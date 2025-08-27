<template>
  <aside class="filters-sidebar mx-2 position-relative top-0">
    <div class="text-center">
      <div
        class="skeleton skeleton-banner w-100 mb-3 rounded-1"
        style="height: 500px"
      ></div>
      <div
        class="skeleton skeleton-banner w-100 mb-3 rounded-1"
        style="height: 300px"
      ></div>
      <div class="skeleton skeleton-banner w-100 mb-3 rounded-1"></div>
      <div class="skeleton skeleton-banner w-100 mb-3 rounded-1"></div>
    </div>
  </aside>
</template>

<style scoped>
.filters-sidebar {
  width: 100%;
}
@media (min-width: 992px) {
  .filters-sidebar {
    position: sticky;
    top: 1rem;
  }
}

/* Skeleton base (Light Mode) */
.skeleton {
  background: linear-gradient(90deg, #f4f6f9 25%, #e9edf3 50%, #f4f6f9 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.4s infinite;
  display: inline-block;
  border-radius: 8px;
}
@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
/* Icons (chevrons, etc.) */
/* Banners */
.skeleton-banner {
  height: 140px;
}

/* Helpers for width (fine control) */
.w-10 {
  width: 10% !important;
}
.w-35 {
  width: 35% !important;
}
.w-40 {
  width: 40% !important;
}
</style>
