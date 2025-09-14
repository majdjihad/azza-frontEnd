<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRuntimeConfig } from "#app";
import { useMainStore } from "~/stores/mainStore";
import { useAuth } from "~/composables/useAuth";

definePageMeta({ layout: false });

const mainStore = useMainStore();
const { isLoggedIn } = useAuth();
const props = defineProps({
  ad: {
    type: Object,
    required: true,
  },
});

/* ====== قلب المفضلة ====== */
const loader = ref(false);
const handleToggleFavorite = async () => {
  try {
    loader.value = true;
    await mainStore.changeFavoriteAds(props.ad.id);
    // خيار: قلب محلي (إذا كان المصدر لا ينعكس فورًا)
    props.ad.is_favorite = !props.ad.is_favorite;
  } catch (e) {
    console.error("Error toggling favorite:", e);
  } finally {
    loader.value = false;
  }
};

/* ================== مشاركة الإعلان - Toast ================== */
const shareToastOpen = ref(false);
let hideTimer = null;
let startedAt = 0;
let remaining = 5000; // ms

const adUrl = computed(() => {
  try {
    return new URL(`/ads/${props.ad.id}`, origin).href;
  } catch {
    return `${origin}/ads/${props.ad.id}`;
  }
});

const shareText = computed(() => {
  const parts = [];
  if (props.ad?.title) parts.push(props.ad.title);
  if (category.value) parts.push(`(${category.value})`);
  if (props.ad?.price)
    parts.push(`السعر: ${props.ad.price} ${props.ad?.currency || ""}`.trim());
  const city = props.ad?.city?.name || props.ad?.city;
  if (city) parts.push(`المكان: ${city}`);
  return parts.join(" • ");
});

const shareUrls = computed(() => ({
  fb: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    adUrl.value
  )}&quote=${encodeURIComponent(shareText.value)}`,
  wa: `https://wa.me/?text=${encodeURIComponent(
    `${shareText.value} ${adUrl.value}`
  )}`,
}));

function openShareToast() {
  shareToastOpen.value = true;
  clearTimeout(hideTimer);
  remaining = 5000;
  startedAt = Date.now();
  hideTimer = setTimeout(() => (shareToastOpen.value = false), remaining);
}

function closeShareToast() {
  shareToastOpen.value = false;
  clearTimeout(hideTimer);
}

function onToastMouseEnter() {
  clearTimeout(hideTimer);
  remaining -= Date.now() - startedAt;
}

function onToastMouseLeave() {
  startedAt = Date.now();
  clearTimeout(hideTimer);
  hideTimer = setTimeout(
    () => (shareToastOpen.value = false),
    Math.max(0, remaining)
  );
}

function shareTo(platform) {
  const url = shareUrls.value[platform];
  if (!url) return;
  if (process.client) window.open(url, "_blank", "noopener,noreferrer");
  closeShareToast();
}

// إغلاق بـ Escape
onMounted(() => {
  const onKey = (e) => e.key === "Escape" && closeShareToast();
  window.addEventListener("keydown", onKey);
  onBeforeUnmount(() => window.removeEventListener("keydown", onKey));
});
</script>

<template>
  <div class="container py-5">
    <div class="card ad-card overflow-hidden p-0 position-relative my-2">
      <!-- Top Image + Chips + Avatar -->
      <div class="position-relative">
        <NuxtLink :to="`/ads/${ad?.id}`">
          <img :src="ad?.main_image" class="card-img-top" :alt="ad?.title" />
        </NuxtLink>

        <span
          class="badge badge-chip position-absolute top-0 end-0 m-3 px-3 py-2"
        >
          {{ ad?.category }}
        </span>

        <NuxtLink :to="`/profile/${ad?.user_id}`" class="avatar-holder">
          <img
            :src="ad?.user_photo"
            width="50"
            class="rounded-circle"
            alt="user"
          />
        </NuxtLink>
      </div>

      <div class="card-body pt-5">
        <div class="text-muted small mb-1" v-if="ad?.created_at">
          منذ {{ ad?.created_at }}
        </div>

        <NuxtLink :to="`/ads/${ad?.id}`" class="text-decoration-none">
          <h5 class="ad-title mb-2">{{ ad?.title }}</h5>
        </NuxtLink>

        <p class="ad-desc mb-3">
          {{ ad?.description?.split(" ").slice(0, 5).join(" ")
          }}{{ ad?.description?.split(" ").length > 5 ? "..." : "" }}
        </p>

        <div class="d-flex align-items-center justify-content-start gap-2">
          <span class="fs-5 text-primary">{{ ad?.price }}</span>
          <span class="fs-5 text-primary">{{ ad?.currency }}</span>
        </div>

        <div class="mt-3 d-flex align-items-center justify-content-between">
          <div
            class="text-muted small d-flex align-items-center gap-1"
            v-if="ad?.city"
          >
            <Icon name="material-symbols:location-on-outline" size="18" />
            <span v-if="ad?.city?.name">{{ ad?.city?.name }}</span>
            <span v-else>{{ ad?.city }}</span>
          </div>

          <div class="meta d-flex align-items-center gap-1 fs-5">
            <!-- تواصل واتساب -->
            <NuxtLink
              :to="`https://wa.me/${ad?.whatsapp}`"
              class="btn text-secondary btn-sm p-1"
              aria-label="تواصل"
            >
              <Icon name="akar-icons:whatsapp-fill" size="22" />
            </NuxtLink>

            <!-- مفضلة -->
            <button
              v-if="isLoggedIn"
              class="btn text-secondary btn-sm p-1"
              aria-label="مفضلة"
              @click="handleToggleFavorite"
            >
              <icon
                v-if="loader"
                name="svg-spinners:ring-resize"
                class="indicator-label fs-1"
              />
              <span v-else>
                <Icon
                  v-if="ad?.is_favorite"
                  class="text-primary"
                  name="mdi:cards-heart"
                  size="22"
                />
                <Icon v-else name="mdi:heart-outline" size="22" />
              </span>
            </button>

            <!-- مشاركة: Toast مخصص -->
            <button
              class="btn text-secondary btn-sm p-1"
              aria-label="مشاركة"
              @click="openShareToast"
            >
              <Icon name="mdi:share-variant-outline" size="22" />
            </button>
          </div>
        </div>
      </div>

      <!-- ======= Share Toast ======= -->
      <transition name="share-toast">
        <div
          v-if="shareToastOpen"
          class="share-toast"
          role="alert"
          aria-live="polite"
          @mouseenter="onToastMouseEnter"
          @mouseleave="onToastMouseLeave"
        >
          <div class="share-toast__body">
            <div class="share-toast__icon">
              <Icon name="mdi:share-variant" size="22" />
            </div>

            <div class="share-toast__text">
              <div class="share-toast__title">شارك الإعلان</div>
              <div class="share-toast__sub">{{ ad?.title }}</div>
            </div>

            <div class="share-toast__actions">
              <button
                class="btn-share fb"
                @click="shareTo('fb')"
                aria-label="Facebook"
              >
                <Icon name="mdi:facebook" size="18" />
                <span>Facebook</span>
              </button>
              <button
                class="btn-share wa"
                @click="shareTo('wa')"
                aria-label="WhatsApp"
              >
                <Icon name="akar-icons:whatsapp-fill" size="18" />
                <span>WhatsApp</span>
              </button>
            </div>

            <button
              class="share-toast__close"
              @click="closeShareToast"
              aria-label="إغلاق"
            >
              ×
            </button>
          </div>

          <div class="share-toast__progress"></div>
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped>
/* ===== بطاقة الإعلان ===== */
.ad-card {
  border: 1px solid #eef0f4;
  border-radius: 1.25rem;
  overflow: hidden;
  background: #fff;
  transition: 0.25s ease;
}
.ad-card:hover img {
  filter: grayscale(0.5);
}
.ad-card:hover .ad-title {
  text-decoration: underline;
}
.ad-card .card-img-top {
  height: 260px;
  object-fit: cover;
}
.badge-chip {
  background: #e7f1f9;
  color: #1b3a8a;
  border-radius: 10px;
  font-weight: 700;
}
.ad-title {
  font-weight: 800;
}
.ad-desc {
  color: #6b7280;
  line-height: 1.9;
}

/* avatar overlap position */
.avatar-holder {
  position: absolute;
  bottom: -28px;
  left: 10px;
}

/* ====== Share Toast ====== */
.share-toast {
  position: fixed;
  bottom: 24px;
  inset-inline: 0; /* يدعم RTL/LTR */
  display: grid;
  place-items: center;
  z-index: 1100;
  pointer-events: none; /* حتى لا تمنع النقرات خارجها */
}
.share-toast__body {
  pointer-events: auto; /* تفعيل التفاعل داخل التوست */
  background: #ffffff;
  color: #111827;
  border: 1px solid #eef0f4;
  border-radius: 14px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
  padding: 12px 14px;
  min-width: min(96vw, 560px);
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  align-items: center;
  gap: 12px;
}
.share-toast__icon {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  background: #f2f6ff;
  color: #1d4ed8;
  border-radius: 10px;
}
.share-toast__text {
  line-height: 1.2;
}
.share-toast__title {
  font-weight: 800;
}
.share-toast__sub {
  font-size: 0.85rem;
  color: #6b7280;
  margin-top: 4px;
}

.share-toast__actions {
  display: inline-flex;
  gap: 8px;
}
.btn-share {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid #e5e7eb;
  padding: 8px 12px;
  border-radius: 10px;
  background: #fff;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s ease, transform 0.06s ease;
}
.btn-share:hover {
  background: #f8fafc;
}
.btn-share:active {
  transform: translateY(1px);
}
.btn-share.fb {
  color: #1452d4;
  border-color: #d9e3ff;
  background: #f4f7ff;
}
.btn-share.wa {
  color: #128c7e;
  border-color: #cfeee9;
  background: #f0fbf9;
}

.share-toast__close {
  background: transparent;
  border: 0;
  font-size: 20px;
  line-height: 1;
  color: #6b7280;
  padding: 4px 8px;
  cursor: pointer;
  border-radius: 8px;
}
.share-toast__close:hover {
  background: #f3f4f6;
  color: #111827;
}

/* Progress bar (CSS فقط) */
.share-toast__progress {
  height: 3px;
  width: 100%;
  background: linear-gradient(90deg, #1d4ed8, #22c55e);
  border-radius: 0 0 12px 12px;
  animation: toast-progress 5s linear forwards;
}
@keyframes toast-progress {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

/* Transition */
.share-toast-enter-from,
.share-toast-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
.share-toast-enter-active,
.share-toast-leave-active {
  transition: all 0.18s ease;
}

/* احترام تفضيل تقليل الحركة */
@media (prefers-reduced-motion: reduce) {
  .share-toast__progress {
    animation: none;
  }
  .share-toast-enter-active,
  .share-toast-leave-active {
    transition: none;
  }
}
</style>
