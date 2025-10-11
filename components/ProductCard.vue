<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRuntimeConfig } from "#app";

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
});
const config = useRuntimeConfig();

// السعر بشكل منسّق
const formattedPrice = computed(() =>
  Number(props.item?.price ?? 0).toLocaleString("en-US")
);

/* ================== مشاركة المنتج - Toast ================== */
const runtimeConfig = useRuntimeConfig?.();

function getOrigin() {
  if (process.client && typeof window !== "undefined")
    return window.location.origin;
  return runtimeConfig?.public?.siteUrl || "https://azza-ak.com/";
}

const productUrl = computed(() => {
  const origin = getOrigin();
  try {
    return new URL(`/products/${props.item.id}`, origin).href;
  } catch {
    return `${origin}/products/${props.item.id}`;
  }
});

const shareText = computed(() => {
  const parts = [];
  if (props.item?.name || props.item?.title)
    parts.push(props.item.name || props.item.title);
  if (props.item?.price)
    parts.push(
      `السعر: ${props.item.price} ${props.item?.currency || ""}`.trim()
    );
  const city = props.item?.city?.name || props.item?.city;
  if (city) parts.push(`المكان: ${city}`);
  return parts.join(" • ");
});

const shareUrls = computed(() => ({
  fb: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    productUrl.value
  )}&quote=${encodeURIComponent(shareText.value)}`,
  wa: `https://wa.me/?text=${encodeURIComponent(
    `${shareText.value} ${productUrl.value}`
  )}`,
}));

const shareToastOpen = ref(false);
let hideTimer = null;
let startedAt = 0;
let remaining = 5000; // ms

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

// إغلاق التوست بـ Escape
onMounted(() => {
  const onKey = (e) => e.key === "Escape" && closeShareToast();
  window.addEventListener("keydown", onKey);
  onBeforeUnmount(() => window.removeEventListener("keydown", onKey));
});
</script>

<template>
  <div class="offer-card h-100 d-flex flex-column position-relative">
    <NuxtLink :to="`/products/${item.id}`" class="offer-media">
      <NuxtImg
        :src="item?.main_image || item?.image"
        :alt="item.title || item.name"
      />
    </NuxtLink>

    <div class="offer-body">
      <NuxtLink :to="`/products/${item.id}`" class="offer-title text-dark h3">
        {{ item.name || item.title }}
      </NuxtLink>
    </div>

    <div
      class="mt-auto d-flex align-items-center justify-content-between px-3 pb-3"
    >
      <div class="text-end px-3 text-primary">
        <span class="price ms-1">{{ formattedPrice }}</span>
        <span class="badge-currency small">{{ item.currency }}</span>
      </div>

      <div class="d-flex align-items-center gap-2">
        <!-- واتساب (إن توفر رقم) -->
        <NuxtLink
          rel="noopener noreferrer"
          :to="config.public.whatsappUrl"
          class="btn btn-sm p-1"
          aria-label="تواصل"
          target="_blank"
        >
          <Icon name="akar-icons:whatsapp-fill" size="24" />
        </NuxtLink>
        <!-- مشاركة: Toast مخصص لفيسبوك/واتساب -->
        <button
          class="btn btn-sm p-1"
          aria-label="مشاركة"
          @click="openShareToast"
        >
          <Icon name="mdi:share-variant-outline" size="24" />
        </button>
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
            <Icon name="mdi:share-variant" size="20" />
          </div>

          <div class="share-toast__text">
            <div class="share-toast__title">شارك المنتج</div>
            <div class="share-toast__sub">{{ item.name || item.title }}</div>
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
</template>

<style scoped>
.offer-card {
  border: 1px solid #eef0f4;
  border-radius: 1.25rem;
  overflow: hidden;
  background: #fff;
  transition: 0.25s ease;
}
.offer-card:hover img {
  filter: grayscale(0.5);
}
.offer-card:hover .offer-title {
  text-decoration: underline;
}

/* الصورة */
.offer-media {
  aspect-ratio: 16/11;
  background: #f1f3f8;
  overflow: hidden;
}
.offer-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* النص */
.offer-body {
  padding: 1rem 1rem 0.5rem 1rem;
}
.offer-title {
  font-weight: 700;
  font-size: 1.05rem;
  margin: 0.25rem 0 0.35rem;
}
.offer-meta {
  color: var(--muted);
  font-size: 0.9rem;
}

/* السعر */
.price {
  color: var(--primary);
  font-weight: 800;
}
.badge-currency {
  color: var(--primary);
  font-weight: 700;
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
  padding: 10px 12px;
  min-width: min(96vw, 520px);
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  align-items: center;
  gap: 10px;
}
.share-toast__icon {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  background: #f2f6ff;
  color: #1d4ed8;
  border-radius: 8px;
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
  font-size: 18px;
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

/* Progress bar */
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

/* تقليل الحركة */
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
