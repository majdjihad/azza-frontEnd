<script setup>
import { useRuntimeConfig } from "#app";
import { useMain } from "~/composables/useMain";

// بعد تعريف listing / pageUrl / mainImage / metaDescription
useSeo(() => {
  const v = listing.value || {};
  return {
    title: v.title ? `${v.title} | منصّة AZZA` : "منصّة AZZA",
    description: (
      v.description ||
      v.title ||
      "اكتشف تفاصيل المنتج المعروض للبيع."
    ).slice(0, 150),
    image: mainImage.value, // لا تستخدم product.image_url لأنه غير معرّف
    canonicalPath: `/products/${route.params.id}`,
    type: "product",
    product: {
      name: v.title || "",
      description: v.description || "",
      image: v.images?.[0] || "/media/avatars/logo.png",
      price: v.price ?? undefined,
      priceCurrency: v.currency || undefined,
    },
  };
});

// ويمكن الاكتفاء بهذا عن useHead الثاني، أو إن أردت العنوان فقط:
useHead(() => ({
  title: "تفاصيل المنتج",
}));
const route = useRoute();
const { getProductDetails } = useMain();
const runtimeConfig = useRuntimeConfig();

/* ===== Helper: بناء روابط مطلقة ===== */
function absUrl(pathOrUrl) {
  const base =
    runtimeConfig?.public?.siteUrl ||
    (process.client && typeof window !== "undefined"
      ? window.location.origin
      : "");
  try {
    return new URL(pathOrUrl || "/", base).href;
  } catch {
    // إن كانت pathOrUrl مطلقة أصلاً
    return pathOrUrl;
  }
}

/* ============ جلب البيانات عبر SSR ============ */
const { data, pending, error } = await useAsyncData(
  () => `product-${route.params.id}`,
  async () => {
    const res = await getProductDetails(route.params.id);
    const root = res?.data ?? res; // { success, message, data } أو مباشر
    return root?.data ?? root; // { product, related_products } أو المنتج مباشرة
  },
  {
    watch: [() => route.params.id],
    server: true,
    lazy: false,
  }
);

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
function mapProductToListing(p) {
  const gallery = Array.isArray(p?.gallery) ? p.gallery : [];
  const galleryUrls = gallery
    .map((ch) => (typeof ch === "string" ? ch : ch?.url || ch?.path || ""))
    .filter(Boolean);
  const images = [p?.main_image, ...galleryUrls].filter(Boolean);

  const customFields = Array.isArray(p?.product_custom_field_values)
    ? p.product_custom_field_values
        .map((row) => ({
          label: row?.custom_field?.name || "",
          value: row?.value ?? "",
        }))
        .filter((x) => x.label && String(x.value).length)
    : [];

  return {
    id: p?.id,
    title: p?.name || "",
    location: p?.city_name || p?.city?.name || "",
    publishedAt: p?.created_at || "",
    price: p?.price ?? null,
    currency: p?.currency || "",
    images,
    description: p?.description || "",
  };
}

/* ====== بيانات العرض المحسوبة من SSR ====== */
const payload = computed(() => data.value ?? null);
const productRaw = computed(
  () => payload.value?.product ?? payload.value ?? null
);

const listing = computed(() => {
  if (!productRaw.value) {
    return {
      id: route.params.id,
      title: "",
      location: "",
      publishedAt: "",
      price: null,
      currency: "",
      images: [],
      description: "",
    };
  }
  return mapProductToListing(productRaw.value);
});

const relatedProducts = computed(() =>
  Array.isArray(payload.value?.related_products)
    ? payload.value.related_products
    : []
);

/* ====== OG/Twitter Meta (SSR) ====== */
const pageUrl = computed(() => absUrl(`/products/${listing.value.id}`));
const mainImage = computed(() =>
  absUrl(listing.value.images?.[0] || "/media/placeholder.png")
);

const metaDescription = computed(() => {
  const base = (listing.value.description || `${listing.value.title}`)
    .replace(/\s+/g, " ")
    .trim();
  return base.length > 180 ? base.slice(0, 177) + "…" : base;
});

useHead(() => {
  const title = listing.value.title || "تفاصيل المنتج";
  const desc = metaDescription.value;
  const img = mainImage.value;
  const url = pageUrl.value;
  const siteName = runtimeConfig?.public?.siteName || "";

  // JSON-LD (اختياري لكنه مفيد للسيو)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: title,
    description: desc,
    image: img,
    url,
    offers: listing.value.price
      ? {
          "@type": "Offer",
          price: String(listing.value.price),
          priceCurrency: listing.value.currency || "USD",
          availability: "https://schema.org/InStock",
        }
      : undefined,
  };

  return {
    title,
    link: [{ rel: "canonical", href: url }],
    meta: [
      // Open Graph
      { property: "og:type", content: "product" },
      { property: "og:title", content: title },
      { property: "og:description", content: desc },
      { property: "og:image", content: img },
      { property: "og:url", content: url },
      { property: "og:site_name", content: siteName },
      { property: "og:locale", content: "ar_AR" },

      // Product-specific (اختياري)
      listing.value.price
        ? {
            property: "product:price:amount",
            content: String(listing.value.price),
          }
        : undefined,
      listing.value.currency
        ? {
            property: "product:price:currency",
            content: listing.value.currency,
          }
        : undefined,

      // Twitter
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: desc },
      { name: "twitter:image", content: img },
    ].filter(Boolean),
    script: [
      {
        type: "application/ld+json",
        innerHTML: JSON.stringify(jsonLd),
      },
    ],
  };
});

/* ============ سلايدر المنتجات ذات الصلة ============ */
const perSlide = 4;
const chunk = (arr, size) => {
  const out = [];
  if (!Array.isArray(arr)) return out;
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};
const productSlides = computed(() => chunk(relatedProducts.value, perSlide));
const carouselId = "relatedProductsCarousel";

/* ============ مشاركة احترافية (Toast) ============ */
const shareToastOpen = ref(false);
let hideTimer = null;
let startedAt = 0;
let remaining = 5000;

const shareText = computed(() => {
  const parts = [];
  if (listing.value.title) parts.push(listing.value.title);
  if (listing.value.price)
    parts.push(
      `السعر: ${listing.value.price} ${listing.value.currency || ""}`.trim()
    );
  if (listing.value.location) parts.push(`المكان: ${listing.value.location}`);
  return parts.join(" • ");
});

const shareUrls = computed(() => ({
  fb: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    pageUrl.value
  )}&quote=${encodeURIComponent(shareText.value)}`,
  wa: `https://wa.me/?text=${encodeURIComponent(
    `${shareText.value} ${pageUrl.value}`
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

// إغلاق Toast بـ Escape
onMounted(() => {
  const onKey = (e) => e.key === "Escape" && closeShareToast();
  window.addEventListener("keydown", onKey);
  onBeforeUnmount(() => window.removeEventListener("keydown", onKey));
});
</script>

<template>
  <div class="container py-4 py-lg-5">
    <SkeletonPageDetails v-if="pending" :showSidebar="true" />
    <div v-else-if="error" class="alert alert-warning">
      تعذّر الجلب من الـ API.
    </div>

    <div v-else>
      <div class="d-flex align-items-center py-9">
        <NuxtLink to="/" class="fs-5 m-0 fw-medium text-primary d-inline"
          >الرئيسية</NuxtLink
        >
        <Icon
          v-if="listing.title"
          name="mdi:chevron-left-circle-outline"
          class="fs-3 fw-medium m-0 text-muted"
        />
        <span v-if="listing.title" class="fs-5 fw-medium m-0 text-muted">
          {{ listing.title || "تفاصيل المنتج" }}
        </span>
      </div>

      <div class="row g-4 flex-row-reverse">
        <main class="col-lg-8 order-1 order-lg-2">
          <div class="card border-0 p-9">
            <div
              class="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-2 mb-8"
            >
              <div>
                <h2 class="mb-1" v-if="listing.title">{{ listing.title }}</h2>
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
                  <NuxtImg
                    :src="listing.images[0]"
                    class="w-100 rounded-1"
                    alt="الصورة الرئيسية"
                  />
                </div>
              </div>
                            <div class="col-md-4 col-6" v-if="listing.images.length > 1">
                <div class="gallery-thumbs d-md-grid d-flex gap-3">
                  <NuxtImg
                    v-for="(img, i) in listing.images.slice(1, 3)"
                    :key="i"
                     :src="img"
                    class="w-100 rounded-1"
                    alt="الصور الفرعية"
                  />
                </div>
              </div>
                <div class="gallery-thumbs row p-0" v-if="listing.images.length > 3">
                  <NuxtImg
                    v-for="(img, i) in listing.images.slice(3, listing.images.length)"
                    :src="img"
                    :key="i"
                    style="border-radius: 10px !important"
                    class="col-4 px-2 rounded-1"
                    alt="الصور الفرعية"
                  />
                </div>
            </div>

            <!-- الوصف -->
            <div class="my-4" v-if="listing.description">
              <p
                class="mb-0 fs-7 small-note fw-normal"
                style="color: #000000b2 !important"
              >
                {{ listing.description }}
              </p>
            </div>

            <!-- تفاصيل إضافية -->
            <div
              class="ads-data"
              v-if="productRaw?.product_custom_field_values?.length"
            >
              <div class="py-4"><h4 class="pb-1">تفاصيل إضافية</h4></div>

              <template
                v-if="productRaw?.product_custom_field_values?.length || false"
              >
                {{ productRaw?.product_custom_field_values?.length }}
                <!-- لو احتجت عرض حقول المنتج مباشرة من raw -->
              </template>

              <template v-else>
                <div class="text-center text-muted py-4">
                  لا توجد بيانات إضافية.
                </div>
              </template>
            </div>
          </div>
        </main>

        <aside class="col-lg-4 order-2 order-lg-1">
          <div class="card mb-3">
            <div
              class="card-body d-flex justify-content-around align-items-center p-2 py-4"
            >
              <Icon name="ic:round-local-offer" class="ms-1 price-icon fs-1" />
              <div class="d-flex align-items-cente">
                <span class="fs-1 fw-bold text-primary">{{
                  listing.price ?? "000.00"
                }}</span>
                <span class="fs-1 text-primary fw-bold ms-1">{{
                  listing.currency
                }}</span>
                <span class="fs-8 me-1 text-muted" v-if="listing.price"
                  >(قابل للتفاوض)</span
                >
              </div>
              <Icon name="ic:round-local-offer" class="ms-1 big-price-icon" />
            </div>
          </div>
          <div class="card mb-3">
            <div class="card-body p-0">
              <h3 class="mb-3 border-bottom pb-3 pt-8 mx-4 fs-4 fw-bold">
                بيانات الناشر
              </h3>
              <NuxtLink to="/products" class="m-auto mb-3 text-center">
                <div>
                  <NuxtImg
                    src="~/public/media/avatars/logo.png"
                    class="rounded-circle border"
                    width="83"
                    height="83"
                    :alt="listing.publisher?.name"
                  />
                  <div><h3 class="fw-bold mt-3">AZZA</h3></div>
                </div>
              </NuxtLink>
              <NuxtLink
                to="/products"
                class="d-block text-primary fw-medium my-3 text-decoration-underline text-center fs-6 mb-2"
              >
                عرض جميع المنتجات
              </NuxtLink>
              <div class="user-data gap-2 my-3 pb-3 px-3">
                <NuxtLink
                  :to="`tel:${runtimeConfig.public.companyPhone}`"
                  class="user-phone d-flex w-md-100 w-75 mx-auto align-items-center btn p-0 mb-4"
                >
                  <span class="p-6 bg-primary rounded">
                    <Icon
                      name="material-symbols:phone-in-talk-watchface-indicator"
                      class="text-white fs-1"
                    />
                  </span>
                  <div class="d-flex flex-column rounded">
                    <span class="text-muted fw-normal fs-7 text-end"
                      >تواصل عبر الجوال</span
                    >
                    <span class="fw-semibold text-end fw-medium fs-6">{{
                      runtimeConfig.public.companyPhone
                    }}</span>
                  </div>
                </NuxtLink>
                <NuxtLink
                  target="_blank"
                  rel="noopener noreferrer"
                  :to="`https://wa.me/${runtimeConfig.public.companyPhone}`"
                  class="user-whatsapp d-flex w-md-100 w-75 mx-auto align-items-center btn p-0 mb-4"
                >
                  <span class="p-6 rounded" style="background-color: #4fad52">
                    <Icon name="bx:bxl-whatsapp" class="text-white fs-1" />
                  </span>
                  <div class="d-flex flex-column rounded">
                    <span class="text-muted fw-normal fs-7 text-end"
                      >تواصل عبر الواتساب</span
                    >
                    <span class="fw-semibold text-end fw-medium fs-6">{{
                      runtimeConfig.public.companyPhone
                    }}</span>
                  </div>
                </NuxtLink>
                <NuxtLink
                  :to="`mailto:runtimeConfig.public.companyEmail`"
                  class="user-email d-flex w-md-100 w-75 mx-auto align-items-center btn p-0 mb-4"
                >
                  <span class="p-6 rounded" style="background-color: #a5acb9">
                    <Icon
                      name="material-symbols:stacked-email-rounded"
                      class="text-white fs-1"
                    />
                  </span>
                  <div class="d-flex flex-column rounded">
                    <span class="text-muted fw-normal fs-7 text-end"
                      >تواصل عبر البريد الالكتروني</span
                    >
                    <span class="fw-semibold text-end fw-medium fs-6">{{
                      runtimeConfig.public.companyEmail
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
                  <p class="p-0 col-10 text-muted">
                    قابل البائع أو المشتـــري في مكان عام وآمــن مثــل المولات
                    محطات الوقود، أو بالقرب من المترو.
                  </p>
                </li>
                <li class="row gap-0">
                  <Icon
                    name="material-symbols:check-circle"
                    class="fs-2 text-primary col-md-2 col-1"
                  />
                  <p class="p-0 col-10 text-muted">
                    يُفضل أن تصطحب معك شخصًا آخـر عنـد إتمــام أي لقــاء.
                  </p>
                </li>
                <li class="row gap-0">
                  <Icon
                    name="material-symbols:check-circle"
                    class="fs-2 text-primary col-md-2 col-1"
                  />
                  <p class="p-0 col-10 text-muted">
                    تحقّق من المنتج بعناية قبــل الشــراء، وتأكــد من أنه
                    يطابــق المواصفات المتفق عليها والسعر المعروض.
                  </p>
                </li>
                <li class="row gap-0">
                  <Icon
                    name="material-symbols:check-circle"
                    class="fs-2 text-primary col-md-2 col-1"
                  />
                  <p class="p-0 col-10 text-muted">
                    لا ترسل أو تدفع أي مبلغ مالي قبل معاينة المنتــج والتأكــد
                    منه بشكل كامل.
                  </p>
                </li>
                <li class="row gap-0">
                  <Icon
                    name="material-symbols:check-circle"
                    class="fs-2 text-primary col-md-2 col-1"
                  />
                  <p class="p-0 col-10 text-muted">
                    تأكد أيضًا مـن أن المنتج غيــر مســــروق أو مخالــف
                    للقوانيـــن المحلية.
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
      <!-- منتجات مشابهة -->
      <section
        class="offers-section container my-4 py-4 px-3 px-sm-4 bg-secandary"
      >
        <div class="d-flex justify-content-between offers-header mb-3">
          <div>
            <p class="fs-6 offers-subtitle text-muted">مقترحات لك</p>
            <h2 class="fs-2 fw-medium mb-1">
              <template v-if="relatedProducts.length">منتجات مشابهة</template>
            </h2>
          </div>
          <div
            class="d-flex align-items-center gap-2 offers-toolbar"
            v-if="relatedProducts.length > perSlide"
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
          v-if="relatedProducts.length"
        >
          <div class="carousel-inner">
            <div
              v-for="(group, idx) in productSlides"
              :key="'rp-' + idx"
              :class="['carousel-item', { active: idx === 0 }]"
            >
              <div class="row g-3 g-md-4">
                <div
                  v-for="item in group"
                  :key="item.id"
                  class="col-12 col-sm-6 col-lg-3"
                >
                  <ProductCard :item="item" :currency="item.currency" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center text-muted py-5">
          لا توجد منتجات ذات صلة لعرضها.
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
            <div class="share-toast__title">شارك المنتج</div>
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
  border-right: none !important;
  border-top-right-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
  padding: 7px 10px;
  width: 100%;
}
.user-data .user-phone {
  border: #1839a0 1px dashed !important;
}
.user-data .user-whatsapp {
  border: #4fad52 1px dashed !important;
}
.user-data .user-email {
  border: #a5acb9 1px dashed !important;
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

/* ====== Share Toast ====== */
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
.price-icon {
  color: #a5acb9 !important;
  transform: rotateY(180deg);
}
.big-price-icon {
  font-size: 70px !important;
  color: #a5acb91a !important;
}
@keyframes toast-progress {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}
.text-muted {
  color: #73818c !important;
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
