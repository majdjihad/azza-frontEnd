<script setup>
useHead({
  title: "الأعلانات",
});
const ads = [
  {
    id: 1,
    category: "عقارات",
    title: "iPhone 14 Pro Max للبيع",
    description:
      "نص لعرض البيع وصيغ موجزة تشرح قرب من الخدمات بحي راقٍ، مناسب للعائلة.",
    price: "شيكل 5,000",
    time: "15 دقيقة",
    location: "غزة - فلسطين",
    comments: 6,
    views: 92,
    image: "/media/bg-home/bg7.png",
    owner: { name: "ليث", avatar: "/media/avatars/user.png" },
  },
  {
    id: 2,
    category: "عقارات",
    title: "سماعة بلوتوث لاسلكية أصلية",
    description:
      "نص بسيط عن المواصفات والجودة العالية مع عمر بطارية كبير جدًا وخدمة ممتازة.",
    price: "شيكل 300",
    time: "15 دقيقة",
    location: "خان يونس - فلسطين",
    comments: 4,
    views: 68,
    image: "/media/bg-home/bg4.png",
    owner: { name: "ليث", avatar: "/media/avatars/user.png" },
  },
  {
    id: 3,
    category: "عقارات",
    title: "دراجة هوائية خفاش 26 بحالة ممتازة",
    description:
      "إطار ألومنيوم، سرعات متعددة، مكابح قرصية، مناسبة للطريق والجبال مع صيانة حديثة.",
    price: "شيكل 3,500",
    time: "15 دقيقة",
    location: "رفح - فلسطين",
    comments: 10,
    views: 120,
    image: "/media/bg-home/bg1.png",
    owner: { name: "ليث", avatar: "/media/avatars/user.png" },
  },
  {
    id: 4,
    category: "عقارات",
    title: "فلت سياحية فخمة بسعر مغري",
    description:
      "مساحة واسعة، غرف نوم عديدة مع قرب من الخدمات العامة وموقع مميز للغاية.",
    price: "شيكل ألاف 560",
    time: "15 دقيقة",
    location: "غزة - فلسطين",
    comments: 7,
    views: 140,
    image: "/media/bg-home/bg3.png",
    owner: { name: "ليث", avatar: "/media/avatars/user.png" },
  },
  {
    id: 5,
    category: "عقارات",
    title: "فلت سياحية وسكنية بعرض مميز",
    description:
      "سعر منافس وموقع قريب من الخدمات بحي راقٍ مناسب للعائلة والرفاهية.",
    price: "شيكل ألاف 560",
    time: "15 دقيقة",
    location: "غزة - فلسطين",
    comments: 5,
    views: 77,
    image: "/media/bg-home/bg2.png",
    owner: { name: "ليث", avatar: "/media/avatars/user.png" },
  },
  {
    id: 6,
    category: "عقارات",
    title: "جهاز للاعتناء المنزلية بالأسرة",
    description:
      "منتج عملي أنيق مع ضمان وخدمة ما بعد البيع، مواصفات ممتازة ومستويات أمان عالية.",
    price: "شيكل 300",
    time: "15 دقيقة",
    location: "خان يونس - فلسطين",
    comments: 8,
    views: 91,
    image: "/media/bg-home/bg7.png",
    owner: { name: "ليث", avatar: "/media/avatars/user.png" },
  },
  {
    id: 7,
    category: "عقارات",
    title: "كاميرا احترافية بحالة ممتازة للبيع",
    description:
      "عدسة أساسية 50mm، تصوير بدقة عالية 4K، مثالية للهواة والمحترفين مع إكسسوارات.",
    price: "شيكل 3,500",
    time: "15 دقيقة",
    location: "رفح - فلسطين",
    comments: 9,
    views: 200,
    image: "/media/bg-home/bg9.png",
    owner: { name: "ليث", avatar: "/media/avatars/user.png" },
  },
  {
    id: 8,
    category: "عقارات",
    title: "عطر فخم برائحة العود وثابت قوي",
    description:
      "ثبات عالٍ ولمسة فاخرة تناسب المناسبات، عبوة أصلية وتوصيل متاح داخل المدينة.",
    price: "شيكل ألاف 560",
    time: "15 دقيقة",
    location: "غزة - فلسطين",
    comments: 2,
    views: 55,
    image: "/media/bg-home/bg2.png",
    owner: { name: "ليث", avatar: "/media/avatars/user.png" },
  },
  {
    id: 9,
    category: "عقارات",
    title: "iPhone 14 Pro Max للبيع",
    description:
      "نص لعرض البيع وصيغ موجزة تشرح قرب من الخدمات بحي راقٍ، مناسب للعائلة.",
    price: "شيكل 5,000",
    time: "15 دقيقة",
    location: "غزة - فلسطين",
    comments: 6,
    views: 92,
    image: "/media/bg-home/bg7.png",
    owner: { name: "ليث", avatar: "/media/avatars/user.png" },
  },
];
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
          >بيع وشراء أي شيء في فلسطين(10,000).</span
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
              v-for="ad in ads"
              :key="ad.id"
              class="col-12 col-md-6 col-xl-4"
            >
              <AdsCard :ad="ad" />
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