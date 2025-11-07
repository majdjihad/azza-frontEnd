<script setup>
import FavoritesMenu from "~/components/FavoritesMenu.vue";
import NotificationsMenu from "~/components/NotificationsMenu.vue";
import { useAuth } from "~/composables/useAuth";
import { useMain } from "~/composables/useMain";
import { useMainStore } from "~/stores/mainStore";

const mainStore = useMainStore();
const { user, isLoggedIn } = useAuth();
const config = useRuntimeConfig();

useMain();

const favoritesMenuVisible = ref(false);

// ✅ تحميل المفضلات تلقائياً عند تسجيل الدخول
watch(
  () => isLoggedIn.value,
  async (logged) => {
    if (logged) {
      await mainStore.getAllAdsFavorites();
    } else {
      mainStore.adsFavorites = {}; // تصفير عند تسجيل الخروج
    }
  },
  { immediate: true } // ينفذ مباشرة عند تحميل الصفحة
);
onMounted(() => {
  document.querySelectorAll("#mainNavbar .nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      const navbar = document.getElementById("mainNavbar");
      if (navbar && navbar.classList.contains("show")) {
        const bsCollapse = bootstrap.Collapse.getInstance(navbar);
        if (bsCollapse) bsCollapse.hide();
      }
    });
  });
});

async function toggleFavoritesMenu() {
  if (!isLoggedIn.value) return navigateTo("/login");
  favoritesMenuVisible.value = !favoritesMenuVisible.value;
}

const route = useRoute();
const allowedPaths = ["ads", "ads-category-slug"];
const defaultAvatar = "/media/avatars/user.png";
const profile = computed(() => {
  const u = user.value;
  if (!u) return null;
  return {
    name: u.name || "—",
    email: u.email || "",
    avatar: u.photo || defaultAvatar,
  };
});
const showAddButton = computed(() => !allowedPaths.includes(route.name ?? ""));
</script>

<template>
  <header class="header">
    <!-- Row 1 -->
    <div
      class="d-flex justify-content-between bar-link align-items-center py-3 px-3 px-md-9"
    >
      <div class="d-flex align-items-center">
        <template v-if="!isLoggedIn">
          <NuxtLink to="/register" class="text-dark fs-5 mx-2"
            >إنشاء حساب</NuxtLink
          >
        </template>

        <NuxtLink to="/terms-of-use" class="text-dark fs-5 trems-link px-2">
          شروط الاستخدام
        </NuxtLink>
        <NuxtLink to="/privacy-policy" class="text-dark fs-5 mx-2">
          سياسة الخصوصية
        </NuxtLink>
      </div>

      <div class="d-flex flex-row-reverse gap-3 gap-md-6">
        <NuxtLink
          target="_blank"
          rel="noopener noreferrer"
          :to="config.public.facebookUrl"
        >
          <Icon name="fa6-brands:facebook-f" class="fs-3 text-secondary" />
        </NuxtLink>
        <NuxtLink
          target="_blank"
          rel="noopener noreferrer"
          :to="config.public.instagramUrl"
        >
          <Icon name="fa6-brands:instagram" class="fs-3 text-secondary" />
        </NuxtLink>
        <NuxtLink
          target="_blank"
          rel="noopener noreferrer"
          :to="config.public.twitterUrl"
        >
          <Icon name="fa6-brands:x-twitter" class="fs-3 text-secondary" />
        </NuxtLink>
        <NuxtLink
          target="_blank"
          rel="noopener noreferrer"
          :to="config.public.whatsappUrl"
        >
          <Icon name="fa6-brands:whatsapp" class="fs-3 text-secondary" />
        </NuxtLink>
        <NuxtLink
          target="_blank"
          rel="noopener noreferrer"
          :to="config.public.tiktokUrl"
        >
          <Icon name="fa6-brands:tiktok" class="fs-3 text-secondary" />
        </NuxtLink>
      </div>
    </div>

    <div class="sticky-top">
      <!-- Row 2 -->
      <div
        class="d-flex justify-content-between align-items-center p-3 px-md-9 bg-white border-bottom"
      >
        <NuxtLink to="/">
          <NuxtImg
            src="/media/logos/azza-logo.png"
            class="img-fluid logo-img pe-md-9"
            alt="azza logo"
            height="40"
          />
        </NuxtLink>
        <div class="d-flex align-items-center gap-9">
          <!-- Favorites -->
          <div class="position-relative dropdown" v-if="isLoggedIn">
            <button
              @click="toggleFavoritesMenu"
              class="btn btn-link text-decoration-none d-flex flex-column align-items-center"
              :class="favoritesMenuVisible ? 'text-primary' : 'text-secondary'"
            >
              <Icon name="fa-solid:heart" class="fs-2" />
              <span class="fs-5 mt-4"> المفضلة </span>
            </button>

            <FavoritesMenu
              :show="favoritesMenuVisible"
              :favorites="mainStore.adsFavorites?.ads?.data ?? []"
              :loading="favoritesMenuVisible && mainStore.favoritesListLoad"
              @close="favoritesMenuVisible = false"
              v-click-outside="() => (favoritesMenuVisible = false)"
              desktopPlacement="end"
            />
          </div>

          <!-- Notifications -->
          <NotificationsMenu v-if="isLoggedIn" />

          <!-- إعلاناتي -->
          <NuxtLink
            v-if="isLoggedIn"
            :to="isLoggedIn ? '/profile/ads' : '/login'"
            class="btn btn-link text-dark text-decoration-none d-flex flex-column align-items-center"
          >
            <Icon name="fa-solid:book" class="text-secondary fs-2" />
            <span class="text-secondary fs-5 mt-4">أعلانتي</span>
          </NuxtLink>

          <!-- حساب المستخدم -->
          <NuxtLink
            to="/profile"
            v-if="isLoggedIn"
            class="d-flex justify-center align-items-start gap-3"
          >
            <img
              :src="profile?.avatar || defaultAvatar"
              alt="userProfile"
              width="40"
              height="40"
              class="rounded-circle"
            />
            <div>
              <div
                class="text-dark text-decoration-none d-none d-md-flex flex-column align-items-start justify-content-center"
              >
                <span class="text-dark fs-5">{{ profile?.name }}</span>
                <span class="text-secondary fs-7">حسابي</span>
              </div>
            </div>
          </NuxtLink>
          <div v-else>
            <NuxtLink
              to="/login"
              class="d-flex justify-center align-items-start gap-3"
            >
              <img
                :src="defaultAvatar"
                alt="userProfile"
                width="40"
                height="40"
                class="rounded-circle"
              />
              <div class="d-none d-md-block">
                <div
                  class="text-dark text-decoration-none d-none d-md-flex flex-column align-items-start justify-content-center ps-md-9"
                >
                  <span class="text-dark fw-medium fs-5"
                    >الحساب</span
                  >
                  <span class="text-secondary fs-7">تسجيل الدخول</span>
                </div>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
      <!-- Row 3 -->
      <nav class="navbar navbar-expand-md px-md-9 bg-white py-3">
        <div
          class="container-fluid d-flex justify-content-between align-items-center px-3 p-md-0"
        >
          <button
            class="navbar-toggler ms-2"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mainNavbar"
            aria-controls="mainNavbar"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span class="navbar-toggler-icon"></span>
          </button>
          <div
            v-if="allowedPaths.includes(route.name)"
            class="btn d-inline-flex align-items-center rounded-0 ms-2"
            data-bs-toggle="collapse"
            href="#collapseExample"
            role="button"
            aria-expanded="false"
            aria-controls="collapseExample"
          >
            <Icon class="fs-1 ms-2" name="fluent:navigation-32-filled" />
            <span class="fs-3 h5 m-0">كل الأقسام</span>
          </div>
          <div class="order-md-2" v-if="showAddButton">
            <NuxtLink :to="isLoggedIn ? '/ads/create' : '/login'">
              <button
                class="btn btn-lg btn-main d-flex align-items-center gap-2"
              >
                <Icon class="fs-3" name="fa-solid:plus" />
                <span class="fs-3">إضافة إعلان</span>
              </button>
            </NuxtLink>
          </div>

          <!-- ✅ روابط القائمة -->
          <div
            class="collapse navbar-collapse order-md-1 justify-content-center py-5"
            id="mainNavbar"
            :class="{'border-end ': allowedPaths.includes(route.name)}"
          >
            <ul class="navbar-nav me-0 pe-0 mb-2 mb-lg-0 gap-md-6">
              <li class="nav-item px-9 mb-3">
                <NuxtLink
                  to="/"
                  class="nav-link text-dark px-1 pb-0 fw-medium"
                  :class="{
                    'text-primary border-bottom border-2 border-primary':
                      route.path === '/',
                  }"
                  >الرئيسية</NuxtLink
                >
              </li>
              <li class="nav-item px-9 mb-3">
                <NuxtLink
                  to="/products"
                  class="nav-link text-dark px-1 pb-0 fw-medium"
                  :class="{
                    'text-primary border-bottom border-2 border-primary':
                      route.path === '/products',
                  }"
                  >منتجاتنا</NuxtLink
                >
              </li>
              <li class="nav-item px-9 mb-3">
                <NuxtLink
                  to="/ads"
                  class="nav-link text-dark px-1 pb-0 fw-medium"
                  :class="{
                    'text-primary border-bottom border-2 border-primary':
                      route.path === '/ads',
                  }"
                  >تصفح الإعلانات</NuxtLink
                >
              </li>
              <li class="nav-item px-9 mb-3">
                <NuxtLink
                  to="/contact"
                  class="nav-link text-dark px-1 pb-0 fw-medium"
                  :class="{
                    'text-primary border-bottom border-2 border-primary':
                      route.path === '/contact',
                  }"
                  >تواصل معنا</NuxtLink
                >
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.header {
  font-family: "Expo Arabic", sans-serif;
}
.navbar-toggler {
  border: 0;
  font-size: 15px;
}
.nav-link {
  font-size: 16px;
  padding: 12px 16px;
}
.btn-primary:hover {
  background: var(--bs-primary-hover) !important;
  color: #fff !important;
}
.row2 {
  position: sticky;
  top: 0;
  z-index: 1000;
}
.navbar-toggler:focus {
  box-shadow: 0 0 0 !important;
}
li a:hover {
  color: #1839a0 !important;
}
.trems-link {
  border-left: #0000001a 2px solid;
  border-right: #0000001a 2px solid;
}
.bar-link {
  background-color: #fafafa;
}
</style>
