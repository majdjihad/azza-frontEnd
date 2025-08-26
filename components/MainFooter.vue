<template>
  <footer class="footer bg-white border-top pt-9">
    <div class="">
      <div class="row text-end px-6">
        <div class="col-md-4 col-10 mb-4">
          <div class="mb-3 pe-9">
            <img
              src="~\public\media\logos\azza-logo.png"
              alt="Azza Logo"
              height="40"
              class="ms-2"
            />
          </div>
          <p class="text-muted fs-5 p-9 pt-3">
            موقعنا هو منصة إلكترونية متكاملة للإعلانات العربية تتيح للمستخدمين
            إضافة إعلاناتهم بسهولة وتصفح العروض الخاصة في مختلف التصنيفات مثل
            العقارات، الأجهزة، الأثاث، المفقودات والخدمات. نوفر بيئة موثوقة
            وآمنة للتواصل المباشر بين البائعين والمشترين.
          </p>
        </div>
        <div class="col-4 col-md-3 mb-4">
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
                class="fs-5 text-muted text-decoration-none"
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
        <div class="col-4 col-md-3 mb-4">
          <h5 class="fw-bold mb-3">روابط سريعة</h5>
          <ul class="list-unstyled p-0">
            <li>
              <NuxtLink to="#" class="fs-5 text-muted text-decoration-none"
                >عقارات</NuxtLink
              >
            </li>
            <li>
              <NuxtLink to="#" class="fs-5 text-muted text-decoration-none"
                >أجهزة</NuxtLink
              >
            </li>
            <li>
              <NuxtLink to="#" class="fs-5 text-muted text-decoration-none"
                >مفقودات</NuxtLink
              >
            </li>
            <li>
              <NuxtLink to="#" class="fs-5 text-muted text-decoration-none"
                >خدمات</NuxtLink
              >
            </li>
            <li>
              <NuxtLink to="#" class="fs-5 text-muted text-decoration-none"
                >إضافة إعلان</NuxtLink
              >
            </li>
            <li>
              <NuxtLink to="#" class="fs-5 text-muted text-decoration-none"
                >تسجيل دخول</NuxtLink
              >
            </li>
          </ul>
        </div>

        <div class="col-4 col-md-2 mb-4">
          <h5 class="fw-bold mb-3">بيانات التواصل</h5>
          <p class="d-flex align-items-center mb-1">
            <span class="ms-2 p-2 bg-primary rounded-circle">
              <Icon
                name="material-symbols:phone-in-talk-watchface-indicator"
                class="text-white fs-2"
              />
            </span>
            <span class="ms-1 text-muted">+972592072429</span>
          </p>
          <p class="d-flex align-items-center mb-1">
            <span class="ms-2 p-2 bg-primary rounded-circle">
              <Icon name="bi:envelope-fill" class="text-white fs-2" />
            </span>
            <span class="ms-1 text-muted">support@azza.com</span>
          </p>
        </div>
      </div>
      <div
        class="border-top py-2 px-6 text-center bg-primary text-white d-flex justify-content-between align-items-center"
      >
        <p class="mb-0 text-white">
          جميع الحقوق محفوظة © 2025 - Azza – إحدى مشاريع مجموعة Akhlaa
        </p>
        <div class="d-flex justify-content-center mb-2">
          <NuxtLink to="#" class="text-white fs-3 mx-2"
            ><Icon name="bi:facebook"
          /></NuxtLink>
          <NuxtLink to="#" class="text-white fs-3 mx-2"
            ><Icon name="bi:instagram"
          /></NuxtLink>
          <NuxtLink to="#" class="text-white fs-3 mx-2"
            ><Icon name="bi:twitter-x"
          /></NuxtLink>
          <NuxtLink to="#" class="text-white fs-3 mx-2"
            ><Icon name="bi:whatsapp"
          /></NuxtLink>
          <NuxtLink to="#" class="text-white fs-3 mx-2"
            ><Icon name="bi:tiktok"
          /></NuxtLink>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
// لا حاجة لتعريف شيء لأن nuxt-icon متكامل مع Nuxt 3
</script>

<style scoped>
.footer {
  overflow: hidden;
}
.footer a:hover {
  color: #0d6efd; /* لون Bootstrap الأساسي */
}
</style>
