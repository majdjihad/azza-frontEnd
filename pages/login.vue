
<script setup>
import BaseText from "@/components/form/BaseText.vue";
import BasePassword from "@/components/form/BasePassword.vue";

useHead({
  title: "تسجيل الدخول",
});
// definePageMeta({
//   middleware: ["guest"],
// });
const { login } = useAuth();
const router = useRouter();
const inProgress = ref(false);

const form = reactive({
  email: "",
  password: "",
});

const errors = reactive({
  email: "",
  password: "",
});
function resetErrors() {
  Object.keys(errors).forEach((k) => (errors[k] = ""));
}

function onSubmit() {
  resetErrors();
  if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email))
    errors.email = "البريد الإلكتروني غير صحيح";
  if (!form.password || form.password.length < 6)
    errors.password = "كلمة المرور لا تقل عن 6 أحرف";

  const hasError = Object.values(errors).some(Boolean);
  if (!hasError) {
    formHandle();
  }
}

// handle form
const formHandle = async () => {
  try {
    inProgress.value = true;
    const { submit } = useSubmit(() => login(form), {
      onSuccess: (response) => {
        // Handle the response
        router.push({
          path: "/",
        });
        showToast("success", response?.message || "تم تسجيل الدخول بنجاح");
      },
      onError: (error) => {
        showToast("error", error?.data?.message);
        if (error?.data?.code === 400) {
          showToast("error", error?.data?.message);
          return navigateTo("/login", { replace: true });
        }
      },
    });
    await submit();
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
              <h1 class="fw-bold text-end mb-4">
                <span class="display-4">👋</span>مرحبًا بك
              </h1>
              <ul class="nav nav-underline justify-content-start mb-4">
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
                  <div class="w-md-50 w-75">
                    <BaseText
                      label="البريد الإلكتروني"
                      placeholder="البريد الإلكتروني"
                      v-model="form.email"
                      :error="errors.email"
                      type="email"
                      autocomplete="email"
                    />
                  </div>
                  <div class="w-md-50 w-75">
                    <BasePassword
                      label="كلمة المرور"
                      placeholder="كلمة المرور"
                      v-model="form.password"
                      :error="errors.password"
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
                    class="btn btn-main px-4"
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
</style>
