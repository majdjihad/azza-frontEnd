
<script setup>
import BaseText from "@/components/form/BaseText.vue";
import BasePassword from "@/components/form/BasePassword.vue";
import BaseSelect from "~/components/form/BaseSelect.vue";
useHead({
  title: "تعديل الملف الشخصي",
});

const form = reactive({
  phone: "972592142714+",
  username: "مجد قويدر",
  city: "مدينة غزة",
  email: "majdjihad@gmail.com",
});

const errors = reactive({
  phone: "",
  username: "",
  city: "",
  email: "",
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
function resetErrors() {
  Object.keys(errors).forEach((k) => (errors[k] = ""));
}

function onSubmit() {
  resetErrors();
  if (!form.phone || !/^(\+?\d{8,15})$/.test(form.phone))
    errors.phone = "يرجى إدخال رقم جوال صحيح";
  if (!form.username || form.username.length < 3)
    errors.username = "الاسم لا يقل عن 3 أحرف";
  if (!form.city) errors.city = "يرجى إدخال المدينة";
  if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email))
    errors.email = "البريد الإلكتروني غير صحيح";
  const hasError = Object.values(errors).some(Boolean);
  if (!hasError) {
    alert("تم تعديل البيانات بنجاح)");
  }
}
const closeModal = () => {
  const modalEl = document.querySelector("#msgChangePassword");
  const modal = bootstrap.Modal.getInstance(modalEl);
  modal.hide();
};
</script>

<template>
  <div class="container mx-auto p-4">
    <div class="page-content">
      <h1>تعديل الملف الشخصي</h1>
      <div class="mt-4">
        <div class="d-flex align-items-center mb-4">
          <h2 class="fs-3 m-0 fw-normal text-primary d-inline">الرئيسية</h2>
          <Icon
            name="mdi:chevron-left-circle-outline"
            class="fs-3 mx-3 text-secondary"
          />
          <h2 class="fs-3 m-0 fw-normal text-primary d-inline">الملف الشخصي</h2>
          <Icon
            name="mdi:chevron-left-circle-outline"
            class="fs-3 mx-3 text-secondary"
          />
          <h2 class="fs-3 m-0 fw-normal text-muted d-inline">
            تعديل الملف الشخصي
          </h2>
        </div>
      </div>
      <div>
        <div class="d-flex align-items-center mt-8">
          <img
            src="/media/avatars/user.png"
            alt="userProfile"
            width="60"
            class="rounded-circle"
          />
          <button
            class="btn me-8 d-flex align-items-center justify-content-between"
            style="background: #f3f5fa"
          >
            <Icon
              name="tabler:cloud-upload"
              class="display-6 text-primary ms-3"
            />
            <span class="mb-0 ms-4 fs-4 text-primary">تحميل صورة</span>
          </button>
        </div>
      </div>
      <div class="card card-soft my-4">
        <div class="card-body">
          <form @submit.prevent="onSubmit" novalidate>
            <div class="row">
              <div class="col-md-6">
                <BaseText
                  label="اسم المستخدم"
                  placeholder="اسم المستخدم"
                  v-model="form.username"
                  :error="errors.username"
                  :modelValue="form.username"
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
                  :modelValue="form.phone"
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
                  :modelValue="form.email"
                />
              </div>
              <div class="col-md-6">
                <BaseSelect
                  label="المدينة"
                  placeholder="اختر المدينة"
                  :options="cities"
                  v-model="form.city"
                  :error="errors.city"
                  :modelValue="form.city"
                />
              </div>
            </div>
            <div class="d-flex mt-3">
              <button class="btn btn-outline-main px-4 ms-4">رجوع</button>
              <button
                class="btn btn-main px-4 fw-sumibold align-items-center"
                type="submit"
              >
                حفظ التعديلات
                <Icon
                  name="material-symbols:arrow-back-rounded"
                  class="text-white me-2"
                  size="22"
                />
              </button>
            </div>
          </form>
        </div>
      </div>
      <div class="row g-3">
        <div class="col-12">
          <div class="card card-soft action-tile">
            <div
              class="card-body d-flex align-items-center justify-content-between"
            >
              <div class="d-flex align-items-center gap-3">
                <button
                  class="btn btn-light border px-3"
                  style="background: #eef6ff"
                  data-bs-toggle="modal"
                  data-bs-target="#resetpasswordProfile"
                >
                  <Icon
                    name="material-symbols:lock-person-outline-sharp"
                    class="display-4 text-primary"
                  />
                </button>
                <div>
                  <h4 class="fw-bold">تغيير كلمة المرور</h4>
                  <div class="text-muted">
                    حافظ على امان حسابك بكلمة المرور قوية
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-12">
          <div class="card card-soft action-tile">
            <div
              class="card-body d-flex align-items-center justify-content-between"
            >
              <div class="d-flex align-items-center gap-3">
                <button
                  class="btn btn-light border px-3"
                  style="background: #eef6ff"
                >
                  <Icon
                    name="octicon:sign-out-16"
                    class="display-4 text-primary"
                  />
                </button>
                <div>
                  <h4 class="fw-bold">تسجيل خروج</h4>
                  <div class="text-muted">تسجيل خروج آمن</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      class="modal fade"
      id="resetpasswordProfile"
      data-bs-backdrop="static"
      data-bs-keyboard="false"
      tabindex="-1"
      aria-labelledby="staticBackdropLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog py-4">
        <div class="modal-content text-center">
          <div class="modal-body text-center">
            <form @submit.prevent="onSubmit" novalidate>
              <div class="d-flex flex-column align-items-center">
                <div class="w-md-50 w-75 text-end mt-3">
                  <BasePassword
                    label="كلمة المرور الحالية"
                    placeholder="أدخل كلمة المرور الحالية"
                    v-model="form.password"
                    :error="errors.password"
                  />
                </div>
                <div class="w-md-50 w-75 text-end mt-3">
                  <BasePassword
                    label="كلمة المرور الجديدة"
                    placeholder="أدخل كلمة المرور الجديدة"
                    v-model="form.password"
                    :error="errors.password"
                  />
                </div>
                <div class="w-md-50 w-75 text-end mt-3">
                  <BasePassword
                    label="تأكيد كلمة المرور"
                    placeholder="تأكيد كلمة المرور"
                    v-model="form.passwordConfirm"
                    :error="errors.passwordConfirm"
                  />
                </div>
              </div>
              <div class="text-center mt-3">
                <button
                  class="btn btn-main px-4"
                  type="submit"
                  data-bs-toggle="modal"
                  data-bs-target="#msgChangePassword"
                >
                  تاكيد
                  <Icon
                    name="material-symbols:arrow-back-rounded"
                    class="text-white me-2"
                    size="22"
                  />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    <div
      class="modal fade"
      id="msgChangePassword"
      data-bs-backdrop="static"
      data-bs-keyboard="false"
      tabindex="-1"
      aria-labelledby="Modal1ToggleLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog py-4">
        <div class="modal-content text-center">
          <div class="modal-body text-center">
            <img src="/media/password.png" alt="password" />
            <p>تم تغيير كلمة المرور بنجاح</p>
          </div>
          <div class="d-flex justify-content-center py-5">
            <NuxtLink
              to="/profile"
              class="btn btn-outline d-flex align-items-center"
              @click="closeModal"
            >
              <span>الرجوع للملف الشخصي</span>
              <Icon
                name="material-symbols:arrow-back-rounded"
                class="me-2"
                size="22"
              />
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
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
