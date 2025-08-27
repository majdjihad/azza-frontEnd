<script setup>
import moment from "moment";

const route = useRoute();
useHead({
  title: route.params.slug,
});
import { useCategoryStore } from "~/stores/categoryStore";

const categoryStore = useCategoryStore();
onMounted(async () => {
  await categoryStore.getCategory(route.params.slug);
});

const filtersState = ref({});
function onFiltersChange(f) {
  filtersState.value = f;
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
        <span class="fs-3 m-0 fw-semibold text-muted"
          >{{ route.params.slug }}.</span
        >
      </div>
      <div
        class="d-flex align-items-center justify-content-between bg-muted p-4 my-9 rounded"
      >
        <span class="fs-3">بيع وشراء أي شيء في فلسطين(10,000)</span>
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
              <!-- up -->
              <Icon class="fs-1 icon-up" name="mdi:chevron-up" />
            </button>
            <ul class="dropdown-menu">
              <li><a class="dropdown-item" href="#">Action</a></li>
              <li><a class="dropdown-item" href="#">Another action</a></li>
              <li><a class="dropdown-item" href="#">Something else here</a></li>
              <li><a class="dropdown-item" href="#">Separated link</a></li>
            </ul>
            <!-- <span class="border-start border-2 mx-2"></span> -->
            <!-- <button
              type="button"
              class="dropdown-toggle fs-3"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <span class="text-muted ms-2">عرض</span>
              <span>12</span>
              <Icon class="fs-1 icon-down" name="mdi:chevron-down" />
              <Icon class="fs-1 icon-up" name="mdi:chevron-up" />
            </button>
            <ul
              class="dropdown-menu"
              style="max-height: 250px; overflow-y: auto"
            >
              <li v-for="count in 12" :key="count">
                <span class="dropdown-item btn">{{ count }}</span>
              </li>
            </ul> -->
          </div>
        </div>
      </div>
      <div class="d-flex align-items-start justify-content-between">
        <div class="collapse collapse-horizontal show" id="collapseExample">
          <SidebarFilters
            v-if="categoryStore?.categoryData?.ads?.items"
            style="width: 350px"
            @update:filters="onFiltersChange"
          />
          <SkeletonSidebard v-else style="width: 350px" />
        </div>

        <section class="ads-section px-4">
          <template v-if="categoryStore?.categoryData?.ads?.items">
            <div class="row g-4">
              <div
                v-for="ad in categoryStore?.categoryData?.ads?.items"
                :key="ad.id"
                class="col-12 col-md-6 col-xl-4"
              >
                <AdsCard :ad="ad" :category="route.params.slug" />
              </div>
            </div>
          </template>
          <template v-else>
            <div class="carousel-item active">
              <div class="row g-4 my-4">
                <div
                  v-for="n in 12"
                  :key="'skeleton-' + n"
                  class="col-12 col-md-6 col-xl-4"
                >
                  <SkeletonAdCard />
                </div>
              </div>
            </div>
          </template>
          <nav
            aria-label="Page navigation example"
            v-if="categoryStore?.categoryData?.ads?.items"
          >
            <ul class="pagination my-9">
              <li class="page-item">
                <a class="page-link" href="#" aria-label="Previous">
                  <span class="fs-1" aria-hidden="true">&laquo;</span>
                </a>
              </li>
              <li class="page-item">
                <a class="page-link active fs-3" href="#">1</a>
              </li>
              <li class="page-item">
                <a class="page-link text-scandary fs-3" href="#">2</a>
              </li>
              <li class="page-item">
                <a class="page-link text-scandary fs-3" href="#">3</a>
              </li>
              <li class="page-item">
                <a class="page-link" href="#" aria-label="Next">
                  <span class="fs-1" aria-hidden="true">&raquo;</span>
                </a>
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