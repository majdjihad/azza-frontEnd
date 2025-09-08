<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from "vue";
import BasePassword from "@/components/form/BasePassword.vue";

useHead({ title: "أعادة تعيين كلمة المرور" });
definePageMeta({ middleware: ["guest"] });
useSeo({
  title: "إعادة تعيين كلمة السر | منصّة AZZA",
  description: "أدخل كلمة مرور جديدة لتأمين حسابك على المنصة.",
  image: "/media/avatars/logo.png",
  canonicalPath: "/reset-password",
  type: "website",
  noindex: true,
});
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
</style>
