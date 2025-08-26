<script setup>
const props = defineProps({ show: Boolean });

const items = [
  {
    title: "كاميرا احترافية بحالة ممتازة",
    location: "فلسطين - دير البلح",
    price: "3,500 شيكل",
    // image: img1,
  },
  {
    title: "فلل سياحية وسكنية عظم للبيع بسعر مغري",
    location: "فلسطين - مدينة غزة",
    price: "80,500 شيكل",
    // image: img2,
  },
  {
    title: "ساعة بلوتوث لاسلكية اصلية",
    location: "فلسطين - مدينة غزة",
    price: "80,500 شيكل",
    // image: img3,
  },
  {
    title: "عطر خليجي برائحة العود ثابت قوي",
    location: "فلسطين - مدينة غزة",
    price: "80,500 شيكل",
    // image: img4,
  },
  {
    title: "iPhone 14 Pro Max للبيع",
    location: "فلسطين - مدينة غزة",
    price: "80,500 شيكل",
    // image: img5,
  },
  {
    title: "فلل سياحية وسكنية عظم للبيع بسعر مغري",
    location: "فلسطين - مدينة غزة",
    price: "80,500 شيكل",
    // image: img2,
  },
  {
    title: "ساعة بلوتوث لاسلكية اصلية",
    location: "فلسطين - مدينة غزة",
    price: "80,500 شيكل",
    // image: img3,
  },
  {
    title: "عطر خليجي برائحة العود ثابت قوي",
    location: "فلسطين - مدينة غزة",
    price: "80,500 شيكل",
    // image: img4,
  },
  {
    title: "iPhone 14 Pro Max للبيع",
    location: "فلسطين - مدينة غزة",
    price: "80,500 شيكل",
    // image: img5,
  },
];
</script>

<template>
  <div
    v-if="show"
    class="dropdown-menu show shadow w-100 p-3 position-absolute start-0"
    style="max-height: 500px; min-width: 350px; overflow-y: auto"
  >
    <h5 class="fw-bold border-bottom text-end pb-2 mb-3">
      المفضلة ({{ items.length }})
    </h5>

    <div v-for="(item, i) in items" :key="i" class="border-bottom py-2">
      <!-- استخدم grid الصحيح -->
      <div class="row g-3 align-items-start fav-item">
        <!-- الصورة -->
        <div class="col-auto">
          <img
            src="/media/bg-home/bg1.png"
            class="rounded thumb"
            style="width: 56px; height: 56px; object-fit: cover"
          />
        </div>

        <!-- النص + الأيقونة -->
        <div class="col text-end position-relative pe-5">
          <!-- الأيقونة ثابتة أعلى يمين -->

          <button
            type="button"
            class="btn p-0 border-0 bg-transparent fav-btn position-absolute top-0 start-0"
          >
            <Icon name="fa-solid:heart" class="text-primary fs-4" />
          </button>
          <div class="fw-semibold fs-6 title-2lines">
            {{ item.title }}
          </div>

          <div class="d-flex justify-content-between align-items-center mt-1">
            <small class="text-muted">{{ item.location }}</small>
            <small class="text-primary fw-bold">{{ item.price }}</small>
          </div>
        </div>
      </div>
    </div>

    <div class="text-center">
      <NuxtLink
        to="/favorites"
        class="text-primary py-2 d-block fw-bold text-decoration-underline"
      >
        عرض جميع المفضلة
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.dropdown-menu {
  right: 0;
  left: auto;
}

/* مساحة آمنة للأيقونة داخل المحتوى */
.fav-item .col.position-relative {
  padding-inline-end: 2.25rem;
}

/* تكبير مساحة النقر حول الأيقونة */
.fav-btn {
  line-height: 1;
}

/* قصّ العنوان لسطرين لتوحيد الارتفاع */
.title-2lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
