<script setup>
const config = useRuntimeConfig();
</script>
<template>
  <footer class="footer bg-white border-top pt-9 shadow">
    <div class="">
      <div class="row text-end px-6">
        <div class="col-md-4 col-10 mb-4">
          <div class="mb-3 pe-md-9">
            <img
              src="~\public\media\logos\azza-logo.png"
              alt="Azza Logo"
              height="40"
              class="ms-2 logo-img"
            />
          </div>
          <p class="text-muted fs-5 p-md-9 pt-3 pb-3 pb-md-0">
            موقعنا هو منصة إلكترونية متكاملة للإعلانات العربية تتيح للمستخدمين
            إضافة إعلاناتهم بسهولة وتصفح العروض الخاصة في مختلف التصنيفات مثل
            العقارات، الأجهزة، الأثاث، المفقودات والخدمات. نوفر بيئة موثوقة
            وآمنة للتواصل المباشر بين البائعين والمشترين.
          </p>
        </div>
        <div class="col-4 col-md-3 ps-sm-0 mb-4">
          <h5 class="fw-bold mb-3">الصفحات</h5>
          <ul class="list-unstyled p-0">
            <li>
              <NuxtLink to="/" class="fs-5 text-muted text-decoration-none"
                >الرئيسية</NuxtLink
              >
            </li>
            <li>
              <NuxtLink
                to="/products"
                class="fs-5 text-muted text-decoration-none"
                >منتجاتنا</NuxtLink
              >
            </li>
            <li>
              <NuxtLink to="/ads" class="fs-5 text-muted text-decoration-none"
                >تصفح الإعلانات</NuxtLink
              >
            </li>
            <li>
              <NuxtLink
                to="/terms-of-use"
                class="fs-5 text-decoration-none text-muted"
                >شروط الاستخدام</NuxtLink
              >
            </li>
            <li>
              <NuxtLink
                to="/privacy-policy"
                class="fs-5 text-muted text-decoration-none"
                >سياسة الخصوصية</NuxtLink
              >
            </li>
            <li>
              <NuxtLink
                to="/contact"
                class="fs-5 text-muted text-decoration-none"
                >تواصل معنا</NuxtLink
              >
            </li>
          </ul>
        </div>
        <div class="col-4 col-md-3 p-0 mb-4">
          <h5 class="fw-bold mb-3">روابط سريعة</h5>
          <ul class="list-unstyled p-0">
            <li>
              <NuxtLink
                to="/products"
                class="fs-5 text-muted text-decoration-none"
                >منتجاتنا</NuxtLink
              >
            </li>
            <li>
              <NuxtLink to="/ads" class="fs-5 text-muted text-decoration-none"
                >الإعلانات</NuxtLink
              >
            </li>
            <li>
              <NuxtLink to="/" class="fs-5 text-muted text-decoration-none"
                >الرئيسية</NuxtLink
              >
            </li>
            <li>
              <NuxtLink
                to="/contact"
                class="fs-5 text-muted text-decoration-none"
                >تواصل معنا</NuxtLink
              >
            </li>
            <li>
              <NuxtLink
                to="/ads/create"
                class="fs-5 text-muted text-decoration-none"
                >إضافة إعلان</NuxtLink
              >
            </li>
            <li>
              <NuxtLink
                to="/privacy-policy"
                class="fs-5 text-muted text-decoration-none"
                >سياسة الخصوصية</NuxtLink
              >
            </li>
          </ul>
        </div>
        <ul class="col-4 col-md-2 p-0 mb-4">
          <h5 class="fw-bold mb-3">بيانات التواصل</h5>
          <li class="d-flex align-items-center mb-1">
            <span class="ms-2 px-2 py-1 bg-primary rounded-circle">
              <Icon
                name="material-symbols:phone-in-talk-watchface-indicator"
                class="text-white"
              />
            </span>
            <span class="ms-1 text-muted fs-5">{{
              config.public.companyPhone
            }}</span>
          </li>
          <li class="d-flex align-items-center mb-1">
            <span class="ms-2 px-2 py-1 bg-primary rounded-circle">
              <Icon name="bi:envelope-fill" class="text-white" />
            </span>
            <span class="ms-1 text-muted fs-5">{{
              config.public.companyEmail
            }}</span>
          </li>
        </ul>
      </div>
      <div
        class="py-2 px-6 text-center bg-primary text-white d-flex flex-column-reverse flex-lg-row justify-content-between align-items-center"
      >
        <p class="mb-0 text-white d-block">
          جميع الحقوق محفوظة © 2025 - Azza – إحدى مشاريع مجموعة Akhlaa
        </p>

        <div class="d-flex justify-content-center mb-2 d-none d-lg-block">
          <NuxtLink
            target="_blank"
            rel="noopener noreferrer"
            :to="config.public.facebookUrl"
            class="text-white fs-3 mx-2"
          >
            <Icon name="bi:facebook" />
          </NuxtLink>
          <NuxtLink
            target="_blank"
            rel="noopener noreferrer"
            :to="config.public.instagramUrl"
            class="text-white fs-3 mx-2"
          >
            <Icon name="bi:instagram" />
          </NuxtLink>
          <NuxtLink
            :to="config.public.twitterUrl"
            class="text-white fs-3 mx-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon name="bi:twitter-x" />
          </NuxtLink>
          <NuxtLink
            target="_blank"
            rel="noopener noreferrer"
            :to="config.public.whatsappUrl"
            class="text-white fs-3 mx-2"
          >
            <Icon name="bi:whatsapp" />
          </NuxtLink>
          <NuxtLink
            target="_blank"
            rel="noopener noreferrer"
            :to="config.public.tiktokUrl"
            class="text-white fs-3 mx-2"
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
}
</style>
