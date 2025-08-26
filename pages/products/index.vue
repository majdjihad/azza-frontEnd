<script setup>
useHead({
  title: "منتجاتنا",
});
const products = ref([
  {
    id: 1,
    title: "أجهزة للعناية المنزلية بالبشرة",
    city: "البلح",
    region: "فلسطين",
    price: 750,
    image: "/media/bg-home/bg1.png",
  },
  {
    id: 2,
    title: "كاميرا احترافية بحالة ممتازة للبيع",
    city: "غزة",
    region: "فلسطين",
    price: 2300,
    image: "/media/bg-home/bg2.png",
  },
  {
    id: 3,
    title: "قميص ستايل عصري",
    city: "النصر",
    region: "فلسطين",
    price: 240,
    image: "/media/bg-home/bg3.png",
  },
  {
    id: 4,
    title: "عطر خليجي برائحة العود وثابت قوي",
    city: "جباليا",
    region: "فلسطين",
    price: 560,
    image: "/media/bg-home/bg4.png",
  },
  // إذا بدك تكرّر لعرض أكثر من سلايد:
  {
    id: 5,
    title: "أجهزة تنظيف وتعقيم منزلية",
    city: "غزة",
    region: "فلسطين",
    price: 420,
    image: "/media/bg-home/bg5.png",
  },
  {
    id: 6,
    title: "عدسة 85mm فتحة 1.8",
    city: "غزة",
    region: "فلسطين",
    price: 1150,
    image: "/media/bg-home/bg6.png",
  },
  {
    id: 7,
    title: "حذاء جلد طبيعي كلاسيك",
    city: "النصر",
    region: "فلسطين",
    price: 330,
    image: "/media/bg-home/bg7.png",
  },
  {
    id: 8,
    title: "بخور عود فاخر",
    city: "جباليا",
    region: "فلسطين",
    price: 199,
    image: "/media/bg-home/bg8.png",
  },
]);
const cats = ref([
  {
    name: "عقارات",
    value: "real-estate",
    count: 500,
    children: [
      { name: "شقة", value: "real-estate.apartment", count: 280 },
      { name: "بناية", value: "real-estate.building", count: 120 },
      { name: "برج", value: "real-estate.tower", count: 100 },
    ],
  },
  {
    name: "سيارات",
    value: "cars",
    count: 320,
    children: [
      { name: "صالون", value: "cars.sedan", count: 130 },
      { name: "جيب", value: "cars.suv", count: 90 },
      { name: "بيك أب", value: "cars.pickup", count: 100 },
    ],
  },
  { name: "أثاث", value: "furniture", count: 145 },
  { name: "أجهزة", value: "devices", count: 480 },
  { name: "وظائف", value: "jobs", count: 250 },
  { name: "أطعمة", value: "food", count: 305 },
  { name: "مفقودات", value: "lost", count: 50 },
]);
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
        <h2 class="fs-3 m-0 fw-semibold text-muted">منتجاتنا</h2>
      </div>
      <div
        class="d-flex align-items-center justify-content-between bg-muted p-4 my-9 rounded"
      >
        <span class="fs-3 h4 m-0 text-muted">عروضنا الخاصة</span>
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
              <li><a class="dropdown-item" href="#">الاقدم</a></li>
              <li><a class="dropdown-item" href="#">الاحداث</a></li>
              <li><a class="dropdown-item" href="#">السعر</a></li>
            </ul>
            <span class="border-start border-2 mx-2"></span>
            <button
              type="button"
              class="dropdown-toggle fs-3"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <span class="text-muted ms-2">عرض</span>
              <span>12</span>
              <Icon class="fs-1 icon-down" name="mdi:chevron-down" />
              <!-- up -->
              <Icon class="fs-1 icon-up" name="mdi:chevron-up" />
            </button>
            <ul
              class="dropdown-menu"
              style="max-height: 250px; overflow-y: auto"
            >
              <li v-for="count in 12" :key="count">
                <span class="dropdown-item btn">{{ count }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div class="d-flex align-items-start justify-content-between">
        <div class="collapse collapse-horizontal show" id="collapseExample">
          <SidebarFilters
            style="width: 350px"
            :categories="cats"
            :currencies="['شيكل', 'دولار', '€']"
            :default-filters="{
              categories: [],
              city: '',
              region: '',
              priceMin: null,
              priceMax: null,
              currency: 'شيكل',
            }"
            @update:filters="onFiltersChange"
          />
        </div>

        <section class="ads-section px-4">
          <div class="row g-4">
            <div
              v-for="pro in products"
              :key="pro.id"
              class="col-12 col-md-6 col-xl-4"
            >
              <ProductCard :item="pro" />
            </div>
          </div>
          <nav aria-label="Page navigation example">
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