<!-- pages/ads/create.vue -->
<script setup>
import vueFilePond from "vue-filepond";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import FilePondPluginFileValidateSize from "filepond-plugin-file-validate-size";
import BaseText from "@/components/form/BaseText.vue";
import BaseSelect from "~/components/form/BaseSelect.vue";

const categories = [
  { name: "خدمات" },
  { name: "أثاث" },
  { name: "أجهزة" },
  { name: "سيارات" },
  { name: "عقارات" },
  { name: "وظائف" },
  { name: "أطعمة" },
  { name: "مفقودات" },
];

const FilePond = vueFilePond(
  FilePondPluginImagePreview,
  FilePondPluginFileValidateType,
  FilePondPluginFileValidateSize
);

/* الحالة العامة */
const step = ref(1);
const adName = ref("");

/* ملفات FilePond */
const mainFiles = ref([]); // صورة رئيسية: عنصر واحد
const galleryFiles = ref([]); // صور فرعية: حتى 5

/* معاينات مخصصة (Object URLs) */
const mainPreviewUrl = ref(null);
const galleryPreviewUrls = ref([]);

/* توليد / تنظيف الروابط */
watch(
  mainFiles,
  (files, prev) => {
    if (mainPreviewUrl.value) URL.revokeObjectURL(mainPreviewUrl.value);
    mainPreviewUrl.value = files.length
      ? URL.createObjectURL(files[0].file)
      : null;
  },
  { deep: true }
);

watch(
  galleryFiles,
  (files) => {
    // نظّف القديم
    galleryPreviewUrls.value.forEach((u) => URL.revokeObjectURL(u));
    // أنشئ الجديد
    galleryPreviewUrls.value = files.map((f) => URL.createObjectURL(f.file));
  },
  { deep: true }
);

onBeforeUnmount(() => {
  if (mainPreviewUrl.value) URL.revokeObjectURL(mainPreviewUrl.value);
  galleryPreviewUrls.value.forEach((u) => URL.revokeObjectURL(u));
});

const canNext = computed(() => mainFiles.value.length > 0);

const sending = ref(false);
const errorMsg = ref("");

/* إزالة */
function removeMain() {
  if (mainPreviewUrl.value) URL.revokeObjectURL(mainPreviewUrl.value);
  mainPreviewUrl.value = null;
  mainFiles.value = [];
}
function removeSubAt(i) {
  if (galleryPreviewUrls.value[i])
    URL.revokeObjectURL(galleryPreviewUrls.value[i]);
  galleryPreviewUrls.value.splice(i, 1);
  galleryFiles.value.splice(i, 1);
}

async function submitAll() {
  errorMsg.value = "";
  if (!adName.value.trim()) {
    errorMsg.value = "الرجاء إدخال اسم الإعلان";
    return;
  }
  if (!mainFiles.value.length) {
    errorMsg.value = "الرجاء اختيار الصورة الرئيسية";
    return;
  }

  const fd = new FormData();
  fd.append("name", adName.value);
  fd.append("main_image", mainFiles.value[0].file);
  galleryFiles.value
    .slice(0, 5)
    .forEach((f) => fd.append("gallery_images[]", f.file));

  try {
    sending.value = true;
    const res = await fetch("/api/ads", { method: "POST", body: fd });
    if (!res.ok)
      throw new Error((await res.text().catch(() => "")) || "فشل الإرسال");

    // نجاح
    adName.value = "";
    removeMain();
    // تنظيف الفرعيات
    [...galleryPreviewUrls.value].forEach((u) => URL.revokeObjectURL(u));
    galleryPreviewUrls.value = [];
    galleryFiles.value = [];
    step.value = 1;
    alert("تم إنشاء الإعلان بنجاح 🎉");
  } catch (e) {
    errorMsg.value = e?.message || "حدث خطأ غير متوقع";
  } finally {
    sending.value = false;
  }
}
const API_BASE = useRuntimeConfig().public.API_BASE;

const form = reactive({
  title: "",
  phone: "",
  email: "",
  subCategory: "",
  duration: "",
  details: "",
  city: "",
  price: "",
  negotiable: false,
  currency: "",
  area: "",
  rooms: "0",
  furnished: "",
  buildingType: "",
});

const errors = reactive({});

const cities = ref([
  { name: "مدينة غزة", value: "all" },
  { name: "جباليا", value: "real-estate" },
  { name: "بيت لاهيا", value: "cars" },
  { name: "بيت حانون", value: "furniture" },
  { name: "خانيونس", value: "services" },
  { name: "دير البلح", value: "services" },
  { name: "النصيرات", value: "services" },
  { name: "رفح", value: "services" },
]);

const subCategories = ref([
  { value: "خدمات", label: "خدمات" },
  { value: "أثاث", label: "أثاث" },
  { value: "أجهزة", label: "أجهزة" },
  { value: "سيارات", label: "سيارات" },
  { value: "عقارات", label: "عقارات" },
  { value: "وظائف", label: "وظائف" },
  { value: "أطعمة", label: "أطعمة" },
  { value: "مفقودات", label: "مفقودات" },
]);

const currencies = ref([
  { value: "ILS", label: "شيكل" },
  { value: "USD", label: "دولار" },
  { value: "EUR", label: "يورو" },
  { value: "JOR", label: "دينار" },
]);
const buildingTypes = ref([]);
const furnishedOptions = [
  { value: "yes", label: "نعم" },
  { value: "no", label: "لا" },
];
const roomOptions = Array.from({ length: 10 }, (_, i) => ({
  value: String(i),
  label: String(i),
}));

function validate() {
  Object.keys(errors).forEach((k) => delete errors[k]);
  if (!form.title || form.title.length < 3)
    errors.title = "أدخل عنواناً مناسباً";
  if (!form.phone || form.phone.length < 7) errors.phone = "رقم هاتف غير صالح";
  if (!form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errors.email = "بريدك الالكتروني غير صالح";
  if (!form.subCategory) errors.subCategory = "اختر التصنيف الفرعي";
  if (!form.city) errors.city = "اختر المدينة";
  if (!form.duration) errors.duration = "اختر مدة ظهور الإعلان";
  if (!form.details || form.details.length < 10)
    errors.details = "أدخل تفاصيل كافية";
  if (!form.price) errors.price = "أدخل السعر";
  if (!form.currency) errors.currency = "اختر العملة";
  return Object.keys(errors).length === 0;
}

const submitting = ref(false);
const toast = ref({ type: "", msg: "" });

async function submit() {
  if (!validate()) return;
  submitting.value = true;
  try {
    const payload = {
      title: form.title,
      phone: `${form.phoneCode}${form.phone}`,
      email: form.email || undefined,
      city_id: form.city,
      duration_months: Number(form.duration),
      description: form.details,
      price: Number(form.price),
      negotiable: form.negotiable,
      currency: form.currency,
      area: form.area ? Number(form.area) : undefined,
      rooms: Number(form.rooms),
      furnished: form.furnished === "yes",
      building_type_id: form.buildingType || undefined,
    };
    await $fetch(`${API_BASE}/ads`, { method: "POST", body: payload });
    toast.value = { type: "success", msg: "تم نشر الإعلان بنجاح" };
    // مثال: navigateTo('/ads/mine')
  } catch (e) {
    toast.value = {
      type: "danger",
      msg: (e && e.data && e.data.message) || "حدث خطأ أثناء النشر",
    };
  } finally {
    submitting.value = false;
  }
}
// phone input handle

const dialCode = ref("+970");
const phone = ref("");
const phoneError = ref("");

function normalizePhone(v) {
  return v.replace(/[^\d]/g, ""); // أرقام فقط
}

function validatePhone() {
  const digits = normalizePhone(phone.value);

  if (!digits) {
    phoneError.value = "رقم الهاتف مطلوب";
    return false;
  }
  // مثال تحقق بسيط: 9 أرقام محلية بدون صفر البداية
  if (!/^\d{9}$/.test(digits)) {
    phoneError.value = "أدخل 9 أرقام بدون صفر البداية";
    return false;
  }
  // (اختياري) لو أردت تقييد البداية: 56 أو 59
  if (!/^5[69]\d{7}$/.test(digits)) {
    phoneError.value = "يجب أن يبدأ بـ 59 أو 56";
    return false;
  }

  phoneError.value = "";
  return true;
}

function onPhoneInput(e) {
  // تنظيف وإعادة ضبط القيمة أثناء الكتابة
  const digits = normalizePhone(e.target.value).slice(0, 15);
  phone.value = digits;

  // إن كان هناك خطأ مُسبق، أعد التحقق لتختفي الرسالة عند التصحيح
  if (phoneError.value) validatePhone();
}
</script>

<template>
  <div class="container py-4">
    <h1 class="mb-4">إضافة إعلان جديد</h1>
    <div class="d-flex align-items-center pb-9">
      <h2 class="fs-3 m-0 fw-normal text-primary d-inline">الرئيسية</h2>
      <Icon
        name="mdi:chevron-left-circle-outline"
        class="fs-3 mx-3 text-secondary"
      />
      <h2 class="fs-3 m-0 fw-semibold text-muted">إضافة إعلان جديد</h2>
    </div>

    <!-- شريط تقدم -->
    <div class="d-flex align-items-center gap-3 mb-4">
      <span
        :class="[
          'badge rounded-pill step-dot fs-3',
          step >= 1 ? 'text-light bg-primary' : 'text-bg-secondary',
        ]"
        >1</span
      >
      <div class="flex-grow-1">
        <div class="progress" style="height: 6px">
          <div
            class="progress-bar bg-primary"
            :style="{ width: step === 1 ? '0%' : '100%' }"
          ></div>
        </div>
      </div>
      <span
        :class="[
          'badge rounded-pill step-dot fs-3',
          step >= 2 ? 'text-light bg-primary' : 'text-bg-secondary',
        ]"
        >2</span
      >
      <div class="flex-grow-1">
        <div class="progress" style="height: 6px">
          <div
            class="progress-bar bg-primary"
            :style="{ width: step > 2 ? '100%' : '0%' }"
          ></div>
        </div>
      </div>
      <span
        :class="[
          'badge rounded-pill step-dot fs-3',
          step === 3 ? 'text-light bg-primary' : 'text-bg-secondary',
        ]"
        >3</span
      >
    </div>
    <!-- الخطوة 1: اختيار التصنيف -->
    <div v-if="step === 1" class="categories my-5">
      <div class="mb-9 text-end">
        <h2>اختر القسم المناسب</h2>
        <p class="text-muted">حدد القسم التي يناسب إعلانك بشكل أفضل</p>
      </div>
      <div class="row g-3">
        <div
          class="col-6 col-md-3 my-3 p-0"
          v-for="(cat, index) in categories"
          :key="index"
        >
          <div
            class="card overflow-hidden overlay-card position-relative cursor-pointer"
            @click="step = 2"
            :style="{
              backgroundImage: `url(/media/bg-home/bg${index + 1}.png)`,
            }"
          >
            <div
              class="card-body text-center position-absolute top-50 start-50 translate-middle"
            >
              <img
                :src="`/media/categories/${cat.name}.png`"
                class="w-75"
                :alt="cat.name"
              />
              <h5 class="card-title mt-4 text-white">{{ cat.name }}</h5>
            </div>
          </div>
        </div>
      </div>
      <div class="d-flex justify-content-center mt-3">
        <button class="btn btn-main px-4" @click="step = 2">
          <!-- :disabled="!canNext" -->
          التالي
          <Icon
            name="material-symbols:arrow-back-rounded"
            class="text-white"
            size="20"
          />
        </button>
      </div>
    </div>
    <!-- الخطوة 2: الصور -->
    <div v-else-if="step === 2">
      <div class="card border-0 shadow-sm p-3 p-md-4">
        <!-- الرئيسية -->
        <div class="mb-4">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h6 class="mb-0 fw-semibold">
              <button
                class="btn btn-lg p-0"
                v-if="step === 2"
                @click="step = 1"
              >
                <Icon
                  name="material-symbols:arrow-right-alt-rounded"
                  class="text-dark display-5 m-0"
                />
              </button>
              الصورة الرئيسية للاعلان (صورة واحدة)
            </h6>
            <small class="text-muted">حتى 1MB</small>
          </div>
          <p class="text-muted mb-4">
            هذه هي الصورة التي ستظهر أولاً في نتائج البحث وقائمة الإعلانات.
          </p>
          <FilePond
            v-if="!mainPreviewUrl"
            class="pond pond-rtl pond-fill-parent hide-pond-list drop-card drop-card--tall cursor-pointer"
            v-model="mainFiles"
            :allow-multiple="false"
            accepted-file-types="image/*"
            max-file-size="1MB"
            label-idle="إسحب وأسقط أو <span class='filepond--label-action text-primary fw-bold'>اضغط هنا</span> لختيار الصور"
          />
          <div
            v-if="mainPreviewUrl"
            class="hero-preview mt-3 position-relative rounded-3 overflow-hidden"
          >
            <img
              :src="mainPreviewUrl"
              alt="main preview"
              class="w-100 h-100 object-cover"
            />
            <button
              type="button"
              class="btn btn-sm btn-danger position-absolute remove-btn"
              @click="removeMain"
              aria-label="حذف"
            >
              حذف
            </button>
          </div>
        </div>
        <div class="mb-3">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h6 class="mb-0 fw-semibold">باقي الصور (حتى 5)</h6>
            <small class="text-muted">حتى 1MB/صورة</small>
          </div>
          <p class="text-muted mb-4">
            يمكنك رفع صور إضافية لعرض تفاصيل أكثر عن الإعلان.
          </p>
          <FilePond
            class="pond pond-rtl pond-sub hide-pond-list cursor-pointer"
            v-model="galleryFiles"
            :allow-multiple="true"
            :max-files="5"
            accepted-file-types="image/*"
            max-file-size="1MB"
            label-idle="إسحب وأسقط أو <span class='filepond--label-action text-primary fw-bold'>اضغط هنا</span> لختيار الصور"
          />
          <div v-if="galleryPreviewUrls.length" class="row g-3 mt-2">
            <div
              v-for="(url, i) in galleryPreviewUrls"
              :key="url"
              class="col-12 col-sm-6 col-md-4"
            >
              <div
                class="card sub-card h-100 border-0 shadow-xs position-relative"
              >
                <img :src="url" alt="" class="card-img-top sub-img" />
                <button type="button" class="sub-check" aria-hidden="true">
                  ✓
                </button>
                <button
                  type="button"
                  class="sub-remove"
                  @click="removeSubAt(i)"
                  aria-label="حذف"
                ></button>
                <div class="card-body py-2">
                  <div class="small text-muted text-truncate">
                    صورة رقم {{ i + 1 }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="d-flex justify-content-center mt-3">
        <button class="btn btn-main px-4" @click="step = 3">
          <!-- :disabled="!canNext" -->
          التالي
          <Icon
            name="material-symbols:arrow-back-rounded"
            class="text-white"
            size="20"
          />
        </button>
      </div>
    </div>
    <!-- الخطوة 3: تفاصيل الاعلان + إرسال -->
    <div v-else class="py-4">
      <div class="card shadow-sm rounded-3 mb-4 border-0">
        <div class="mb-3 px-9 py-5">
          <div class="d-flex align-items-center gap-2">
            <h5 class="m-0 fw-bold">
              <button
                class="btn btn-lg p-0"
                v-if="step === 3"
                @click="step = 2"
              >
                <Icon
                  name="material-symbols:arrow-right-alt-rounded"
                  class="text-dark display-5 m-0"
                />
              </button>
              إدخال بيانات الإعلان
            </h5>
          </div>
          <p class="text-muted pe-9">
            أدخل معلومات إعلانك بشكل واضح ومفصل، لتساعد المهتمين على فهم محتواه
            واتخاذ قرارهم بسهولة.
          </p>
        </div>
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-6">
              <BaseText
                v-model="form.title"
                label="عنوان الإعلان *"
                placeholder="مثال: بيت 5 طوابق للبيع بسعر مغري"
                :error="errors.title"
              />
            </div>
            <div class="col-md-6">
              <BaseSelect
                label="التصنيف الفرعي *"
                placeholder="اختر التصنيف الفرعي للاعلان"
                :options="subCategories"
                v-model="form.subCategory"
                :error="errors.subCategory"
              />
            </div>
            <div class="col-md-6">
              <BaseText
                label="رقم الهاتف *"
                placeholder="أدخل رقم الهاتف"
                v-model="form.phone"
                :error="errors.phone"
                type="tel"
                inputmode="tel"
              />
            </div>
            <div class="col-md-6">
              <BaseText
                v-model="form.email"
                type="email"
                label="البريد الإلكتروني *"
                placeholder="example@gmail.com"
                :error="errors.email"
              >
              </BaseText>
            </div>
            <div class="col-md-6">
              <BaseSelect
                v-model="form.city"
                label="المدينة *"
                :options="cities"
                placeholder="اختر المدينة"
                :error="errors.city"
              />
            </div>
            <div class="col-md-6">
              <label class="form-label mb-2 fw-medium text-dark"
                >مدة الإعلان *</label
              >
              <input
                type="number"
                class="form-control"
                :class="{
                  'is-invalid': errors.duration,
                }"
                v-model="form.duration"
              />

              <div v-if="errors.duration" class="invalid-feedback d-block">
                {{ errors.duration }}
              </div>
            </div>

            <div class="col-12">
              <label class="form-label mb-2 fw-medium text-dark"
                >تفاصيل الإعلان *</label
              >
              <textarea
                class="form-control text-end rounded-1"
                rows="7"
                placeholder="أدخل تفاصيل الإعلان ..."
                v-model="form.details"
                :class="{ 'is-invalid': !!errors.details }"
              ></textarea>
              <div v-if="errors.details" class="invalid-feedback d-block">
                {{ errors.details }}
              </div>
            </div>
            <div
              class="price col-md-6 d-flex gap-0 align-items-center btn-group"
            >
              <BaseText
                v-model="form.price"
                label="السعر *"
                placeholder="أدخل السعر هنا"
                inputmode="numeric"
                :error="errors.price"
                class="col-9"
              />
              <div
                class="form-check-sm col-3 bg-secondary rounded-1 rounded-end-0 d-flex align-items-center align-self-center"
                style="margin-top: 18px; padding: 11px"
              >
                <input
                  class="form-check-input"
                  type="checkbox"
                  id="neg"
                  v-model="form.negotiable"
                />
                <label class="form-check-label me-1 text-white" for="neg"
                  >قابل للتفاوض</label
                >
              </div>
            </div>

            <!-- العملة -->
            <div class="col-md-6">
              <BaseSelect
                v-model="form.currency"
                label="العملة *"
                :options="currencies"
                placeholder="اختر العملة"
                :error="errors.currency"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="card shadow-sm rounded-3 mb-4 border-0">
        <div class="mb-3 px-9 py-5">
          <h5 class="m-0 fw-bold">بيانات إضافية</h5>
          <p class="text-muted">أضف تفاصيل أكثر... لتظهر بثقة أكبر</p>
        </div>
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-6">
              <BaseText
                v-model="form.area"
                label="المساحة"
                placeholder="م²"
                inputmode="numeric"
              />
            </div>

            <div class="col-md-6">
              <BaseSelect
                v-model="form.rooms"
                label="الغرف"
                :options="roomOptions"
                placeholder="0"
              />
            </div>

            <div class="col-md-6">
              <BaseSelect
                v-model="form.buildingType"
                label="نوع البناء"
                :options="buildingTypes"
                placeholder="نوع البناء"
              />
            </div>

            <div class="col-md-6">
              <BaseSelect
                v-model="form.furnished"
                label="مفروشة"
                :options="furnishedOptions"
                placeholder="اختر"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- زر الإرسال -->
      <div class="text-center">
        <button
          :disabled="submitting"
          @click="submit"
          class="btn btn-lg btn-view-all"
        >
          <div v-if="!submitting">
            <span class="mb-0 text-white">نشر الاعلان</span>
            <Icon
              name="material-symbols:arrow-back-rounded"
              class="text-white"
              size="20"
            />
          </div>
          <span
            v-else
            class="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
          ></span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay-card {
  position: relative;
  background-size: cover;
  background-position: center;
  height: 200px;
  margin: 0 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
  overflow: hidden;
}

.overlay-card::before {
  content: "";
  position: absolute;
  inset: 0;
  backdrop-filter: blur(5px);
  z-index: 1;
}

.overlay-card .card-body {
  position: relative;
  z-index: 1;
}

.overlay-card:hover {
  transform: scale(1.05); /* تكبير خفيف عند المرور */
}
.pond-main .filepond--panel-root {
  min-height: 240px;
}
.pond-sub .filepond--panel-root {
  min-height: 1080px;
}
.pond .filepond--panel-root {
  background: #fff;
  border: 1px dashed #d9dee7;
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(31, 41, 55, 0.06);
}
.pond .filepond--drop-label {
  color: #6b7280;
  padding: 1.1rem 1rem;
  font-size: 0.95rem;
}
.filepond--root .filepond--credits {
  display: none !important;
}

.pond-rtl .filepond--drop-label {
  text-align: center;
}

.hero-preview {
  height: 50vh;
  max-height: 580px;
}
.object-cover {
  object-fit: cover;
}
.remove-btn {
  top: 12px;
  inset-inline-start: 12px;
}
.filepond--label-action {
  cursor: pointer !important;
}
.sub-card {
  border-radius: 14px;
  background: #f7f9fc;
}
.sub-img {
  height: 180px;
  object-fit: cover;
  border-top-left-radius: 14px;
  border-top-right-radius: 14px;
}

.sub-check {
  position: absolute;
  inset-inline-end: 40px;
  top: 12px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #2563eb;
  color: #fff;
  border: 0;
  font-weight: 700;
  line-height: 1;
  display: grid;
  place-items: center;
  pointer-events: none;
}

.sub-remove {
  position: absolute;
  inset-inline-end: 12px;
  top: 14px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ef4444;
  border: 0;
}

.step-dot {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
}
.shadow-xs {
  box-shadow: 0 6px 20px rgba(17, 24, 39, 0.06);
}
</style>
