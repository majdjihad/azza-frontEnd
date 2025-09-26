<script setup>
import { useMainStore } from "~/stores/mainStore";
import { useCategoryStore } from "~/stores/categoryStore";

const route = useRoute();
const router = useRouter();
const mainStore = useMainStore();
const categoryStore = useCategoryStore();
useSeo({
  title: "الإعلانات | منصّة الإعلانات العربية",
  description:
    "تصفح أحدث الإعلانات المضافة من المستخدمين في مختلف الأقسام مثل العقارات، السيارات، الأجهزة، الأثاث، الخدمات والمزيد.",
  image: "/media/avatars/logo.png",
  canonicalPath: "/ads",
  type: "website",
});

useHead({ title: "الإعلانات" });

/* ========= الترتيب (JS فقط بدون أي طلبات/استعلامات) ========= */
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

/* دوال مقارنة عامة */
function toNumber(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}
function toTime(v) {
  const t = new Date(v).getTime();
  return Number.isFinite(t) ? t : 0;
}
function compareValues(a, b, key, dir) {
  let va, vb;
  if (key === "price") {
    va = toNumber(a?.price, 0);
    vb = toNumber(b?.price, 0);
  } else {
    // created_at افتراض
    va = toTime(a?.created_at);
    vb = toTime(b?.created_at);
  }
  const diff = va - vb;
  return dir === "asc" ? diff : -diff;
}

/* مصادر البيانات الخام من المتجر (لا نغيّرها) */
const productsRaw = computed(
  () => mainStore?.adsPageData?.data?.products?.data ?? []
);
const adsRaw = computed(() => mainStore?.adsPageData?.data?.ads?.data ?? []);

/* القوائم بعد الفرز محليًا */
const sortedProducts = computed(() => {
  const list = [...productsRaw.value];
  list.sort((a, b) => compareValues(a, b, sortKey.value, sortDir.value));
  return list;
});
const sortedAds = computed(() => {
  const list = [...adsRaw.value];
  list.sort((a, b) => compareValues(a, b, sortKey.value, sortDir.value));
  return list;
});

/* ========= بقية منطق الصفحة ========= */
const currentPage = computed(() => {
  const p = Number(route.query.page || 1);
  return Number.isNaN(p) || p < 1 ? 1 : p;
});

function buildParamsFromQuery(query = {}) {
  let subIds = query["subcategory_ids[]"] ?? query.subcategory_ids ?? [];
  if (!Array.isArray(subIds)) subIds = [subIds].filter(Boolean);
  const city_id = query.city_id ? Number(query.city_id) : undefined;
  return {
    category_id: query.category_id ? Number(query.category_id) : undefined,
    subcategory_ids: subIds
      .map((x) => Number(x))
      .filter((x) => !Number.isNaN(x)),
    city_id,
    min_price: query.min_price ? Number(query.min_price) : undefined,
    max_price: query.max_price ? Number(query.max_price) : undefined,
    page: query.page ? Math.max(1, Number(query.page)) : 1,
    // ملاحظة: لا نرسل أي مفاتيح للترتيب — الفرز محلي فقط
  };
}

watch(
  () => route.query,
  async () => {
    const params = buildParamsFromQuery(route.query);
    await mainStore.getFilteredAds(params);
    if (process.client) window.scrollTo({ top: 0, behavior: "smooth" });
  },
  { immediate: true, deep: true }
);

const lastPage = computed(() => {
  const pager = mainStore?.adsPageData?.data?.ads;
  if (!pager) return 1;
  if (typeof pager?.last_page === "number" && pager.last_page > 0)
    return pager.last_page;

  const url = pager?.last_page_url;
  if (typeof url === "string" && url.length) {
    try {
      const u = new URL(url);
      const n = Number(u.searchParams.get("page"));
      if (!Number.isNaN(n) && n > 0) return n;
    } catch {}
  }
  return 1;
});

function onFiltersChange(f) {
  const q = {
    ...route.query,
    page: 1,
    min_price: f.priceMin ?? undefined,
    max_price: f.priceMax ?? undefined,
    city_id: f.city_id || undefined,
  };

  if (f.category_id) q.category_id = f.category_id;
  else delete q.category_id;

  delete q["subcategory_ids[]"];
  if (Array.isArray(f.categories) && f.categories.length) {
    q["subcategory_ids[]"] = f.categories.map(String);
  }

  router.push({ path: route.path, query: q });
}
</script>

<template>
  <div class="container py-4 py-md-5">
    <div class="page-content">
      <div class="d-flex align-items-center mb-4">
        <h1 class="fs-3 m-0 fw-normal text-primary d-inline">الرئيسية</h1>
        <Icon
          name="mdi:chevron-left-circle-outline"
          class="fs-3 mx-3 text-secondary"
        />
        <span class="fs-3 m-0 fw-semibold text-muted">الإعلانات</span>
      </div>

      <div
        class="d-flex align-items-center justify-content-between bg-muted p-4 my-9 rounded"
      >
        <span class="fs-3">بيع وشراء أي شيء في فلسطين (10,000)</span>

        <!-- زر الترتيب (فرز محلي بدون أي استدعاء API) -->
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
      </div>

      <div class="d-lg-flex align-items-start justify-content-between">
        <div class="collapse collapse-horizontal show" id="collapseExample">
          <SidebarFilters
            class="sidebar-filters"
            @update:filters="onFiltersChange"
          />
        </div>
        <div class="d-flex flex-column">
          <section class="product-section px-4">
            <template v-if="sortedProducts?.length">
              <div class="row g-4">
                <div
                  v-for="pro in sortedProducts.slice(0, 3)"
                  :key="pro.id"
                  class="col-12 col-md-6 col-xl-4"
                >
                  <ProductCard :item="pro" />
                </div>
              </div>
            </template>
          </section>

          <!-- الإعلانات (نرتّب محليًا القائمة الحالية فقط) -->
          <section class="ads-section px-4">
            <template v-if="sortedAds?.length">
              <div class="row g-4">
                <div
                  v-for="ad in sortedAds"
                  :key="ad.id"
                  class="col-12 col-md-6 col-xl-4"
                >
                  <AdsCard :ad="ad" />
                </div>
              </div>
            </template>
            <template v-else>
              <div class="row g-4 my-4">
                <div
                  v-for="n in 12"
                  :key="'skeleton-' + n"
                  class="col-12 col-md-6 col-xl-4"
                >
                  <SkeletonAdCard />
                </div>
              </div>
            </template>

            <!-- ترقيم الصفحات (يبقى كما هو، فالفرز محلي لا يغيّر بيانات الـ pager) -->
            <nav aria-label="Page navigation example" v-if="lastPage > 1">
              <ul class="pagination my-9">
                <li class="page-item" :class="{ disabled: currentPage <= 1 }">
                  <NuxtLink
                    class="page-link"
                    :to="{
                      path: route.path,
                      query: {
                        ...route.query,
                        page: Math.max(1, currentPage - 1),
                      },
                    }"
                    aria-label="Previous"
                  >
                    <span class="fs-1" aria-hidden="true">&laquo;</span>
                  </NuxtLink>
                </li>

                <li v-for="n in lastPage" :key="'p-' + n" class="page-item">
                  <NuxtLink
                    class="page-link fs-3"
                    :class="{ active: n === currentPage }"
                    :to="{
                      path: route.path,
                      query: { ...route.query, page: n },
                    }"
                  >
                    {{ n }}
                  </NuxtLink>
                </li>

                <li
                  class="page-item"
                  :class="{ disabled: currentPage >= lastPage }"
                >
                  <NuxtLink
                    class="page-link"
                    :to="{
                      path: route.path,
                      query: {
                        ...route.query,
                        page: Math.min(lastPage, currentPage + 1),
                      },
                    }"
                    aria-label="Next"
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
</style>
