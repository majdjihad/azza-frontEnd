<script setup>
import FavoritesMenu from "~/components/FavoritesMenu.vue";

const favoritesMenuVisible = ref(false);
const notificationsMenuVisible = ref(false);

function toggleFavoritesMenu() {
  favoritesMenuVisible.value = !favoritesMenuVisible.value;
}
function toggleNotificationsMenu() {
  notificationsMenuVisible.value = !notificationsMenuVisible.value;
}
const route = useRoute();

const allowedPaths = ["/ads", "/products"];

const showCategoriesBtn = computed(() => {
  const path = (route.path || "/").replace(/\/+$/, "") || "/";
  return allowedPaths.includes(path);
});

const isActive = (path) => {
  return route.path === path;
};
</script>

<template>
  <header class="header">
    <!-- Row 1 -->
    <div
      class="d-flex justify-content-between bg-light align-items-center py-2 px-9"
    >
      <div class="d-flex align-items-center">
        <NuxtLink to="#" class="text-dark fs-5 mx-2">إنشاء حساب</NuxtLink>
        <NuxtLink
          to="/terms-of-use"
          class="text-dark fs-5 border-start border-end px-2"
          >شروط الاستخدام</NuxtLink
        >
        <NuxtLink to="/privacy-policy" class="text-dark fs-5 mx-2"
          >سياسة الخصوصية</NuxtLink
        >
      </div>
      <div class="d-flex flex-row-reverse gap-6">
        <NuxtLink to="https://www.facebook.com/">
          <Icon name="fa6-brands:facebook-f" class="fs-3 text-secondary" />
        </NuxtLink>
        <NuxtLink to="https://www.instagram.com/">
          <Icon name="fa6-brands:instagram" class="fs-3 text-secondary" />
        </NuxtLink>
        <NuxtLink to="https://www.x.com/">
          <Icon name="fa6-brands:x-twitter" class="fs-3 text-secondary" />
        </NuxtLink>
        <NuxtLink to="https://www.whatsapp.com/">
          <Icon name="fa6-brands:whatsapp" class="fs-3 text-secondary" />
        </NuxtLink>
        <NuxtLink to="https://www.tiktok.com/">
          <Icon name="fa6-brands:tiktok" class="fs-3 text-secondary" />
        </NuxtLink>
      </div>
    </div>
    <div class="sticky-top">
      <!-- Row 2 -->
      <div
        class="d-flex justify-content-between align-items-center py-3 px-9 bg-white border-bottom"
      >
        <NuxtLink to="/">
          <img
            src="~/public/media/logos/azza-logo.png"
            alt="azza logo"
            height="40"
          />
        </NuxtLink>
        <div class="d-flex align-items-center gap-9">
          <div class="position-relative dropdown">
            <button
              @click="toggleFavoritesMenu"
              class="btn btn-link text-decoration-none d-flex flex-column align-items-center"
              :class="favoritesMenuVisible ? 'text-primary' : 'text-secondary'"
            >
              <Icon name="fa-solid:heart" class="fs-2" />
              <span
                class="fs-5 mt-4"
                :class="
                  favoritesMenuVisible ? 'text-primary' : 'text-secondary'
                "
                >المفضلة</span
              >
            </button>

            <FavoritesMenu
              :show="favoritesMenuVisible"
              v-click-outside="
                () => {
                  favoritesMenuVisible = false;
                }
              "
            />
          </div>
          <div class="position-relative dropdown">
            <button
              @click="toggleNotificationsMenu"
              class="btn btn-link text-decoration-none d-flex flex-column align-items-center"
              :class="
                notificationsMenuVisible ? 'text-primary' : 'text-secondary'
              "
            >
              <Icon name="fa-solid:bell" class="fs-2" />
              <span
                class="fs-5 mt-4"
                :class="
                  notificationsMenuVisible ? 'text-primary' : 'text-secondary'
                "
                >الإشعارات</span
              >
            </button>

            <NotificationsMenu
              :show="notificationsMenuVisible"
              v-click-outside="
                () => {
                  notificationsMenuVisible = false;
                }
              "
            />
          </div>
          <NuxtLink
            to="#"
            class="btn btn-link text-dark text-decoration-none d-flex flex-column align-items-center"
          >
            <Icon name="fa-solid:book" class="text-secondary fs-2" />
            <span class="text-secondary fs-5 mt-4">أعلانتي</span>
          </NuxtLink>
          <div class="d-flex justify-center align-items-start gap-3">
            <img
              src="~/public/media/avatars/user.png"
              alt="userProfile"
              width="40"
              class="rounded-circle"
            />
            <div>
              <NuxtLink
                to="#"
                class="text-dark text-decoration-none d-flex flex-column align-items-start justify-content-center"
              >
                <span class="text-dark fs-5">مجد قويدر</span>
                <span class="text-secondary fs-7">حسابي</span>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
      <!-- Row 3 -->
      <nav class="navbar navbar-expand-md px-9 bg-white shadow-sm">
        <div
          class="container-fluid d-flex justify-content-between align-items-center"
        >
          <!-- Toggle Button -->
          <button
            class="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mainNavbar"
            aria-controls="mainNavbar"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="order-md-2">
            <NuxtLink to="/profile/ads/create">
              <button
                class="btn btn-lg btn-main d-flex align-items-center gap-2"
              >
                <Icon class="fs-3" name="fa-solid:plus" />
                <span class="fs-3">إضافة إعلان</span>
              </button>
            </NuxtLink>
          </div>
          <div
            v-if="showCategoriesBtn"
            class="btn d-inline-flex align-items-center border-start rounded-0"
            data-bs-toggle="collapse"
            href="#collapseExample"
            role="button"
            aria-expanded="false"
            aria-controls="collapseExample"
          >
            <Icon class="fs-3 ms-2" name="fluent:navigation-32-filled" />
            <span class="fs-3 h5 m-0">كل الأقسام</span>
          </div>
          <div
            class="collapse navbar-collapse order-md-1 justify-content-center"
            id="mainNavbar"
          >
            <ul class="navbar-nav me-0 pe-0 mb-2 mb-lg-0">
              <li class="nav-item px-8 mb-3">
                <NuxtLink
                  to="/"
                  class="nav-link text-dark px-1 pb-0"
                  :class="{
                    'fw-bold border-bottom border-2 border-primary':
                      isActive('/'),
                  }"
                  >الرئيسية</NuxtLink
                >
              </li>
              <li class="nav-item px-8 mb-3">
                <NuxtLink
                  to="/products"
                  class="nav-link text-dark px-1 pb-0"
                  :class="{
                    'fw-bold border-bottom border-2 border-primary':
                      isActive('/products'),
                  }"
                  >منتجاتنا</NuxtLink
                >
              </li>
              <li class="nav-item px-8 mb-3">
                <NuxtLink
                  to="/ads"
                  class="nav-link text-dark px-1 pb-0"
                  :class="{
                    'fw-bold border-bottom border-2 border-primary':
                      isActive('/ads'),
                  }"
                  >تصفح الإعلانات</NuxtLink
                >
              </li>
              <li class="nav-item px-8 mb-3">
                <NuxtLink
                  to="/contact"
                  class="nav-link text-dark px-1 pb-0"
                  :class="{
                    'fw-bold border-bottom border-2 border-primary':
                      isActive('/contact'),
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
.nav-link {
  font-size: 16px;
}
.nav-link {
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
</style>
