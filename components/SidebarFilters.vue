<script setup>
/* SidebarFilters — يُظهر تصنيف المسار فقط إن وُجد، وإلا كل التصنيفات.
   يُرسل update:filters عند أي تغيير (city_id, subcategory_ids, price range, category_id). */
import { useCategoryStore } from "~/stores/categoryStore";
import { useMainStore } from "~/stores/mainStore";
import SkeletonSidebar from "./Skeleton/SkeletonSidebar.vue";

const categoryStore = useCategoryStore();
const mainStore = useMainStore();
const route = useRoute();

/* تحميل بيانات المدن + بيانات التصنيفات مرة واحدة */
onMounted(async () => {
  if (!categoryStore?.citiesData) await categoryStore.getCitiesData();
  if (!mainStore?.filterData) await mainStore.getFilterData();
  // بعد التحميل الأوّلي، أرسل الفلاتر الحالية فورًا
  nextTick(() => emitFilters());
});

/* عملات (واجهية) */
const currencies = ref(["شيكل", "دولار", "يورو", "دينار"]);

/* Props */
const props = defineProps({
  defaultFilters: {
    type: Object,
    default: () => ({
      categories: [], // subcategory_ids
      city_id: "",
      region: "",
      priceMin: null,
      priceMax: null,
      currency: "شيكل",
      category_id: "",
    }),
  },
  sticky: { type: Boolean, default: true },
});

const emit = defineEmits(["update:filters"]);

/* الحالة الداخلية للفلاتر */
const filters = reactive({
  categories: [...(props.defaultFilters.categories || [])], // subcategory_ids
  city_id: props.defaultFilters.city_id || "",
  region: props.defaultFilters.region || "",
  priceMin: props.defaultFilters.priceMin ?? null,
  priceMax: props.defaultFilters.priceMax ?? null,
  currency: props.defaultFilters.currency || currencies.value[0],
  category_id: props.defaultFilters.category_id || "",
});

/* حقولا السعر النصية */
const priceMinText = ref(
  filters.priceMin !== null ? String(filters.priceMin) : ""
);
const priceMaxText = ref(
  filters.priceMax !== null ? String(filters.priceMax) : ""
);
function sanitizePrice(which) {
  if (which === "min") {
    priceMinText.value = (priceMinText.value || "").replace(/[^\d]/g, "");
    filters.priceMin = priceMinText.value ? Number(priceMinText.value) : null;
  } else {
    priceMaxText.value = (priceMaxText.value || "").replace(/[^\d]/g, "");
    filters.priceMax = priceMaxText.value ? Number(priceMaxText.value) : null;
  }
  if (
    filters.priceMin !== null &&
    filters.priceMax !== null &&
    filters.priceMin > filters.priceMax
  ) {
    const tmp = filters.priceMin;
    filters.priceMin = filters.priceMax;
    filters.priceMax = tmp;
    priceMinText.value = String(filters.priceMin);
    priceMaxText.value = String(filters.priceMax);
  }
}

/* ====== تحديد تصنيف المسار ====== */
const slugify = (s) =>
  String(s || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "");

const routeCategorySlug = computed(() => {
  if (route?.params?.slug) return String(route.params.slug);
  const m = String(route?.path || "").match(/\/ads\/category\/([^/?#]+)/i);
  return m ? decodeURIComponent(m[1]) : "";
});
const isCategoryRoute = computed(
  () =>
    /\/ads\/category\//i.test(String(route?.path || "")) &&
    !!routeCategorySlug.value
);

/* الحصول على كائن تصنيف الصفحة (إن أمكن) */
const pageCategory = computed(() => {
  const slug = routeCategorySlug.value;
  if (!slug) return null;

  const fromCategoryStore = categoryStore?.categoryData?.category;
  if (
    fromCategoryStore &&
    slugify(fromCategoryStore?.slug || fromCategoryStore?.name) ===
      slugify(slug)
  ) {
    return fromCategoryStore;
  }
  const raw = mainStore?.filterData?.categories || [];
  return raw.find((c) => slugify(c?.slug || c?.name) === slugify(slug)) || null;
});

/* تحويل استجابة التصنيفات لبنية المكوّن */
const categories = computed(() => {
  const raw = mainStore?.filterData?.categories || [];
  const mapCat = (cat) => ({
    name: cat?.name,
    value: cat?.id, // category_id
    children: Array.isArray(cat?.subcategories)
      ? cat.subcategories.map((sc) => ({ name: sc?.name, value: sc?.id }))
      : [],
  });

  if (isCategoryRoute.value && pageCategory.value) {
    return [mapCat(pageCategory.value)]; // تصنيف واحد + أبناؤه
  }
  // لا يوجد تصنيف من المسار (أو لم نجد مطابقًا) => أعرض الكل
  return raw.map(mapCat);
});

/* اختيار التصنيفات الفرعية */
const selectedCategories = ref([...filters.categories]);
const expanded = reactive({});

function toggleParent(p) {
  const childVals = (p.children || []).map((ch) => ch.value);
  if (!childVals.length) {
    const exists = selectedCategories.value.includes(p.value);
    selectedCategories.value = exists
      ? selectedCategories.value.filter((v) => v !== p.value)
      : [...selectedCategories.value, p.value];
    return;
  }
  const allSelected = childVals.every((v) =>
    selectedCategories.value.includes(v)
  );
  selectedCategories.value = allSelected
    ? selectedCategories.value.filter((v) => !childVals.includes(v))
    : Array.from(new Set([...selectedCategories.value, ...childVals]));
}

function isParentChecked(p) {
  const childVals = (p.children || []).map((ch) => ch.value);
  if (!childVals.length) return selectedCategories.value.includes(p.value);
  return (
    childVals.length &&
    childVals.every((v) => selectedCategories.value.includes(v))
  );
}
function isParentIndeterminate(p) {
  const childVals = (p.children || []).map((ch) => ch.value);
  if (!childVals.length) return false;
  const hit = childVals.filter((v) =>
    selectedCategories.value.includes(v)
  ).length;
  return hit > 0 && hit < childVals.length;
}

/* تحديد الكل/إلغاء الكل */
const allValues = computed(() => {
  const vals = [];
  for (const p of categories.value) {
    if (p?.children?.length) vals.push(...p.children.map((ch) => ch.value));
    else if (p?.value) vals.push(p.value);
  }
  return vals;
});
const allChecked = computed(
  () =>
    allValues.value.length > 0 &&
    allValues.value.every((v) => selectedCategories.value.includes(v))
);
const isIndeterminate = computed(
  () => selectedCategories.value.length > 0 && !allChecked.value
);
function toggleAll(e) {
  selectedCategories.value = e.target.checked ? [...allValues.value] : [];
}

/* ====== تهيئة category_id وتنظيف subcategory_ids عند تغيّر تصنيف الصفحة ====== */
watch(
  () => pageCategory.value?.id,
  (id) => {
    // اضبط category_id كي يرسَل مع الفلاتر — هذا ما كان يمنع الطلب في وضع تصنيف واحد
    filters.category_id = id ?? "";

    // دع فقط التصنيفات الفرعية المسموحة لهذا التصنيف
    const allowed = new Set(
      (pageCategory.value?.subcategories || []).map((sc) => Number(sc?.id))
    );
    selectedCategories.value = selectedCategories.value.filter((sid) =>
      allowed.has(Number(sid))
    );

    // افتح التصنيف الوحيد تلقائيًا
    if (id) expanded[id] = true;

    // أعد الإرسال فورًا
    emitFilters();
  },
  { immediate: true }
);

/* إرسال الفلاتر للخارج */
function emitFilters() {
  filters.categories = [...selectedCategories.value];
  emit("update:filters", {
    categories: filters.categories,
    city_id: filters.city_id || undefined,
    priceMin: filters.priceMin ?? undefined,
    priceMax: filters.priceMax ?? undefined,
    currency: filters.currency,
    // مهم: category_id من تصنيف الصفحة إن وُجد
    category_id: filters.category_id || undefined,
  });
}

/* أرسل على أي تغيير (مع immediate لضمان أول إرسال) */
watch(
  [
    selectedCategories,
    () => filters.city_id,
    () => filters.region,
    () => filters.priceMin,
    () => filters.priceMax,
    () => filters.currency,
    () => filters.category_id,
    () => routeCategorySlug.value, // تغيّر المسار
  ],
  () => emitFilters(),
  { deep: true, immediate: true }
);
</script>

<template>
  <aside class="filters-sidebar mx-2 position-relative top-0">
    <div
      v-if="
        mainStore?.filterData?.categories && categoryStore?.citiesData?.cities
      "
    >
      <div class="card border-0 mb-3 bg-muted">
        <div class="card-body">
          <h4 class="fw-bold pb-3 mb-3 border-bottom">الأقسام</h4>

          <!-- تحديد الكل -->
          <div class="form-check form-check-reverse mb-2">
            <input
              class="form-check-input"
              type="checkbox"
              :checked="allChecked"
              :indeterminate.prop="isIndeterminate"
              @change="toggleAll($event)"
              id="cat-all"
            />
            <label
              class="form-check-label w-100 d-inline-flex gap-2"
              for="cat-all"
            >
              <span>{{
                isCategoryRoute ? "جميع الأقسام الفرعية" : "جميع الأقسام"
              }}</span>
            </label>
          </div>

          <!-- قائمة الأقسام (تصنيف المسار فقط إن وُجد، وإلا الكل) -->
          <div v-for="(p, i) in categories" :key="p.value || i" class="mb-2">
            <div
              class="d-flex align-items-center justify-content-between app-item"
            >
              <div class="form-check form-check-reverse m-0">
                <input
                  class="form-check-input"
                  type="checkbox"
                  :id="`p-${i}`"
                  :checked="isParentChecked(p)"
                  :indeterminate.prop="isParentIndeterminate(p)"
                  @change="toggleParent(p)"
                />
                <label
                  class="form-check-label d-inline-flex gap-2"
                  :for="`p-${i}`"
                >
                  <span>{{ p.name }}</span>
                </label>
              </div>

              <button
                v-if="p.children && p.children.length"
                class="btn btn-sm btn-link text-decoration-none"
                type="button"
                @click="expanded[p.value] = !expanded[p.value]"
                :aria-expanded="!!expanded[p.value]"
              >
                <Icon
                  :name="
                    expanded[p.value] ? 'mdi:chevron-up' : 'mdi:chevron-down'
                  "
                  size="18"
                />
              </button>
            </div>

            <!-- أبناء التصنيف -->
            <div
              v-if="p.children && p.children.length && expanded[p.value]"
              class="mt-2 ps-4"
            >
              <div
                v-for="(ch, j) in p.children"
                :key="ch.value || j"
                class="form-check child-item form-check-reverse mb-2"
              >
                <input
                  class="form-check-input ms-2"
                  type="checkbox"
                  :id="`c-${i}-${j}`"
                  :value="ch.value"
                  v-model="selectedCategories"
                />
                <label
                  class="form-check-label w-100 d-flex"
                  :for="`c-${i}-${j}`"
                >
                  <span>{{ ch.name }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- المدينة -->
      <div class="border bg-muted my-5 rounded">
        <div class="card bg-muted border-0 my-9">
          <div class="card-body py-0">
            <h4 class="fw-bold mb-3">المدينة</h4>
            <div class="input-group">
              <span
                class="input-group-text text-secondary rounded-0 border-secondary rounded-end border-start-0 bg-white"
              >
                <Icon name="material-symbols:location-on-outline" size="18" />
              </span>
              <select
                class="form-control rounded-0 text-muted border-end-0 rounded-start p-0 bg-white"
                id="inputCityGroup"
                v-model="filters.city_id"
              >
                <option value="">اختر المدينة</option>
                <option
                  :value="city.id"
                  v-for="city in categoryStore?.citiesData?.cities || []"
                  :key="city.id"
                >
                  {{ city.name }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- السعر + العملة -->
        <div class="card bg-muted border-0 my-9">
          <div class="card-body py-0">
            <div class="d-flex justify-content-between align-items-center">
              <h4 class="fw-bold mb-3">السعر</h4>
              <div class="btn-group">
                <button
                  type="button"
                  class="btn btn-currency p-1 dropdown-toggle"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  {{ filters.currency }}
                  <Icon class="fs-1 icon-down" name="mdi:chevron-down" />
                  <Icon class="fs-1 icon-up" name="mdi:chevron-up" />
                </button>
                <ul class="dropdown-menu shadow-none">
                  <li v-for="(cur, i) in currencies" :key="i">
                    <button
                      class="dropdown-item btn text-end"
                      @click="filters.currency = cur"
                    >
                      {{ cur }}
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            <div class="d-flex align-items-stretch gap-2 w-75">
              <div class="input-group">
                <span
                  class="input-group-text text-secondary rounded-0 border-secondary rounded-end border-start-0 bg-white"
                  >من...</span
                >
                <input
                  type="text"
                  inputmode="numeric"
                  class="form-control rounded-0 border-end-0 rounded-start p-0 bg-white"
                  v-model="priceMinText"
                  @input="sanitizePrice('min')"
                />
              </div>
              <div class="input-group">
                <span
                  class="input-group-text text-secondary rounded-0 border-secondary rounded-end border-start-0 bg-white"
                  >إلى...</span
                >
                <input
                  type="text"
                  inputmode="numeric"
                  class="form-control rounded-0 border-end-0 rounded-start p-0 bg-white"
                  v-model="priceMaxText"
                  @input="sanitizePrice('max')"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- زر إرسال يدوي (اختياري) -->
        <button
          class="btn btn-main w-100 d-flex algin-items-center justify-content-center mt-3"
          @click="emitFilters()"
        >
          بحث
        </button>
      </div>

      <!-- صور جانبية -->
      <div class="text-center">
        <img
          src="~/public/media/bg-home/jawwal1.jpg"
          class="w-100 mb-3 rounded-1"
          alt="jawwal"
        />
        <img
          src="~/public/media/bg-home/jawwal2.jpg"
          class="w-100 mb-3 rounded-1"
          alt="jawwal"
        />
      </div>
    </div>
    <SkeletonSidebar v-else />
  </aside>
</template>

<style scoped>
.filters-sidebar {
  width: 100%;
}
.card {
  border-radius: 12px;
}
.child-item {
  padding-right: 50px;
}
.btn-currency::after {
  display: none;
}
.dropdown-toggle .icon-up {
  display: none;
}
.dropdown-toggle[aria-expanded="true"] .icon-down {
  display: none;
}
.dropdown-toggle[aria-expanded="true"] .icon-up {
  display: inline;
}
@media (min-width: 992px) {
  .filters-sidebar {
    position: sticky;
    top: 1rem;
  }
}
</style>
