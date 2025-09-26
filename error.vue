<template>
  <div
    id="error-view"
    class="landing-hero-bg d-flex align-items-center justify-content-center"
  >
    <Error :statusCode="error.statusCode" :message="error.message" />
  </div>
</template>

<script setup>
const props = defineProps({
  error: Object,
});
</script>

<style scoped>
#error-view {
  padding: 0 15px;
  min-height: 100vh;
  min-width: 100%;
}
</style>
