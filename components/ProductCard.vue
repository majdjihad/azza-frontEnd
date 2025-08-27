<script setup>
import { computed } from "vue";

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
});

const formattedPrice = computed(() =>
  Number(props.item?.price ?? 0).toLocaleString("en-US")
);
</script>

<template>
  <div class="offer-card h-100 d-flex flex-column">
    <NuxtLink :to="`/products/${item.id}`" class="offer-media">
      <img :src="item.image" :alt="item.title" />
    </NuxtLink>
    <div class="offer-body">
      <NuxtLink :to="`/products/${item.id}`" class="offer-title text-dark h3">{{
        item.name
      }}</NuxtLink>
      <div class="d-flex align-items-center text-secondary gap-1 offer-meta">
        <Icon name="mdi:map-marker-outline" size="18" />
        <span class="fs-5" v-if="item.city">{{ item.city }}</span>
      </div>
    </div>

    <div
      class="mt-auto d-flex align-items-center justify-content-between px-3 pb-3"
    >
      <div class="text-end px-3 text-primary">
        <span class="price ms-1">{{ formattedPrice }}</span>
        <span class="badge-currency small">{{ item.currency }}</span>
      </div>
      <div class="d-flex align-items-center gap-2">
        <button class="btn btn-sm p-1" aria-label="تواصل">
          <Icon name="akar-icons:whatsapp-fill" size="24" />
        </button>
        <button class="btn btn-sm p-1" aria-label="مشاركة">
          <Icon name="mdi:share-variant-outline" size="24" />
        </button>
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
.offer-card:hover img {
  filter: grayscale(0.5);
}
.offer-card:hover .offer-title {
  text-decoration: underline;
}
/* الصورة */
.offer-media {
  aspect-ratio: 16/11;
  background: #f1f3f8;
  overflow: hidden;
}
.offer-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* النص */
.offer-body {
  padding: 1rem 1rem 0.5rem 1rem;
}
.offer-title {
  font-weight: 700;
  font-size: 1.05rem;
  margin: 0.25rem 0 0.35rem;
}
.offer-meta {
  color: var(--muted);
  font-size: 0.9rem;
}

/* السعر */
.price {
  color: var(--primary);
  font-weight: 800;
}
.badge-currency {
  color: var(--primary);
  font-weight: 700;
}
</style>
