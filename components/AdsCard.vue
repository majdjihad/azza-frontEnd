<template>
  <div class="card ad-card overflow-hidden position-relative my-2">
    <!-- Top Image + Chips + Avatar -->
    <div class="position-relative">
      <img :src="ad.image" class="card-img-top" :alt="ad.title" />
      <span
        class="badge badge-chip position-absolute top-0 end-0 m-3 px-3 py-2"
      >
        {{ ad.category }}
      </span>
      <div class="avatar-holder">
        <div class="avatar-ring">
          <i class="bi bi-person fs-1 text-secondary"></i>
        </div>
      </div>
    </div>

    <!-- Body -->
    <div class="card-body pt-5">
      <NuxtLink to="ads/details">
        <div class="text-muted small mb-1">منذ {{ ad.time }}</div>
        <h5 class="ad-title mb-2">
          {{ ad.title }} <span class="fw-bold">للبيع</span>
        </h5>
        <p class="ad-desc mb-3">{{ ad.description }}</p>
        <div class="d-flex align-items-center justify-content-between">
          <div class="ad-price fs-5">{{ ad.price }}</div>
        </div>
      </NuxtLink>
      <div class="mt-3 d-flex align-items-center justify-content-between">
        <div class="text-muted small d-flex align-items-center gap-1">
          <Icon name="material-symbols:location-on-outline" />
          <span>{{ ad.location }}</span>
        </div>
        <div class="meta d-flex align-items-center gap-1 fs-5">
          <button class="btn text-secondary btn-sm p-1" aria-label="تواصل">
            <Icon name="akar-icons:whatsapp-fill" size="18" />
          </button>
          <button class="btn text-secondary btn-sm p-1" aria-label="مفضلة">
            <Icon name="mdi:heart-outline" size="18" />
          </button>
          <button class="btn text-secondary btn-sm p-1" aria-label="مشاركة">
            <Icon name="mdi:share-variant-outline" size="18" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  ad: {
    type: Object,
    required: true,
  },
});
</script>

<style scoped>
.ad-card {
  border: 0;
  border-radius: 15px;
  transition: box-shadow 0.2s ease;
}
.ad-card:hover {
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.12);
}
.ad-card .card-img-top {
  height: 230px;
  object-fit: cover;
}
.badge-chip {
  background: #e7f1f9;
  color: #1b3a8a;
  border-radius: 10px;
  font-weight: 700;
}
.avatar-ring {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #e9ecef;
  display: grid;
  place-items: center;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
  border: 3px solid #fff;
}
.ad-title {
  font-weight: 800;
}
.ad-desc {
  color: #6b7280;
  line-height: 1.9;
}
.ad-price {
  color: #195bdb;
  font-weight: 900;
}
.meta i {
  opacity: 0.6;
}
.meta i:hover {
  opacity: 1;
}
/* avatar overlap position (logical for RTL/LTR) */
.avatar-holder {
  position: absolute;
  bottom: -28px;
  left: 10px;
}
</style>
