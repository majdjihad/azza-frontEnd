<script setup>
import BaseText from "@/components/form/BaseText.vue";
import BasePassword from "@/components/form/BasePassword.vue";
import BaseSelect from "~/components/form/BaseSelect.vue";
import { showToast } from "~/composables/useToast";
import { useAuth } from "~/composables/useAuth";
import { useSubmit } from "~/composables/useSubmit";
import { useRouter } from "vue-router";

useHead({
  title: "تسجيل",
});

const { register } = useAuth();
const router = useRouter();
const inProgress = ref(false);

const form = reactive({
  phone: "",
  name: "",
  city: "",
  email: "",
  password: "",
  password_confirmation: "",
});

const errors = reactive({
  phone: "",
  name: "",
  city: "",
  email: "",
  password: "",
  password_confirmation: "",
});

const cities = [
  { value: "جباليا", label: "جباليا" },
  { value: "خانيونس", label: "خانيونس" },
  { value: "النصيرات", label: "النصيرات" },
  { value: "رفح", label: "رفح" },
  { value: "دير البلح", label: "دير البلح" },
  { value: "مدينة غزة", label: "مدينة غزة" },
  { value: "بيت لاهيا", label: "بيت لاهيا" },
  { value: "بيت حانون", label: "بيت حانون" },
];

// switch error msg
function resetErrors() {
  Object.keys(errors).forEach((k) => (errors[k] = ""));
}

// validation errors form
function onSubmit() {
  resetErrors();
  if (!form.phone || !/^(\+?\d{8,15})$/.test(form.phone))
    errors.phone = "يرجى إدخال رقم جوال صحيح";
  if (!form.name || form.name.length < 3)
    errors.name = "الاسم لا يقل عن 3 أحرف";
  if (!form.city) errors.city = "يرجى إدخال المدينة";
  if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email))
    errors.email = "البريد الإلكتروني غير صحيح";
  if (!form.password || form.password.length < 6)
    errors.password = "كلمة المرور لا تقل عن 6 أحرف";
  if (form.password_confirmation !== form.password)
    errors.password_confirmation = "تأكيد كلمة المرور غير متطابق";

  const hasError = Object.values(errors).some(Boolean);
  if (!hasError) {
    formHandle();
  }
}
// handle form
const formHandle = async () => {
  try {
    inProgress.value = true;
    const { submit } = useSubmit(() => register(form), {
      onSuccess: (response) => {
        // Handle the response
        router.push({
          path: "/verify-code",
          query: {
            email: form.email,
            mode: "register",
          },
        });
        showToast("success", response.message);
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
        <div class="col-lg-8">
          <div class="card border-0 h-100 bg-white">
            <div class="card-body p-4 p-md-5">
              <h1 class="fw-bold text-end mb-4">
                <span class="display-4">👋</span>مرحبًا بك
              </h1>
              <ul class="nav nav-underline justify-content-start mb-4">
                <li class="nav-item d-flex align-items-center">
                  <NuxtLink class="text-secondary fw-bold" to="/login"
                    >تسجيل الدخول</NuxtLink
                  >
                </li>
                <li class="nav-item">
                  <span class="nav-link active fw-bold">إنشاء حساب</span>
                </li>
              </ul>
              <form @submit.prevent="onSubmit" novalidate>
                <div class="row">
                  <div class="col-md-6">
                    <BaseText
                      label="اسم المستخدم"
                      placeholder="اسم المستخدم"
                      v-model="form.name"
                      :error="errors.name"
                    />
                  </div>
                  <div class="col-md-6">
                    <BaseText
                      label="رقم الجوال"
                      placeholder="أدخل رقم الجوال"
                      v-model="form.phone"
                      :error="errors.phone"
                      type="tel"
                      inputmode="tel"
                    />
                  </div>

                  <div class="col-md-6">
                    <BaseText
                      label="البريد الإلكتروني"
                      placeholder="البريد الإلكتروني"
                      v-model="form.email"
                      :error="errors.email"
                      type="email"
                      autocomplete="email"
                    />
                  </div>
                  <div class="col-md-6">
                    <BaseSelect
                      label="المدينة"
                      placeholder="اختر المدينة"
                      :options="cities"
                      v-model="form.city"
                      :error="errors.city"
                    />
                  </div>

                  <div class="col-md-6">
                    <BasePassword
                      label="كلمة المرور"
                      placeholder="كلمة المرور"
                      v-model="form.password"
                      :error="errors.password"
                    />
                  </div>
                  <div class="col-md-6">
                    <BasePassword
                      label="تأكيد كلمة المرور"
                      placeholder="تأكيد كلمة المرور"
                      v-model="form.password_confirmation"
                      :error="errors.password_confirmation"
                    />
                  </div>
                </div>
                <div class="text-center mt-3">
                  <button
                    class="btn btn-main px-4"
                    :disabled="inProgress"
                    type="submit"
                  >
                    <span v-if="!inProgress">
                      إنشاء حساب
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

                <div class="text-center text-secondary mt-4 other-register">
                  أو التسجيل باستخدام
                </div>
                <div class="d-flex justify-content-center gap-3 mt-3">
                  <button
                    type="button"
                    class="btn btn-light border shadow-sm px-5"
                  >
                    <img
                      src="/media/bg-home/google-icon.png"
                      class="img-fluid"
                      style="width: 22px"
                      alt="google-icon"
                    />
                  </button>
                  <button
                    type="button"
                    class="btn btn-light border shadow-sm px-5"
                  >
                    <Icon
                      name="ic:round-facebook"
                      class="text-center fs-1 p-0 text-primary"
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
.other-register {
  position: relative;
}
.other-register::before {
  content: "";
  position: absolute;
  left: 0;
  bottom: 50%;
  width: 42%;
  height: 1px;
  background-color: #e5e1e9;
}
.other-register::after {
  content: "";
  position: absolute;
  right: 0;
  bottom: 50%;
  width: 42%;
  height: 1px;
  background-color: #e5e1e9;
}
</style>
