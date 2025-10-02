<script setup>
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
useSeo({
  title: "إنشاء إعلان جديد | منصّة AZZA",
  description:
    "أضف إعلانك بسهولة في مختلف الأقسام مثل العقارات، السيارات، الأجهزة، الأثاث والخدمات.",
  image: "/media/avatars/logo.png",
  canonicalPath: "/ads/create",
  type: "website",
});
useHead({
  title: "إنشاء إعلان جديد | منصّة AZZA",
});
definePageMeta({ middleware: ["auth"] });

/* ========== Stores / API ========== */
const { user } = useAuth();
const mainStore = useMainStore();
const { getCustomFiled, createAd } = useMain();
const router = useRouter();

/* اجلب بيانات الفلاتر العامة عند الدخول (التصنيفات الرئيسية) */
onMounted(async () => {
  if (!mainStore?.filterData) await mainStore.getFilterData();
});

/* ========== FilePond ========== */
const FilePond = vueFilePond(
  FilePondPluginImagePreview,
  FilePondPluginFileValidateType,
  FilePondPluginFileValidateSize
);

/* مراجع FilePond للتحكم اليدوي */
const mainPond = ref(null);
const galleryPond = ref(null);

/* عدد الصور الرئيسية (ريّأكتف لتفعيل زر التالي) */
const mainFilesCount = ref(0);
function onMainUpdate(items) {
  mainFilesCount.value = (items || []).filter((it) => !!it?.file).length;
}
function onGalleryUpdate(_items) {
  /* متروك عند الحاجة */
}

/* ========== حالة الصفحة العامة ========== */
const step = ref(1); // 1: فئة رئيسية، 2: فئة فرعية، 3: صور، 4: تفاصيل
const toast = ref({ type: "", msg: "" });

/* ========== اختيار التصنيفات ========== */
const selectedCategoryId = ref(null);
const selectedSubcategoryId = ref(null);

const categories = computed(() => mainStore?.filterData?.categories || []);
const selectedCategory = computed(
  () => categories.value.find((c) => c.id === selectedCategoryId.value) || null
);
const subcategories = computed(
  () => selectedCategory.value?.subcategories || []
);

/* زر التالي يتفعّل فقط عند وجود ملف فعلي في الرئيسية */
const canNextImages = computed(() => mainFilesCount.value > 0);

/* حذف الرئيسية من FilePond مباشرة */
function removeMain() {
  try {
    mainPond.value?.removeFiles?.();
  } catch {}
}

/* حذف صورة فرعية حسب الفهرس (إن رغبت) */
function removeSubAt(i) {
  try {
    const items = galleryPond.value?.getFiles?.() || [];
    const item = items[i];
    if (item) galleryPond.value?.removeFile?.(item?.id ?? item?.file);
  } catch {}
}

/* ========== نموذج الإرسال ========== */
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

/* أخطاء التحقق */
const errors = reactive({});

/* العملات */
const currencies = ref([
  { value: "شيكل", label: "شيكل" },
  { value: "دولار", label: "دولار" },
  { value: "دينار", label: "دينار" },
]);

/* المدن القادمة من getCustomFiled */
const citiesOptions = ref([]);

/* الحقول المخصصة */
const customFieldsLoading = ref(false);
const customFieldsError = ref("");
const customFields = ref([]);
const customFieldValues = reactive({});

/* أدوات مساعدة */
function splitOptions(str) {
  if (!str) return [];
  return String(str)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => ({ value: s, label: s }));
}

/* اختيار فئة رئيسية */
function chooseCategory(cat) {
  selectedCategoryId.value = cat.id;
  selectedSubcategoryId.value = null;
  form.categoryId = cat.id;
  form.subCategory = "";

  // صفر حقول مخصصة ومدن
  customFields.value = [];
  Object.keys(customFieldValues).forEach((k) => delete customFieldValues[k]);
  citiesOptions.value = [];

  step.value = 2;
}

/* اختيار فئة فرعية + جلب حقول/مدن */
async function chooseSubcategory(sub) {
  selectedSubcategoryId.value = sub.id;
  form.subCategory = sub.id;

  customFieldsLoading.value = true;
  customFieldsError.value = "";
  customFields.value = [];
  Object.keys(customFieldValues).forEach((k) => delete customFieldValues[k]);
  citiesOptions.value = [];

  try {
    const res = await getCustomFiled(sub.id);
    const data = res?.data ?? res;
    const payload = data?.data ?? data;

    /* مدن */
    const apiCities = Array.isArray(payload?.cities) ? payload.cities : [];
    citiesOptions.value = apiCities.map((c) => ({
      value: c.id,
      label: c.name,
    }));

    /* حقول مخصصة */
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

    // قيم ابتدائية
    customFields.value.forEach((f) => {
      if (f.type === "number") customFieldValues[f.id] = "";
      else if (f.type === "select")
        customFieldValues[f.id] = f.options[0]?.value ?? "";
      else customFieldValues[f.id] = "";
    });
  } catch (e) {
    customFieldsError.value =
      e?.data?.message || e?.message || "فشل جلب الحقول المخصصة";
  } finally {
    customFieldsLoading.value = false;
  }

  step.value = 3;
}

/* تحقق قبل الإرسال */
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
  if (
    !form.whatsapp ||
    !/^(\+97259\d{7}|\+97256\d{7}|\+97059\d{7}|\+97056\d{7})$/.test(
      form.whatsapp
    )
  ) {
    errors.whatsapp = "أدخل رقم واتساب صالح مثل +97259XXXXXXX";
  }

  if (mainFilesCount.value === 0) errors.mainImage = "الصورة الرئيسية مطلوبة";

  // حقول مخصصة مطلوبة
  customFields.value.forEach((f) => {
    if (!f.required) return;
    const v = customFieldValues[f.id];
    const isEmpty = v === undefined || v === null || String(v).trim() === "";
    if (isEmpty) errors[`cf_${f.id}`] = `حقل "${f.name}" مطلوب`;
  });

  return Object.keys(errors).length === 0;
}

/* إرسال باستخدام FormData و createAd(formData) */
const submitting = ref(false);

async function submit() {
  if (!validate()) return;

  submitting.value = true;
  toast.value = { type: "", msg: "" };

  try {
    const fd = new FormData();

    // أساسية:
    fd.append("subcategory_id", String(form.subCategory));
    fd.append("city_id", String(form.city));
    fd.append("title", form.title);
    fd.append("description", form.details);
    fd.append("price", String(form.price));
    fd.append("whatsapp", form.whatsapp);
    fd.append("duration_days", String(form.durationDays));
    fd.append("currency", form.currency);
    fd.append("user_id", user.value.id);
    if (form.email) fd.append("email", form.email);

    // === الصورة الرئيسية (مع التحقق والاسم) ===
    const mainItem = (mainPond.value?.getFiles?.() || [])[0];
    const mainFile = mainItem?.file;
    if (!(mainFile instanceof File) || !mainFile.type?.startsWith("image/")) {
      errors.mainImage = "يرجى اختيار ملف صورة صالح";
      submitting.value = false;
      return;
    }
    fd.append(
      "main_image",
      mainFile,
      mainFile.name || `main.${(mainFile.type || "image/jpeg").split("/")[1]}`
    );

    // === الصور الفرعية (اختياري + اسم ملف) ===
    (galleryPond.value?.getFiles?.() || []).slice(0, 5).forEach((it, idx) => {
      const f = it?.file;
      if (f && f.type?.startsWith("image/")) {
        fd.append(
          "gallery_images[]",
          f,
          f.name || `gallery_${idx}.${(f.type || "image/jpeg").split("/")[1]}`
        );
      }
    });

    // === الحقول المخصصة ===
    for (const [id, value] of Object.entries(customFieldValues)) {
      if (value !== "" && value !== null && value !== undefined) {
        fd.append(`custom_fields[${id}]`, value);
      }
    }

    // الإرسال عبر $larafetch داخل createAd
    const res = await createAd(fd);
    router.push({ path: "/profile/ads" });
    showToast(
      "success",
      res?.message || res?.data?.message || "تم نشر الإعلان بنجاح 🎉"
    );
    resetAll();
  } catch (e) {
    showToast(
      "danger",
      e?.data?.message || e?.message || "حدث خطأ أثناء نشر الإعلان"
    );
  } finally {
    submitting.value = false;
  }
}

function resetAll() {
  // حقول
  form.title = "";
  form.email = "";
  form.whatsapp = "";
  form.categoryId = "";
  form.subCategory = "";
  form.durationDays = "";
  form.details = "";
  form.city = "";
  form.price = "";
  form.currency = "";
  form.negotiable = false;

  // تصنيفات
  selectedCategoryId.value = null;
  selectedSubcategoryId.value = null;

  // حقول مخصصة ومدن
  customFields.value = [];
  Object.keys(customFieldValues).forEach((k) => delete customFieldValues[k]);
  citiesOptions.value = [];

  // صور — امسح من FilePond أيضًا
  try {
    mainPond.value?.removeFiles?.();
    galleryPond.value?.removeFiles?.();
  } catch {}

  // خطوة
  step.value = 1;

  // أخطاء
  Object.keys(errors).forEach((k) => delete errors[k]);
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
                backgroundImage: `url(/media/bg-home/bg${(index % 8) + 1}.png)`,
              }"
              role="button"
            >
              <div
                class="card-body text-center position-absolute top-50 start-50 translate-middle w-100"
              >
                <NuxtImg :src="cat?.icon" :alt="cat?.name" class="w-25 mb-4" />
                <div
                  class="rounded px-3 py-2 bg-dark bg-opacity-50 text-white fw-bold"
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
        <!-- حالة جلب الحقول والمدن -->
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
              الصورة الرئيسية للاعلان (صورة واحدة)
            </h6>
            <small class="text-muted">حتى 2MB</small>
          </div>
          <p class="text-muted mb-4">
            هذه هي الصورة التي ستظهر أولاً في نتائج البحث.
          </p>

          <!-- FilePond يبقى مركّب (لن يفقد الحالة عند الرجوع) -->
          <div class="pond-card">
            <!-- زر حذف علوي مخصص -->
            <button
              v-if="mainFilesCount > 0"
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
              max-file-size="2MB"
              :instant-upload="false"
              :store-as-file="true"
              @updatefiles="onMainUpdate"
              label-idle="إسحب وأسقط الصور هنا أو <span class='filepond--label-action'>اضغط للاختيار</span>"
            />

            <div v-if="errors.mainImage" class="invalid-feedback d-block mt-2">
              {{ errors.mainImage }}
            </div>
          </div>
        </div>

        <div class="mb-3">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h6 class="mb-0 fw-semibold">باقي الصور (اختياري حتى 3)</h6>
            <small class="text-muted">حتى 1MB/صورة</small>
          </div>

          <div class="pond-card">
            <FilePond
              ref="galleryPond"
              class="pond"
              :allow-multiple="true"
              :max-files="3"
              :accepted-file-types="['image/*']"
              max-file-size="1MB"
              :instant-upload="false"
              :store-as-file="true"
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

    <!-- الخطوة 4: تفاصيل الإعلان + الحقول المخصصة + الإرسال -->
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
              إدخال بيانات الإعلان
            </h5>
          </div>
          <p class="text-muted pe-9">أدخل معلومات إعلانك بشكل واضح ومفصل.</p>
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
                req
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
              <div v-if="!citiesOptions.length" class="form-text text-muted">
                اختر التصنيف الفرعي لتحميل المدن المتاحة.
              </div>
            </div>

            <div class="col-md-6">
              <label class="form-label mb-2 fw-medium text-dark"
                >مدة الإعلان (بالأيام) <span class="text-danger">*</span></label
              >
              <input
                type="number"
                class="form-control"
                :class="{ 'is-invalid': errors.durationDays }"
                v-model="form.durationDays"
                min="1"
              />
              <div v-if="errors.durationDays" class="invalid-feedback d-block">
                {{ errors.durationDays }}
              </div>
            </div>

            <div class="col-12">
              <label class="form-label mb-2 fw-medium text-dark"
                >تفاصيل الإعلان <span class="text-danger">*</span></label
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

      <!-- حقول مخصصة من getCustomFiled -->
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

      <!-- زر الإرسال -->
      <div class="text-center">
        <button
          :disabled="submitting"
          @click="submit"
          class="btn btn-lg btn-view-all w-auto"
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
/* --------- كارت اختيار الصور (تصميم + ألوان رئيسية) ---------- */
.pond-card {
  position: relative;
  border: 2px dashed var(--bs-primary, #2563eb); /* أزرق رئيسي */
  border-radius: 14px;
  padding: 18px;
  transition: box-shadow 0.2s ease, border-color 0.2s ease, transform 0.1s ease;
  cursor: pointer;
}
.pond-card:hover {
  border-color: var(--bs-primary, #2563eb);
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.15);
}

/* اجعل منطقة FilePond أطول */
.pond {
  display: block;
}

/* زر حذف دائري أعلى البطاقة */
.remove-main-btn {
  position: absolute;
  inset-inline-start: 10px; /* يدعم RTL/LTR */
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

/* تخصيص شكل FilePond داخليًا */
:deep(.filepond--panel-root) {
  background: transparent !important;
  border-radius: 12px !important;
  border: 0 !important;
}

/* اللابل: سطر واحد بدون تفكيك + لون رمادي للنص */
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

/* اجعل عبارة "اضغط للاختيار" باللون الأزرق */
:deep(.filepond--drop-label .filepond--label-action) {
  color: var(--bs-primary, #2563eb) !important;
  font-weight: 700;
  text-decoration: underline;
  white-space: inherit;
}

/* على الشاشات الصغيرة اسمح باللفّ بدل القصّ */
@media (max-width: 480px) {
  :deep(.filepond--drop-label > label),
  :deep(.filepond--label-root) {
    white-space: normal;
    text-overflow: clip;
  }
}

/* إخفاء credits إن ظهرت */
:deep(.filepond--credits) {
  display: none !important;
}

/* باقي ستايلات الصفحة كما هي */
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
