<script setup>
import { useMainStore } from "~/stores/mainStore";

useHead({ title: "الرئيسية" });

// ✅ SEO للصفحة الرئيسية
useSeo({
  title: "منصّة AZZA | بيع وشراء بسهولة وأمان",
  description:
    "منصّة إلكترونية متكاملة للإعلانات العربية تتيح للمستخدمين إضافة إعلاناتهم وتصفح العروض في العقارات، الأجهزة، الأثاث، المفقودات والخدمات. تواصل مباشر وآمن بين البائعين والمشترين.",
  image: "/media/avatars/logo.png",
  canonicalPath: "/",
  type: "website",
});
const mainStore = useMainStore();

/* مدخلات البحث */
const inputQuery = ref("");
const categoryIdSelected = ref("");
const cityIdSelected = ref("");

onMounted(async () => {
  if (!mainStore?.homePageData) {
    await mainStore.getHomeData();
  }
});

/* بيانات القوائم */
const categories = computed(
  () => mainStore?.homePageData?.categories_section ?? []
);
const cities = computed(
  () =>
    mainStore?.homePageData?.search_section?.search_fields?.[2]?.options ?? []
);

/* رابط البحث: استعمل كائن NuxtLink لتكوين الاستعلام بشكل آمن */
const searchTo = computed(() => {
  const query = {};
  if (inputQuery.value?.trim()) query.query = inputQuery.value.trim();
  if (categoryIdSelected.value) query.category_id = categoryIdSelected.value;
  if (cityIdSelected.value) query.city_id = cityIdSelected.value;
  return { path: "/search", query };
});

/* كتل الإعلانات لعروض السلايدر */
const chunk = (arr, size) => {
  const out = [];
  if (!Array.isArray(arr)) return out;
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};
const chunkedAds = computed(() =>
  chunk(mainStore?.homePageData?.ads_section, 8)
);
const slides = computed(() =>
  chunk(mainStore?.homePageData?.products_section, 4)
);
const carouselId = "offersCarousel";
const selectedCategoryName = ref("أختر القسم");

const selectCategory = (id, name) => {
  categoryIdSelected.value = id;
  selectedCategoryName.value = name;
};
const selectedCityName = ref("أختر المدينة");

const selectCity = (id, name) => {
  cityIdSelected.value = id;
  selectedCityName.value = name;
};
</script>

<template>
  <div>
    <section
      class="hero-section position-relative text-white"
      style="height: 600px"
    >
      <div
        class="hero-background-grid position-absolute top-0 start-0 w-100 h-100 z-n1"
      >
        <div class="row g-0 h-100">
          <div class="row g-0">
            <div class="col-3">
              <img
                src="/media/bg-home/bg1.png"
                class="img-fluid w-100 h-100 object-fit-cover img-home"
              />
            </div>
            <div class="col-2">
              <img
                src="/media/bg-home/bg2.png"
                class="img-fluid w-100 h-100 object-fit-cover img-home"
              />
            </div>
            <div class="col-4">
              <img
                src="/media/bg-home/bg3.png"
                class="img-fluid w-100 h-100 object-fit-cover img-home"
              />
            </div>
            <div class="col-3">
              <img
                src="/media/bg-home/bg4.png"
                class="img-fluid w-100 h-100 object-fit-cover img-home"
              />
            </div>
          </div>
          <div class="row g-0">
            <div class="col-2">
              <img
                src="/media/bg-home/bg5.png"
                class="img-fluid w-100 h-100 object-fit-cover img-home"
              />
            </div>
            <div class="col-5">
              <img
                src="/media/bg-home/bg6.png"
                class="img-fluid w-100 h-100 object-fit-cover img-home"
              />
            </div>
            <div class="col-3">
              <img
                src="/media/bg-home/bg7.png"
                class="img-fluid w-100 h-100 object-fit-cover img-home"
              />
            </div>
            <div class="col-2">
              <img
                src="/media/bg-home/bg8.png"
                class="img-fluid w-100 h-100 object-fit-cover img-home"
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
          <h2
            class="hero-subtitle bg-primary d-inline p-5 px-9 text-white fw-normal"
          >
            أكثر من 100,000 إعلان نشط
          </h2>
          <h1 class="text-center hero-title fs-1 fw-bold my-9 py-9 text-white">
            منصـة إعلانيـة تجمـع لـك كـل مـا تحتاجـه مـن حولـك، وتمنحـك مساحـة
            سهلة وآمنة لعرض إعلاناتك
          </h1>

          <!-- صندوق البحث -->
          <div
            class="row g-0 align-items-stretch w-100 m-auto justify-content-center"
          >
            <!-- نص البحث -->
            <div class="col-md-3 overflow-hidden">
              <div class="input-group d-flex align-items-stretch h-100">
                <label
                  for="input-search"
                  class="input-group-text ms-2 p-0 pe-3 text-secondary rounded-0 border-0 border-end"
                >
                  <Icon
                    name="mdi:form-textbox-password"
                    class="fs-1 fw-bold"
                    :class="{
                      'text-secondary': !inputQuery,
                      'text-dark': inputQuery,
                    }"
                  />
                </label>
                <input
                  type="text"
                  id="input-search"
                  name="text-search"
                  class="form-control search-input py-6 text-dark border-0 rounded-0"
                  placeholder="ادخل كلمة البحث هنا"
                  v-model="inputQuery"
                />
              </div>
            </div>

            <!-- اختيار القسم -->
            <div
              class="col-md-3 d-flex justify-content-center align-items-stretch"
            >
              <div class="input-group row gap-0 w-100">
                <div class="dropdown w-100 p-0">
                  <button
                    class="btn dropdown-toggle w-100 h-100 text-end border-0 fs-4 d-flex align-items-center justify-content-between placeholder-btn"
                    type="button"
                    id="dropdownCategory"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    style="background: #f1f1f4 !important"
                  >
                    <span class="border-dropdown">
                      <!-- الأيقونة -->
                      <Icon
                        name="mdi:tag-multiple"
                        class="fs-1 fw-bold ms-2"
                        :class="{
                          'text-secondary':
                            selectedCategoryName === 'أختر القسم',
                          'text-dark': selectedCategoryName !== 'أختر القسم',
                        }"
                      />
                    </span>
                    <!-- النص -->
                    <span
                      class="flex-grow-1 text-end"
                      :class="{
                        'text-muted': selectedCategoryName === 'أختر القسم',
                        'text-dark': selectedCategoryName !== 'أختر القسم',
                      }"
                    >
                      {{ selectedCategoryName }}
                    </span>
                  </button>

                  <ul
                    class="dropdown-menu w-100 text-end"
                    aria-labelledby="dropdownCategory"
                  >
                    <li v-for="cat in categories" :key="cat.id">
                      <a
                        class="dropdown-item fs-5 py-2"
                        href="#"
                        @click.prevent="selectCategory(cat.id, cat.name)"
                      >
                        {{ cat.name }}
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <!-- اختيار المدينة -->
            <div
              class="col-md-3 d-flex justify-content-center align-items-stretch"
            >
              <div class="input-group row gap-0 w-100">
                <div class="dropdown w-100 p-0">
                  <button
                    class="btn dropdown-toggle w-100 h-100 text-end border-0 fs-4 d-flex align-items-center justify-content-between placeholder-btn"
                    type="button"
                    id="dropdownCity"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    style="background: #f1f1f4 !important"
                  >
                    <span class="border-dropdown">
                      <!-- الأيقونة -->
                      <Icon
                        name="material-symbols:location-on"
                        class="fs-1 fw-bold ms-2"
                        :class="{
                          'text-secondary': selectedCityName === 'أختر المدينة',
                          'text-dark': selectedCityName !== 'أختر المدينة',
                        }"
                      />
                    </span>
                    <!-- النص -->
                    <span
                      class="flex-grow-1 text-end"
                      :class="{
                        'text-muted': selectedCityName === 'أختر المدينة',
                        'text-dark': selectedCityName !== 'أختر المدينة',
                      }"
                    >
                      {{ selectedCityName }}
                    </span>
                  </button>

                  <ul
                    class="dropdown-menu w-100 text-end"
                    aria-labelledby="dropdownCity"
                  >
                    <li v-for="city in cities" :key="city.id">
                      <a
                        class="dropdown-item fs-5 py-2"
                        href="#"
                        @click.prevent="selectCity(city.id, city.name)"
                      >
                        {{ city.name }}
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- زر البحث -->
            <div class="col-md-2">
              <NuxtLink
                :to="searchTo"
                class="btn btn-main d-flex align-items-center justify-content-center w-100 h-100 rounded-0"
                type="button"
              >
                <span class="fs-2 text-white m-0">بحث</span>
              </NuxtLink>
            </div>
          </div>
        </div>
      </section>
    </section>

    <!-- الأقسام -->
    <section class="categories-section my-9 py-9 px-3 px-sm-4">
      <div class="container my-5">
        <div
          class="row g-3 py-4 justify-content-center"
          v-if="mainStore?.homePageData?.categories_section"
        >
          <div
            v-for="(cat, index) in mainStore?.homePageData?.categories_section"
            :key="index"
            class="col-6 col-sm-4 col-md-3 col-lg-2-4 my-3 position-relative my-9"
          >
            <NuxtLink
              :to="`ads/category/${cat.slug}`"
              class="category-card h-150px text-center border rounded d-flex flex-column align-items-center justify-content-between mx-2"
            >
              <div class="bg-white px-2 cat-img">
                <NuxtImg
                  :src="cat.icon"
                  style="width: 50px"
                  :alt="cat.name"
                />
              </div>
              <div class="position-absolute bottom-0">
                <p class="fs-4 fw-semibold text-dark">{{ cat.name }}</p>
                <div
                  class="btn-category bg-white px-3 d-flex justify-content-center"
                >
                  <button class="btn btn-sm fw-bold mt-2">
                    <Icon name="line-md:arrow-left" class="fs-1 fw-bold" />
                  </button>
                </div>
              </div>
            </NuxtLink>
          </div>
        </div>

        <div v-else class="text-center py-9">
          <icon name="svg-spinners:ring-resize" class="indicator-label fs-1" />
        </div>

        <div
          class="bg-primary text-white rounded p-9 mt-5 d-flex flex-column flex-lg-row align-items-start justify-content-between"
        >
          <div>
            <h2 class="fw-bold text-white">بيع ما لا تحتاج واكسب المال</h2>
            <p class="mb-0 mt-3 fs-3 fw-light">
              أضف إعلانك الآن لتصل إلى ملايين المشترين وتبيع كل ما تريد بأفضل
              الأسعار.
            </p>
          </div>
          <NuxtLink
            to="/ads/create"
            class="btn-info mt-3 mt-lg-0 d-flex align-items-center"
          >
            <span class="fs-3 ms-3">أضف إعلانك الآن</span>
            <Icon name="line-md:arrow-left" class="fs-1 fw-bold" />
          </NuxtLink>
        </div>
      </div>
    </section>
    <!-- عروضنا الخاصة -->
    <section class="offers-section my-9 py-9 px-3 px-sm-4">
      <div class="container">
        <div class="d-flex justify-content-between offers-header mb-3">
          <div>
            <h2 class="fs-1 fw-bold mb-1 fw-medium">عروضنا الخاصة</h2>
            <div class="fs-3 offers-subtitle text-muted">
              عروض حصرية من إدارة الموقع
            </div>
          </div>
          <div
            class="d-flex align-items-center gap-2 offers-toolbar"
            v-if="mainStore?.homePageData?.products_section"
          >
            <button
              class="btn-carousel"
              :data-bs-target="`#${carouselId}`"
              data-bs-slide="prev"
              aria-label="السابق"
            >
              <Icon name="line-md:arrow-right" size="20" />
            </button>
            <button
              class="btn-carousel"
              :data-bs-target="`#${carouselId}`"
              data-bs-slide="next"
              aria-label="التالي"
            >
              <Icon name="line-md:arrow-left" size="20" />
            </button>
            <NuxtLink to="/products" class="btn-view-all">
              <span class="mb-0 text-white">عرض الكل</span>
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
            <template v-if="mainStore?.homePageData?.products_section">
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
                    <ProductCard :item="item" />
                  </div>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="carousel-item active">
                <div class="row g-3 g-md-4">
                  <div v-for="n in 4" :key="n" class="col-12 col-sm-6 col-lg-3">
                    <SkeletonProductCard />
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </section>

    <!-- أحدث الإعلانات -->
    <section class="container container-ads pt-4 my-9 py-9">
      <div class="d-flex align-items-center justify-content-between mb-4">
        <div class="d-flex align-items-center gap-4">
          <div>
            <span class="text-primary fs-3 fw-medium pe-3">جديد</span>
            <h2 class="fs-1 section-title mb-0 mt-3 fw-medium">
              أحدث الإعلانات
            </h2>
            <p class="fs-3 offers-subtitle text-muted">
              ابقَ على اطلاع.. لا تفوت الفرص الجديدة!
            </p>
          </div>
        </div>

        <div
          class="d-flex align-items-center gap-2 offers-toolbar"
          v-if="mainStore?.homePageData?.ads_section"
        >
          <button
            class="btn-carousel"
            data-bs-target="#adsCarousel"
            data-bs-slide="prev"
            aria-label="السابق"
          >
            <Icon name="line-md:arrow-right" size="20" />
          </button>
          <button
            class="btn-carousel"
            data-bs-target="#adsCarousel"
            data-bs-slide="next"
            aria-label="التالي"
          >
            <Icon name="line-md:arrow-left" size="20" />
          </button>

          <NuxtLink to="/ads" class="btn-view-all">
            <span class="mb-0 text-white">عرض الكل</span>
            <Icon
              name="material-symbols:arrow-back-rounded"
              class="text-white"
              size="20"
            />
          </NuxtLink>
        </div>
      </div>

      <div id="adsCarousel" class="carousel slide" data-bs-interval="false">
        <div class="carousel-inner">
          <template v-if="mainStore?.homePageData?.ads_section">
            <div
              v-for="(group, idx) in chunkedAds"
              :key="'slide-' + idx"
              class="carousel-item"
              :class="{ active: idx === 0 }"
            >
              <div class="row g-3 g-md-4">
                <div
                  v-for="ad in group"
                  :key="ad.id"
                  class="col-12 col-sm-6 col-lg-3 card ad-card overflow-hidden p-0 position-relative border-0 mt-6"
                >
                  <AdsCard :ad="ad" />
                </div>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="carousel-item active">
              <div class="row g-3 g-md-4 my-4">
                <div
                  v-for="n in 4"
                  :key="'skeleton-1-' + n"
                  class="col-12 col-md-6 col-xl-3"
                >
                  <SkeletonAdCard />
                </div>
              </div>
              <div class="row g-4 my-4">
                <div
                  v-for="n in 4"
                  :key="'skeleton-2-' + n"
                  class="col-12 col-md-6 col-xl-3"
                >
                  <SkeletonAdCard />
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.btn:hover {
  color: white !important;
}
.img-home {
  height: 300px !important;
  border-left: 2px #fff solid;
  border-right: 2px #fff solid;
}
.hero-overlay {
  background-color: rgba(0, 0, 0, 0.5);
}
.hero-content {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 600px;
}

.category-card:hover button {
  background-color: var(--bs-primary);
  color: white;
}

/* لمسة بصرية عندما تكون القيمة فارغة */
.text-muted {
  color: #6c757d !important;
}

input:focus,
label:focus {
  outline: none !important;
  box-shadow: none !important;
  border-color: transparent !important;
}
/* أضف هذا في ملف CSS الخاص بك */
@media (min-width: 992px) {
  .col-lg-2-4 {
    flex: 0 0 auto;
    width: 20%; /* 100 ÷ 5 */
  }
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
  padding-inline: 8px;
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
.border-dropdown {
  border-right: 2px lch(70.1 7.6 265.62 / 0.4) solid;
  padding-right: 5px;
  height: 100%;
  display: flex;
  align-items: center;
}
.placeholder-btn {
  background-color: transparent !important;
  box-shadow: none !important;
  border-radius: 0 !important;
  text-align: right !important;
  padding-right: 0 !important;
  font-weight: 400;
}
.cat-img {
  position: relative;
  top: -25px;
}
.placeholder-btn::after {
  display: none !important; /* إخفاء السهم الصغير */
}

.dropdown-menu {
  max-height: 250px;
  overflow-y: auto;
  border-radius: 0;
  z-index: 9999 !important;
  position: absolute !important;
}
.hero-section,
.hero-content {
  overflow: visible !important;
}
.dropdown-item:hover {
  background-color: var(--bs-primary);
  color: #fff;
}

.input-group,
.input-group input,
.input-group label {
  background: #f1f1f4 !important;
}
.search-input {
  padding: 10.3px 0 10.3px 19px !important;
}
.search-input::placeholder {
  color: #6e6e6e !important;
  font-size: 14px !important;
  font-weight: 400;
}
.offers-section {
  background-color: #f7f7f7;
}

/* Mobile */
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
  .cat-img {
    top: -45px;
  }
  .search-input,
  .search-input::placeholder {
    font-size: 11.4px !important;
  }
}
</style>
