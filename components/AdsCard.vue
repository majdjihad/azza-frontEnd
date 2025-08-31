<script setup>
import moment from "moment";

defineProps({
  ad: {
    type: Object,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
});
</script>


<template>
  <div class="card ad-card overflow-hidden p-0 position-relative my-2">
    <!-- Top Image + Chips + Avatar -->
    <div class="position-relative">
      <NuxtLink :to="`ads/category/${ad.id}`">
        <img :src="ad.image" class="card-img-top" :alt="ad.title" />
      </NuxtLink>
      <span
        class="badge badge-chip position-absolute top-0 end-0 m-3 px-3 py-2"
      >
        {{ category }}
      </span>
      <NuxtLink :to="`/profile/${ad.user_id}/show`" class="avatar-holder">
        <img :src="ad.user_photo" width="50px" class="rounded-circle" alt="" />
      </NuxtLink>
    </div>
    <div class="card-body pt-5">
      <NuxtLink :to="`ads/category/${ad.id}`" class="text-decoration-none">
        <div class="text-muted small mb-1">منذ {{ ad?.created_at }}</div>
        <h5 class="ad-title mb-2">
          {{ ad.title }}
        </h5>
      </NuxtLink>
      <p class="ad-desc mb-3">
        {{ ad?.description?.split(" ").slice(0, 15).join(" ")
        }}{{ ad?.description?.split(" ").length > 15 ? "..." : "" }}
      </p>
      <div class="d-flex align-items-center justify-content-start">
        <span class="fs-5 text-primary">{{ ad.price }}</span>
        <span class="fs-5 text-primary">{{ ad.currency }}</span>
      </div>
      <div class="mt-3 d-flex align-items-center justify-content-between">
        <div class="text-muted small d-flex align-items-center gap-1">
          <Icon name="material-symbols:location-on-outline" size="18" />
          <span>{{ ad.city }}</span>
        </div>
        <div class="meta d-flex align-items-center gap-1 fs-5">
          <NuxtLink
            :to="`https://wa.me/${ad.whatsapp}`"
            class="btn text-secondary btn-sm p-1"
            aria-label="تواصل"
          >
            <Icon name="akar-icons:whatsapp-fill" size="22" />
          </NuxtLink>
          <button class="btn text-secondary btn-sm p-1" aria-label="مفضلة">
            <Icon
              v-if="ad.featured"
              class="text-primary"
              name="mdi:cards-heart"
              size="22"
            />
            <Icon v-else name="mdi:heart-outline" size="22" />
          </button>
          <button class="btn text-secondary btn-sm p-1" aria-label="مشاركة">
            <Icon name="mdi:share-variant-outline" size="22" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ad-card {
  border: 1px solid #eef0f4;
  border-radius: 1.25rem;
  overflow: hidden;
  background: #fff;
  transition: 0.25s ease;
}
.ad-card:hover img {
  filter: grayscale(0.5);
}
.ad-card:hover .ad-title {
  text-decoration: underline;
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
