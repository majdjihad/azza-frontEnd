<script setup>
import BaseText from "@/components/form/BaseText.vue";
import BasePassword from "@/components/form/BasePassword.vue";
import { useAuth } from "~/composables/useAuth";
import { useProfile } from "~/composables/useProfile";
import { useCategoryStore } from "~/stores/categoryStore";

definePageMeta({ middleware: ["auth"] });
useHead({ title: "تعديل الملف الشخصي" });

const categoryStore = useCategoryStore();
const router = useRouter();
const { user, logout } = useAuth();
const { editProfile, resetPassword } = useProfile();

/* --- تحميل المدن --- */
onMounted(async () => {
  if (!categoryStore?.citiesData) await categoryStore.getCitiesData();
});

/* --- بيانات المستخدم الحالية --- */
const rawUser = computed(
  () => user.value?.data?.user ?? user.value?.user ?? user.value ?? null
);

/* --- فورم تعديل البيانات --- */
const form = reactive({
  name: "",
  phone: "",
  city: "",
  email: "",
});

/* صورة الحساب */
const defaultAvatar = "/media/avatars/user.png";
const avatarPreview = ref(defaultAvatar);
const avatarFile = ref(null);
const fileInputRef = ref(null);

function triggerUpload() {
  fileInputRef.value?.click();
}
function onFileChange(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  avatarFile.value = file;
  if (avatarPreview.value?.startsWith("blob:"))
    URL.revokeObjectURL(avatarPreview.value);
  avatarPreview.value = URL.createObjectURL(file);
}
onBeforeUnmount(() => {
  if (avatarPreview.value?.startsWith("blob:"))
    URL.revokeObjectURL(avatarPreview.value);
});

/* تعبئة الفورم من المستخدم */
watchEffect(() => {
  if (!rawUser.value) return;
  form.name = rawUser.value.name || "";
  form.phone = rawUser.value.phone || "";
  form.city = rawUser.value.city || "";
  form.email = rawUser.value.email || "";
  avatarPreview.value = rawUser.value.photo || defaultAvatar;
});

/* تحقّق الحقول */
const errors = reactive({ phone: "", name: "", city: "", email: "" });
function resetErrors() {
  Object.keys(errors).forEach((k) => (errors[k] = ""));
}
function validate() {
  resetErrors();
  if (!form.phone || !/^(\+?\d{8,15})$/.test(form.phone))
    errors.phone = "يرجى إدخال رقم جوال صحيح";
  if (!form.name || form.name.length < 3)
    errors.name = "الاسم لا يقل عن 3 أحرف";
  if (!form.city) errors.city = "يرجى اختيار المدينة";
  if (form.email && !/^\S+@\S+\.\S+$/.test(form.email))
    errors.email = "البريد الإلكتروني غير صحيح";
  return !Object.values(errors).some(Boolean);
}

/* إرسال تعديل البيانات */
const saving = ref(false);
async function onSubmit() {
  if (!validate()) return;
  try {
    saving.value = true;
    const fd = new FormData();
    fd.append("name", form.name.trim());
    fd.append("phone", form.phone.trim());
    if (form.city) fd.append("city", form.city);
    if (avatarFile.value) fd.append("photo", avatarFile.value);

    await editProfile(fd);
    await router.push("/profile");
  } catch (e) {
    const msg =
      e?.data?.message ||
      e?.response?.data?.message ||
      "حدث خطأ أثناء حفظ التعديلات";
    showToast?.("error", msg);
  } finally {
    saving.value = false;
  }
}

/* ===================== تغيير كلمة المرور ===================== */
const pwd = reactive({ current: "", password: "", passwordConfirm: "" });
const pwdErrors = reactive({ current: "", password: "", passwordConfirm: "" });
const pwdPending = ref(false);

function clearPwd() {
  pwd.current = "";
  pwd.password = "";
  pwd.passwordConfirm = "";
  Object.keys(pwdErrors).forEach((k) => (pwdErrors[k] = ""));
}

function validatePwd() {
  pwdErrors.current = "";
  pwdErrors.password = "";
  pwdErrors.passwordConfirm = "";
  if (!pwd.current) pwdErrors.current = "أدخل كلمة المرور الحالية";
  if (!pwd.password || pwd.password.length < 6)
    pwdErrors.password = "كلمة المرور لا تقل عن 6 أحرف";
  if (pwd.passwordConfirm !== pwd.password)
    pwdErrors.passwordConfirm = "تأكيد كلمة المرور غير متطابق";
  return !Object.values(pwdErrors).some(Boolean);
}

/* مساعدات المودال */
function showModal(id) {
  const el = document.querySelector(id);
  if (!el) return;
  const m = bootstrap.Modal.getOrCreateInstance(el);
  m.show();
  return m;
}
function hideModal(id) {
  const el = document.querySelector(id);
  const m = el ? bootstrap.Modal.getInstance(el) : null;
  m?.hide();
}

/* إرسال تغيير كلمة المرور */
async function submitPasswordChange() {
  if (!validatePwd()) return;
  try {
    pwdPending.value = true;
    await resetPassword({
      oldPassword: pwd.current,
      password: pwd.password,
      password_confirmation: pwd.passwordConfirm,
    });

    // نجاح: نظّف الحقول، أغلق مودال الإدخال وافتح مودال النجاح
    clearPwd();
    hideModal("#resetpasswordProfile");
    showModal("#msgChangePassword");
    showToast?.("success", "تم تغيير كلمة المرور بنجاح");
  } catch (e) {
    const msg =
      e?.data?.message || e?.response?.data?.message || "فشل تغيير كلمة المرور";
    showToast?.("error", msg);
  } finally {
    pwdPending.value = false;
  }
}

const closeSuccessModal = () => hideModal("#msgChangePassword");
/* تسجيل الخروج */
async function handleLogout() {
  try {
    await logout();
  } catch {}
}
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

      <!-- صورة الحساب -->
      <div>
        <div class="d-flex align-items-center mt-8 gap-3">
          <img
            :src="avatarPreview"
            alt="userProfile"
            width="100"
            class="rounded-circle"
          />
          <input
            ref="fileInputRef"
            type="file"
            class="d-none"
            accept="image/*"
            @change="onFileChange"
          />
          <button
            class="btn me-8 d-flex align-items-center justify-content-between"
            style="background: #f3f5fa"
            @click="triggerUpload"
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
              <div class="col-md-4 my-3">
                <BaseText
                  label="اسم المستخدم"
                  placeholder="اسم المستخدم"
                  v-model="form.name"
                  :error="errors.name"
                />
              </div>
              <div class="col-md-4 my-3">
                <BaseText
                  label="رقم الجوال"
                  placeholder="أدخل رقم الجوال"
                  v-model="form.phone"
                  :error="errors.phone"
                  type="tel"
                  inputmode="tel"
                />
              </div>
              <div>
                <div class="col-md-4 my-3">
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
              </div>
            </div>

            <div class="d-flex mt-3">
              <NuxtLink to="/profile" class="btn btn-outline-main px-4 ms-4"
                >رجوع</NuxtLink
              >
              <button
                class="btn btn-main px-4 fw-sumibold align-items-center"
                type="submit"
                :disabled="saving"
              >
                <span v-if="!saving">حفظ التعديلات</span>
                <span
                  v-else
                  class="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                ></span>
                <Icon
                  v-if="!saving"
                  name="material-symbols:arrow-back-rounded"
                  class="text-white me-2"
                  size="22"
                />
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- بطاقة تغيير كلمة المرور -->
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
                    حافظ على امان حسابك بكلمة مرور قوية
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- تسجيل الخروج -->
        <div class="col-12">
          <div class="card card-soft action-tile">
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

      <!-- مودال إدخال كلمة المرور الجديدة -->
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
              <form @submit.prevent="submitPasswordChange" novalidate>
                <div class="d-flex flex-column align-items-center">
                  <div class="w-md-50 w-75 text-end mt-3">
                    <BasePassword
                      label="كلمة المرور الحالية"
                      placeholder="أدخل كلمة المرور الحالية"
                      v-model="pwd.current"
                      :error="pwdErrors.current"
                    />
                  </div>
                  <div class="w-md-50 w-75 text-end mt-3">
                    <BasePassword
                      label="كلمة المرور الجديدة"
                      placeholder="أدخل كلمة المرور الجديدة"
                      v-model="pwd.password"
                      :error="pwdErrors.password"
                    />
                  </div>
                  <div class="w-md-50 w-75 text-end mt-3">
                    <BasePassword
                      label="تأكيد كلمة المرور"
                      placeholder="تأكيد كلمة المرور"
                      v-model="pwd.passwordConfirm"
                      :error="pwdErrors.passwordConfirm"
                    />
                  </div>
                </div>
                <div class="text-center mt-3 d-flex justify-content-center">
                  <button
                    class="btn btn-main px-4"
                    type="submit"
                    :disabled="pwdPending"
                  >
                    <span v-if="!pwdPending">تأكيد</span>
                    <span
                      v-else
                      class="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    <Icon
                      v-if="!pwdPending"
                      name="material-symbols:arrow-back-rounded"
                      class="text-white me-2"
                      size="22"
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

      <!-- مودال نجاح تغيير كلمة المرور -->
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
              <img src="/media/password.png" alt="password" />
              <p>تم تغيير كلمة المرور بنجاح</p>
            </div>
            <div class="d-flex justify-content-center py-5">
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
      <!-- /مودالات -->
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
select {
  background-color: #f6f6f6 !important;
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
