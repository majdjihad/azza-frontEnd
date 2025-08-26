// Import PrimeVue theme utilities
import Aura from "@primevue/themes/aura";

export default defineNuxtConfig({
  // Enable Nuxt DevTools for development
  devtools: { enabled: true },

  // Register Nuxt modules
  modules: [
    "@pinia/nuxt", // State management
    "nuxt-icon", // Icon system
    "@primevue/nuxt-module", // UI component library
  ],

  // PrimeVue configuration
  primevue: {
    options: {
      theme: {
        preset: Aura,
        option: {
          prefix: "p",
          cssLayer: false,
        },
      },
    },
  },

  // Global CSS imports
  css: [
    "bootstrap/dist/css/bootstrap.css",
    "~/assets/plugins/global/plugins.bundle.css",
    "~/assets/css/style.bundle.css",
    "primeicons/primeicons.css",
    "~/assets/css/style.css",
    "filepond/dist/filepond.min.css",
    "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css",
  ],

  // Vue plugins
  plugins: [
    "~/plugins/toastification.js", // Toast notifications
    "~/plugins/clickOutside.js", // Click outside directive
  ],

  // Build configuration
  build: {
    transpile: ["vue-toastification"],
  },

  // App-wide head configuration
  app: {
    head: {
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

  // Runtime configuration with environment variables
  runtimeConfig: {
    public: {
      backendUrl: process.env.NUXT_PUBLIC_BACKEND_URL,
      frontendUrl: process.env.NUXT_PUBLIC_FRONTEND_URL,
    },
  },

  // Auto-import utilities
  imports: {
    dirs: ["./utils"],
  },

  // Disable server-side rendering globally
  ssr: false,

  // Route-specific SSR rules
  routeRules: {
    "/": { ssr: true }, // Enable SSR only for landing page
  },

  // Set compatibility date for Nuxt features
  compatibilityDate: "2025-08-01",
});
