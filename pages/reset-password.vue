<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from "vue";
import BasePassword from "@/components/form/BasePassword.vue";

useHead({ title: "أعادة تعيين كلمة المرور" });

const { resetPassword } = useAuth();
const route = useRoute();
const router = useRouter();

const form = reactive({
  email: route.query.email,
  verification_code: route.query.code,
  password: "",
  password_confirmation: "",
});

const errors = reactive({
  password: "",
  password_confirmation: "",
});

function resetErrors() {
  Object.keys(errors).forEach((k) => (errors[k] = ""));
}

const modalEl = ref(null);
let modal = null;

onMounted(async () => {
  const bs = await import("bootstrap/dist/js/bootstrap.bundle.min.js");
  if (modalEl.value) {
    modal = new bs.Modal(modalEl.value, {
      backdrop: "static",
      keyboard: false,
    });
  }
});

onBeforeUnmount(() => {
  if (modal && modal.dispose) modal.dispose();
  modal = null;
});

const openModal = () => modal && modal.show && modal.show();
const closeModal = () => modal && modal.hide && modal.hide();
// ===================================================

function onSubmit() {
  resetErrors();
  if (!form.password || form.password.length < 6)
    errors.password = "كلمة المرور لا تقل عن 6 أحرف";
  if (form.password_confirmation !== form.password)
    errors.password_confirmation = "تأكيد كلمة المرور غير متطابق";
  const hasError = Object.values(errors).some(Boolean);
  if (!hasError) formHandle();
}

const inProgress = ref(false);

// handle form
const formHandle = async () => {
  try {
    inProgress.value = true;
    const { submit } = useSubmit(() => resetPassword(form), {
      onSuccess: (response) => {
        openModal();
        showToast("success", response?.message || "تم تغيير كلمة السر بنجاح");
        setTimeout(() => router.push({ path: "/login" }), 1500);
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
    showToast("error", error?.data?.message || "فشل التسجيل");
  } finally {
    inProgress.value = false;
  }
};
</script>

<template>
  <section class="py-5 pb-9">
    <div class="container">
      <div class="row flex-column-reverse flex-md-row g-9 align-items-stretch">
        <div class="col-lg-5 col-md-6">
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
        <div class="col-lg-7 col-md-6 py-9">
          <div class="card border-0 py-9 h-100 bg-white">
            <div class="card-body p-4 p-md-5">
              <h1 class="fw-bold text-end mb-4">
                <span class="display-4">👋</span>مرحبًا بك
              </h1>
              <p class="text-muted my-9">إنشاء كلمة مرور جديدة</p>

              <form @submit.prevent="onSubmit" novalidate>
                <div>
                  <div class="w-md-50 w-75">
                    <BasePassword
                      label="كلمة المرور الجديدة"
                      placeholder="أدخل كلمة المرور الجديدة"
                      v-model="form.password"
                      :error="errors.password"
                    />
                  </div>
                  <div class="w-md-50 w-75">
                    <BasePassword
                      label="تأكيد كلمة المرور"
                      placeholder="تأكيد كلمة المرور"
                      v-model="form.password_confirmation"
                      :error="errors.password_confirmation"
                    />
                  </div>
                </div>
                <div class="text-end mt-3">
                  <button
                    class="btn btn-main px-4"
                    type="submit"
                    :disabled="inProgress"
                  >
                    <span v-if="!inProgress">
                      تاكيد
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
                  <div
                    class="modal fade"
                    id="staticBackdrop"
                    data-bs-backdrop="static"
                    data-bs-keyboard="false"
                    tabindex="-1"
                    aria-labelledby="staticBackdropLabel"
                    aria-hidden="true"
                    ref="modalEl"
                  >
                    <div class="modal-dialog py-4">
                      <div class="modal-content text-center">
                        <div class="modal-body text-center">
                          <img src="/media/password.png" alt="password" />
                          <p>تم تغيير كلمة المرور بنجاح</p>
                        </div>
                        <div class="d-flex justify-content-center py-5">
                          <NuxtLink
                            to="/login"
                            class="btn btn-outline d-flex align-items-center"
                            @click="closeModal"
                          >
                            <span>تسجيل الدخول</span>
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
.modal-dialog {
  width: 350px;
}
</style>
