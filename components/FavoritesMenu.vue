<script setup>
import { useMainStore } from "~/stores/mainStore";
import { reactive, computed } from "vue";

// Props
const props = defineProps({
  show: { type: Boolean, default: false },
  favorites: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  desktopPlacement: {
    type: String,
    default: "end",
    validator: (v) => ["start", "end", "center"].includes(v),
  },
});

// Emits
const emit = defineEmits(["close", "update:show"]);
const mainStore = useMainStore();

// ✅ لودر لكل عنصر باستخدام Set تفاعلي
const loadingIds = reactive(new Set());
const isLoading = (id) => loadingIds.has(id);

// ✅ تبديل المفضلة
const handleToggleFavorite = async (id) => {
  if (!id || isLoading(id)) return;
  loadingIds.add(id);
  try {
    await mainStore.changeFavoriteAds(id);
  } catch (error) {
    console.error("Error toggling favorite:", error);
  } finally {
    loadingIds.delete(id);
  }
};

// ✅ إغلاق
const handleClose = () => {
  emit("update:show", false);
  emit("close");
};

// ✅ مكان الديسكتوب
const desktopClass = computed(() => {
  return {
    "place-end": props.desktopPlacement === "end",
    "place-start": props.desktopPlacement === "start",
    "place-center": props.desktopPlacement === "center",
  };
});
</script>

<template>
  <div
    v-if="show"
    class="fav-panel-container mobile-fullscreen"
    role="dialog"
    aria-modal="true"
    aria-label="قائمة المفضلة"
    :class="desktopClass"
  >
    <!-- ترويسة الموبايل -->
    <div
      class="mobile-header d-md-none sticky-top bg-white pb-2 mb-3 border-bottom"
    >
      <div class="d-flex align-items-center justify-content-between py-3">
        <h3 class="fw-bold m-0">المفضلة ({{ favorites.length }})</h3>
        <button
          type="button"
          class="btn-close"
          aria-label="إغلاق"
          @click="handleClose"
        ></button>
      </div>
    </div>

    <!-- ترويسة الديسكتوب -->
    <h5 class="fw-bold border-bottom text-end pb-2 mb-3 d-none d-md-block">
      المفضلة ({{ favorites.length }})
    </h5>

    <!-- Skeleton -->
    <template v-if="loading">
      <div v-for="i in 3" :key="i" class="border-bottom py-2">
        <div class="row g-3 align-items-start">
          <div class="col-auto">
            <div
              class="bg-light rounded shimmer"
              style="width: 56px; height: 56px"
            ></div>
          </div>
          <div class="col text-end pe-5">
            <div
              class="bg-light rounded shimmer mb-2"
              style="height: 16px; width: 80%"
            ></div>
            <div class="d-flex justify-content-between">
              <div
                class="bg-light rounded shimmer"
                style="height: 12px; width: 40%"
              ></div>
              <div
                class="bg-light rounded shimmer"
                style="height: 12px; width: 20%"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- لا توجد مفضلة -->
    <template v-else-if="favorites.length === 0">
      <div class="text-center text-muted py-5">لا يوجد إعلانات مفضلة</div>
    </template>

    <!-- القائمة -->
    <template v-else>
      <div
        v-for="item in favorites"
        :key="item.id"
        class="border-bottom py-2 fav-item-wrapper"
      >
        <div class="row g-3 align-items-center fav-item">
          <div class="col-auto">
            <NuxtImg
              :src="item?.image"
              class="rounded thumb"
              style="width: 56px; height: 56px; object-fit: cover"
              :alt="item.title"
            />
          </div>
          <div class="col text-end position-relative p-0">
            <button
              type="button"
              class="btn p-0 border-0 bg-transparent fav-btn position-absolute top-0 start-0"
              aria-label="مفضلة"
              :disabled="isLoading(item.id)"
              :aria-busy="isLoading(item.id)"
              @click="handleToggleFavorite(item.id)"
            >
              <icon
                v-if="isLoading(item.id)"
                name="svg-spinners:ring-resize"
                class="indicator-label fs-1"
              />
              <span v-else>
                <Icon class="text-primary" name="mdi:cards-heart" size="22" />
              </span>
            </button>

            <p class="fw-semibold title-2lines">{{ item.title }}</p>
            <div class="d-flex justify-content-between align-items-center mt-1">
              <small class="text-muted">{{ item.city }}</small>
              <small class="text-primary mt-4 fw-bold"
                >{{ item.price }} {{ item.currency }}</small
              >
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.fav-item .col.position-relative {
  padding-inline-end: 2.25rem;
}
.fav-btn {
  line-height: 1;
}
.title-2lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.shimmer {
  position: relative;
  overflow: hidden;
}
.shimmer::after {
  content: "";
  position: absolute;
  top: 0;
  left: -150px;
  height: 100%;
  width: 150px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
  animation: shimmer 1.5s infinite;
}
@keyframes shimmer {
  100% {
    transform: translateX(300px);
  }
}

/* ===== موبايل ===== */
@media (max-width: 768px) {
  .mobile-fullscreen {
    position: fixed !important;
    top: 0;
    left: 0 !important;
    right: 0 !important;
    bottom: 0;
    width: 100% !important;
    height: 100% !important;
    max-height: none !important;
    min-width: auto !important;
    border-radius: 0;
    overflow-y: auto;
    z-index: 1050;
    background: #fff;
    padding: 0 1rem 1rem 1rem; /* ✅ إضافة مسافة يمين ويسار */
  }
  .fav-item-wrapper {
    padding-inline: 0.5rem; /* ✅ مسافة داخلية لعناصر القائمة */
  }
  .mobile-header + * {
    scroll-margin-top: 56px;
  }
}

/* ===== ديسكتوب ===== */
@media (min-width: 769px) {
  .fav-panel-container {
    position: absolute;
    top: 100%;
    margin-top: 8px;
    min-width: 350px;
    max-height: 500px;
    overflow-y: auto;
    z-index: 1050;
    background: #fff;
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    border-radius: 0.5rem;
    padding: 1rem;
  }
  .fav-panel-container.place-end {
    inset-inline-end: 1rem;
  }
  .fav-panel-container.place-start {
    inset-inline-start: 1rem;
  }
  .fav-panel-container.place-center {
    left: 50%;
    transform: translateX(-50%);
    right: auto;
  }
}
</style>
