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
            سهلة وآمنة لعرض إعلاناتك
          </h1>

          <!-- صندوق البحث -->
          <div class="row g-0 align-items-stretch w-100 justify-content-center">
            <!-- نص البحث -->
            <div class="col-md-3">
              <div class="input-group d-flex align-items-stretch h-100">
                <span
                  class="input-group-text bg-white p-3 text-secondary rounded-0 border-0 border-end"
                >
                  <Icon name="mdi:form-textbox-password" class="fs-1" />
                </span>
                <input
                  type="text"
                  class="form-control search-input bg-white py-6 text-dark fs-3 border-0 rounded-0"
                  placeholder="ادخل كلمة البحث هنا"
                  v-model="inputQuery"
                />
              </div>
            </div>

            <!-- اختيار القسم -->
            <div class="col-md-3 d-flex justify-content-center bg-white">
              <div class="input-group row gap-0">
                <div
                  class="input-group-prepend col-3 text-center bg-white w-auto d-flex justify-content-start align-items-center p-0 border-end"
                >
                  <label
                    class="input-group-text bg-white d-flex justify-content-center text-secondary rounded-0 border-0 border-end"
                    for="inputCategoryGroup"
                  >
                    <Icon name="mdi:tag-multiple" class="fs-1" />
                  </label>
                </div>

                <select
                  id="inputCategoryGroup"
                  v-model="categoryIdSelected"
                  class="bg-white text-dark py-6 col-9 text-end fs-3 rounded-0 border-0"
                  :class="{ 'text-muted': !categoryIdSelected }"
                >
                  <!-- placeholder -->
                  <option disabled value="">اختر القسم</option>
                  <option
                    v-for="cat in categories"
                    :key="cat.id ?? cat.value ?? cat.slug ?? cat.name"
                    :value="String(cat.id ?? cat.value ?? cat.name)"
                  >
                    {{ cat.name }}
                  </option>
                </select>
              </div>
            </div>

            <!-- اختيار المدينة -->
            <div class="col-md-3 d-flex justify-content-center bg-white">
              <div class="input-group row gap-0">
                <div
                  class="input-group-prepend col-3 text-center bg-white d-flex justify-content-start w-auto align-items-center p-0 border-end"
                >
                  <label
                    class="input-group-text bg-white d-flex justify-content-center text-secondary rounded-0 border-0 border-end"
                    for="inputCityGroup"
                  >
                    <Icon name="material-symbols:location-on" class="fs-1" />
                  </label>
                </div>

                <select
                  id="inputCityGroup"
                  v-model="cityIdSelected"
                  class="bg-white text-dark py-6 col-9 text-end fs-3 rounded-0 border-0"
                  :class="{ 'text-muted': !cityIdSelected }"
                >
                  <!-- placeholder -->
                  <option disabled value="">اختر المدينة</option>
                  <option
                    v-for="city in cities"
                    :key="city.id ?? city.value ?? city.name"
                    :value="String(city.id ?? city.value ?? city.name)"
                  >
                    {{ city.name }}
                  </option>
                </select>
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
    <section class="categories-section">
      <div class="container my-5">
        <div
          class="row g-3 py-4"
          v-if="mainStore?.homePageData?.categories_section"
        >
          <div
            v-for="(cat, index) in mainStore?.homePageData?.categories_section"
            :key="index"
            class="col-6 col-md-3 my-9 position-relative p-0"
          >
            <NuxtLink
              :to="`ads/category/${cat.slug}`"
              class="category-card h-150px text-center border rounded d-flex flex-column align-items-center justify-content-between mx-3"
            >
              <div
                class="bg-white w-25 px-2"
                style="position: relative; top: -25px"
              >
                <NuxtImg :src="cat.image_url" class="w-100" :alt="cat.name" />
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
            </NuxtLink>
          </div>
        </div>
        <div v-else class="text-center py-9">
          <icon name="svg-spinners:ring-resize" class="indicator-label fs-1" />
        </div>

        <div
          class="bg-primary text-white rounded p-9 mt-5 d-flex flex-column flex-md-row align-items-start justify-content-between"
        >
          <div>
            <h2 class="fw-bold text-white">بيع ما لا تحتاج واكسب المال</h2>
            <p class="mb-0 mt-3 fs-3">
              أضف إعلانك الآن لتصل إلى ملايين المشترين وتبيع كل ما تريد بأفضل
              الأسعار.
            </p>
          </div>
          <NuxtLink
            to="/ads/create"
            class="btn-info mt-3 mt-md-0 d-flex align-items-center"
          >
            <span class="fs-3 ms-3">أضف إعلانك الآن</span>
            <Icon name="line-md:arrow-left" class="fs-1 fw-bold" />
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- عروضنا الخاصة -->
    <section class="offers-section my-4 py-4 px-3 px-sm-4 bg-muted">
      <div class="container">
        <div class="d-flex justify-content-between offers-header mb-3">
          <div>
            <h2 class="fs-1 fw-bold mb-1">عروضنا الخاصة</h2>
            <div class="fs-3 offers-subtitle">عروض حصرية من إدارة الموقع</div>
          </div>
          <div class="d-flex align-items-center gap-2 offers-toolbar">
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
    <section class="container container-ads pt-4 mb-9 py-md-5">
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
            <h5 class="mb-0 text-white w-100">عرض الكل</h5>
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
              <div class="row g-4">
                <div
                  v-for="ad in group"
                  :key="ad.id"
                  class="col-12 col-md-6 col-xl-3 shadow-sm"
                >
                  <AdsCard :ad="ad" />
                </div>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="carousel-item active">
              <div class="row g-4 my-4">
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

/* إزالة سهم الـ select الافتراضي */
select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: none !important;
}

/* لمسة بصرية عندما تكون القيمة فارغة */
.text-muted {
  color: #6c757d !important;
}

input:focus,
select:focus,
label:focus {
  outline: none !important;
  box-shadow: none !important;
  border-color: transparent !important;
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
}
.search-input::placeholder {
  color: #6c757d !important;
  font-size: 1.35rem !important;
  font-weight: 400;
}
</style>
