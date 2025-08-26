<script setup>
import BasePassword from "@/components/form/BasePassword.vue";

useHead({
  title: "Profile",
});
const user = reactive({
  fullName: "حسين الصوالحي",
  phone: "+972592072429",
  email: "husseinsawalhy8@gmail.com",
  city: "مدينة غزة",
  joinedAt: "10-07-2025",
  avatar: "/media/avatars/user.png",
});
const form = reactive({
  password: "",
  passwordConfirm: "",
});

const errors = reactive({
  password: "",
  passwordConfirm: "",
});
function resetErrors() {
  Object.keys(errors).forEach((k) => (errors[k] = ""));
}

function onSubmit() {
  resetErrors();
  if (!form.password || form.password.length < 6)
    errors.password = "كلمة المرور لا تقل عن 6 أحرف";
  if (form.passwordConfirm !== form.password)
    errors.passwordConfirm = "تأكيد كلمة المرور غير متطابق";
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
      <h1>الملف الشخصي</h1>
      <div class="d-flex align-items-center mb-4">
        <h2 class="fs-3 m-0 fw-normal text-primary d-inline">الرئيسية</h2>
        <Icon
          name="mdi:chevron-left-circle-outline"
          class="fs-3 mx-3 text-secondary"
        />
        <h2 class="fs-3 m-0 fw-semibold text-muted">الملف الشخصي</h2>
      </div>
      <div>
        <div class="d-flex align-items-center justify-content-between mt-8">
          <div class="d-flex justify-center align-items-center gap-3">
            <img
              :src="user.avatar"
              alt="userProfile"
              width="60"
              class="rounded-circle"
            />
            <div>
              <div
                class="text-dark text-decoration-none d-flex flex-column align-items-start justify-content-center"
              >
                <span class="text-dark fs-4">مجد قويدر</span>
                <span class="text-secondary fs-5">972592142714+</span>
              </div>
            </div>
          </div>
          <NuxtLink to="/products" class="btn-outline-main">
            <h5 class="mb-0 ms-4 text-primary">تعديل البيانات</h5>
            <Icon
              name="material-symbols:arrow-back-rounded"
              class=""
              size="20"
            />
          </NuxtLink>
        </div>
      </div>
      <div class="card card-soft my-4">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-12 mt-4 col-md-6">
              <div class="label-muted fw-bold fs-4 mb-2">الاسم الكامل</div>
              <div class="form-tile bg-muted p-4 rounded">
                {{ user.fullName }}
              </div>
            </div>
            <div class="col-12 mt-4 col-md-6">
              <div class="label-muted fw-bold fs-4 mb-2">رقم الجوال</div>
              <div class="form-tile bg-muted p-4 rounded">
                {{ user.phone }}
              </div>
            </div>
            <div class="col-12 mt-4 col-md-6">
              <div class="label-muted fw-bold fs-4 mb-2">البريد الإلكتروني</div>
              <div class="form-tile bg-muted p-4 rounded">
                {{ user.email }}
              </div>
            </div>
            <div class="col-12 mt-4 col-md-6">
              <div class="label-muted fw-bold fs-4 mb-2">المدينة</div>
              <div class="form-tile bg-muted p-4 rounded">
                {{ user.city }}
              </div>
            </div>
            <div class="col-12 mt-4 col-md-6">
              <div class="label-muted fw-bold fs-4 mb-2">تاريخ الانضمام</div>
              <div class="form-tile bg-muted p-4 rounded">
                {{ user.joinedAt }}
              </div>
            </div>
          </div>
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
</style>