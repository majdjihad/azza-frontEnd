<template>
  <div class="offer-card h-100 d-flex flex-column skeleton-card">
    <div class="offer-media">
      <div class="skeleton skeleton-img"></div>
    </div>
    <div class="offer-body">
      <div class="offer-title skeleton skeleton-text w-75 mb-2"></div>
      <div class="d-flex align-items-center text-secondary gap-1 offer-meta">
        <span class="skeleton skeleton-text w-50"></span>
      </div>
    </div>
    <div
      class="mt-auto d-flex align-items-center justify-content-between px-3 pb-3"
    >
      <div class="text-end px-3 text-primary d-flex align-items-center gap-2">
        <span class="skeleton skeleton-price d-inline-block"></span>
      </div>
      <div class="d-flex align-items-center gap-1">
        <span class="skeleton skeleton-btn rounded-circle"></span>
        <span class="skeleton skeleton-btn rounded-circle"></span>
        <span class="skeleton skeleton-btn rounded-circle"></span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.offer-card {
  border: 1px solid #eef0f4;
  border-radius: 1.25rem;
  overflow: hidden;
  background: #fff;
  transition: 0.25s ease;
}

/* تعطيل تأثيرات الهوفر في السكلتون */
.skeleton-card:hover img,
.skeleton-card:hover .offer-title {
  filter: none;
  text-decoration: none;
}

/* الصورة بنسبة 16:11 كما في الأصل */
.offer-media {
  aspect-ratio: 16/11;
  background: #f1f3f8;
  overflow: hidden;
}

/* نفس مسافات النص */
.offer-body {
  padding: 1rem 1rem 0.5rem 1rem;
}
.offer-title {
  margin: 0.25rem 0 0.35rem;
}

/* عناصر السكلتون العامة (ألوان Light Mode + shimmer) */
.skeleton {
  background: linear-gradient(90deg, #f4f6f9 25%, #e9edf3 50%, #f4f6f9 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.4s infinite;
  display: inline-block;
  border-radius: 6px;
}

/* صورة السكلتون تملأ مساحة الميديا */
.skeleton-img {
  width: 100%;
  height: 100%;
  display: block;
}

/* نصوص */
.skeleton-text {
  height: 16px;
}

/* أيقونة الموقع (بديل الأيقونة) */
.skeleton-icon {
  width: 18px;
  height: 18px;
}

/* السعر والعملة */
.skeleton-price {
  width: 90px;
  height: 18px;
}
.skeleton-currency {
  width: 56px;
  height: 16px;
}

/* أزرار الإجراءات */
.skeleton-btn {
  width: 36px;
  height: 36px;
}

/* أنيميشن */
@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
