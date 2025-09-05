AuthController.php
<?php

namespace App\Http\Controllers\API\Auth;

use App\Http\Controllers\API\BaseApiController;
use App\Http\Requests\Api\RegisterRequest;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;

class AuthController extends BaseApiController
{
    // ✅ Register
    public function register(RegisterRequest $request)
    {
        $verification_code = rand(100000, 999999);
        $data = $request->validated();

        $user = User::create([
            'name'                       => $data['name'],
            'email'                      => $data['email'],
            'phone'                      => $data['phone'] ?? null,
            'photo'                      => asset('assets/img/avatars/user.png'),
            'password'                   => Hash::make($data['password']),
            'verification_code'          => $verification_code,
            'verification_code_sent_at'  => now(),
            'verification_attempts'      => 0,
            'expires_at'                 => now()->addHour()->toIso8601String(),
        ]);

        // إرسال الكود عبر البريد
        // Mail::to($user->email)->send(new VerificationCodeMail($verification_code));

        return $this->sendResponse([
            'expires_at' => $user->expires_at
        ], 'تم تسجيل الحساب بنجاح، تحقق من بريدك الإلكتروني لإدخال رمز التفعيل');
    }

    // ✅ Verify Email
    public function verify(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'verification_code' => 'required|digits:6'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) return $this->sendError('المستخدم غير موجود', [], 404);
        if ($user->email_verified_at) return $this->sendError('مفعّل مسبقاً', [], 422);
        if ($user->verification_attempts >= 5) return $this->sendError('تجاوزت الحد', [], 429);

        if ($user->verification_code != $request->verification_code) {
            $user->increment('verification_attempts');
            return $this->sendError('رمز التحقق غير صحيح', [], 422);
        }

        if (!$user->verification_code_sent_at || \Carbon\Carbon::parse($user->verification_code_sent_at)->addHour()->isPast()) {
            return $this->sendError('رمز التحقق منتهي', [], 422);
        }

        $user->update([
            'email_verified_at' => now(),
            'verification_code' => null,
            'verification_code_sent_at' => null,
            'verification_attempts' => 0,
        ]);

        // ✅ ادخل المستخدم تلقائياً بعد التفعيل
        Auth::login($user);
        $request->session()->regenerate();

        return $this->sendResponse(['user' => $user], 'تم التفعيل وتسجيل الدخول بنجاح');
    }

    // ✅ Login - Stateful Authentication
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return $this->sendError('بيانات الدخول غير صحيحة', [], 401);
        }

        if (!$user->email_verified_at) {
            return $this->sendError('البريد الإلكتروني غير مفعل', [], 403);
        }

        Auth::login($user, $request->boolean('remember', true));

        // مهم جداً لمنع Session Fixation
        $request->session()->regenerate();

        return $this->sendResponse([
            'user' => $user,
            'authenticated' => true
        ], 'تم تسجيل الدخول بنجاح');
    }

    // 🆕 Google OAuth - Redirect
    public function googleRedirect()
    {
        try {
            $redirectUrl = Socialite::driver('google')
                ->redirect()
                ->getTargetUrl();

            return $this->sendResponse([
                'redirect_url' => $redirectUrl
            ], 'رابط المصادقة عبر جوجل');
        } catch (\Exception $e) {
            return $this->sendError('حدث خطأ أثناء توليد رابط المصادقة', [], 500);
        }
    }

    // Google OAuth - Callback - Stateful Authentication
    public function googleCallback(Request $request)
    {
        try {
            $request->validate([
                'code' => 'required|string',
            ], [
                'code.required' => 'كود المصادقة من جوجل مطلوب',
                'code.string' => 'كود المصادقة يجب أن يكون نص'
            ]);

            $googleUser = Socialite::driver('google')->user();

            if (!$googleUser || !$googleUser->email) {
                return $this->sendError('فشل في الحصول على معلومات المستخدم من جوجل', [], 422);
            }

            $user = User::where('email', $googleUser->email)->first();

            if ($user) {
                if (!$user->google_id) {
                    $user->update([
                        'google_id' => $googleUser->id,
                        'email_verified_at' => $user->email_verified_at ?? now(),
                    ]);
                }
            } else {
                $user = User::create([
                    'name' => $googleUser->name,
                    'email' => $googleUser->email,
                    'google_id' => $googleUser->id,
                    'photo' => $googleUser->avatar ?? asset('assets/img/avatars/user.png'),
                    'password' => Hash::make(Str::random(24)),
                    'email_verified_at' => now(),
                    'verification_attempts' => 0,
                ]);
            }

            // Log the user in using Laravel's session-based authentication
            Auth::login($user);

            return $this->sendResponse([
                'user' => $user,
                'authenticated' => true,
                'auth_method' => 'google'
            ], 'تم تسجيل الدخول بنجاح عبر جوجل');
        } catch (\Exception $e) {
            return $this->sendError('حدث خطأ أثناء المصادقة عبر جوجل: ' . $e->getMessage(), [], 500);
        }
    }

    public function checkAuth(Request $request)
    {
        return $this->sendResponse([
            'authenticated' => Auth::check(),
            'user' => Auth::user(),
        ], 'تم فحص حالة المصادقة');
    }

    // ✅ Forgot Password
    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email'
        ], [
            'email.required' => 'حقل البريد الإلكتروني مطلوب',
            'email.email' => 'يجب إدخال بريد إلكتروني صحيح',
            'email.exists' => 'البريد الإلكتروني غير مسجل في النظام'
        ]);

        $user = User::where('email', $request->email)->first();

        // منع إعادة تعيين كلمة المرور للحسابات المرتبطة بجوجل فقط
        if ($user->google_id && !$user->password) {
            return $this->sendError('هذا الحساب مرتبط بجوجل فقط، يرجى تسجيل الدخول عبر جوجل', [], 422);
        }

        $code = rand(100000, 999999);

        $user->update([
            'verification_code'         => $code,
            'verification_code_sent_at' => now(),
            'verification_attempts'     => 0,
        ]);

        // Mail::to($user->email)->send(new VerificationCodeMail($code));

        return $this->sendResponse(null, 'تم إرسال رمز إعادة تعيين كلمة المرور إلى بريدك الإلكتروني');
    }

    // ✅ Reset Password
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email'             => 'required|email',
            'verification_code' => 'required|digits:6',
            'password'          => 'required|min:8|confirmed'
        ], [
            'email.required' => 'حقل البريد الإلكتروني مطلوب',
            'email.email' => 'يجب إدخال بريد إلكتروني صحيح',
            'verification_code.required' => 'حقل رمز التحقق مطلوب',
            'verification_code.digits' => 'رمز التحقق يجب أن يتكون من 6 أرقام',
            'password.required' => 'حقل كلمة المرور الجديدة مطلوب',
            'password.min' => 'كلمة المرور يجب أن تحتوي على الأقل على 8 أحرف',
            'password.confirmed' => 'تأكيد كلمة المرور غير متطابق'
        ]);

        $user = User::where('email', $request->email)
            ->where('verification_code', $request->verification_code)
            ->first();

        if (!$user) {
            return $this->sendError('رمز التحقق غير صحيح أو البريد الإلكتروني غير مسجل', [], 422);
        }

        if (!$user->verification_code_sent_at || Carbon::parse($user->verification_code_sent_at)->addHour()->isPast()) {
            return $this->sendError('رمز التحقق منتهي الصلاحية', [], 422);
        }

        $user->update([
            'password'                 => Hash::make($request->password),
            'verification_code'        => null,
            'verification_code_sent_at' => null,
            'verification_attempts'    => 0,
        ]);

        return $this->sendResponse(null, 'تم إعادة تعيين كلمة المرور بنجاح');
    }

    // ✅ Logout - Stateful Authentication
    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return $this->sendResponse(null, 'تم تسجيل الخروج بنجاح');
    }

    // ✅ Resend Verification Code
    public function resendVerificationCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ], [
            'email.required' => 'حقل البريد الإلكتروني مطلوب',
            'email.email' => 'يجب إدخال بريد إلكتروني صحيح',
            'email.exists' => 'البريد الإلكتروني غير مسجل في النظام'
        ]);

        $user = User::where('email', $request->email)->first();

        if ($user->email_verified_at) {
            return $this->sendError('البريد الإلكتروني مفعل مسبقاً', [], 422);
        }

        // التحقق من وجود رمز صالح
        if ($user->verification_attempts < 5) {
            if (
                $user->verification_code_sent_at &&
                Carbon::parse($user->verification_code_sent_at)->addHour()->isFuture()
            ) {
                return $this->sendError('يوجد رمز تحقق صالح بالفعل، يرجى الانتظار أو استخدام الرمز الحالي', [], 422);
            }
        }

        $newCode = rand(100000, 999999);
        $user->update([
            'verification_code' => $newCode,
            'verification_code_sent_at' => now(),
            'verification_attempts' => 0,
            'expires_at' => now()->addHour()->toIso8601String(),
        ]);

        // Mail::to($user->email)->send(new VerificationCodeMail($newCode));

        return $this->sendResponse([
            'expires_at' => $user->expires_at
        ], 'تم إرسال رمز التحقق من جديد إلى بريدك الإلكتروني');
    }

    // 🆕 Get User Profile
    public function profile(Request $request)
    {
        return $this->sendResponse([
            'user' => $request->user()
        ], 'تم جلب معلومات المستخدم بنجاح');
    }

    // 🆕 Update Profile
    public function updateProfile(Request $request)
    {
        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'phone' => 'sometimes|nullable|string|max:20',
            'photo' => 'sometimes|nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ], [
            'name.required' => 'حقل الاسم مطلوب',
            'name.string' => 'الاسم يجب أن يكون نص',
            'name.max' => 'الاسم يجب ألا يتجاوز 255 حرف',
            'phone.string' => 'رقم الهاتف يجب أن يكون نص',
            'phone.max' => 'رقم الهاتف يجب ألا يتجاوز 20 رقم',
            'photo.image' => 'الملف يجب أن يكون صورة',
            'photo.mimes' => 'الصورة يجب أن تكون من نوع: jpeg, png, jpg, gif',
            'photo.max' => 'حجم الصورة يجب ألا يتجاوز 2 ميجابايت'
        ]);

        $user = $request->user();
        $data = $request->only(['name', 'phone']);

        if ($request->hasFile('photo')) {
            // حذف الصورة القديمة إذا لم تكن الصورة الافتراضية
            if ($user->photo && !str_contains($user->photo, 'avatars/user.png')) {
                $oldPhotoPath = str_replace(asset(''), '', $user->photo);
                if (file_exists(public_path($oldPhotoPath))) {
                    unlink(public_path($oldPhotoPath));
                }
            }

            // رفع الصورة الجديدة
            $photo = $request->file('photo');
            $photoName = time() . '_' . $user->id . '.' . $photo->getClientOriginalExtension();
            $photo->move(public_path('assets/img/avatars/'), $photoName);
            $data['photo'] = asset('assets/img/avatars/' . $photoName);
        }

        $user->update($data);

        return $this->sendResponse([
            'user' => $user->fresh()
        ], 'تم تحديث الملف الشخصي بنجاح');
    }
}



bootstrap/app.php
<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\HandleCors; // ← أضف هذا

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // فعّل CORS كـ global middleware
        // $middleware->use([
        //     HandleCors::class,
        // ]);

        // لو تستخدم جلسات Sanctum/Stateful للـ API
        $middleware->statefulApi();

        // أي aliases أخرى...
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })
    ->create();



core.php
<?php

return [
    'paths' => [
        'api/*',
        'sanctum/csrf-cookie',
        // جلسات المستخدم
        'login',
        'logout',
        'register',
        'verify',
        'forgot-password',
        'reset-password',
        // فحص المصادقة
        'check-auth',
        // لو عندك سوشيال
        'auth/*',
        'broadcasting/auth',
    ],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:3000',
    ],

    'allowed_origins_patterns' => [
        '#^https?://localhost(?::\d+)?$#',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];



.env
APP_NAME=Laravel
APP_ENV=local
APP_KEY=base64:F6GcrAil/n3LSZK5pnPyUwpFJLHXBG1GqFc1BuO8UZI=
APP_DEBUG=true
APP_URL=http://localhost:8000
APP_LOCALE=en
APP_FALLBACK_LOCALE=en
APP_FAKER_LOCALE=en_US


APP_MAINTENANCE_DRIVER=file
PHP_CLI_SERVER_WORKERS=4

BCRYPT_ROUNDS=12

LOG_CHANNEL=stack
LOG_STACK=single
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=azza
DB_USERNAME=root
DB_PASSWORD=

# APP_URL=http://localhost:8000

# Sanctum / Session
SANCTUM_STATEFUL_DOMAINS=localhost:3000
SESSION_DRIVER=cookie
SESSION_DOMAIN=
SESSION_SECURE_COOKIE=false
SESSION_SAME_SITE=lax

# (keep FRONTEND_URL as is)
FRONTEND_URL=http://localhost:3000


# إعدادات Sanctum و Session
# SANCTUM_STATEFUL_DOMAINS=localhost:3000,localhost:3001,127.0.0.1:8000,127.0.0.1:3001,127.0.0.1
# SESSION_DRIVER=cookie
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
# SESSION_DOMAIN=
# SESSION_SECURE_COOKIE=true
SESSION_HTTP_ONLY=true
# SESSION_SAME_SITE=lax

BROADCAST_CONNECTION=log
FILESYSTEM_DISK=local
QUEUE_CONNECTION=database

CACHE_STORE=database
MEMCACHED_HOST=127.0.0.1

REDIS_CLIENT=phpredis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=log
MAIL_SCHEME=null
MAIL_HOST=127.0.0.1
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="${APP_NAME}"

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=false

VITE_APP_NAME="${APP_NAME}"

# Google OAuth
GOOGLE_CLIENT_ID=751971296768-hihc5algd18poumdouunm6ur0oq7r0p9.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_REDIRECT_URI=http://localhost:3000
