<script setup>
import BaseText from "@/components/form/BaseText.vue";
import BasePassword from "@/components/form/BasePassword.vue";
import { showToast } from "~/composables/useToast";
import { useAuth } from "~/composables/useAuth";
import { useSubmit } from "~/composables/useSubmit";
import { useRouter } from "vue-router";
import { useCategoryStore } from "~/stores/categoryStore";
useSeo({
  title: "إنشاء حساب جديد | منصّة AZZA",
  description:
    "سجل الآن في منصّة الإعلانات العربية لإنشاء حسابك الشخصي وإضافة إعلاناتك بسهولة وتصفح آلاف العروض في مختلف الأقسام.",
  image: "/media/avatars/logo.png",
  canonicalPath: "/register",
  type: "website",
});

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
          path: "/"
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
      <div
        class="row flex-column-reverse flex-md-row g-9 justify-content-center align-items-stretch"
      >
        <div class="col-lg-4">
          <div class="info-panel h-100 text-white rounded-3">
            <div class="info-panel__content">
              <h2 class="mb-3 text-white fs-3 lh-base">
                <span class="fw-bold">اكتشــــــف آلاف الإعلانــــــات </span>
                <span class="fw-light">من المستخدمين</span>
                <br />
                <span class="fw-light"> في مختلف الفئات وبأفضل الأسعار </span>
              </h2>

              <ul class="list-unstyled lh-lg mb-0 mt-9 me-0 p-0">
                <li class="d-flex align-items-start my-4">
                  <Icon
                    name="material-symbols:check-circle"
                    class="text-info fs-3 mt-1 ms-2"
                  />
                  <span class="fs-6 fw-medium"
                    >انضم إلى ملايين المستخدمين على منصتنا</span
                  >
                </li>
                <li class="d-flex align-items-start my-4">
                  <Icon
                    name="material-symbols:check-circle"
                    class="text-info fs-3 mt-1 ms-2"
                  />
                  <span class="fs-6 fw-medium">
                    تسجيل الدخول يعزز الأمان والمصداقيــة</span
                  >
                </li>
                <li class="d-flex align-items-start my-4">
                  <Icon
                    name="material-symbols:check-circle"
                    class="text-info fs-3 mt-1 ms-2"
                  />
                  <span class="fs-6 fw-medium"
                    >تابــــــــع الرسائــــــــل والعـــــروض بسهـولــــة</span
                  >
                </li>
                <li class="d-flex align-items-start my-4">
                  <Icon
                    name="material-symbols:check-circle"
                    class="text-info fs-3 mt-1 ms-2"
                  />
                  <span class="fs-6 fw-medium"
                    >نظّـــــم إعلاناتــــك المفضلــــة والمحفوظــــة</span
                  >
                </li>
                <li class="d-flex align-items-start my-4">
                  <Icon
                    name="material-symbols:check-circle"
                    class="text-info fs-3 mt-1 ms-2"
                  />
                  <span class="fs-6 fw-medium"
                    >اعرض أي شــــيء للبيـــع، للإيجــار، أو حتـــى لإعلان
                    وظيفة</span
                  >
                </li>
                <li class="d-flex align-items-start my-4">
                  <Icon
                    name="material-symbols:check-circle"
                    class="text-info fs-3 mt-1 ms-2"
                  />
                  <span class="fs-6 fw-medium"
                    >تابع أداء إعلاناتـك وعدّلهـــا فـــي أي وقــــت</span
                  >
                </li>
                <li class="d-flex align-items-start my-4">
                  <Icon
                    name="material-symbols:check-circle"
                    class="text-info fs-3 mt-1 ms-2"
                  />
                  <span class="fs-6 fw-medium"
                    >أضف الصور ومواصفات الإعلان لجذب المزيد من المهتمين</span
                  >
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div class="col-lg-7">
          <div class="card border-0 h-100" style="background-color: #f8f8f8">
            <div class="card-body p-4 p-md-5">
              <h1 class="fw-bold text-end mb-4">
                <span class="display-4">👋</span>
                <span>مرحبًا بك</span>
              </h1>
              <ul class="nav nav-underline justify-content-start mb-4 p-0">
                <li class="nav-item d-flex align-items-center">
                  <NuxtLink class="fw-medium" style="color: #6e6e6e" to="/login"
                    >تسجيل الدخول</NuxtLink
                  >
                </li>
                <li class="nav-item">
                  <span class="nav-link active fw-medium">إنشاء حساب</span>
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
                    >
                      المدينة
                    </label>

                    <div class="dropdown w-100">
                      <button
                        type="button"
                        class="btn text-end w-100 position-relative bg-white city-dropdown"
                        id="inputCityGroup"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                        :class="{ 'is-invalid': !!errors.city }"
                      >
                        <span v-if="form.city">{{ form.city }}</span>
                        <span v-else class="text-muted">اختر المدينة</span>
                      </button>

                      <ul class="dropdown-menu w-100 mt-1 shadow-sm border-0">
                        <li
                          v-for="city in categoryStore?.citiesData?.cities ||
                          []"
                          :key="city.id"
                        >
                          <button
                            class="dropdown-item text-end"
                            type="button"
                            @click="form.city = city.name"
                          >
                            {{ city.name }}
                          </button>
                        </li>
                      </ul>
                    </div>

                    <div v-if="errors.city" class="invalid-feedback d-block">
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
                    class="btn btn-main px-4 w-100 w-md-auto justify-content-center"
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
                <!-- <div class="text-center fw-medium mt-4 other-register">
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
                </div> -->
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
  color: #6e6e6e;
}
.other-register::before {
  content: "";
  position: absolute;
  left: 0;
  bottom: 50%;
  width: 40%;
  height: 1px;
  background-color: #e5e1e9;
}
.other-register::after {
  content: "";
  position: absolute;
  right: 0;
  bottom: 50%;
  width: 40%;
  height: 1px;
  background-color: #e5e1e9;
}
.city-dropdown {
  border: 1px solid #dbdfe9 !important;
}
.city-dropdown:hover {
  background-color: white !important;
  box-shadow: 0 0 0 0.1rem rgb(24 57 160 / 0.3) !important;
  border: none !important;
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
@media (max-width: 575px) {
  .other-register::before {
    width: 33%;
  }
  .other-register::after {
    width: 33%;
  }
}
</style>
