<script setup>
import BasePassword from "~/components/form/BasePassword.vue";
import { useAuth } from "~/composables/useAuth";
import { useProfile } from "~/composables/useProfile";
import { useMainStore } from "~/stores/mainStore";

definePageMeta({ middleware: ["auth"] });
useHead({ title: "الملف الشخصي" });
useSeo({
  title: "ملفي الشخصي | منصّة AZZA",
  description:
    "شاهد معلومات حسابك، عدّل بياناتك، وتابع نشاطك على منصّة الإعلانات.",
  image: "/media/avatars/logo.png",
  canonicalPath: "/profile",
  type: "website",
});
const router = useRouter();
const { logout } = useAuth();
const { resetPassword } = useProfile();

const mainStore = useMainStore();

onMounted(async () => {
  try {
    await mainStore.fetchProfile();
    if (!mainStore.profileUser) {
      // غير مسجّل / انتهت الجلسة
      return router.push("/login");
    }
  } catch (e) {
    const status = e?.response?.status ?? e?.status ?? -1;
    if ([401, 419].includes(status)) return router.push("/login");
    console.error("fetchProfile error:", e);
  }
});

/* ===================== كلمة المرور ===================== */
const form = reactive({
  password: "",
  newPassword: "",
  password_confirmation: "",
});
const errors = reactive({
  password: "",
  newPassword: "",
  password_confirmation: "",
});
const inProgress = ref(false);

function resetErrors() {
  Object.keys(errors).forEach((k) => (errors[k] = ""));
}
function clearForm() {
  form.password = "";
  form.newPassword = "";
  form.password_confirmation = "";
}

/* أدوات المودال (Bootstrap) */
function showModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const modal = bootstrap.Modal.getOrCreateInstance(el);
  modal.show();
}
function hideModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const modal = bootstrap.Modal.getInstance(el);
  modal?.hide();
}
function closeSuccessModal() {
  hideModal("msgChangePassword");
}

async function onSubmit() {
  resetErrors();

  if (!form.password.trim()) {
    errors.password = "ادخل كلمة المرور الحالية";
  }
  if (!form.newPassword.trim() || form.newPassword.length < 6) {
    errors.newPassword = "كلمة المرور لا تقل عن 6 أحرف";
  }
  if (form.password_confirmation !== form.newPassword) {
    errors.password_confirmation = "تأكيد كلمة المرور غير متطابق";
  }
  if (Object.values(errors).some(Boolean)) return;

  try {
    inProgress.value = true;

    const res = await resetPassword({
      oldPassword: form.password,
      password: form.newPassword,
      password_confirmation: form.password_confirmation,
    });

    if (res?.success) {
      hideModal("resetpasswordProfile");
      clearForm();
      resetErrors();
      showModal("msgChangePassword");
      showToast?.("success", res?.message || "تم تغيير كلمة المرور بنجاح");
    } else {
      showToast?.("error", res?.message || "حدث خطأ أثناء تغيير كلمة المرور");
    }
  } catch (e) {
    const msg =
      e?.response?.data?.message ||
      e?.data?.message ||
      e?.message ||
      "حدث خطأ أثناء تغيير كلمة المرور";
    showToast?.("error", msg);
    console.error("resetPassword error:", e);
  } finally {
    inProgress.value = false;
  }
}

async function handleLogout() {
  try {
    await logout();
    mainStore.clearProfile?.();
  } catch {}
}
</script>

<template>
  <div class="container mx-auto p-4">
    <div class="page-content my-6">
      <h1>الملف الشخصي</h1>

      <div class="d-flex align-items-center mb-4">
        <NuxtLink to="/" class="fs-5 m-0 fw-medium text-primary d-inline"
          >الرئيسية</NuxtLink
        >
        <Icon
          name="mdi:chevron-left-circle-outline"
          class="fs-3 mx-3 fw-medium text-muted"
        />
        <span class="fs-5 m-0 text-muted text-muted">الملف الشخصي</span>
      </div>

      <!-- حالة تحميل: Skeleton -->
      <div v-if="mainStore.profilePending" class="py-4">
        <div class="d-flex align-items-center justify-content-between mt-8">
          <div class="d-flex justify-center align-items-center gap-3">
            <div class="skeleton skeleton-avatar rounded-circle"></div>
            <div
              class="d-flex flex-column align-items-start justify-content-center"
            >
              <div class="skeleton skeleton-line w-200 mb-2"></div>
              <div class="skeleton skeleton-line w-140"></div>
            </div>
          </div>
          <div class="skeleton skeleton-pill w-160 h-40"></div>
        </div>

        <div class="card card-soft my-4">
          <div class="card-body">
            <div class="row g-3">
              <div
                class="col-12 mt-4 col-md-6"
                v-for="i in 5"
                :key="'tile-' + i"
              >
                <div class="skeleton skeleton-line w-120 mb-2"></div>
                <div class="skeleton skeleton-tile rounded"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="row g-3">
          <div class="col-12" v-for="i in 2" :key="'action-' + i">
            <div class="card card-soft action-tile">
              <div
                class="card-body d-flex align-items-center justify-content-between"
              >
                <div class="d-flex align-items-center gap-3">
                  <div class="skeleton skeleton-icon rounded"></div>
                  <div>
                    <div class="skeleton skeleton-line w-180 mb-2"></div>
                    <div class="skeleton skeleton-line w-240"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- المحتوى -->
      <template v-else-if="mainStore.profile">
        <div class="d-flex align-items-center justify-content-between mt-8">
          <div
            class="d-flex flex-column flex-md-row justify-center align-items-center gap-3"
          >
            <img
              :src="mainStore.profile.avatar"
              :alt="mainStore.profile.fullName"
              width="73"
              height="73"
              class="rounded-circle"
            />
            <div
              class="text-dark d-flex flex-column align-items-start justify-content-center"
            >
              <span class="text-dark fs-3 fw-bold">{{
                mainStore.profile.fullName
              }}</span>
              <span class="text-muted fs-3 mt-2">{{
                mainStore.profile.phone
              }}</span>
            </div>
          </div>

          <NuxtLink to="/profile/edit" class="btn btn-outline-main">
            <h5 class="mb-0 ms-4 text-primary">تعديل البيانات</h5>
            <Icon name="material-symbols:arrow-back-rounded" size="20" />
          </NuxtLink>
        </div>

        <div class="card card-soft border-0 my-4" style="background: #f8f8f8">
          <div class="card-body">
            <div class="row g-3">
              <div class="col-12 my-3 col-md-5">
                <div class="label-muted fw-medium fs-5 mb-2">الإسم الكامل</div>
                <div class="text-muted bg-white p-4 rounded fs-6">
                  {{ mainStore.profile.fullName }}
                </div>
              </div>
              <div class="col-12 my-3 col-md-5">
                <div class="label-muted fw-medium fs-5 mb-2">رقم الجوال</div>
                <div class="text-muted bg-white p-4 rounded fs-6">
                  {{ mainStore.profile.phone }}
                </div>
              </div>
            </div>
            <div class="row g-3">
              <div class="col-12 my-3 col-md-5">
                <div class="label-muted fw-medium fs-5 mb-2">
                  البريد الإلكتروني
                </div>
                <div class="text-muted bg-white p-4 rounded fs-6">
                  {{ mainStore.profile.email }}
                </div>
              </div>
              <div class="col-12 my-3 col-md-5" v-if="mainStore.profile?.city">
                <div class="label-muted fw-medium fs-5 mb-2">المدينة</div>
                <div class="text-muted bg-white p-4 rounded fs-6">
                  {{ mainStore.profile?.city }}
                </div>
              </div>
            </div>

            <div class="col-12 my-3 col-md-5">
              <div class="label-muted fw-medium fs-5 mb-2">تاريخ الانضمام</div>
              <div class="text-muted bg-white p-4 rounded fs-6">
                {{ mainStore.profile.joinedAt }}
              </div>
            </div>
          </div>
        </div>

        <!-- إجراءات -->
        <div class="row g-3">
          <div class="col-12">
            <div
              class="card card-soft border-0 action-tile"
              style="background-color: #f8f8f8"
            >
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
                      class="display-6 text-primary"
                    />
                  </button>
                  <div>
                    <h4 class="fw-bold">تغيير كلمة المرور</h4>
                    <div class="text-muted">
                      حافظ على أمان حسابك بكلمة مرور قوية
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- تسجيل الخروج -->
          <div class="col-12">
            <div
              class="card card-soft border-0 action-tile"
              style="background-color: #f8f8f8"
            >
              <div
                class="card-body d-flex align-items-center justify-content-between"
              >
                <div class="d-flex align-items-center gap-3">
                  <button
                    class="btn btn-light border px-3"
                    style="background: #eef6ff"
                    @click="handleLogout"
                  >
                    <Icon
                      name="octicon:sign-out-16"
                      class="display-6 text-primary"
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
      </template>

      <!-- fallback -->
      <div v-else class="text-center py-5">
        <NuxtLink to="/login" class="btn btn-main px-4">تسجيل الدخول</NuxtLink>
      </div>
    </div>

    <!-- مودال تغيير كلمة المرور -->
    <div
      class="modal fade"
      id="resetpasswordProfile"
      data-bs-backdrop="static"
      data-bs-keyboard="false"
      tabindex="-1"
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
                  <BasePassword
                    label="كلمة المرور الجديدة"
                    placeholder="أدخل كلمة المرور الجديدة"
                    v-model="form.newPassword"
                    :error="errors.newPassword"
                  />
                </div>
                <div class="w-md-50 w-75 text-end mt-3">
                  <BasePassword
                    label="تأكيد كلمة المرور"
                    placeholder="تأكيد كلمة المرور"
                    v-model="form.password_confirmation"
                    :error="errors.password_confirmation"
                  />
                </div>
              </div>
              <div class="text-center mt-3 d-flex justify-content-center">
                <button
                  class="btn btn-main px-4"
                  :disabled="inProgress"
                  type="submit"
                >
                  <template v-if="!inProgress">
                    تأكيد
                    <Icon
                      name="material-symbols:arrow-back-rounded"
                      class="text-white me-2"
                      size="22"
                    />
                  </template>
                  <icon
                    v-else
                    name="svg-spinners:ring-resize"
                    class="indicator-label fs-1"
                  />
                </button>
              </div>
            </form>
          </div>
          <div class="modal-footer justify-content-center">
            <button class="btn btn-outline-secondary" data-bs-dismiss="modal">
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- مودال رسالة النجاح -->
    <div
      class="modal fade"
      id="msgChangePassword"
      data-bs-backdrop="static"
      data-bs-keyboard="false"
      tabindex="-1"
      aria-hidden="true"
    >
      <div class="modal-dialog py-4">
        <div class="modal-content text-center">
          <div class="modal-body text-center">
            <NuxtImg src="/media/password.png" alt="password" />
            <p class="mt-3 mb-0">تم تغيير كلمة المرور بنجاح</p>
          </div>
          <div class="d-flex justify-content-center py-4">
            <NuxtLink
              to="/profile"
              class="btn btn-outline d-flex align-items-center"
              @click="closeSuccessModal"
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
/* ====== Skeleton (Shimmer) ====== */
.skeleton {
  position: relative;
  overflow: hidden;
  background: #eef1f5;
  border-radius: 0.5rem;
}
.skeleton::after {
  content: "";
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background-image: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.7) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  animation: shimmer 1.6s infinite;
}
@media (prefers-reduced-motion: reduce) {
  .skeleton::after {
    animation: none;
  }
}
@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}
.skeleton-avatar {
  width: 60px;
  height: 60px;
}
.skeleton-line {
  height: 14px;
}
.skeleton-icon {
  width: 60px;
  height: 60px;
}
.skeleton-pill {
  border-radius: 9999px;
  height: 40px;
}
.skeleton-tile {
  height: 56px;
  background: #f3f5f8;
  border: 1px solid #eef0f3;
}
.w-80 {
  width: 80px;
}
.w-120 {
  width: 120px;
}
.w-140 {
  width: 140px;
}
.w-160 {
  width: 160px;
}
.w-180 {
  width: 180px;
}
.w-200 {
  width: 200px;
}
.w-240 {
  width: 240px;
}
.h-32 {
  height: 32px;
}
.h-40 {
  height: 40px;
}

/* ====== بقية الأنماط ====== */
.card-soft {
  border: 1px solid #eef0f3;
  border-radius: 0.75rem;
}
.form-tile {
  background: #fafbfc;
  border: 1px solid #eef0f3;
}
.btn-outline-main {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.9rem;
  border: 1px solid #d7e3ff;
  border-radius: 0.5rem;
  color: #2563eb;
  background: #f8fbff;
}
.bg-muted {
  background-color: #f9f9fa !important;
}
</style>
