<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useCategoryStore } from "~/stores/categoryStore";
import { useMainStore } from "~/stores/mainStore";
import SkeletonSidebar from "./Skeleton/SkeletonSidebar.vue";

const categoryStore = useCategoryStore();
const mainStore = useMainStore();
const route = useRoute();
const config = useRuntimeConfig();

/* حفظ/استعادة موضع التمرير */
let _savedScroll = 0;
function preserveScroll() {
  if (typeof window === "undefined") return;
  _savedScroll =
    window.scrollY ||
    window.pageYOffset ||
    document.documentElement.scrollTop ||
    0;
  setTimeout(() => {
    const now =
      window.scrollY ||
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      0;
    if (Math.abs(now - _savedScroll) > 0) {
      window.scrollTo({ top: _savedScroll, left: 0, behavior: "auto" });
    }
  }, 0);
}

/* تحميل بيانات المدن + الفلاتر */
onMounted(async () => {
  if (!categoryStore?.citiesData) await categoryStore.getCitiesData();
  if (!mainStore?.filterData) await mainStore.getFilterData();
});

/* Props */
const props = defineProps({
  defaultFilters: {
    type: Object,
    default: () => ({
      categories: [],
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
  categories: [...(props.defaultFilters.categories || [])],
  city_id: props.defaultFilters.city_id || "",
  region: props.defaultFilters.region || "",
  priceMin: props.defaultFilters.priceMin ?? null,
  priceMax: props.defaultFilters.priceMax ?? null,
  category_id: props.defaultFilters.category_id || "",
  currency: props.defaultFilters.currency || "شيكل",
});

/* حقولا السعر النصية */
const priceMinText = ref(
  filters.priceMin !== null ? String(filters.priceMin) : ""
);
const priceMaxText = ref(
  filters.priceMax !== null ? String(filters.priceMax) : ""
);

/* تنظيف الأرقام */
function sanitizePrice(which, e) {
  e?.stopPropagation?.();

  if (which === "min") {
    priceMinText.value = (priceMinText.value || "").replace(/[^\d]/g, "");
    filters.priceMin = priceMinText.value ? Number(priceMinText.value) : null;
  } else {
    priceMaxText.value = (priceMaxText.value || "").replace(/[^\d]/g, "");
    filters.priceMax = priceMaxText.value ? Number(priceMaxText.value) : null;
  }

  // ✅ فقط تحقق بدون قلب القيم
  if (
    filters.priceMin !== null &&
    filters.priceMax !== null &&
    filters.priceMin > filters.priceMax
  ) {
    console.warn("⚠️ تأكد أن السعر الأدنى أصغر من الأعلى");
  }
}

/* ====== معالجة التصنيفات ====== */
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

const categories = computed(() => {
  const raw = mainStore?.filterData?.categories || [];
  const mapCat = (cat) => ({
    name: cat?.name,
    value: cat?.id,
    children: Array.isArray(cat?.subcategories)
      ? cat.subcategories.map((sc) => ({ name: sc?.name, value: sc?.id }))
      : [],
  });
  if (isCategoryRoute.value && pageCategory.value) {
    return [mapCat(pageCategory.value)];
  }
  return raw.map(mapCat);
});

/* اختيار التصنيفات */
const selectedCategories = ref([...filters.categories]);
const expanded = reactive({});

const selectedParentIds = ref([]);        // category_id[]
const selectedSubcategoryIds = ref([]);   // subcategory_ids[]

function toggleParent(p, e) {
  e?.stopPropagation?.();

  if (selectedParentIds.value.includes(p.value)) {
    selectedParentIds.value =
      selectedParentIds.value.filter(id => id !== p.value);
  } else {
    selectedParentIds.value.push(p.value);
  }
}
function toggleChild(id) {
  if (selectedSubcategoryIds.value.includes(id)) {
    selectedSubcategoryIds.value =
      selectedSubcategoryIds.value.filter(v => v !== id);
  } else {
    selectedSubcategoryIds.value.push(id);
  }
}

function isParentChecked(p) {
  return selectedParentIds.value.includes(p.value);
}

function isParentIndeterminate(p) {
  const childVals = (p.children || []).map(ch => ch.value);
  if (!childVals.length) return false;

  const hit = childVals.filter(v =>
    selectedSubcategoryIds.value.includes(v)
  ).length;

  return hit > 0 && hit < childVals.length;
}

watch(selectedCategories, (val) => {
  if (val.length > 0) {
    filters.category_id = "";
  }
});


const allValues = computed(() => {
  const vals = [];
  for (const p of categories.value) {
    if (p?.children?.length) vals.push(...p.children.map((ch) => ch.value));
    else if (p?.value) vals.push(p.value);
  }
  return vals;
});
const allChecked = ref(false);
const isIndeterminate = ref(false);

watch(
  selectedCategories,
  (val) => {
    allChecked.value =
      val.length > 0 && val.length === allValues.value.length;
    isIndeterminate.value =
      val.length > 0 && val.length < allValues.value.length;
  },
  { deep: true }
);
const allValuesCount = computed(() => {
  return categories.value.reduce((acc, p) => {
    if (p.children?.length) return acc + p.children.length;
    return acc + 1;
  }, 0);
});

watch(
  [selectedParentIds, selectedSubcategoryIds],
  () => {
    const totalSelected =
      selectedParentIds.value.length + selectedSubcategoryIds.value.length;
    allChecked.value = totalSelected === allValuesCount.value;
    isIndeterminate.value =
      totalSelected > 0 && totalSelected < allValuesCount.value;
  },
  { deep: true }
);

function toggleAll(e) {
  e?.stopPropagation?.();
  if (e.target.checked) {
    // حدد كل الآباء والأبناء
    selectedParentIds.value = categories.value.map(p => p.value);
    selectedSubcategoryIds.value = categories.value
      .flatMap(p => p.children ? p.children.map(ch => ch.value) : []);
  } else {
    // أفرغ التحديد
    selectedParentIds.value = [];
    selectedSubcategoryIds.value = [];
  }
}

/* ====== تطبيق الفلاتر عند النقر فقط ====== */
function applyFilters() {
  emit("update:filters", {
    category_id: selectedParentIds.value.length
      ? [...selectedParentIds.value]
      : undefined,

    subcategory_ids: selectedSubcategoryIds.value.length
      ? [...selectedSubcategoryIds.value]
      : undefined,

    city_id: filters.city_id || undefined,
    min_price: priceMinText.value ? Number(priceMinText.value) : undefined,
    max_price: priceMaxText.value ? Number(priceMaxText.value) : undefined,
  });
}
</script>

<template>
  <aside
    class="filters-sidebar mx-2 position-relative top-0"
    @mousedown.capture="preserveScroll"
    @touchstart.capture="preserveScroll"
    @keydown.capture="preserveScroll"
    @input.capture="preserveScroll"
  >
    <div
      v-if="
        mainStore?.filterData?.categories && categoryStore?.citiesData?.cities
      "
    >
      <!-- الأقسام -->
      <div
        class="card border-0 mb-3 rounded-0"
        style="background-color: #f9f9f9"
      >
        <div class="card-body">
          <h4 class="fw-medium pb-3 mb-3 border-bottom">الأقسام</h4>

          <div class="form-check form-check-reverse mb-2">
            <input
              class="form-check-input"
              type="checkbox"
              :checked="allChecked"
              :indeterminate.prop="isIndeterminate"
              @change.stop="toggleAll($event)"
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

          <div  v-for="(p, i) in categories" :key="p.value" class="mb-2">
            <div
              class="d-flex align-items-center justify-content-between app-item"
            >
              <div class="form-check form-check-reverse m-0">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    :checked="isParentChecked(p)"
                    :indeterminate.prop="isParentIndeterminate(p)"
                    @change.stop="toggleParent(p, $event)"
                    :id="`p-${i}`"
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
                @click.stop="
                  expanded[p.value] = !expanded[p.value];
                  preserveScroll();
                "
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

            <div
              v-if="p.children && p.children.length"
              class="mt-2 ps-4"
            >
              <div
                v-for="(ch, j) in p.children"
                :key="ch.value"
                class="form-check child-item form-check-reverse mb-2"
              >
<input
  class="form-check-input ms-2"
  type="checkbox"
  :checked="selectedSubcategoryIds.includes(ch.value)"
  @change.stop="toggleChild(ch.value)"
  :id="`c-${i}-${j}`"
/>                <label
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

      <!-- المدينة والسعر -->
      <div class="border my-5 rounded shadow-sm">
        <div class="card border-0 my-9 bg-white">
          <div class="card-body py-0">
            <h4 class="fw-medium mb-3">المدينة</h4>
            <div class="input-group input-group-city w-100 align-items-center">
              <span
                class="input-group-text city-icon text-secondary p-3 bg-white"
              >
                <Icon name="material-symbols:location-on-outline" size="18" />
              </span>

              <div class="dropdown w-100 rounded-0">
                <button
                  class="city-dropdown btn w-100 text-end border-0 fs-4 bg-white d-flex align-items-center justify-content-between"
                  type="button"
                  id="dropdownCity"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  style="box-shadow: none"
                >
                  <span
                    :class="{
                      'text-muted': !filters.city_id,
                      'text-dark': filters.city_id,
                    }"
                    class="flex-grow-1 city-placeholder text-end p-3 pe-0 fw-medium"
                  >
                    {{
                      filters.city_id
                        ? categoryStore.citiesData.cities.find(
                            (c) => c.id === filters.city_id
                          )?.name
                        : "ابحث عن المدينة..."
                    }}
                  </span>
                </button>

                <ul
                  class="dropdown-menu w-100 text-end shadow-sm"
                  aria-labelledby="dropdownCity"
                >
                  <li>
                    <a
                      class="dropdown-item fs-5 py-2 text-muted fw-medium"
                      href="#"
                      @click.prevent="filters.city_id = ''"
                    >
                      ابحث عن المدينة...
                    </a>
                  </li>
                  <li
                    v-for="city in categoryStore?.citiesData?.cities || []"
                    :key="city.id"
                  >
                    <a
                      class="dropdown-item fs-5 py-2 fw-medium"
                      href="#"
                      @click.prevent="filters.city_id = city.id"
                    >
                      {{ city.name }}
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- السعر -->
        <div class="card border-0 my-9">
          <div class="card-body py-0">
            <h4 class="fw-medium mb-3">السعر</h4>
            <div class="d-flex align-items-stretch gap-2 w-75">
              <div class="input-group">
                <span
                  class="input-group-text text-secondary rounded-0 border-secondary rounded-end bg-white px-2"
                  >من...</span
                >
                <input
                  type="text"
                  inputmode="numeric"
                  class="form-control rounded-0 border-end-0 rounded-start p-0 bg-white"
                  v-model="priceMinText"
                  @input.stop="sanitizePrice('min', $event)"
                />
              </div>
              <div class="input-group">
                <span
                  class="input-group-text text-secondary rounded-0 border-secondary rounded-end bg-white px-2"
                  >إلى...</span
                >
                <input
                  type="text"
                  inputmode="numeric"
                  class="form-control rounded-0 border-end-0 rounded-start p-0 bg-white"
                  v-model="priceMaxText"
                  @input.stop="sanitizePrice('max', $event)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <button
        class="btn btn-main w-100 d-flex algin-items-center justify-content-center my-3"
        @click.stop="applyFilters()"
      >
        بحث
      </button>

      <div class="text-center">
        <nuxt-link
          rel="noopener noreferrer"
          :to="config.public.whatsappUrl"
          aria-label="تواصل"
          target="_blank"
        >
          <img
            src="/media/bg-home/ads.jpg"
            class="w-100 mb-3 rounded-1"
            alt="ads"
          />
        </nuxt-link>
        <nuxt-link
          rel="noopener noreferrer"
          :to="config.public.whatsappUrl"
          aria-label="تواصل"
          target="_blank"
        >
          <img
            src="/media/bg-home/ads.jpg"
            class="w-100 mb-3 rounded-1"
            alt="ads"
          />
        </nuxt-link>
      </div>
    </div>

    <SkeletonSidebar v-else />
  </aside>
</template>

<style scoped>
.filters-sidebar {
  width: 100%;
}
.filters-sidebar *:focus {
  scroll-behavior: auto !important;
}
.card {
  border-radius: 12px;
}
.child-item {
  padding-right: 50px;
}
.dropdown-menu {
  z-index: 9999 !important;
  position: absolute !important;
}
.city-dropdown {
  padding: 0 !important;
  border: 0 !important;
}
.city-icon {
  border: 0 !important;
}
.input-group-city {
  flex-wrap: nowrap;
  border: #dbdfe9 1px solid !important;
  border-radius: 5px !important;
}
.city-placeholder {
  border-left: #dbdfe9 1px solid !important;
  border-radius: 5px !important;
}
@media (min-width: 992px) {
  .filters-sidebar {
    position: sticky;
    top: 1rem;
  }
}
</style>
