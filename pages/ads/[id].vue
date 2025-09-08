<script setup>
useHead({ title: "تفاصيل الإعلان" });

import {
  ref,
  reactive,
  computed,
  onMounted,
  watch,
  onBeforeUnmount,
} from "vue";
import { useRuntimeConfig } from "#app";
import { useMain } from "~/composables/useMain";

const route = useRoute();
const runtimeConfig = useRuntimeConfig?.();

const pending = ref(true);
const loadError = ref(false);
const { getAdDetails } = useMain();

const listing = reactive({
  id: route.params.id,
  title: "",
  location: "",
  publishedAt: "",
  price: null,
  currency: "",
  category: "",
  images: [],
  description: "",
  publisher: null,
  details: {},
  customFields: [],
});

const relatedProducts = ref([]);
const relatedAds = ref([]);

/* ============ أدوات مشتركة ============ */
function humanDate(d) {
  if (!d) return "";
  try {
    const LOCALE = "ar-EG-u-nu-latn";
    const dt = new Date(d);
    const dateStr = new Intl.DateTimeFormat(LOCALE, {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(dt);
    const timeRaw = new Intl.DateTimeFormat(LOCALE, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(dt);
    const time = timeRaw.replace(/\s([صم])$/, "$1");
    return `${dateStr} - ${time}`;
  } catch {
    return d;
  }
}

/* ============ تحويل استجابة API -> نموذج العرض ============ */
function mapAdToListing(d) {
  const ad = d?.ad ?? d;

  const gallery = Array.isArray(ad?.gallery) ? ad.gallery : [];
  const galleryUrls = gallery
    .map((it) => (typeof it === "string" ? it : it?.url || it?.path || ""))
    .filter(Boolean);
  const images = [ad?.main_image, ...galleryUrls].filter(Boolean);

  const publisher = ad?.publisher || ad?.user || null;

  const customFields = Array.isArray(ad?.ad_custom_field_values)
    ? ad.ad_custom_field_values
        .map((row) => ({
          label: row?.custom_field?.name || "",
          value: row?.value ?? "",
        }))
        .filter((x) => x.label && String(x.value).length)
    : [];

  return {
    id: ad?.id,
    title: ad?.title || ad?.name || "",
    location: ad?.city_name || ad?.city?.name || "",
    publishedAt: ad?.approved_at || "",
    price: ad?.price ?? null,
    currency: ad?.currency || "",
    category:
      ad?.category_name ||
      ad?.subcategory?.category?.name ||
      ad?.subcategory?.category_name ||
      "",
    images,
    description: ad?.description || "",
    publisher: publisher
      ? {
          id: ad?.user_id || publisher?.id || "",
          name: ad?.user_name || publisher?.name || "",
          avatar: ad?.user_photo || publisher?.image || publisher?.photo || "",
          phone: ad?.whatsapp || "",
          whatsapp: ad?.whatsapp || "",
          email: ad?.email || "",
        }
      : null,
    details: {},
    customFields,
  };
}

/* ============ الجلب ============ */
async function fetchDetails() {
  pending.value = true;
  loadError.value = false;
  try {
    const res = await getAdDetails(route.params.id);
    const data = res?.data ?? res;
    const payload = data?.data ?? data;
    if (payload && typeof payload === "object") {
      Object.assign(listing, mapAdToListing(payload));
      relatedProducts.value = Array.isArray(payload.products)
        ? payload.products
        : [];
      relatedAds.value = Array.isArray(payload.related_ads)
        ? payload.related_ads
        : [];
    } else {
      loadError.value = true;
    }
  } catch {
    loadError.value = true;
  } finally {
    pending.value = false;
  }
}

onMounted(fetchDetails);
watch(
  () => route.params.id,
  async () => {
    listing.id = route.params.id;
    await fetchDetails();
  }
);

/* ============ سلايدر العناصر ذات الصلة ============ */
const chunk = (arr, size) => {
  const out = [];
  if (!Array.isArray(arr)) return out;
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};
const perSlide = 4;
const productSlides = computed(() => chunk(relatedProducts.value, perSlide));
const relatedAdSlides = computed(() => chunk(relatedAds.value, perSlide));
const carouselId = "offersCarousel";

/* ============ مشاركة احترافية (Toast) ============ */
function getOrigin() {
  if (process.client && typeof window !== "undefined")
    return window.location.origin;
  return runtimeConfig?.public?.siteUrl || "https://example.com";
}

const adUrl = computed(() => {
  const origin = getOrigin();
  try {
    return new URL(`/ads/${listing.id}`, origin).href;
  } catch {
    return `${origin}/ads/${listing.id}`;
  }
});

const shareText = computed(() => {
  const parts = [];
  if (listing?.title) parts.push(listing.title);
  if (listing?.category) parts.push(`(${listing.category})`);
  if (listing?.price)
    parts.push(`السعر: ${listing.price} ${listing?.currency || ""}`.trim());
  if (listing?.location) parts.push(`المكان: ${listing.location}`);
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

const shareToastOpen = ref(false);
let hideTimer = null;
let startedAt = 0;
let remaining = 5000;

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

// Escape لإغلاق التوست
onMounted(() => {
  const onKey = (e) => e.key === "Escape" && closeShareToast();
  window.addEventListener("keydown", onKey);
  onBeforeUnmount(() => window.removeEventListener("keydown", onKey));
});
</script>

<template>
  <div class="container py-4 py-lg-5">
    <SkeletonPageDetails v-if="pending" :showSidebar="true" />
    <div v-else-if="loadError" class="alert alert-warning">
      تعذّر الجلب من الـ API.
    </div>

    <div v-else>
      <div class="d-flex align-items-center py-9">
        <h2 class="fs-3 m-0 fw-normal text-primary d-inline">الرئيسية</h2>
        <Icon
          name="mdi:chevron-left-circle-outline"
          class="fs-3 mx-3 text-secondary"
        />
        <h2 class="fs-3 m-0 fw-semibold text-muted">
          {{ listing.category || "—" }}
        </h2>
        <Icon
          name="mdi:chevron-left-circle-outline"
          class="fs-3 mx-3 text-secondary"
        />
        <h2 class="fs-3 m-0 fw-semibold text-muted">
          {{ listing.title || "..." }}
        </h2>
      </div>

      <div class="row g-4 flex-row-reverse">
        <main class="col-lg-9 order-1 order-lg-2">
          <div class="card shadow-sm p-9">
            <div
              class="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-2 mb-8"
            >
              <div>
                <h2 class="mb-1">{{ listing.title || "..." }}</h2>
                <div class="small text-muted">
                  <div
                    class="d-inline-flex align-items-center ms-5"
                    v-if="listing.location"
                  >
                    <Icon
                      class="fs-3 ms-1"
                      name="material-symbols:location-on-rounded"
                    />
                    <span class="fs-5">{{ listing.location }}</span>
                  </div>
                  <div
                    class="d-inline-flex align-items-center ms-5"
                    v-if="listing.publishedAt"
                  >
                    <Icon class="fs-3 ms-1" name="material-symbols:alarm-on" />
                    <span class="fs-5">{{
                      humanDate(listing.publishedAt)
                    }}</span>
                  </div>
                </div>
              </div>

              <div class="d-flex align-items-center gap-2">
                <!-- <button
                  class="btn btn-outline-secondary text-muted border d-flex align-items-center"
                  title="مفضلة"
                >
                  <Icon name="ic:baseline-favorite" class="fs-2" />
                  <span class="fs-3 text-muted me-2">المفضلة</span>
                </button> -->
                <button
                  class="btn btn-outline-secondary text-muted border d-flex align-items-center"
                  title="مشاركة"
                  @click="openShareToast"
                >
                  <Icon name="material-symbols:share" class="fs-3" />
                  <span class="fs-3 text-muted me-2">المشاركة</span>
                </button>
              </div>
            </div>

            <!-- الصور -->
            <div class="row g-3 mb-3" v-if="listing.images?.length">
              <div class="col-md-8">
                <div class="gallery-main">
                  <img
                    :src="listing.images[2] || listing.images[0]"
                    class="w-100 rounded-1"
                    alt=""
                  />
                </div>
              </div>
              <div class="col-md-4 col-6">
                <div class="gallery-thumbs d-md-grid d-flex gap-3">
                  <img
                    v-for="(img, i) in listing.images.slice(0, 2)"
                    :key="i"
                    :src="img"
                    class="w-100 rounded-1"
                    alt=""
                  />
                </div>
              </div>
            </div>

            <!-- الوصف -->
            <div class="my-4" v-if="listing.description">
              <p class="mb-0 fs-4 small-note">{{ listing.description }}</p>
            </div>

            <!-- تفاصيل إضافية -->
            <div class="ads-data">
              <div class="py-4"><h4 class="pb-1">تفاصيل إضافية</h4></div>
              <template v-if="listing.customFields?.length">
                <div class="row g-3">
                  <div
                    v-for="(cf, idx) in listing.customFields"
                    :key="idx"
                    class="col-6 col-md-3"
                  >
                    <div class="p-3 pe-0 text-end">
                      <div class="fs-4 fw-bold">{{ cf.label }}</div>
                      <div class="fs-5 text-muted fw-semibold">
                        {{ cf.value }}
                      </div>
                    </div>
                  </div>
                </div>
              </template>
              <template v-else>
                <div class="text-center text-muted py-4">
                  لا توجد بيانات إضافية.
                </div>
              </template>
            </div>
          </div>
        </main>

        <aside class="col-lg-3 order-2 order-lg-1">
          <div class="card mb-3">
            <div class="card-body d-flex align-items-center">
              <Icon name="ic:round-local-offer" class="fs-1 text-muted ms-1" />
              <span class="fs-1 fw-bold text-primary">{{
                listing.price ?? "—"
              }}</span>
              <span class="fs-9 text-primary fw-bold ms-1">{{
                listing.currency
              }}</span>
              <span class="fs-3 me-3 text-muted" v-if="listing.price"
                >(قابل للتفاوض)</span
              >
            </div>
          </div>

          <div class="card mb-3">
            <div class="card-body p-0">
              <h3 class="mb-3 border-bottom border-dark pb-3 pt-8 mx-4">
                بيانات الناشر
              </h3>

              <NuxtLink
                :to="`/users/${listing.publisher.id}`"
                class="m-auto mb-3 text-center"
                v-if="listing.publisher"
              >
                <div>
                  <img
                    :src="listing.publisher.avatar"
                    class="rounded-circle border"
                    width="100"
                    height="100"
                    :alt="listing.publisher.name"
                  />
                  <h3 class="fw-bold mt-3">{{ listing.publisher.name }}</h3>
                </div>
              </NuxtLink>

              <NuxtLink
                :to="`/users/${listing.publisher.id}`"
                class="d-block text-primary fw-bold my-3 text-decoration-underline text-center fs-3 mb-2"
              >
                عرض جميع المنتجات
              </NuxtLink>

              <div class="user-data gap-2 my-3 pb-3 px-3">
                <NuxtLink
                  :to="`tel:${listing.publisher?.phone}`"
                  class="d-flex w-md-100 w-50 mx-auto align-items-center btn p-0 mb-4"
                  v-if="listing.publisher?.phone"
                >
                  <span class="p-6 bg-primary rounded">
                    <Icon
                      name="material-symbols:phone-in-talk-watchface-indicator"
                      class="text-white fs-1"
                    />
                  </span>
                  <div class="d-flex flex-column rounded">
                    <span class="text-muted text-end">تواصل عبر الجوال</span>
                    <span class="fw-semibold text-end fw-bold">{{
                      listing.publisher.phone
                    }}</span>
                  </div>
                </NuxtLink>

                <NuxtLink
                  :to="`https://wa.me/${listing.publisher?.whatsapp}`"
                  class="d-flex w-md-100 w-50 mx-auto align-items-center btn p-0 mb-4"
                  v-if="listing.publisher?.whatsapp"
                >
                  <span class="p-6 rounded" style="background-color: #4fad52">
                    <Icon name="bx:bxl-whatsapp" class="text-white fs-1" />
                  </span>
                  <div class="d-flex flex-column rounded">
                    <span class="text-muted text-end">تواصل عبر الواتساب</span>
                    <span class="fw-semibold text-end fw-bold">{{
                      listing.publisher.whatsapp
                    }}</span>
                  </div>
                </NuxtLink>

                <NuxtLink
                  :to="`mailto:${listing.publisher?.email}`"
                  class="d-flex w-md-100 w-50 mx-auto align-items-center btn p-0 mb-4"
                  v-if="listing.publisher?.email"
                >
                  <span class="p-6 rounded" style="background-color: #a5acb9">
                    <Icon
                      name="material-symbols:stacked-email-rounded"
                      class="text-white fs-1"
                    />
                  </span>
                  <div class="d-flex flex-column rounded">
                    <span class="text-muted text-end"
                      >تواصل عبر البريد الالكتروني</span
                    >
                    <span class="fw-semibold text-end fw-bold">{{
                      listing.publisher.email
                    }}</span>
                  </div>
                </NuxtLink>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-body">
              <h4 class="mb-3">إرشادات مهمة للمستخدمين</h4>
              <ul class="list-unstyled small-note p-0 m-0">
                <li class="row gap-0">
                  <Icon
                    name="material-symbols:check-circle"
                    class="fs-2 text-primary col-md-2 col-1"
                  />
                  <p class="fs-6 p-0 col-10 text-muted">
                    قابل البائع أو المشتري في مكان عام وآمن مثل المولات ومحطات
                    الوقود.
                  </p>
                </li>
                <li class="row gap-0">
                  <Icon
                    name="material-symbols:check-circle"
                    class="fs-2 text-primary col-md-2 col-1"
                  />
                  <p class="fs-6 p-0 col-10 text-muted">
                    يفضل اصطحاب شخص آخر عند اللقاء.
                  </p>
                </li>
                <li class="row gap-0">
                  <Icon
                    name="material-symbols:check-circle"
                    class="fs-2 text-primary col-md-2 col-1"
                  />
                  <p class="fs-6 p-0 col-10 text-muted">
                    تحقق من المنتج بعناية قبل الشراء.
                  </p>
                </li>
                <li class="row gap-0">
                  <Icon
                    name="material-symbols:check-circle"
                    class="fs-2 text-primary col-md-2 col-1"
                  />
                  <p class="fs-6 p-0 col-10 text-muted">
                    لا تدفع أي مبلغ قبل المعاينة والتأكد من المنتج.
                  </p>
                </li>
                <li class="row gap-0">
                  <Icon
                    name="material-symbols:check-circle"
                    class="fs-2 text-primary col-md-2 col-1"
                  />
                  <p class="fs-6 p-0 col-10 text-muted">
                    تأكد من أن المنتج غير مسروق أو مخالف للقانون.
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </aside>
      </div>

      <!-- العناصر ذات الصلة -->
      <section
        class="offers-section container my-4 py-4 px-3 px-sm-4 bg-secandary"
      >
        <div class="d-flex justify-content-between offers-header mb-3">
          <div>
            <p class="fs-3 offers-subtitle text-muted">مقترحات لك</p>
            <h2 class="fs-1 fw-bold mb-1">
              <template v-if="relatedProducts.length">منتجات مشابهة</template>
              <template v-else-if="relatedAds.length">إعلانات ذات صلة</template>
              <template v-else>لا توجد عناصر ذات صلة</template>
            </h2>
          </div>
          <div
            class="d-flex align-items-center gap-2 offers-toolbar"
            v-if="relatedProducts.length > 4 || relatedAds.length > 4"
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
          </div>
        </div>

        <div
          class="carousel slide"
          :id="carouselId"
          data-bs-ride="false"
          data-bs-interval="0"
          v-if="relatedProducts.length || relatedAds.length"
        >
          <div class="carousel-inner">
            <!-- منتجات -->
            <template v-if="relatedProducts.length">
              <div
                v-for="(group, idx) in productSlides"
                :key="'p-' + idx"
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

            <!-- إعلانات -->
            <template v-else>
              <div
                v-for="(group, idx) in relatedAdSlides"
                :key="'a-' + idx"
                :class="['carousel-item', { active: idx === 0 }]"
              >
                <div class="row g-3 g-md-4">
                  <div
                    v-for="ad in group"
                    :key="ad.id"
                    class="col-12 col-sm-6 col-lg-3"
                  >
                    <AdsCard :ad="ad" />
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>

        <div v-else class="text-center text-muted py-5">
          لا توجد عناصر ذات صلة لعرضها.
        </div>
      </section>
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
            <div class="share-toast__title">شارك الإعلان</div>
            <div class="share-toast__sub">{{ listing.title }}</div>
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
.btn-soft {
  background-color: #f8f9fb;
  border-color: #eef0f3;
}
.gallery-thumbs img {
  height: 154px;
  object-fit: cover;
}
.gallery-main img {
  height: 322px;
  object-fit: cover;
}
.contact-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.user-data div {
  border: black 1px dashed !important;
  border-right: none !important;
  border-top-right-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
  padding: 7px 10px;
  width: 100%;
}
.small-note {
  line-height: 1.7;
}
.ads-data h4 {
  position: relative;
}
.ads-data h4::before {
  content: "";
  width: 80px;
  height: 2px;
  background-color: #071437;
  position: absolute;
  bottom: 0;
  right: 0;
}
.list-dotted li {
  padding-inline-start: 0.5rem;
  position: relative;
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
  color: #fff;
}
@media (max-width: 575.98px) {
  .gallery-main img {
    height: 220px;
  }
}

/* ====== Share Toast (نفس تجربة AdsCard/OfferCard) ====== */
.share-toast {
  position: fixed;
  bottom: 24px;
  inset-inline: 0;
  display: grid;
  place-items: center;
  z-index: 1100;
  pointer-events: none;
}
.share-toast__body {
  pointer-events: auto;
  background: #ffffff;
  color: #111827;
  border: 1px solid #eef0f4;
  border-radius: 14px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
  padding: 10px 12px;
  min-width: min(96vw, 560px);
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
.share-toast-enter-from,
.share-toast-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
.share-toast-enter-active,
.share-toast-leave-active {
  transition: all 0.18s ease;
}
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
