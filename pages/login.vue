<script setup>
import BaseText from "@/components/form/BaseText.vue";
import BasePassword from "@/components/form/BasePassword.vue";

useHead({ title: "تسجيل الدخول" });
definePageMeta({ middleware: ["guest"] });

useSeo({
  title: "تسجيل الدخول | منصّة AZZA",
  description:
    "سجّل دخولك لإدارة إعلاناتك، إضافة عروض جديدة، والتواصل الآمن مع المشترين والبائعين على منصّتنا.",
  image: "media/avatars/logo.png",
  canonicalPath: "/login",
  type: "website",
  noindex: true,
});
const { login, authWithGoogle } = useAuth();
const router = useRouter();
const inProgress = ref(false);

// نموذج موحّد: login يقبل إيميل أو هاتف
const form = reactive({
  login: "",
  password: "",
});

const errors = reactive({
  login: "",
  password: "",
});

function resetErrors() {
  Object.keys(errors).forEach((k) => (errors[k] = ""));
}

// --- تحققات --- //
function isEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}
function toEnglishDigits(v) {
  const map = {
    "٠": "0",
    "١": "1",
    "٢": "2",
    "٣": "3",
    "٤": "4",
    "٥": "5",
    "٦": "6",
    "٧": "7",
    "٨": "8",
    "٩": "9",
    "۰": "0",
    "۱": "1",
    "۲": "2",
    "۳": "3",
    "۴": "4",
    "۵": "5",
    "۶": "6",
    "۷": "7",
    "۸": "8",
    "۹": "9",
  };
  return (v || "").replace(/[٠-٩۰-۹]/g, (d) => map[d]);
}
function isPhone(v) {
  const digits = toEnglishDigits(v).replace(/[^\d]/g, "");
  return digits.length >= 8 && digits.length <= 15;
}

function validateLogin() {
  const value = (form.login || "").trim();
  errors.login = "";

  if (!value) {
    errors.login = "من فضلك أدخل البريد الإلكتروني أو رقم الهاتف";
    return false;
  }
  if (!(isEmail(value) || isPhone(value))) {
    errors.login = "أدخل بريدًا إلكترونيًا صالحًا أو رقم هاتف صالح";
    return false;
  }
  return true;
}

function validatePassword() {
  errors.password = "";
  if (!form.password || form.password.length < 6) {
    errors.password = "كلمة المرور لا تقل عن 6 أحرف";
    return false;
  }
  return true;
}

// إرسال النموذج
async function onSubmit() {
  resetErrors();

  const okLogin = validateLogin();
  const okPass = validatePassword();
  if (!okLogin || !okPass) return;

  // (اختياري) تطبيع الهاتف ليصل للأخذية كأرقام فقط
  let normalizedLogin = (form.login || "").trim();
  if (isPhone(normalizedLogin)) {
    normalizedLogin = toEnglishDigits(normalizedLogin).replace(/[^\d]/g, "");
  }

  await formHandle(normalizedLogin);
}

// تنفيذ الإرسال مع useSubmit
const formHandle = async (normalizedLogin) => {
  try {
    inProgress.value = true;

    const payload = { ...form, login: normalizedLogin };
    const { submit } = useSubmit(() => login(payload), {
      onSuccess: (response) => {
        router.push({ path: "/" });
        showToast("success", response?.message || "تم تسجيل الدخول بنجاح");
      },
      onError: (error) => {
        if (error?.data?.code === 400) {
          return navigateTo("/login", { replace: true });
        }
      },
    });

    await submit();
  } catch (error) {
    showToast("error", error?.data?.message || "فشل التسجيل");
  } finally {
    inProgress.value = false;
  }
};

const loginGoogle = async () => {
  try {
    const googleReqouset = await authWithGoogle();
    if (googleReqouset.data.redirect_url) {
      window.location.href = googleReqouset.data.redirect_url;
    }
  } catch (error) {
    if (!error?.data?.message) {
      showToast("error", "فشل التسجيل");
    }
  } finally {
    inProgress.value = false;
  }
};
</script>

<template>
  <section class="py-5 pb-9">
    <div class="container">
      <div class="row flex-column-reverse flex-md-row g-9 align-items-stretch">
        <div class="col-lg-5">
          <div class="info-panel h-100 text-white rounded-3">
            <div class="info-panel__content">
              <h2 class="fw-normal mb-3 text-white">
                <span class="fw-bold fs-1 d-block"
                  >اكتشــــــف آلاف الإعلانــــــات</span
                >
                من المستخدمين في مختلف الفئات <br />وبأفضل الأسعار
              </h2>

              <ul class="list-unstyled lh-lg mb-0 mt-9 me-0 p-0">
                <li class="d-flex align-items-start my-4">
                  <Icon
                    name="material-symbols:check-circle"
                    class="text-info fs-3 mt-1 ms-2"
                  />
                  <span >انضم إلى مئات المستخدمين على منصتنا</span>
                </li>
                <li class="d-flex align-items-start my-4">
                  <Icon
                    name="material-symbols:check-circle"
                    class="text-info fs-3 mt-1 ms-2"
                  />
                  <span >تسجيل الدخول سهل وآمن وسريع</span>
                </li>
                <li class="d-flex align-items-start my-4">
                  <Icon
                    name="material-symbols:check-circle"
                    class="text-info fs-3 mt-1 ms-2"
                  />
                  <span >نشر الإعلانات ورفع الصور بسهولة</span>
                </li>
                <li class="d-flex align-items-start my-4">
                  <Icon
                    name="material-symbols:check-circle"
                    class="text-info fs-3 mt-1 ms-2"
                  />
                  <span >استعرض العروض في المنطقة الأقرب لك</span>
                </li>
                <li class="d-flex align-items-start my-4">
                  <Icon
                    name="material-symbols:check-circle"
                    class="text-info fs-3 mt-1 ms-2"
                  />
                  <span >إدارة إعلاناتك وتتبعها في أي وقت</span>
                </li>
                <li class="d-flex align-items-start my-4">
                  <Icon
                    name="material-symbols:check-circle"
                    class="text-info fs-3 mt-1 ms-2"
                  />
                  <span >اضف التفاصيل والصور لوصف إعلانك بدقة</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div class="col-lg-7 py-9">
          <div class="card py-9 h-100">
            <div class="card-body p-4 p-md-5">
              <h1 class="fw-bold text-end mb-4">
                <span class="display-4">👋</span>مرحبًا بك
              </h1>
              <ul class="nav nav-underline justify-content-start mb-4 p-0">
                <li class="nav-item">
                  <span class="nav-link active fw-bold">تسجيل الدخول</span>
                </li>
                <li class="nav-item d-flex align-items-center">
                  <NuxtLink class="text-secondary fw-bold" to="/register"
                    >إنشاء حساب</NuxtLink
                  >
                </li>
              </ul>
              <form @submit.prevent="onSubmit" novalidate>
                <div>
                  <div class="w-md-50 w-100">
                    <BaseText
                      label="البريد الإلكتروني أو رقم الهاتف"
                      placeholder="البريد الإلكتروني أو رقم الهاتف"
                      v-model="form.login"
                      :error="errors.login"
                      type="text"
                      autocomplete="username"
                      @blur="
                        () => {
                          errors.login && validateLogin();
                        }
                      "
                    />
                  </div>
                  <div class="w-md-50 w-100">
                    <BasePassword
                      label="كلمة المرور"
                      placeholder="كلمة المرور"
                      v-model="form.password"
                      :error="errors.password"
                      @blur="
                        () => {
                          errors.password && validatePassword();
                        }
                      "
                    />
                    <div class="text-start">
                      <NuxtLink to="/forget-password" class="text-muted"
                        >نسيت كلمة السر؟</NuxtLink
                      >
                    </div>
                  </div>
                </div>
                <div class="text-end mt-3">
                  <button
                    class="btn btn-main px-4 w-100 w-md-auto justify-content-center"
                    :disabled="inProgress"
                    type="submit"
                  >
                    <span v-if="!inProgress">
                      تسجيل الدخول
                      <Icon
                        name="material-symbols:arrow-back-rounded"
                        class="text-white me-2"
                        size="22"
                      />
                    </span>
                    <icon
                      v-else
                      name="svg-spinners:ring-resize"
                      class="indicator-label fs-1"
                    />
                  </button>
                </div>
                <div class="text-center text-secondary mt-4 other-login">
                  أو التسجيل باستخدام
                </div>
                <div class="d-flex justify-content-center gap-3 mt-3">
                  <button
                    type="button"
                    class="btn btn-light border shadow-sm px-5"
                    @click="loginGoogle"
                  >
                    <img
                      src="/media/bg-home/google-icon.png"
                      class="img-fluid"
                      style="width: 22px"
                      alt="google-icon"
                    />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.info-panel {
  position: relative;
  overflow: hidden;
  border-radius: 1rem;
  color: #fff;
  min-height: 420px;
  background: url("../public/media/avatars/logo.png") center/cover no-repeat;
  box-shadow: 0 12px 30px rgba(24, 56, 163, 0.25);
}

.info-panel::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #264fcf, #1838a3);
  box-shadow: 0 0.5rem 1rem rgba(24, 56, 163, 0.15);
  opacity: 0.85;
}

.info-panel::after {
  content: "";
  position: absolute;
  inset: -15%;
  background: radial-gradient(
    60% 60% at 85% 15%,
    rgba(255, 255, 255, 0.18) 0%,
    rgba(255, 255, 255, 0) 70%
  );
  pointer-events: none;
  mix-blend-mode: screen;
}

.info-panel__content {
  position: relative;
  padding: 2rem 2.25rem;
}

@media (min-width: 768px) {
  .info-panel__content {
    padding: 2.5rem 3rem;
  }
}

.info-panel__icon {
  font-size: 1.5rem;
  color: #58c0ff;
}

.info-panel__list li {
  gap: 0.5rem;
}

[dir="rtl"] .info-panel__content {
  text-align: right;
}

.badge.rounded-circle {
  width: 28px;
  height: 28px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}
li .active {
  position: relative;
  color: #f5bc48 !important;
  border: none !important;
}
li .active::after {
  content: "";
  width: 70%;
  height: 2px;
  background: #f5bc48;
  position: absolute;
  right: 0;
  bottom: 0;
}
.other-login {
  position: relative;
}
.other-login::before {
  content: "";
  position: absolute;
  left: 0;
  bottom: 50%;
  width: 37%;
  height: 1px;
  background-color: #e5e1e9;
}
.other-login::after {
  content: "";
  position: absolute;
  right: 0;
  bottom: 50%;
  width: 37%;
  height: 1px;
  background-color: #e5e1e9;
}
</style>
