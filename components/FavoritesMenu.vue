<script setup>
import { useMainStore } from "~/stores/mainStore";

// Props
const props = defineProps({
  show: { type: Boolean, default: false },
  favorites: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
});

const mainStore = useMainStore();

// ✅ لودر لكل عنصر باستخدام Set تفاعلي
const loadingIds = reactive(new Set());
const isLoading = (id) => loadingIds.has(id);

// ✅ تبديل المفضلة لعنصر معيّن فقط
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
</script>

<template>
  <div
    v-if="show"
    class="dropdown-menu show shadow w-100 p-3 position-absolute start-0"
    style="max-height: 500px; min-width: 350px; overflow-y: auto"
  >
    <h5 class="fw-bold border-bottom text-end pb-2 mb-3">
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
      <div v-for="item in favorites" :key="item.id" class="border-bottom py-2">
        <div class="row g-3 align-items-start fav-item">
          <div class="col-auto">
            <img
              :src="item.image || '/media/bg-home/bg1.png'"
              class="rounded thumb"
              style="width: 56px; height: 56px; object-fit: cover"
              alt="صورة الإعلان"
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

            <div class="fw-semibold fs-6 title-2lines">
              {{ item.title }}
            </div>
            <div class="d-flex justify-content-between align-items-center mt-1">
              <small class="text-muted">{{ item.city }}</small>
              <small class="text-primary fw-bold">
                {{ item.price }} {{ item.currency }}
              </small>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.dropdown-menu {
  right: 0;
  left: auto;
}
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
/* ✅ shimmer animation */
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
</style>
