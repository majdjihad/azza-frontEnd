<script setup>
const config = useRuntimeConfig();
</script>
<template>
  <footer class="footer bg-white border-top pt-9 shadow">
    <div class="">
      <div class="row text-end px-6 gap-9">
        <div class="col-md-4 col-10 mb-4">
          <div class="mb-3 pe-md-9">
            <img
              src="~\public\media\logos\azza-logo.png"
              alt="Azza Logo"
              height="40"
              class="ms-2 logo-img"
            />
          </div>
          <p
            class="text-muted fw-medium fs-6 p-md-4 p-lg-9 pt-lg-0 pb-3 pb-md-0"
          >
            موقعنا هو منصة إلكترونية متكاملة للإعلانات العربية تتيح للمستخدمين
            إضافة إعلاناتهم بسهولة وتصفح العروض الخاصة في مختلف التصنيفات مثل
            العقارات، الأجهزة، الأثاث، المفقودات والخدمات. نوفر بيئة موثوقة
            وآمنة للتواصل المباشر بين البائعين والمشترين.
          </p>
        </div>
        <div class="col-4 col-md-2 ps-sm-0 mb-4">
          <h5 class="fw-bold mb-3">الصفحات</h5>
          <ul class="list-unstyled p-0">
            <li>
              <NuxtLink
                to="/"
                class="fs-6 text-muted fw-medium text-decoration-none"
                >الرئيسية</NuxtLink
              >
            </li>
            <li>
              <NuxtLink
                to="/products"
                class="fs-6 text-muted fw-medium text-decoration-none"
                >منتجاتنا</NuxtLink
              >
            </li>
            <li>
              <NuxtLink
                to="/ads"
                class="fs-6 text-muted fw-medium text-decoration-none"
                >تصفح الإعلانات</NuxtLink
              >
            </li>
            <li>
              <NuxtLink
                to="/terms-of-use"
                class="fs-6 text-decoration-none text-muted fw-medium"
                >شروط الاستخدام</NuxtLink
              >
            </li>
            <li>
              <NuxtLink
                to="/privacy-policy"
                class="fs-6 text-muted fw-medium text-decoration-none"
                >سياسة الخصوصية</NuxtLink
              >
            </li>
            <li>
              <NuxtLink
                to="/contact"
                class="fs-6 text-muted fw-medium text-decoration-none"
                >تواصل معنا</NuxtLink
              >
            </li>
          </ul>
        </div>
        <div class="col-4 col-md-2 p-0 mb-4">
          <h5 class="fw-bold mb-3">روابط سريعة</h5>
          <ul class="list-unstyled p-0">
            <li>
              <NuxtLink
                to="/products"
                class="fs-6 text-muted fw-medium text-decoration-none"
                >منتجاتنا</NuxtLink
              >
            </li>
            <li>
              <NuxtLink
                to="/ads"
                class="fs-6 text-muted fw-medium text-decoration-none"
                >الإعلانات</NuxtLink
              >
            </li>
            <li>
              <NuxtLink
                to="/"
                class="fs-6 text-muted fw-medium text-decoration-none"
                >الرئيسية</NuxtLink
              >
            </li>
            <li>
              <NuxtLink
                to="/contact"
                class="fs-6 text-muted fw-medium text-decoration-none"
                >تواصل معنا</NuxtLink
              >
            </li>
            <li>
              <NuxtLink
                to="/ads/create"
                class="fs-6 text-muted fw-medium text-decoration-none"
                >إضافة إعلان</NuxtLink
              >
            </li>
            <li>
              <NuxtLink
                to="/privacy-policy"
                class="fs-6 text-muted fw-medium text-decoration-none"
                >سياسة الخصوصية</NuxtLink
              >
            </li>
          </ul>
        </div>
        <ul class="col-4 col-md-2 p-0 mb-4">
          <h5 class="fw-bold mb-3">بيانات التواصل</h5>
          <li class="d-flex align-items-center mb-1">
            <span class="ms-2 px-3 py-2 bg-primary rounded-circle">
              <Icon
                name="material-symbols:phone-in-talk-watchface-indicator"
                class="text-white fs-4"
              />
            </span>
            <span class="fs-6 ms-1 text-muted">{{
              config.public.companyPhone
            }}</span>
          </li>
          <li class="d-flex align-items-center mb-1">
            <span class="ms-2 px-3 py-2 bg-primary rounded-circle">
              <Icon name="bi:envelope-fill" class="text-white fs-4" />
            </span>
            <span class="fs-6 ms-1 text-muted">{{
              config.public.companyEmail
            }}</span>
          </li>
        </ul>
      </div>
      <div
        class="py-3 px-6 text-center bg-primary text-white d-flex flex-column-reverse flex-lg-row justify-content-between align-items-center"
      >
        <p class="mb-0 text-white d-block">
          جميع الحقوق محفوظة © 2025 - Azza – إحدى مشاريع مجموعة Akhlaa
        </p>

        <div class="d-flex justify-content-center d-none d-lg-block">
          <NuxtLink
            target="_blank"
            rel="noopener noreferrer"
            :to="config.public.facebookUrl"
            class="text-white fs-3 mx-3"
          >
            <Icon name="bi:facebook" />
          </NuxtLink>
          <NuxtLink
            target="_blank"
            rel="noopener noreferrer"
            :to="config.public.instagramUrl"
            class="text-white fs-3 mx-3"
          >
            <Icon name="bi:instagram" />
          </NuxtLink>
          <NuxtLink
            :to="config.public.twitterUrl"
            class="text-white fs-3 mx-3"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon name="bi:twitter-x" />
          </NuxtLink>
          <NuxtLink
            target="_blank"
            rel="noopener noreferrer"
            :to="config.public.whatsappUrl"
            class="text-white fs-3 mx-3"
          >
            <Icon name="bi:whatsapp" />
          </NuxtLink>
          <NuxtLink
            target="_blank"
            rel="noopener noreferrer"
            :to="config.public.tiktokUrl"
            class="text-white fs-3 mx-3"
          >
            <Icon name="bi:tiktok" />
          </NuxtLink>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  overflow: hidden;
}
li {
  margin: 5px 0;
}
li a:hover {
  color: #1839a0 !important;
  border-bottom: #1839a0 2px solid;
}
.text-muted {
  color: #6c757d !important;
}
</style>
