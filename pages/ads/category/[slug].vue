<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { useCategoryStore } from "~/stores/categoryStore";
import SidebarFilters from "~/components/SidebarFilters.vue";
import ProductCard from "~/components/ProductCard.vue";
import AdsCard from "~/components/AdsCard.vue";
import SkeletonSidebar from "~/components/Skeleton/SkeletonSidebar.vue";
import SkeletonAdCard from "~/components/Skeleton/SkeletonAdCard.vue";

const route = useRoute();
const router = useRouter();
const categoryStore = useCategoryStore();

// SEO / head
useSeo({
  title: `إعلانات ${route.params.slug} | منصّة الإعلانات العربية`,
  description: `تصفح أحدث إعلانات ${route.params.slug}، وتواصل مباشرة مع البائعين.`,
  image: "/media/avatars/logo.png",
  canonicalPath: `/ads/category/${route.params.slug}`,
  type: "website",
});
useHead({ title: route.params.slug });

// load category
const fetchCategory = async () => {
  await categoryStore.getCategory(route.params.slug);
};
onMounted(fetchCategory);
watch(
  () => route.params.slug,
  async () => {
    router.replace({ path: route.path, query: { page: 1 } });
    await fetchCategory();
  }
);

/* ===================== util ===================== */
function toNumber(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}
function toTime(v) {
  const t = new Date(v).getTime();
  return Number.isFinite(t) ? t : 0;
}
function parseFiltersFromQuery(q = {}) {
  let subIds = q["subcategory_ids[]"] ?? q.subcategory_ids ?? [];
  if (!Array.isArray(subIds)) subIds = [subIds].filter(Boolean);
  const categories = subIds
    .map((x) => Number(x))
    .filter((x) => Number.isFinite(x));

  const city_id = q.city_id ? Number(q.city_id) : undefined;
  const priceMin = q.min_price ? Number(q.min_price) : undefined;
  const priceMax = q.max_price ? Number(q.max_price) : undefined;

  return { categories, city_id, priceMin, priceMax };
}

/* ===================== الفلاتر (JS فقط + URL query) ===================== */
const activeFilters = ref(parseFiltersFromQuery(route.query));

watch(
  () => route.query,
  (q) => {
    activeFilters.value = parseFiltersFromQuery(q);
  },
  { immediate: true, deep: true }
);

// يُستدعى من SidebarFilters
function onFiltersChange(f) {
  const q = {
    ...route.query,
    page: 1,
    min_price: f.priceMin ?? undefined,
    max_price: f.priceMax ?? undefined,
    city_id: f.city_id || undefined,
  };

  delete q["subcategory_ids[]"];
  if (Array.isArray(f.categories) && f.categories.length) {
    q["subcategory_ids[]"] = f.categories.map(String);
  }

  router.push({ path: route.path, query: q });
}

/* ===================== الترتيب (JS فقط) ===================== */
const sortKey = ref("created_at"); // created_at | price
const sortDir = ref("desc"); // asc | desc

const sortLabel = computed(() => {
  if (sortKey.value === "created_at" && sortDir.value === "desc")
    return "الأحدث";
  if (sortKey.value === "created_at" && sortDir.value === "asc")
    return "الأقدم";
  if (sortKey.value === "price" && sortDir.value === "asc") return "الأرخص سعر";
  if (sortKey.value === "price" && sortDir.value === "desc")
    return "الأعلى سعر";
  return "الترتيب حسب";
});
function setSort(key, dir) {
  sortKey.value = key;
  sortDir.value = dir;
}
function compareValues(a, b, key, dir) {
  let va, vb;
  if (key === "price") {
    va = toNumber(a?.price, 0);
    vb = toNumber(b?.price, 0);
  } else {
    va = toTime(a?.created_at);
    vb = toTime(b?.created_at);
  }
  const diff = va - vb;
  return dir === "asc" ? diff : -diff;
}

/* ===================== البيانات الخام ===================== */
const adsRaw = computed(
  () => categoryStore?.categoryData?.ads?.items?.data ?? []
);
const productsRaw = computed(
  () => categoryStore?.categoryData?.products?.items?.data ?? []
);

/* ===================== تتبع حالة Sidebar (Bootstrap collapse) ===================== */
const isSidebarVisible = ref(false);
let onShown = null;
let onHidden = null;

onMounted(() => {
  const collapseEl = document.getElementById("collapseExample");
  if (!collapseEl) return;

  // الحالة الابتدائية (لو العنصر مفتوح بالـ HTML مع الصنف show)
  isSidebarVisible.value = collapseEl.classList.contains("show");

  onShown = () => {
    isSidebarVisible.value = true;
  };
  onHidden = () => {
    isSidebarVisible.value = false;
  };

  collapseEl.addEventListener("shown.bs.collapse", onShown);
  collapseEl.addEventListener("hidden.bs.collapse", onHidden);
});

onBeforeUnmount(() => {
  const collapseEl = document.getElementById("collapseExample");
  if (collapseEl) {
    if (onShown) collapseEl.removeEventListener("shown.bs.collapse", onShown);
    if (onHidden)
      collapseEl.removeEventListener("hidden.bs.collapse", onHidden);
  }
});

/* ===================== تطبيق الفلاتر محليًا ===================== */
const filteredAds = computed(() => {
  const { categories, city_id, priceMin, priceMax } = activeFilters.value;
  const hasCats = Array.isArray(categories) && categories.length > 0;

  return (adsRaw.value || []).filter((ad) => {
    // المدينة
    if (city_id && !(Number(ad?.city_id ?? ad?.city?.id) === city_id))
      return false;

    // التصنيفات الفرعية
    if (hasCats) {
      const adSubId = Number(ad?.subcategory_id ?? ad?.subcategory?.id);
      if (!categories.includes(adSubId)) return false;
    }

    // السعر
    const p = toNumber(ad?.price, NaN);
    if (Number.isFinite(p)) {
      if (
        typeof priceMin === "number" &&
        !Number.isNaN(priceMin) &&
        p < priceMin
      )
        return false;
      if (
        typeof priceMax === "number" &&
        !Number.isNaN(priceMax) &&
        p > priceMax
      )
        return false;
    }
    return true;
  });
});

/* ===================== الفرز + الترقيم (على النتيجة بعد الفلترة) ===================== */
const sortedAds = computed(() => {
  const list = [...filteredAds.value];
  list.sort((a, b) => compareValues(a, b, sortKey.value, sortDir.value));
  return list;
});

/* pagination local */
const pageSize = ref(12);
const currentPage = computed(() => {
  const p = Number(route.query.page || 1);
  return Number.isNaN(p) || p < 1 ? 1 : Math.floor(p);
});
const lastPage = computed(() => {
  const total = sortedAds.value.length;
  const lp = Math.ceil(total / pageSize.value);
  return Math.max(1, lp || 1);
});
const safeCurrentPage = computed(() =>
  Math.max(1, Math.min(lastPage.value, currentPage.value))
);
const paginatedAds = computed(() => {
  const start = (safeCurrentPage.value - 1) * pageSize.value;
  return sortedAds.value.slice(start, start + pageSize.value);
});
watch(
  () => safeCurrentPage.value,
  () => {
    if (process.client) window.scrollTo({ top: 0, behavior: "smooth" });
  }
);
function goToPage(n) {
  const page = Math.max(1, Math.min(lastPage.value, Number(n) || 1));
  router.push({ path: route.path, query: { ...route.query, page } });
}

/* ===================== منتجات المعاينة (عدد/مصفوفة) ===================== */
const productsPreviewCount = computed(() => (isSidebarVisible.value ? 4 : 3));
const visibleProductsForPreview = computed(() =>
  (productsRaw.value || []).slice(0, productsPreviewCount.value)
);

/* ===================== عرض عدد الإعلانات (controls) ===================== */
const itemsPerPage = ref(9); // القيمة الافتراضية
function setItemsPerPage(n) {
  itemsPerPage.value = n;
}
const visibleAds = computed(() => sortedAds.value.slice(0, itemsPerPage.value));

/* تمرير القيم الحالية لـ Sidebar (لتعبئة الحقول) */
const sidebarDefaults = computed(() => ({
  categories: activeFilters.value.categories || [],
  city_id: activeFilters.value.city_id || "",
  priceMin: activeFilters.value.priceMin ?? null,
  priceMax: activeFilters.value.priceMax ?? null,
  category_id: "", // غير مستخدم هنا
}));
</script>

<template>
  <div class="container py-4 py-md-5">
    <div class="page-content my-6">
      <div class="d-flex align-items-center mb-4 p-4">
        <NuxtLink to="/" class="fs-5 m-0 fw-medium text-primary d-inline"
          >الرئيسية</NuxtLink
        >
        <Icon
          name="mdi:chevron-left-circle-outline"
          class="fs-3 fw-medium mx-3 text-muted"
        />
        <span class="fs-5 fw-medium m-0 text-muted">
          {{ route.params.slug }}
        </span>
      </div>

      <div
        class="d-flex align-items-center justify-content-between p-4 my-9 rounded-0"
        style="background-color: #f9f9f9"
      >
        <span class="fs-3 fw-medium">بيع وشراء أي شيء في فلسطين (10,000)</span>

        <!-- زر الترتيب (فرز محلي بدون أي استدعاء API) -->
        <!-- أزرار التحكم (الترتيب وعدد الإعلانات) -->
        <div class="d-flex align-items-center gap-4">
          <!-- ✅ زر الترتيب -->
          <div class="btn-group">
            <button
              type="button"
              class="dropdown-toggle fs-3"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <span>{{ sortLabel }}</span>
              <Icon class="fs-1 icon-down" name="mdi:chevron-down" />
              <Icon class="fs-1 icon-up" name="mdi:chevron-up" />
            </button>

            <ul class="dropdown-menu">
              <li>
                <button
                  type="button"
                  class="dropdown-item text-end"
                  :class="{
                    active: sortKey === 'created_at' && sortDir === 'desc',
                  }"
                  @click="setSort('created_at', 'desc')"
                >
                  الأحدث
                </button>
              </li>
              <li>
                <button
                  type="button"
                  class="dropdown-item text-end"
                  :class="{
                    active: sortKey === 'created_at' && sortDir === 'asc',
                  }"
                  @click="setSort('created_at', 'asc')"
                >
                  الأقدم
                </button>
              </li>
              <li>
                <button
                  type="button"
                  class="dropdown-item text-end"
                  :class="{ active: sortKey === 'price' && sortDir === 'asc' }"
                  @click="setSort('price', 'asc')"
                >
                  الأرخص سعر
                </button>
              </li>
              <li>
                <button
                  type="button"
                  class="dropdown-item text-end"
                  :class="{ active: sortKey === 'price' && sortDir === 'desc' }"
                  @click="setSort('price', 'desc')"
                >
                  الأعلى سعر
                </button>
              </li>
            </ul>
          </div>

          <!-- ✅ زر عرض عدد الإعلانات -->
          <div class="btn-group">
            <button
              type="button"
              class="dropdown-toggle fs-3"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <span>عرض {{ itemsPerPage }}</span>
              <Icon class="fs-1 icon-down" name="mdi:chevron-down" />
              <Icon class="fs-1 icon-up" name="mdi:chevron-up" />
            </button>

            <ul class="dropdown-menu">
              <li v-for="n in [3, 6, 9, 12]" :key="n">
                <button
                  type="button"
                  class="dropdown-item text-end fs-4"
                  :class="{ active: itemsPerPage === n }"
                  @click="setItemsPerPage(n)"
                >
                  <span>{{ n }}</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="d-lg-flex align-items-start justify-content-between">
        <div class="collapse collapse-horizontal" id="collapseExample">
          <SidebarFilters
            :default-filters="sidebarDefaults"
            class="sidebar-filters"
            @update:filters="onFiltersChange"
          />
        </div>
        <div class="d-flex flex-column w-100">
          <section class="product-section px-4">
            <template v-if="categoryStore?.categoryData?.products?.count > 0">
              <div class="row g-4">
                <div
                  v-for="pro in visibleProductsForPreview"
                  :key="pro.id"
                  class="col-12 col-md-6 mb-4"
                  :class="isSidebarVisible ? 'col-xl-4' : 'col-xl-3'"
                >
                  <ProductCard :item="pro" />
                </div>
              </div>
            </template>
          </section>
          <section class="ads-section px-4">
            <!-- الاعلانات -->
            <template v-if="categoryStore?.categoryData?.ads?.count > 0">
              <div class="row g-4">
                <div
                  v-for="ad in paginatedAds"
                  :key="ad.id"
                  class="col-12 col-md-6 p-0"
                  :class="isSidebarVisible ? 'col-xl-4' : 'col-xl-3'"
                >
                  <AdsCard :ad="ad" :category="route.params.slug" />
                </div>
              </div>
            </template>

            <!-- لا نتائج -->
            <template v-else-if="categoryStore?.categoryData?.ads?.count === 0">
              <div class="py-5 text-center">
                <!-- لا توجد إعلانات -->
                <div class="text-center p-4">
                  <NuxtImg
                    src="/media/empty-ads.png"
                    alt="اعلانات فارغة"
                    width="250px"
                    height="250px"
                  />
                  <h3 class="text-dark fs-1">لا يوجد نتائج لعرضها.</h3>
                  <p class="text-muted">
                    انشر أول إعلان في هذه القسم لتبدأ رحلتك مع الزبائن المهتمين!
                  </p>
                  <div>
                    <NuxtLink
                      to="/ads/create"
                      class="btn btn-lg mt-4 btn-main d-inline-flex align-items-center gap-2"
                    >
                      <Icon class="fs-3" name="fa-solid:plus" />
                      <span class="fs-3">إضافة إعلان</span>
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </template>

            <!-- skeleton عام -->
            <template v-else>
              <div class="carousel-item active">
                <div class="row g-4 my-4">
                  <div
                    v-for="n in 12"
                    :key="'skeleton-' + n"
                    class="col-12 col-md-6 col-xl-3"
                  >
                    <SkeletonAdCard />
                  </div>
                </div>
              </div>
            </template>

            <!-- ترقيم الصفحات -->
            <nav aria-label="Page navigation example" v-if="lastPage > 1">
              <ul class="pagination my-9">
                <li
                  class="page-item"
                  :class="{ disabled: safeCurrentPage <= 1 }"
                >
                  <NuxtLink
                    class="page-link"
                    :to="{
                      path: route.path,
                      query: {
                        ...route.query,
                        page: Math.max(1, safeCurrentPage - 1),
                      },
                    }"
                    aria-label="Previous"
                    @click.prevent="goToPage(safeCurrentPage - 1)"
                  >
                    <span class="fs-1" aria-hidden="true">&laquo;</span>
                  </NuxtLink>
                </li>

                <li v-for="n in lastPage" :key="'p-' + n" class="page-item">
                  <NuxtLink
                    class="page-link fs-3"
                    :class="{ active: n === safeCurrentPage }"
                    :to="{
                      path: route.path,
                      query: { ...route.query, page: n },
                    }"
                    @click.prevent="goToPage(n)"
                  >
                    {{ n }}
                  </NuxtLink>
                </li>

                <li
                  class="page-item"
                  :class="{ disabled: safeCurrentPage >= lastPage }"
                >
                  <NuxtLink
                    class="page-link"
                    :to="{
                      path: route.path,
                      query: {
                        ...route.query,
                        page: Math.min(lastPage, safeCurrentPage + 1),
                      },
                    }"
                    aria-label="Next"
                    @click.prevent="goToPage(safeCurrentPage + 1)"
                  >
                    <span class="fs-1" aria-hidden="true">&raquo;</span>
                  </NuxtLink>
                </li>
              </ul>
            </nav>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-link:hover {
  color: var(--bs-primary) !important;
}
.page-link.active {
  background-color: var(--bs-primary);
  border-radius: 3px;
}
.dropdown-toggle:hover {
  color: var(--bs-primary);
}
.dropdown-toggle {
  background: transparent;
  border: none;
  color: black;
}
.dropdown-toggle::after {
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
.collapse-horizontal {
  transition: 0.2s ease-in-out;
}

/* تمييز الخيار النشط في القائمة */
.dropdown-menu .dropdown-item.active {
  font-weight: 600;
}
.dropdown-item:hover,
.dropdown-item.active {
  color: var(--bs-primary);
}
.router-link-exact-active.active {
  color: white !important;
}
</style>
