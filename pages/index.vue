<script setup>
useHead({
  title: "الرئيسية",
});
// definePageMeta({
//   middleware: ["auth"],
// });

import { useCategoryStore } from "~/stores/categoryStore";

const categoryStore = useCategoryStore();
categoryStore?.getCategories();
const category = ref([
  { name: "جميع الفئات", value: "all" },
  { name: "عقارات", value: "real-estate" },
  { name: "سيارات", value: "cars" },
  { name: "أثاث", value: "furniture" },
  { name: "خدمات", value: "services" },
]);
const cities = ref([
  { name: "مدينة غزة", value: "all" },
  { name: "جباليا", value: "real-estate" },
  { name: "بيت لاهيا", value: "cars" },
  { name: "بيت حانون", value: "furniture" },
  { name: "خانيونس", value: "services" },
  { name: "دير البلح", value: "services" },
  { name: "النصيرات", value: "services" },
  { name: "رفح", value: "services" },
]);
const categories = [
  { name: "خدمات" },
  { name: "أثاث" },
  { name: "أجهزة" },
  { name: "سيارات" },
  { name: "عقارات" },
  { name: "وظائف" },
  { name: "أطعمة" },
  { name: "مفقودات" },
];

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
  {
    id: 10,
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
    id: 11,
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
    id: 12,
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
    id: 13,
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
    id: 14,
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
    id: 15,
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
    id: 16,
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
];

const chunkedAds = computed(() => {
  const size = 8;
  const chunks = [];
  for (let i = 0; i < ads.length; i += size)
    chunks.push(ads.slice(i, i + size));
  return chunks;
});
const offers = ref([
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

const currency = "شيكل";
const perSlide = 4;
const chunk = (arr, size) => {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};
const slides = computed(() => chunk(offers.value, perSlide));
const carouselId = "offersCarousel";
</script>
<template>
  <div>
    <section class="hero-section position-relative text-white">
      <div
        class="hero-background-grid position-absolute top-0 start-0 w-100 h-100 z-n1"
      >
        <div class="row g-0 h-100">
          <div class="row g-0">
            <div class="col-3">
              <img
                src="/media/bg-home/bg1.png"
                class="img-fluid w-100 h-100 object-fit-cover"
              />
            </div>
            <div class="col-2">
              <img
                src="/media/bg-home/bg2.png"
                class="img-fluid w-100 h-100 object-fit-cover"
              />
            </div>
            <div class="col-4">
              <img
                src="/media/bg-home/bg3.png"
                class="img-fluid w-100 h-100 object-fit-cover"
              />
            </div>
            <div class="col-3">
              <img
                src="/media/bg-home/bg4.png"
                class="img-fluid w-100 h-100 object-fit-cover"
              />
            </div>
          </div>
          <div class="row g-0">
            <div class="col-2">
              <img
                src="/media/bg-home/bg5.png"
                class="img-fluid w-100 h-100 object-fit-cover"
              />
            </div>
            <div class="col-5">
              <img
                src="/media/bg-home/bg6.png"
                class="img-fluid w-100 h-100 object-fit-cover"
              />
            </div>
            <div class="col-3">
              <img
                src="/media/bg-home/bg7.png"
                class="img-fluid w-100 h-100 object-fit-cover"
              />
            </div>
            <div class="col-2">
              <img
                src="/media/bg-home/bg8.png"
                class="img-fluid w-100 h-100 object-fit-cover"
              />
            </div>
          </div>
        </div>
              </div>
      <div
        class="hero-overlay position-absolute top-0 start-0 w-100 h-100 z-0 bg-dark opacity-50"
      ></div>
      <section class="hero-content position-relative z-1">
        <div class="container text-center">
          <h2 class="hero-subtitle bg-primary d-inline p-5 text-white">
            أكثر من 100,000 إعلان نشط
          </h2>
          <h1 class="text-center hero-title fs-1 fw-bold my-9 py-9 text-white">
            منصـة إعلانيـة تجمـع لـك كـل مـا تحتاجـه مـن حولـك، وتمنحـك مساحـة
            سهلـة وآمنـة لعـرض إعلاناتـك
          </h1>
          <!-- Search Box -->
          <div class="row g-0 align-items-stretch w-100 justify-content-center">
            <div class="col-md-3">
              <div class="input-group d-flex align-items-stretch h-100">
                <span
                  class="input-group-text bg-white p-3 text-secondary rounded-0 border-0 border-end"
                >
                  <Icon name="mdi:form-textbox-password" class="fs-1" />
                </span>
                <input
                  type="text"
                  class="form-control bg-white py-6 text-dark fs-3 border-0 rounded-0"
                  placeholder="ادخل كلمة البحث هنا"
                />
              </div>
            </div>
            <div class="col-md-3">
              <div class="input-group row gap-0">
                <div
                  class="input-group-prepend col-3 text-center bg-white d-flex justify-content-center align-items-center p-0 border-end"
                >
                  <label
                    class="input-group-text bg-white d-flex justify-content-center text-secondary rounded-0 border-0 border-end"
                    for="inputCategoryGroup"
                  >
                    <Icon name="mdi:tag-multiple" class="fs-1" />
                  </label>
                </div>
                <select
                  class="custom-select bg-white p-0 py-6 col-9 text-end fs-3 text-secondary rounded-0 border-0"
                  id="inputCategoryGroup"
                >
                  <option selected>اختر القسم</option>
                  <option
                    v-for="category in categoryStore.Allcategories"
                    :key="category.value"
                    :value="category.name"
                  >
                    {{ category.name }}
                  </option>
                </select>
              </div>
            </div>
            <div class="col-md-3 bg-white">
              <div class="input-group row gap-0">
                <div
                  class="input-group-prepend col-3 text-center bg-white d-flex justify-content-center align-items-center p-0 border-end"
                >
                  <label
                    class="input-group-text bg-white d-flex justify-content-center text-secondary rounded-0 border-0 border-end"
                    for="inputCityGroup"
                  >
                    <Icon name="material-symbols:location-on" class="fs-1" />
                  </label>
                </div>
                <select
                  class="custom-select bg-white p-0 py-6 col-9 text-end fs-3 text-secondary rounded-0 border-0"
                  id="inputCityGroup"
                >
                  <option selected>اختر المدينة</option>
                  <option
                    :value="city.name"
                    v-for="city in cities"
                    :key="city.id"
                  >
                    {{ city.name }}
                  </option>
                </select>
              </div>
            </div>
            <div class="col-md-2">
              <button
                class="btn btn-main d-flex align-items-center justify-content-center w-100 h-100 rounded-0"
                type="button"
              >
                <h1 class="fs-2 text-white m-0">بحث</h1>
              </button>
            </div>
          </div>
        </div>
      </section>
    </section>
    <section class="categories-section bg-white">
      <div class="container my-5">
        <div class="row g-3 py-4" v-if="!categoryStore.Allcategories">
          <NuxtLink
            v-for="(cat, index) in categoryStore.Allcategories"
            :key="index"
            class="col-6 col-md-3 my-9 position-relative"
            :to="`ads/category/${cat.slug}`"
          >
            <div
              class="category-card h-150px text-center border rounded d-flex flex-column align-items-center justify-content-between mx-3"
            >
              <div
                class="bg-white w-25 px-2"
                style="position: relative; top: -25px"
              >
                <img
                  :src="`/media/categories/${cat.image_url}.png`"
                  class="w-100"
                  :alt="cat.name"
                />
              </div>
              <div class="position-absolute bottom-0">
                <h4>{{ cat.name }}</h4>
                <div
                  class="btn-category bg-white px-4 d-flex justify-content-center"
                >
                  <button class="btn btn-sm mt-2">
                    <Icon name="line-md:arrow-left" class="fs-1 fw-bold" />
                  </button>
                </div>
              </div>
            </div>
          </NuxtLink>
        </div>
        <div v-else class="text-center py-9">
          <icon name="svg-spinners:ring-resize" class="indicator-label fs-1" />
        </div>
        <div
          class="bg-primary text-white rounded p-9 mt-5 d-flex flex-column flex-md-row align-items-center justify-content-between"
        >
          <div>
            <h2 class="fw-bold text-white">بيع ما لا تحتاج واكسب المال</h2>
            <p class="mb-0 mt-3 fs-3">
              أضف إعلانك الآن لتصل إلى ملايين المشترين وتبيع كل ما تريد بأفضل
              الأسعار.
            </p>
          </div>
          <button class="btn-info mt-3 mt-md-0 d-flex align-items-center">
            <span class="fs-3 ms-3">أضف إعلانك الآن</span>
            <Icon name="line-md:arrow-left" class="fs-1 fw-bold" />
          </button>
        </div>
      </div>
    </section>
    <section
      class="offers-section container my-4 py-4 px-3 px-sm-4 bg-secandary"
    >
      <!-- Bootstrap Carousel -->
      <div class="d-flex justify-content-between offers-header mb-3">
        <div>
          <h2 class="fs-1 fw-bold mb-1">عروضنا الخاصة</h2>
          <div class="fs-3 offers-subtitle">عروض حصرية من إدارة الموقع</div>
        </div>
        <div class="d-flex align-items-center gap-2 offers-toolbar">
          <!-- Prev -->
          <button
            class="btn-carousel"
            :data-bs-target="`#${carouselId}`"
            data-bs-slide="prev"
            aria-label="السابق"
          >
            <Icon name="line-md:arrow-right" size="20" />
          </button>

          <!-- Next -->
          <button
            class="btn-carousel"
            :data-bs-target="`#${carouselId}`"
            data-bs-slide="next"
            aria-label="التالي"
          >
            <Icon name="line-md:arrow-left" size="20" />
          </button>
          <NuxtLink to="/products" class="btn-view-all">
            <h5 class="mb-0 text-white">عرض الكل</h5>
            <Icon
              name="material-symbols:arrow-back-rounded"
              class="text-white"
              size="20"
            />
          </NuxtLink>
        </div>
      </div>
      <div
        class="carousel slide"
        :id="carouselId"
        data-bs-ride="false"
        data-bs-interval="0"
      >
        <div class="carousel-inner">
          <div
            v-for="(group, idx) in slides"
            :key="idx"
            :class="['carousel-item', { active: idx === 0 }]"
          >
            <div class="row g-3 g-md-4">
              <div
                v-for="item in group"
                :key="item.id"
                class="col-12 col-sm-6 col-lg-3"
              >
                <ProductCard :item="item" :currency="currency" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="container container-ads pt-4 mb-9 py-md-5">
      <!-- Header + Toolbar -->
      <div class="d-flex align-items-center justify-content-between mb-4">
        <div class="d-flex align-items-center gap-4">
          <span class="badge-chip p-2 ms-1 secondary">جديد</span>
          <div>
            <h2 class="fs-1 section-title mb-0">أحدث الإعلانات</h2>
            <div class="fs-3 small-muted">
              ابقَ على اطلاع.. لا تفوت الفرص الجديدة!
            </div>
          </div>
        </div>

        <div class="d-flex align-items-center gap-2 offers-toolbar">
          <!-- Prev -->
          <button
            class="btn-carousel"
            data-bs-target="#adsCarousel"
            data-bs-slide="prev"
            aria-label="السابق"
          >
            <Icon name="line-md:arrow-right" size="20" />
          </button>

          <!-- Next -->
          <button
            class="btn-carousel"
            data-bs-target="#adsCarousel"
            data-bs-slide="next"
            aria-label="التالي"
          >
            <Icon name="line-md:arrow-left" size="20" />
          </button>
          <NuxtLink to="/ads" class="btn-view-all">
            <h5 class="mb-0 text-white">عرض الكل</h5>
            <Icon
              name="material-symbols:arrow-back-rounded"
              class="text-white"
              size="20"
            />
          </NuxtLink>
        </div>
      </div>
      <!-- Bootstrap Carousel -->
      <div id="adsCarousel" class="carousel slide" data-bs-interval="false">
        <div class="carousel-inner">
          <div
            v-for="(group, idx) in chunkedAds"
            :key="'slide-' + idx"
            class="carousel-item"
            :class="{ active: idx === 0 }"
          >
            <div class="row g-4">
              <div
                v-for="ad in group"
                :key="ad.id"
                class="col-12 col-md-6 col-xl-3"
              >
                <AdsCard :ad="ad" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
<style scoped>
.hero-section {
  height: 100vh;
  overflow: hidden;
}
.hero-overlay {
  background-color: rgba(0, 0, 0, 0.5);
}

.hero-content {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}
.category-card:hover button {
  background-color: var(--bs-primary);
  color: white;
}
select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}

input:focus,
select:focus,
label:focus {
  outline: none !important;
  box-shadow: none !important;
  border-color: transparent !important; /* إذا بتحب تخفي لون البوردر كمان */
}

.btn-category {
  position: relative;
  bottom: -20px;
}
.btn-category button {
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  background-color: #e7f1f9;
  color: var(--bs-primary);
}
.offers-toolbar .btn-carousel {
  width: 42px;
  height: 42px;
  border-radius: 0.75rem;
  background: #e7f1f9;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #eef0f4;
  transition: 0.2s ease;
  color: var(--bs-primary);
}
.offers-toolbar .btn-carousel:hover {
  box-shadow: var(--shadow);
  background: var(--bs-primary);
  color: white;
}

.btn-view-all {
  border-radius: 0.8rem;
  padding-inline: 16px;
  height: 42px;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid #eef0f4;
  background: var(--bs-primary);
  transition: 0.2s ease;
}
.btn-view-all:hover {
  background: var(--bs-primary-hover);
}

.badge-chip {
  background: #e7f1f9;
  color: #1b3a8a;
  border-radius: 10px;
  font-weight: 700;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .hero-title {
    font-size: 1.8rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .search-form {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .stats-container {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .category-card {
    padding: 20px 15px;
  }

  .category-icon {
    font-size: 2rem;
  }

  .cta-content {
    flex-direction: column;
    text-align: center;
  }

  .hero-content {
    padding: 1rem;
  }

  .search-box {
    margin: 0 1rem 2rem;
    padding: 15px;
  }
}
</style>