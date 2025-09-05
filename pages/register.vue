<script setup>
import BaseText from "@/components/form/BaseText.vue";
import BasePassword from "@/components/form/BasePassword.vue";
import BaseSelect from "~/components/form/BaseSelect.vue";
import { showToast } from "~/composables/useToast";
import { useAuth } from "~/composables/useAuth";
import { useSubmit } from "~/composables/useSubmit";
import { useRouter } from "vue-router";
import { useCategoryStore } from "~/stores/categoryStore";

useHead({
  title: "تسجيل",
});

definePageMeta({
  middleware: ["guest"],
});

const categoryStore = useCategoryStore();

onMounted(async () => {
  if (!categoryStore?.citiesData) await categoryStore.getCitiesData();
});

const { register, authWithGoogle } = useAuth();
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

const registerGoogle = async () => {
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
        <div class="col-lg-7">
          <div class="card h-100">
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
                    <label
                      class="form-label mb-2 fw-medium text-dark"
                      for="inputCityGroup"
                      >المدينة</label
                    >
                    <select
                      class="form-select"
                      :class="{ 'is-invalid': !!errors.city }"
                      id="inputCityGroup"
                      v-model="form.city"
                    >
                      <option value="">اختر المدينة</option>
                      <option
                        :value="city.name"
                        v-for="city in categoryStore?.citiesData?.cities || []"
                        :key="city.id"
                      >
                        {{ city.name }}
                      </option>
                    </select>
                    <div v-if="errors.city" class="invalid-feedback">
                      {{ errors.city }}
                    </div>
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
                    @click="registerGoogle"
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
.other-register {
  position: relative;
}
.other-register::before {
  content: "";
  position: absolute;
  left: 0;
  bottom: 50%;
  width: 41%;
  height: 1px;
  background-color: #e5e1e9;
}
.other-register::after {
  content: "";
  position: absolute;
  right: 0;
  bottom: 50%;
  width: 41%;
  height: 1px;
  background-color: #e5e1e9;
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
