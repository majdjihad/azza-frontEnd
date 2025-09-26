// nuxt.config.ts
import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    "@pinia/nuxt",
    "nuxt-icon",
    "@nuxt/image",
    "@nuxtjs/robots",
    "@nuxtjs/sitemap",
  ],

  // Sitemap (بدون hostname/siteUrl هنا)
  sitemap: {
    autoLastmod: true,
    defaults: { changefreq: "daily", priority: 0.7 },
    exclude: ["/admin/**", "/dashboard/**"],
    experimentalCompression: true,
  },

  robots: {
    groups: [
      { userAgent: "*", allow: ["/"], disallow: ["/admin", "/dashboard"] },
    ],
    sitemap: [
      `${
        process.env.NUXT_PUBLIC_SITE_URL || "https://azza-ak.com"
      }/sitemap.xml`,
    ],
  },

  css: [
    "bootstrap/dist/css/bootstrap.css",
    "~/assets/plugins/global/plugins.bundle.css",
    "~/assets/css/style.bundle.css",
    "~/assets/css/style.css",
    "filepond/dist/filepond.min.css",
    "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css",
  ],

  plugins: ["~/plugins/toastification.js", "~/plugins/clickOutside.js"],
  build: { transpile: ["vue-toastification"] },

  experimental: {
    renderJsonPayloads: true,
    respectNoSSRHeader: true, // لتعطيل SSR بهيدر x-nuxt-no-ssr
  },

  app: {
    head: {
      htmlAttrs: { lang: "ar", dir: "rtl" },
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content:
            "منصة عربية متكاملة للإعلانات المبوبة — أضف إعلانك بسهولة وتصفح عروض العقارات، الأجهزة، الأثاث، المفقودات والخدمات. تواصل مباشر وآمن بين البائع والمشتري.",
        },
      ],
            script: [
        {
          // Metronic plugins bundle
          type: "text/javascript",
          src: "https://preview.keenthemes.com/metronic8/demo32/assets/plugins/global/plugins.bundle.js",
        },
        {
          // Metronic script bundle
          type: "text/javascript",
          src: "https://preview.keenthemes.com/metronic8/demo32/assets/js/scripts.bundle.js",
        },
      ],

    },
  },

  runtimeConfig: {
    public: {
      backendUrl: process.env.NUXT_PUBLIC_BACKEND_URL,
      frontendUrl: process.env.NUXT_PUBLIC_FRONTEND_URL,
      companyName: process.env.NUXT_PUBLIC_COMPANY_NAME || "",
      companyPhone: process.env.NUXT_PUBLIC_COMPANY_PHONE || "",
      companyEmail: process.env.NUXT_PUBLIC_COMPANY_EMAIL || "",
      companyAddress: process.env.NUXT_PUBLIC_COMPANY_ADDRESS || "",
      facebookUrl: process.env.NUXT_PUBLIC_FACEBOOK_URL || "",
      instagramUrl: process.env.NUXT_PUBLIC_INSTAGRAM_URL || "",
      twitterUrl: process.env.NUXT_PUBLIC_TWITTER_URL || "",
      whatsappUrl: process.env.NUXT_PUBLIC_WHATSAPP_URL || "",
      tiktokUrl: process.env.NUXT_PUBLIC_TIKTOK_URL || "",
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || "",
      siteDescription:
        "منصة إلكترونية عربية لبيع وشراء كل شيء: عقارات، أجهزة، أثاث، مفقودات وخدمات — تواصل آمن ومباشر بين البائعين والمشترين.",
      siteImage: "/media/avatars/logo.png",
    },
  },

  // @nuxt/image
  image: {
    screens: { xs: 320, sm: 640, md: 768, lg: 1024, xl: 1280, xxl: 1536 },
    quality: 75,
    format: ["webp", "avif", "jpeg"],
  },

  nitro: { compressPublicAssets: true },

  ssr: true,

  routeRules: {
    "/": { prerender: true },
    "/categories/**": { isr: 3600 },
    "/ads/**": { swr: 1800 },

    // تعطيل SSR لهذه المسارات عبر الهيدر
    "/admin": { headers: { "x-nuxt-no-ssr": "1" } },
    "/admin/**": { headers: { "x-nuxt-no-ssr": "1" } },
    "/dashboard": { headers: { "x-nuxt-no-ssr": "1" } },
    "/dashboard/**": { headers: { "x-nuxt-no-ssr": "1" } },

    "/images/**": {
      headers: { "cache-control": "public, max-age=31536000, immutable" },
    },
  },

  imports: { dirs: ["./utils"] },
  compatibilityDate: "2025-08-01",
});
