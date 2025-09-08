<script setup>
/* ========== Imports ========== */
import vueFilePond from "vue-filepond";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import FilePondPluginFileValidateSize from "filepond-plugin-file-validate-size";

import BaseText from "@/components/form/BaseText.vue";
import BaseSelect from "~/components/form/BaseSelect.vue";
import { showToast } from "~/composables/useToast";
import { useAuth } from "~/composables/useAuth";
import { useMainStore } from "~/stores/mainStore";
import { useMain } from "~/composables/useMain";

definePageMeta({ middleware: ["auth"] });

const router = useRouter();
const route = useRoute();

/* ========== Stores / API ========== */
const { user } = useAuth();
const mainStore = useMainStore();
const { getCustomFiled, getAdDetails, updateAd } = useMain();

/* ========== حالة عامة ========== */
const adId = computed(() => Number(route.params.id));
const loadingPage = ref(true);
const submitting = ref(false);
const step = ref(1);

/* ========== FilePond ========== */
const FilePond = vueFilePond(
  FilePondPluginImagePreview,
  FilePondPluginFileValidateType,
  FilePondPluginFileValidateSize
);

const mainPond = ref(null);
const galleryPond = ref(null);

const mainFilesCount = ref(0);
const hasExistingMain = ref(false);
const mainInitialFiles = ref([]);
const galleryInitialFiles = ref([]);

function onMainUpdate(items) {
  mainFilesCount.value = (items || []).filter(
    (it) => !!it?.file || !!it?.source
  ).length;
}
function onGalleryUpdate(_items) {}

/* ========== فلاتر واختيارات ========== */
const selectedCategoryId = ref(null);
const selectedSubcategoryId = ref(null);

const categories = computed(() => mainStore?.filterData?.categories || []);
const selectedCategory = computed(
  () => categories.value.find((c) => c.id === selectedCategoryId.value) || null
);
const subcategories = computed(
  () => selectedCategory.value?.subcategories || []
);

/* ========== نموذج التعديل ========== */
const form = reactive({
  title: "",
  email: "",
  whatsapp: "",
  categoryId: "",
  subCategory: "",
  durationDays: "",
  details: "",
  city: "",
  price: "",
  currency: "",
  negotiable: false,
});

const errors = reactive({});
const currencies = ref([
  { value: "شيكل", label: "شيكل" },
  { value: "دولار", label: "دولار" },
  { value: "يورو", label: "يورو" },
  { value: "دينار", label: "دينار" },
]);

const citiesOptions = ref([]);

const customFieldsLoading = ref(false);
const customFieldsError = ref("");
const customFields = ref([]);
const customFieldValues = reactive({});

/* ========== Helpers ========== */
function splitOptions(str) {
  if (!str) return [];
  return String(str)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => ({ value: s, label: s }));
}

/* ========== تحميل التصنيفات + بيانات الإعلان ========== */
onMounted(async () => {
  try {
    if (!mainStore?.filterData) await mainStore.getFilterData();

    const res = await getAdDetails(adId.value);
    const ad = res?.data?.ad ?? res?.ad ?? res?.data;
    if (!ad?.id) throw new Error("لم يتم العثور على الإعلان");

    // تعبئة الحقول الأساسية
    form.title = ad.title ?? "";
    form.email = ad.email ?? "";
    form.whatsapp = ad.whatsapp ?? "";
    form.price = String(ad.price ?? "");
    form.currency = ad.currency ?? "";
    form.details = ad.description ?? "";
    form.durationDays = String(ad.duration_days ?? "");
    form.negotiable = !!ad.negotiable;

    // التصنيفات والمدينة
    selectedCategoryId.value = ad?.subcategory?.category_id ?? null;
    selectedSubcategoryId.value = ad?.subcategory_id ?? null;
    form.categoryId = selectedCategoryId.value || "";
    form.subCategory = selectedSubcategoryId.value || "";
    form.city = ad?.city_id ?? "";

    // تهيئة الصور
    hasExistingMain.value = !!ad?.main_image;
    // قد يعود main_image كرابط كامل أو مسار تسجيلي — FilePond يقبل كلاهما
    mainInitialFiles.value = hasExistingMain.value
      ? [{ source: ad.main_image, options: { type: "local" } }]
      : [];

    // images قد تكون [{image_path: '...'}, ...] أو ['...', ...]
    const rawImages = Array.isArray(ad?.images) ? ad.images : [];
    galleryInitialFiles.value = rawImages
      .map((img) => {
        const src = typeof img === "string" ? img : img?.image_path;
        return src ? { source: src, options: { type: "local" } } : null;
      })
      .filter(Boolean);

    // الحقول المخصصة والمدن
    const existingCF = Array.isArray(ad?.ad_custom_field_values)
      ? ad.ad_custom_field_values
      : [];
    if (selectedSubcategoryId.value) {
      await loadCustomFieldsAndCities(selectedSubcategoryId.value, existingCF);
    }

    // اذهب مباشرة للتفاصيل
    step.value = 4;
  } catch (e) {
    showToast(
      "danger",
      e?.data?.message || e?.message || "فشل تحميل بيانات الإعلان"
    );
  } finally {
    loadingPage.value = false;
  }
});

/* ========== تحميل CF + المدن ========== */
async function loadCustomFieldsAndCities(subId, existingCF = []) {
  customFieldsLoading.value = true;
  customFieldsError.value = "";
  customFields.value = [];
  Object.keys(customFieldValues).forEach((k) => delete customFieldValues[k]);
  citiesOptions.value = [];

  try {
    const res = await getCustomFiled(subId);
    const data = res?.data ?? res;
    const payload = data?.data ?? data;

    const apiCities = Array.isArray(payload?.cities) ? payload.cities : [];
    citiesOptions.value = apiCities.map((c) => ({
      value: c.id,
      label: c.name,
    }));

    const apiCF = Array.isArray(payload?.customFields)
      ? payload.customFields
      : [];
    customFields.value = apiCF.map((f) => ({
      id: f.id,
      name: f.name || `Field ${f.id}`,
      type: (f.type || "text").toLowerCase(),
      options:
        f.type?.toLowerCase() === "select" ? splitOptions(f.options) : [],
      required: !!f.is_required,
    }));

    const existingMap = new Map(
      existingCF.map((x) => [String(x.custom_field_id ?? x.id), x.value ?? ""])
    );

    customFields.value.forEach((f) => {
      if (existingMap.has(String(f.id))) {
        customFieldValues[f.id] = existingMap.get(String(f.id));
      } else {
        if (f.type === "number") customFieldValues[f.id] = "";
        else if (f.type === "select")
          customFieldValues[f.id] = f.options[0]?.value ?? "";
        else customFieldValues[f.id] = "";
      }
    });
  } catch (e) {
    customFieldsError.value =
      e?.data?.message || e?.message || "فشل جلب الحقول المخصصة";
  } finally {
    customFieldsLoading.value = false;
  }
}

/* ========== اختيار الأقسام (لو أردت تغييرها أثناء التعديل) ========== */
function chooseCategory(cat) {
  selectedCategoryId.value = cat.id;
  selectedSubcategoryId.value = null;
  form.categoryId = cat.id;
  form.subCategory = "";

  customFields.value = [];
  Object.keys(customFieldValues).forEach((k) => delete customFieldValues[k]);
  citiesOptions.value = [];

  step.value = 2;
}

async function chooseSubcategory(sub) {
  selectedSubcategoryId.value = sub.id;
  form.subCategory = sub.id;

  await loadCustomFieldsAndCities(sub.id);
  step.value = 3;
}

/* ========== تحقق ========== */
function validate() {
  Object.keys(errors).forEach((k) => delete errors[k]);

  if (!form.title || form.title.trim().length < 3)
    errors.title = "أدخل عنواناً مناسباً";
  if (!form.city) errors.city = "اختر المدينة";
  if (!form.durationDays || Number(form.durationDays) <= 0)
    errors.durationDays = "أدخل مدة بالأيام (أكبر من 0)";
  if (!form.details || form.details.trim().length < 10)
    errors.details = "أدخل تفاصيل كافية";
  if (!form.price || isNaN(Number(form.price)))
    errors.price = "أدخل السعر بشكل صحيح";
  if (!form.currency) errors.currency = "اختر العملة";
  if (!form.whatsapp || form.whatsapp.trim().length < 6)
    errors.whatsapp = "أدخل رقم واتساب صالح";

  // الصورة الرئيسية مطلوبة فقط إذا لا يوجد قديم ولا جديد
  const hasNewMain = (mainPond.value?.getFiles?.() || []).some(
    (it) => !!it?.file
  );
  if (!hasExistingMain.value && !hasNewMain) {
    errors.mainImage = "الصورة الرئيسية مطلوبة";
  }

  customFields.value.forEach((f) => {
    if (!f.required) return;
    const v = customFieldValues[f.id];
    const isEmpty = v === undefined || v === null || String(v).trim() === "";
    if (isEmpty) errors[`cf_${f.id}`] = `حقل "${f.name}" مطلوب`;
  });

  return Object.keys(errors).length === 0;
}

/* ========== حفظ التعديلات ========== */
async function submitEdit() {
  if (!validate()) return;

  submitting.value = true;
  try {
    const fd = new FormData();

    // أساسية
    fd.append(
      "subcategory_id",
      String(form.subCategory || selectedSubcategoryId.value || "")
    );
    fd.append("city_id", String(form.city));
    fd.append("title", form.title);
    fd.append("description", form.details);
    fd.append("price", String(form.price));
    fd.append("whatsapp", form.whatsapp);
    fd.append("duration_days", String(form.durationDays));
    fd.append("currency", form.currency);
    fd.append("user_id", user.value.id);
    if (form.email) fd.append("email", form.email);
    if (typeof form.negotiable === "boolean") {
      fd.append("negotiable", form.negotiable ? "1" : "0");
    }

    // صورة رئيسية جديدة فقط إذا رفع المستخدم ملف جديد
    const mainNew = (mainPond.value?.getFiles?.() || []).find(
      (it) => !!it?.file
    );
    if (mainNew?.file && mainNew.file.type?.startsWith("image/")) {
      const f = mainNew.file;
      fd.append(
        "main_image",
        f,
        f.name || `main.${(f.type || "image/jpeg").split("/")[1]}`
      );
    }

    // ✅ اسم حقل المعرض كما في الكنترولر: gallery[]
    const galleryFiles = (galleryPond.value?.getFiles?.() || []).filter(
      (it) => !!it?.file
    );
    if (galleryFiles.length > 0) {
      galleryFiles.forEach((it, idx) => {
        const f = it.file;
        if (f && f.type?.startsWith("image/")) {
          fd.append(
            "gallery[]",
            f,
            f.name || `gallery_${idx}.${(f.type || "image/jpeg").split("/")[1]}`
          );
        }
      });
      // ملاحظة: بمجرد إرسال gallery[] سيحذف السيرفر القديم ويضيف الجديد (حسب منطقك في الكنترولر)
    }

    // الحقول المخصصة
    for (const [id, value] of Object.entries(customFieldValues)) {
      if (value !== "" && value !== null && value !== undefined) {
        fd.append(`custom_fields[${id}]`, value);
      }
    }

    // تحديث
    const resp = await updateAd(adId.value, fd);

    showToast("success", resp?.message || "تم تحديث الإعلان بنجاح ✅");
    router.push({ path: "/profile/ads" });
  } catch (e) {
    showToast(
      "danger",
      e?.data?.message || e?.message || "فشل حفظ تعديلات الإعلان"
    );
  } finally {
    submitting.value = false;
  }
}

/* ========== تنقّل الصور ========= */
const canNextImages = computed(() => {
  const hasNew = (mainPond.value?.getFiles?.() || []).some((it) => !!it?.file);
  return hasExistingMain.value || hasNew;
});
function removeMain() {
  try {
    mainPond.value?.removeFiles?.();
    hasExistingMain.value = false;
    mainFilesCount.value = 0;
  } catch {}
}
</script>

<template>
  <div class="container py-4">
    <div class="d-flex align-items-center pb-9">
      <h2 class="fs-3 m-0 fw-normal text-primary d-inline">الرئيسية</h2>
      <Icon
        name="mdi:chevron-left-circle-outline"
        class="fs-3 mx-3 text-secondary"
      />
      <h2 class="fs-3 m-0 fw-semibold text-muted">تعديل إعلان</h2>
    </div>

    <div v-if="loadingPage" class="text-center text-muted py-5">
      جاري تحميل بيانات الإعلان...
    </div>

    <template v-else>
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
              :style="{ width: step > 1 ? '100%' : '0%' }"
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
            step >= 3 ? 'text-light bg-primary' : 'text-bg-secondary',
          ]"
          >3</span
        >
        <div class="flex-grow-1">
          <div class="progress" style="height: 6px">
            <div
              class="progress-bar bg-primary"
              :style="{ width: step > 3 ? '100%' : '0%' }"
            ></div>
          </div>
        </div>
        <span
          :class="[
            'badge rounded-pill step-dot fs-3',
            step === 4 ? 'text-light bg-primary' : 'text-bg-secondary',
          ]"
          >4</span
        >
      </div>

      <!-- الخطوة 1: اختيار القسم -->
      <div v-show="step === 1" class="categories my-5">
        <div class="mb-9 text-end">
          <h2>اختر القسم المناسب</h2>
          <p class="text-muted">حدد القسم الذي يناسب إعلانك</p>
        </div>

        <template v-if="categories.length">
          <div class="row g-3">
            <div
              class="col-6 col-md-3 my-3 p-0"
              v-for="(cat, index) in categories"
              :key="cat.id"
            >
              <div
                class="card overflow-hidden overlay-card position-relative cursor-pointer"
                @click="chooseCategory(cat)"
                :style="{
                  backgroundImage: `url(/media/bg-home/bg${
                    (index % 8) + 1
                  }.png)`,
                }"
                role="button"
              >
                <div
                  class="card-body text-center position-absolute top-50 start-50 translate-middle w-100"
                >
                  <div
                    class="rounded px-3 py-2 bg-dark bg-opacity-50 d-inline-block text-white fw-bold"
                  >
                    {{ cat.name }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <div v-else class="text-center text-muted py-5">
          جاري تحميل التصنيفات...
        </div>
      </div>

      <!-- الخطوة 2: اختيار التصنيف الفرعي -->
      <div v-show="step === 2" class="subcategories my-5">
        <div class="mb-9 d-flex align-items-center justify-content-start">
          <button
            class="btn btn-lg p-0"
            @click="step = 1"
            title="رجوع للقسم الرئيسي"
          >
            <Icon
              name="material-symbols:arrow-right-alt-rounded"
              class="text-dark display-5 m-0"
            />
          </button>
          <div>
            <h2>اختر التصنيف الفرعي</h2>
            <p class="text-muted mb-0">
              القسم المختار:
              <span class="fw-bold">{{ selectedCategory?.name || "—" }}</span>
            </p>
          </div>
        </div>

        <template v-if="subcategories.length">
          <div v-if="customFieldsLoading" class="text-center text-muted py-3">
            يتم جلب الحقول والمدن ...
          </div>
          <div v-else-if="customFieldsError" class="alert alert-danger mt-3">
            {{ customFieldsError }}
          </div>
          <div v-else class="row g-3">
            <div
              class="col-6 col-md-3 my-3 p-0"
              v-for="(sub, i) in subcategories"
              :key="sub.id"
            >
              <div
                class="card overflow-hidden overlay-card position-relative cursor-pointer"
                @click="chooseSubcategory(sub)"
                :style="{
                  backgroundImage: `url(/media/bg-home/bg${(i % 8) + 1}.png)`,
                }"
                role="button"
              >
                <div
                  class="card-body text-center position-absolute top-50 start-50 translate-middle w-100"
                >
                  <div
                    class="rounded px-3 py-2 bg-dark bg-opacity-50 text-white fw-bold"
                  >
                    {{ sub.name }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <div v-else class="text-center text-muted py-5">
          لا توجد تصنيفات فرعية لهذا القسم.
          <div class="mt-3">
            <button class="btn btn-main px-4" @click="step = 3">
              تخطّي
              <Icon
                name="material-symbols:arrow-back-rounded"
                class="text-white"
                size="20"
              />
            </button>
          </div>
        </div>
      </div>

      <!-- الخطوة 3: الصور -->
      <div v-show="step === 3">
        <div class="card border-0 shadow-sm p-3 p-md-4">
          <div class="mb-4">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h6 class="mb-0 fw-semibold">
                <button class="btn btn-lg p-0" @click="step = 2">
                  <Icon
                    name="material-symbols:arrow-right-alt-rounded"
                    class="text-dark display-5 m-0"
                  />
                </button>
                الصورة الرئيسية للإعلان (صورة واحدة)
              </h6>
              <small class="text-muted">حتى 1MB</small>
            </div>
            <p class="text-muted mb-4">
              هذه هي الصورة التي ستظهر أولاً في نتائج البحث.
            </p>

            <div class="pond-card">
              <button
                v-if="hasExistingMain || mainFilesCount > 0"
                type="button"
                class="remove-main-btn"
                title="حذف الصورة الرئيسية"
                @click="removeMain"
              >
                ×
              </button>

              <FilePond
                ref="mainPond"
                class="pond"
                :allow-multiple="false"
                :accepted-file-types="['image/*']"
                max-file-size="1MB"
                :instant-upload="false"
                :store-as-file="true"
                :files="mainInitialFiles"
                @updatefiles="onMainUpdate"
                label-idle="إسحب وأسقط الصور هنا أو <span class='filepond--label-action'>اضغط للاختيار</span>"
              />

              <div
                v-if="errors.mainImage"
                class="invalid-feedback d-block mt-2"
              >
                {{ errors.mainImage }}
              </div>
            </div>
          </div>

          <div class="mb-3">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h6 class="mb-0 fw-semibold">باقي الصور (اختياري حتى 5)</h6>
              <small class="text-muted">حتى 1MB/صورة</small>
            </div>

            <div class="pond-card">
              <FilePond
                ref="galleryPond"
                class="pond"
                :allow-multiple="true"
                :max-files="5"
                :accepted-file-types="['image/*']"
                max-file-size="1MB"
                :instant-upload="false"
                :store-as-file="true"
                :files="galleryInitialFiles"
                @updatefiles="onGalleryUpdate"
                label-idle="إسحب وأسقط الصور هنا أو <span class='filepond--label-action'>اضغط للاختيار</span>"
              />
            </div>
          </div>
        </div>

        <div class="d-flex justify-content-center mt-3">
          <button
            class="btn btn-main px-4"
            @click="step = 4"
            :disabled="!canNextImages"
          >
            التالي
            <Icon
              name="material-symbols:arrow-back-rounded"
              class="text-white"
              size="20"
            />
          </button>
        </div>
      </div>

      <!-- الخطوة 4: تفاصيل الإعلان -->
      <div v-show="step === 4" class="py-4">
        <div class="card shadow-sm rounded-3 mb-4 border-0">
          <div class="mb-3 px-9 py-5">
            <div class="d-flex align-items-center gap-2">
              <h5 class="m-0 fw-bold">
                <button class="btn btn-lg p-0" @click="step = 3">
                  <Icon
                    name="material-symbols:arrow-right-alt-rounded"
                    class="text-dark display-5 m-0"
                  />
                </button>
                تعديل بيانات الإعلان
              </h5>
            </div>
            <p class="text-muted pe-9">حدّث بيانات إعلانك ثم اضغط حفظ.</p>
          </div>

          <div class="card-body">
            <div class="row g-3">
              <div class="col-md-6">
                <BaseText
                  v-model="form.title"
                  label="عنوان الإعلان"
                  placeholder="مثال: شقة 3 غرف للبيع ..."
                  :error="errors.title"
                  req
                />
              </div>
              <div class="col-md-6">
                <BaseText
                  v-model="form.whatsapp"
                  type="tel"
                  inputmode="tel"
                  label="رقم الواتساب"
                  placeholder="+9705XXXXXXXX"
                  :error="errors.whatsapp"
                  req
                />
              </div>

              <div class="col-md-6">
                <BaseText
                  v-model="form.email"
                  type="email"
                  label="البريد الإلكتروني"
                  placeholder="example@gmail.com"
                  :error="errors.email"
                />
              </div>

              <div class="col-md-6">
                <BaseSelect
                  v-model="form.city"
                  label="المدينة"
                  :options="citiesOptions"
                  placeholder="اختر المدينة"
                  :error="errors.city"
                  req
                />
              </div>

              <div class="col-md-6">
                <label class="form-label mb-2 fw-medium text-dark">
                  مدة الإعلان (بالأيام) <span class="text-danger">*</span>
                </label>
                <input
                  type="number"
                  class="form-control"
                  :class="{ 'is-invalid': errors.durationDays }"
                  v-model="form.durationDays"
                  min="1"
                />
                <div
                  v-if="errors.durationDays"
                  class="invalid-feedback d-block"
                >
                  {{ errors.durationDays }}
                </div>
              </div>

              <div class="col-12">
                <label class="form-label mb-2 fw-medium text-dark">
                  تفاصيل الإعلان <span class="text-danger">*</span>
                </label>
                <textarea
                  class="form-control text-end rounded-1"
                  rows="7"
                  placeholder="أدخل تفاصيل الإعلان ..."
                  v-model="form.details"
                  :class="{ 'is-invalid': !!errors.details }"
                />
                <div v-if="errors.details" class="invalid-feedback d-block">
                  {{ errors.details }}
                </div>
              </div>

              <div
                class="price col-md-6 d-flex gap-0 align-items-center btn-group"
              >
                <BaseText
                  v-model="form.price"
                  label="السعر"
                  placeholder="أدخل السعر هنا"
                  inputmode="numeric"
                  :error="errors.price"
                  class="col-9"
                  req
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

              <div class="col-md-6">
                <BaseSelect
                  v-model="form.currency"
                  label="العملة"
                  :options="currencies"
                  placeholder="اختر العملة"
                  :error="errors.currency"
                  req
                />
              </div>
            </div>
          </div>
        </div>

        <!-- حقول مخصصة -->
        <div
          class="card shadow-sm rounded-3 mb-4 border-0"
          v-if="customFields.length"
        >
          <div class="mb-3 px-9 py-5">
            <h5 class="m-0 fw-bold">حقول إضافية حسب القسم</h5>
            <p class="text-muted">
              هذه الحقول تم توليدها بناءً على التصنيف الفرعي الذي اخترته.
            </p>
          </div>
          <div class="card-body">
            <div class="row g-3">
              <div v-for="cf in customFields" :key="cf.id">
                <div class="col-md-6" v-if="cf.type === 'number'">
                  <BaseText
                    :label="cf.name"
                    :placeholder="cf.name"
                    v-model="customFieldValues[cf.id]"
                    :error="errors['cf_' + cf.id]"
                    type="number"
                    inputmode="numeric"
                    :req="cf.required"
                  />
                </div>

                <div class="col-md-6" v-else-if="cf.type === 'select'">
                  <BaseSelect
                    :label="cf.name"
                    :placeholder="'اختر ' + cf.name"
                    :options="cf.options"
                    v-model="customFieldValues[cf.id]"
                    :req="cf.required"
                  />
                  <div
                    v-if="errors['cf_' + cf.id]"
                    class="invalid-feedback d-block"
                  >
                    {{ errors["cf_" + cf.id] }}
                  </div>
                </div>

                <div class="col-md-6" v-else>
                  <BaseText
                    :label="cf.name"
                    :placeholder="cf.name"
                    v-model="customFieldValues[cf.id]"
                    :error="errors['cf_' + cf.id]"
                    :req="cf.required"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- زر حفظ -->
        <div class="text-center">
          <button
            :disabled="submitting"
            @click="submitEdit"
            class="btn btn-lg btn-view-all"
          >
            <div v-if="!submitting">
              <span class="mb-0 text-white">حفظ التعديل</span>
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
    </template>
  </div>
</template>

<style scoped>
/* --------- كارت اختيار الصور ---------- */
.pond-card {
  position: relative;
  border: 2px dashed var(--bs-primary, #2563eb);
  border-radius: 14px;
  padding: 18px;
  transition: box-shadow 0.2s ease, border-color 0.2s ease, transform 0.1s ease;
  cursor: pointer;
}
.pond-card:hover {
  border-color: var(--bs-primary, #2563eb);
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.15);
}
.pond {
  display: block;
}
.remove-main-btn {
  position: absolute;
  inset-inline-start: 10px;
  top: 10px;
  width: 32px;
  height: 32px;
  line-height: 28px;
  border-radius: 50%;
  border: 2px solid #ef4444;
  background: #fff;
  color: #ef4444;
  font-weight: 800;
  text-align: center;
  z-index: 5;
  cursor: pointer;
}
.remove-main-btn:hover {
  background: #ef4444;
  color: #fff;
}
/* FilePond tweaks */
:deep(.filepond--panel-root) {
  background: transparent !important;
  border-radius: 12px !important;
  border: 0 !important;
}
:deep(.filepond--drop-label) {
  text-align: center;
  padding: 28px 16px !important;
  font-size: 1rem !important;
  color: #6b7280 !important;
}
:deep(.filepond--drop-label > label),
:deep(.filepond--label-root) {
  white-space: nowrap;
  word-break: keep-all;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  display: block;
  line-height: 1.9;
  direction: rtl;
  text-align: center;
}
:deep(.filepond--drop-label .filepond--label-action) {
  color: var(--bs-primary, #2563eb) !important;
  font-weight: 700;
  text-decoration: underline;
  white-space: inherit;
}
@media (max-width: 480px) {
  :deep(.filepond--drop-label > label),
  :deep(.filepond--label-root) {
    white-space: normal;
    text-overflow: clip;
  }
}
:deep(.filepond--credits) {
  display: none !important;
}

/* بطاقات الأقسام */
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
  transform: scale(1.05);
}

/* أخرى */
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

{"type":"new_ad","ad_id":137,"title":"Et quidem quaerat ex","user_name":"ahmed","user_photo":"http:\/\/localhost:8000\/assets\/img\/avatars\/user.png","message":"\u062a\u0645 \u0625\u0646\u0634\u0627\u0621 \u0625\u0639\u0644\u0627\u0646 \u062c\u062f\u064a\u062f: Et quidem quaerat ex","link":"\/admin\/ads\/137","created_at":"2025-09-06 09:29:00"}