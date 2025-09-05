
<script setup>
import BaseText from "@/components/form/BaseText.vue";

useHead({
  title: "نسيت كلمة السر",
});
definePageMeta({ middleware: ["guest"] });

const { forgetPassword } = useAuth();
const router = useRouter();
const inProgress = ref(false);
const form = reactive({
  email: "",
});

const errors = reactive({
  email: "",
});
function resetErrors() {
  Object.keys(errors).forEach((k) => (errors[k] = ""));
}

function onSubmit() {
  resetErrors();
  if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email))
    errors.email = "البريد الإلكتروني غير صالح";

  const hasError = Object.values(errors).some(Boolean);
  if (!hasError) {
    formHandle();
  }
}

// handle form
const formHandle = async () => {
  try {
    inProgress.value = true;
    const { submit } = useSubmit(() => forgetPassword(form), {
      onSuccess: (response) => {
        // Handle the response
        router.push({
          path: "/verify-code",
          query: { email: form.email, mode: "forget-password" },
        });
        showToast("success", response?.message || "تم تسجيل الدخول بنجاح");
      },
      onError: (error) => {
        showToast("error", error?.data?.message);
        if (error?.data?.code === 400) {
          return navigateTo("/login", { replace: true });
        }
      },
    });
    await submit();
  } catch (error) {
    if (!error?.data?.message) {
      showToast("error", "فشل الارسال");
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
                من المستخدمين في مختلف الفئات وبأفضل الأسعار
              </h2>

              <ul class="list-unstyled lh-lg mb-0 mt-4">
                <li class="d-flex align-items-start my-4">
                  <Icon
                    name="material-symbols:check-circle"
                    class="text-info fs-3 mt-1 ms-2"
                  />
                  <span class="fs-4">انضم إلى مئات المستخدمين على منصتنا</span>
                </li>
                <li class="d-flex align-items-start my-4">
                  <Icon
                    name="material-symbols:check-circle"
                    class="text-info fs-3 mt-1 ms-2"
                  />
                  <span class="fs-4">تسجيل الدخول سهل وآمن وسريع</span>
                </li>
                <li class="d-flex align-items-start my-4">
                  <Icon
                    name="material-symbols:check-circle"
                    class="text-info fs-3 mt-1 ms-2"
                  />
                  <span class="fs-4">نشر الإعلانات ورفع الصور بسهولة</span>
                </li>
                <li class="d-flex align-items-start my-4">
                  <Icon
                    name="material-symbols:check-circle"
                    class="text-info fs-3 mt-1 ms-2"
                  />
                  <span class="fs-4">استعرض العروض في المنطقة الأقرب لك</span>
                </li>
                <li class="d-flex align-items-start my-4">
                  <Icon
                    name="material-symbols:check-circle"
                    class="text-info fs-3 mt-1 ms-2"
                  />
                  <span class="fs-4">إدارة إعلاناتك وتتبعها في أي وقت</span>
                </li>
                <li class="d-flex align-items-start my-4">
                  <Icon
                    name="material-symbols:check-circle"
                    class="text-info fs-3 mt-1 ms-2"
                  />
                  <span class="fs-4">اضف التفاصيل والصور لوصف إعلانك بدقة</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div class="col-lg-7 py-9">
          <div class="card py-9 h-100">
            <div class="card-body p-4 p-md-5">
              <form @submit.prevent="onSubmit" novalidate>
                <div>
                  <NuxtLink
                    to="/login"
                    class="d-flex align-items-center mb-3 text-primary fw-bold"
                  >
                    <Icon
                      name="material-symbols:arrow-right-alt"
                      class="ms-1"
                      size="28"
                    />
                    <span class="fs-3">إعادة تعيين كلمة المرور</span>
                  </NuxtLink>
                  <div class="w-md-50 w-75 my-8">
                    <BaseText
                      label="البريد الإلكتروني أو رقم الجوال"
                      placeholder="أدخل بريدك الإلكتروني أو رقم هاتفك"
                      v-model="form.email"
                      :error="errors.email"
                      type="email"
                      autocomplete="email"
                    />
                    <p class="my-3 text-muted">
                      سيصلك رمز التحقق بعد تعبىء الحقل
                    </p>
                  </div>
                </div>
                <div class="text-end my-3">
                  <button
                    class="btn btn-main px-8"
                    :disabled="inProgress"
                    type="submit"
                  >
                    <span v-if="!inProgress" class="fw-semibold"
                      >إرسال
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
  background: linear-gradient(135deg, #264fcf 0%, #1838a3 60%, #0f2a87 100%);
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
.btn-main {
  padding: 10px 40px !important;
}
</style>
