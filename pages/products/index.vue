<script setup>
import { useMainStore } from "~/stores/mainStore";

const route = useRoute();
const router = useRouter();
const mainStore = useMainStore();

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

watch(
  () => currentPage.value,
  async () => {
    await mainStore.getProducts(currentPage.value);
    if (process.client) window.scrollTo({ top: 0, behavior: "smooth" });
  },
  { immediate: true }
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
        : "https://example.com"
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

function goToPage(n) {
  const page = Math.max(1, Math.min(lastPage.value, Number(n) || 1));
  router.push({ path: route.path, query: { ...route.query, page } });
}
</script>

<template>
  <div class="container py-4 py-md-5">
    <div class="page-content">
      <div class="d-flex align-items-center mb-4">
        <h1 class="fs-3 m-0 fw-normal text-primary d-inline">المنتجات</h1>
        <Icon
          name="mdi:chevron-left-circle-outline"
          class="fs-3 mx-3 text-secondary"
        />
        <span class="fs-3 m-0 fw-semibold text-muted">قائمة المنتجات</span>
      </div>

      <div
        class="d-flex align-items-center justify-content-between bg-muted p-4 my-9 rounded"
      >
        <span class="fs-3">تصفح واشتري ما يناسبك</span>

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

      <div class="d-flex flex-column">
        <!-- شبكة المنتجات -->
        <section class="product-section px-4">
          <template v-if="sortedProducts?.length">
            <div class="row g-4">
              <div
                v-for="pro in sortedProducts"
                :key="pro.id ?? pro.slug ?? JSON.stringify(pro)"
                class="col-12 col-md-4 col-xl-3"
              >
                <ProductCard :item="pro" />
              </div>
            </div>
          </template>
          <template v-else>
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
