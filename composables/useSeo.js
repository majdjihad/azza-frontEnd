// composables/useSeo.js
export function useSeo(opts = {}) {
  const route = typeof useRoute === "function" ? useRoute() : { fullPath: "/" };
  const runtime =
    typeof useRuntimeConfig === "function"
      ? useRuntimeConfig()
      : { public: {} };
  const conf = (runtime && runtime.public) || {};

  // Helpers آمنة
  const safeStr = (v, fallback = "") => (v == null ? fallback : String(v));
  const trimEndSlashes = (s) => safeStr(s).replace(/\/+$/, "");
  const trimStartSlashes = (s) => safeStr(s).replace(/^\/+/, "");
  const isAbsUrl = (u) => /^https?:\/\//i.test(safeStr(u));

  // Base URL آمن (من runtime config أو origin في المتصفح)
  const base = trimEndSlashes(
    conf.siteUrl ||
      (typeof window !== "undefined" ? window.location.origin : "")
  );

  // Canonical URL
  const url = opts.canonicalPath
    ? `${base}/${trimStartSlashes(opts.canonicalPath)}`
    : `${base}${safeStr(route.fullPath, "/")}`;

  // قيم افتراضية لو ما انوجدت في runtime
  const title = opts.title || conf.siteName || "المنصّة";
  const description =
    opts.description ||
    conf.siteDescription ||
    "منصّة للإعلانات العربية تسهّل البيع والشراء.";
  const rawImage = opts.image || conf.siteImage || "/media/avatars/logo.png";
  const image = isAbsUrl(rawImage)
    ? rawImage
    : `${base}/${trimStartSlashes(rawImage)}`;
  const type = opts.type || "website";

  // <meta> الأساسية + OpenGraph + Twitter
  useSeoMeta({
    title,
    ogTitle: title,
    twitterTitle: title,

    description,
    ogDescription: description,
    twitterDescription: description,

    ogType: type,
    ogUrl: url,
    ogImage: image,
    twitterCard: "summary_large_image",
    twitterImage: image,

    robots: opts.noindex ? "noindex,nofollow" : "index,follow",
  });

  // canonical
  useHead({ link: [{ rel: "canonical", href: url }] });

  // Article JSON-LD
  if (type === "article") {
    const articleLd = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: title,
      description,
      image: [image],
      datePublished: opts.publishedAt,
      dateModified: opts.modifiedAt || opts.publishedAt,
      mainEntityOfPage: url,
    };
    useHead({
      script: [
        { type: "application/ld+json", children: JSON.stringify(articleLd) },
      ],
    });
  }

  // Product/Ad JSON-LD
  if (type === "product" && opts.product) {
    const p = opts.product;
    const prodImg = isAbsUrl(p.image)
      ? p.image
      : `${base}/${trimStartSlashes(p.image || "")}`;

    const productLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: p.name,
      description: p.description,
      image: [prodImg],
      url,
      offers: {
        "@type": "Offer",
        priceCurrency: p.priceCurrency,
        price: String(p.price),
        availability: p.availability
          ? `https://schema.org/${p.availability}`
          : undefined,
        itemCondition: p.condition
          ? `https://schema.org/${p.condition}`
          : undefined,
      },
    };
    // إزالة المفاتيح undefined حتى يبقى JSON نظيف
    if (!productLd.offers.availability) delete productLd.offers.availability;
    if (!productLd.offers.itemCondition) delete productLd.offers.itemCondition;

    useHead({
      script: [
        { type: "application/ld+json", children: JSON.stringify(productLd) },
      ],
    });
  }
}
