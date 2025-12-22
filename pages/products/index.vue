<script setup>
import { useMainStore } from "~/stores/mainStore";

const route = useRoute();
const router = useRouter();
const mainStore = useMainStore();
useSeo({
  title: "المنتجات | منصّة AZZA",
  description:
    "اكتشف المنتجات المتاحة للبيع، قارن الأسعار والعروض، وتواصل مباشرة مع البائعين لشراء ما تحتاجه.",
  image: "/media/avatars/logo.png",
  canonicalPath: "/products",
  type: "website",
});

useHead({ title: "المنتجات" });

const sortKey = ref("created_at");
const sortDir = ref("desc");

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
    va = toTime(a?.created_at);
    vb = toTime(b?.created_at);
  }
  const diff = va - vb;
  return dir === "asc" ? diff : -diff;
}

const currentPage = computed(() => {
  const p = Number(route.query.page || 1);
  return Number.isNaN(p) || p < 1 ? 1 : p;
});

function buildParamsFromQuery(query = {}) {
  return {
    category_id: query.category_id
      ? String(query.category_id)
          .split(",")
          .map(Number)
          .filter(Boolean)
      : undefined,

    subcategory_ids: query.subcategory_ids
      ? String(query.subcategory_ids)
          .split(",")
          .map(Number)
          .filter(Boolean)
      : undefined,

    city_id: query.city_id ? Number(query.city_id) : undefined,
    min_price: query.min_price ? Number(query.min_price) : undefined,
    max_price: query.max_price ? Number(query.max_price) : undefined,
    page: query.page ? Number(query.page) : 1,
  };
}
const isLoading = ref(false);

watch(
  () => route.query,
  async () => {
    isLoading.value = true;

    if (
      route.query.category_id ||
      route.query.city_id ||
      route.query.min_price ||
      route.query.max_price
    ) {
      const params = buildParamsFromQuery(route.query);
      await mainStore.getFilteredProducts(params);
    } else {
      await mainStore.getProducts(1);
    }

    isLoading.value = false;

    if (process.client) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  },
  { immediate: true, deep: true }
);

const productsPager = computed(() => {
  const p = mainStore?.productsPageData ?? {};
  // أشكال محتملة للـ pager
  return (
    p?.data?.products ??
    p?.products ??
    (Array.isArray(p?.data) ? { data: p.data } : p?.data) ??
    p
  );
});

const productsRaw = computed(() => {
  const pager = productsPager.value;
  if (!pager) return [];
  if (Array.isArray(pager)) return pager;
  return pager?.data ?? pager?.items ?? [];
});

const sortedProducts = computed(() => {
  const list = [...productsRaw.value];
  list.sort((a, b) => compareValues(a, b, sortKey.value, sortDir.value));
  return list;
});
function parsePageFromUrl(url) {
  try {
    const u = new URL(
      url,
      typeof window !== "undefined"
        ? window.location.origin
        : "https://azza-ak.com/"
    );
    const n = Number(u.searchParams.get("page"));
    return Number.isFinite(n) && n > 0 ? n : 1;
  } catch {
    return 1;
  }
}

const lastPage = computed(() => {
  const pager = productsPager.value;
  if (!pager) return 1;

  // Laravel paginator الشائع
  if (typeof pager?.last_page === "number" && pager.last_page > 0)
    return pager.last_page;
  if (typeof pager?.meta?.last_page === "number" && pager.meta.last_page > 0)
    return pager.meta.last_page;

  // روابط أخيرة
  if (pager?.last_page_url) return parsePageFromUrl(pager.last_page_url);
  if (pager?.links && Array.isArray(pager.links)) {
    const lastLink = pager.links.find(
      (l) => l.label?.toString().includes("Last") || l.rel === "last"
    );
    if (lastLink?.url) return parsePageFromUrl(lastLink.url);
  }
  return 1;
});
function onFiltersChange(f) {
  const q = {
    page: 1,
    city_id: f.city_id ?? undefined,
    min_price: f.min_price ?? undefined,
    max_price: f.max_price ?? undefined,
  };
  if (Array.isArray(f.category_id) && f.category_id.length) {
    q.category_id = f.category_id.join(",");
  }
  if (Array.isArray(f.subcategory_ids) && f.subcategory_ids.length) {
    q.subcategory_ids = f.subcategory_ids.join(",");
  }

  router.push({ path: route.path, query: q });
}

function goToPage(n) {
  const page = Math.max(1, Math.min(lastPage.value, Number(n) || 1));
  router.push({ path: route.path, query: { ...route.query, page } });
}

const itemsPerPage = ref(9); // القيمة الافتراضية

function setItemsPerPage(n) {
  itemsPerPage.value = n;
}
const visibleProducts = computed(() => sortedProducts.value.slice(0, itemsPerPage.value));

</script>

<template>
  <div class="container py-4 py-md-5">
    <div class="page-content my-6">
      <div class="d-flex align-items-center mb-4">
        <NuxtLink to="/" class="fs-5 m-0 fw-medium text-primary d-inline"
          >الرئيسية</NuxtLink
        >
        <Icon
          name="mdi:chevron-left-circle-outline"
          class="fs-5 fw-medium mx-3 text-secondary"
        />
        <span class="fs-3 m-0 text-muted">قائمة المنتجات</span>
      </div>

      <div
        class="d-flex align-items-center justify-content-between p-4 my-9 rounded-0"
        style="background-color: #f9f9f9"
      >
        <span class="fs-3 fw-medium">تصفح واشتري ما يناسبك</span>

        <!-- زر الترتيب (فرز محلي بدون أي استدعاء API) -->
        <div class="d-flex align-items-center gap-4">
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
                  <span>
                    {{ n }}
                  </span>
                </button>
              </li>
            </ul>
          </div>
        </div>

      </div>
      <div class="d-lg-flex align-items-start justify-content-between">
        <div class="collapse collapse-horizontal" id="collapseExample">
          <SidebarFilters
            class="sidebar-filters"
            @update:filters="onFiltersChange"
          />
        </div>
      <div class="d-flex flex-column w-100">
        <section class="product-section px-4">
          <template v-if="isLoading">
            <div class="row g-4 my-4">
              <div
                v-for="n in 12"
                :key="'skeleton-' + n"
                class="col-12 col-md-4 col-xl-3"
              >
                <SkeletonProductCard />
              </div>
            </div>
          </template>
          <template v-else-if="!isLoading && sortedProducts.length === 0">
  <div class="text-center my-6 py-6">
    <Icon name="mdi:alert-circle-outline" size="48" class="text-primary mb-3" />
    <h4 class="fw-medium text-muted">لا توجد منتجات مطابقة لبحثك</h4>
    <p class="text-muted fs-4">
      جرّب تغيير الفلاتر أو توسيع نطاق البحث
    </p>
  </div>
</template>
          <template v-else>
            <div class="row g-4">
              <div
                v-for="pro in visibleProducts"
                :key="pro.id ?? pro.slug ?? JSON.stringify(pro)"
                class="col-12 col-md-4 col-xl-3"
              >
                <ProductCard :item="pro" />
              </div>
            </div>
          </template>

        </section>

        <!-- ترقيم الصفحات -->
        <nav
          aria-label="Page navigation example"
          v-if="lastPage > 1"
          class="px-4"
        >
          <ul class="pagination my-9">
            <!-- السابق -->
            <li class="page-item" :class="{ disabled: currentPage <= 1 }">
              <NuxtLink
                class="page-link"
                :to="{
                  path: route.path,
                  query: { ...route.query, page: Math.max(1, currentPage - 1) },
                }"
                aria-label="Previous"
                @click.prevent="goToPage(currentPage - 1)"
              >
                <span class="fs-1" aria-hidden="true">&laquo;</span>
              </NuxtLink>
            </li>

            <!-- الأرقام -->
            <li v-for="n in lastPage" :key="'p-' + n" class="page-item">
              <NuxtLink
                class="page-link fs-3"
                :class="{ active: n === currentPage }"
                :to="{ path: route.path, query: { ...route.query, page: n } }"
                @click.prevent="goToPage(n)"
              >
                {{ n }}
              </NuxtLink>
            </li>

            <!-- التالي -->
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
                @click.prevent="goToPage(currentPage + 1)"
              >
                <span class="fs-1" aria-hidden="true">&raquo;</span>
              </NuxtLink>
            </li>
          </ul>
        </nav>
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
