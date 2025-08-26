
<script setup>
import BaseText from "@/components/form/BaseText.vue";
import BasePassword from "@/components/form/BasePassword.vue";

useHead({
  title: "تسجيل الدخول",
});
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
          query: { email: form.email, mode: "forget-password", },
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
        <div class="col-lg-4">
          <div class="info-panel h-100 text-white rounded-3 p-4 p-md-5">
            <h2 class="text-white fw-normal mb-3 p-4 px-9">
              <span class="fw-bold fs-1">اكتشــــــف آلاف الإعلانــــــات</span>
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
        <div class="col-lg-8 py-9">
          <div class="card border-0 py-9 h-100 bg-white">
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
  background: linear-gradient(135deg, #264fcf, #1838a3);
  box-shadow: 0 0.5rem 1rem rgba(24, 56, 163, 0.15);
}
.btn-main {
  padding: 10px 40px !important;
}
</style>
