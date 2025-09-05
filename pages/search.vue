<script setup>
import { useMainStore } from "~/stores/mainStore";
import { useCategoryStore } from "~/stores/categoryStore";

const route = useRoute();
const router = useRouter();
const mainStore = useMainStore();

useHead({ title: "نتائج البحث" });

/* ===== أدوات مساعدة للفرز المحلي ===== */
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

/* ===== قراءة معايير البحث من الـ URL ===== */
const searchParams = computed(() => {
  const q = route.query?.query ?? route.query?.q ?? "";
  const category_id = route.query?.category_id
    ? Number(route.query.category_id)
    : undefined;
  const city_id = route.query?.city_id
    ? Number(route.query.city_id)
    : undefined;
  const page = route.query?.page ? Number(route.query.page) : 1;
  return { query: String(q), category_id, city_id, page };
});

/* ===== جلب النتائج (يقرأ من الصفحة الرئيسية عبر URL) ===== */
const fetchSearch = async () => {
  await mainStore.getSearchResults(searchParams.value);
  if (process.client) window.scrollTo({ top: 0, behavior: "smooth" });
};
watch(() => route.query, fetchSearch, { immediate: true, deep: true });

/* ===== فرز محلي (ينطبق على القسمين) ===== */
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

/* ===== بيانات جاهزة من المتجر ===== */
const adsRaw = computed(() => mainStore.searchAds || []);
const productsRaw = computed(() => mainStore.searchProducts || []);

// قوائم بعد الفرز (محلي)
const sortedAds = computed(() => {
  const list = [...adsRaw.value];
  list.sort((a, b) => compareValues(a, b, sortKey.value, sortDir.value));
  return list;
});
const sortedProducts = computed(() => {
  const list = [...productsRaw.value];
  list.sort((a, b) => compareValues(a, b, sortKey.value, sortDir.value));
  return list;
});

/* ===== ترقيم السيرفر =====
   - الـ API يرجّع last_page لكل من ads & products
   - سنعتمد على "الأكبر" كنهاية الترقيم (نفس باراميتر page يحكم الاثنين)
*/
const currentPage = computed(() => {
  const p = Number(route.query.page || 1);
  return Number.isNaN(p) || p < 1 ? 1 : Math.floor(p);
});
const lastPage = computed(() => mainStore.searchMaxLastPage || 1);

function goToPage(n) {
  const page = Math.max(1, Math.min(lastPage.value, Number(n) || 1));
  router.push({ path: route.path, query: { ...route.query, page } });
}
watch(
  () => currentPage.value,
  () => {
    if (process.client) window.scrollTo({ top: 0, behavior: "smooth" });
  }
);

const keyword = computed(() => searchParams.value.query || "");
</script>

<template>
  <div class="container py-4 py-md-5">
    <div class="page-content">
      <div class="d-flex align-items-center mb-4">
        <h1 class="fs-3 m-0 fw-normal text-primary d-inline">نتائج البحث</h1>
        <Icon
          name="mdi:chevron-left-circle-outline"
          class="fs-3 mx-3 text-secondary"
        />
        <span class="fs-3 m-0 fw-semibold text-muted">
          {{ keyword ? `عن: "${keyword}"` : "كل النتائج" }}
        </span>
      </div>

      <div
        class="d-flex align-items-center justify-content-between bg-muted p-4 my-9 rounded"
      >
        <span class="fs-3">بيع وشراء أي شيء في فلسطين</span>

        <!-- زر الترتيب (فرز محلي) -->
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

      <div class="d-flex align-items-start justify-content-between">
        <div class="d-flex flex-column flex-grow-1">
          <div v-if="mainStore.searchProducts">
            <section class="product-section px-4" v-if="sortedProducts?.length">
              <h5 class="mb-3 text-muted">منتجات</h5>
              <div class="row g-4">
                <div
                  v-for="pro in sortedProducts"
                  :key="pro.id"
                  class="col-12 col-md-6 col-xl-3"
                >
                  <ProductCard :item="pro" />
                </div>
              </div>
            </section>
            <section class="ads-section px-4">
              <template v-if="sortedAds?.length">
                <h5 class="mb-3 text-muted">إعلانات</h5>
                <div class="row g-4">
                  <div
                    v-for="ad in sortedAds"
                    :key="ad.id"
                    class="col-12 col-md-6 col-xl-3"
                  >
                    <AdsCard :ad="ad" />
                  </div>
                </div>
              </template>

              <template v-else-if="mainStore.isSearching">
                <div class="row g-4 my-4">
                  <div
                    v-for="n in 12"
                    :key="'skeleton-' + n"
                    class="col-12 col-md-6 col-xl-3"
                  >
                    <SkeletonAdCard />
                  </div>
                </div>
              </template>

              <template v-else-if="!sortedProducts?.length">
                <div class="py-5 text-center text-muted">
                  لا توجد نتائج مطابقة.
                </div>
              </template>

              <!-- ترقيم الصفحات (من السيرفر: نعتمد الأكبر بين ads/products) -->
              <nav
                aria-label="Page navigation example"
                v-if="lastPage > 1"
                class="mt-4"
              >
                <ul class="pagination my-9">
                  <!-- السابق -->
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
                      :to="{
                        path: route.path,
                        query: { ...route.query, page: n },
                      }"
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
            </section>
          </div>
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
.dropdown-menu .dropdown-item.active {
  font-weight: 600;
}
.dropdown-item:hover,
.dropdown-item.active {
  color: var(--bs-primary);
}
</style>
