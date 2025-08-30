<script setup>
/* صفحة الإعلانات
   - تقرأ الفلاتر والصفحة من route.query
   - تستدعي mainStore.getFilteredAds(params)
   - تحدّث الـ pagination وتعيد التمرير للأعلى
*/
import { useMainStore } from "~/stores/mainStore";
import { useCategoryStore } from "~/stores/categoryStore";

const route = useRoute();
const router = useRouter();
const mainStore = useMainStore();
const categoryStore = useCategoryStore();

useHead({ title: "الإعلانات" });

/* الصفحة الحالية مأخوذة من الاستعلام */
const currentPage = computed(() => {
  const p = Number(route.query.page || 1);
  return Number.isNaN(p) || p < 1 ? 1 : p;
});

/* تحويل الاستعلام إلى باراميترات API للفلترة */
function buildParamsFromQuery(query = {}) {
  // subcategory_ids[] قد تأتي كـ string أو array
  let subIds = query["subcategory_ids[]"] ?? query.subcategory_ids ?? [];
  if (!Array.isArray(subIds)) subIds = [subIds].filter(Boolean);

  // city_id: نعتمد مباشرة على الاستعلام (الآن SidebarFilters يرسل id)
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
  };
}

/* اجلب البيانات عند أي تغيير في الاستعلام */
watch(
  () => route.query,
  async () => {
    const params = buildParamsFromQuery(route.query);
    await mainStore.getFilteredAds(params);
    if (process.client) window.scrollTo({ top: 0, behavior: "smooth" });
  },
  { immediate: true, deep: true }
);

/* عدد الصفحات من استجابة السيرفر */
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

/* استلام الفلاتر من SidebarFilters ودفعها للـ query */
function onFiltersChange(f) {
  // f.categories: مصفوفة subcategory_ids
  // f.city_id: معرّف المدينة (رقم)
  // f.priceMin, f.priceMax, f.currency: (العملة غير مستخدمة في API الفلترة لديك)
  const q = {
    ...route.query,
    page: 1,
    min_price: f.priceMin ?? undefined,
    max_price: f.priceMax ?? undefined,
    city_id: f.city_id || undefined,
  };

  // إن رغبت بإرسال category_id (تصنيف رئيسي) من المكوّن: أضِفه هنا
  if (f.category_id) q.category_id = f.category_id;
  else delete q.category_id;

  // subcategory_ids[] كمصفوفة في الاستعلام
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
        <div>
          <div class="btn-group">
            <button
              type="button"
              class="dropdown-toggle fs-3"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <span> الترتيب حسب </span>
              <Icon class="fs-1 icon-down" name="mdi:chevron-down" />
              <Icon class="fs-1 icon-up" name="mdi:chevron-up" />
            </button>
            <ul class="dropdown-menu">
              <li><a class="dropdown-item" href="#">أحدث</a></li>
              <li><a class="dropdown-item" href="#">الأقل سعرًا</a></li>
              <li><a class="dropdown-item" href="#">الأعلى سعرًا</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div class="d-flex align-items-start justify-content-between">
        <!-- لوحة الفلاتر -->
        <div class="collapse collapse-horizontal show" id="collapseExample">
          <SidebarFilters
            style="width: 350px"
            @update:filters="onFiltersChange"
          />
        </div>

        <!-- قائمة الإعلانات -->
        <section class="ads-section px-4">
          <template v-if="mainStore?.adsPageData?.data?.ads?.data?.length">
            <div class="row g-4">
              <div
                v-for="ad in mainStore.adsPageData.data.ads.data"
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

          <!-- ترقيم الصفحات -->
          <nav aria-label="Page navigation example" v-if="lastPage > 1">
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
</style>
