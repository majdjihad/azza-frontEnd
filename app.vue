<template>
  <div
    v-if="isMobile"
    id="mobile-error-view"
    class="landing-hero-bg d-flex align-items-center justify-content-center"
  >
    <Error
      message="TaskSwift Softwatre Does Not Allowed for mobile devices"
      errType="mobile"
    />
  </div>
  <div v-else>
    <NuxtLoadingIndicator />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
// Configure global page title template
// If a page has a title, it will be displayed as "[title] - AzzA"
// If no title is provided, it will display just "AzzA"
useHead({
  titleTemplate: (title) => (title ? `${title} - AZZA` : "AZZA"),
});
</script>

<style>
.ghost {
  background-color: var(--bs-gray-200);
}
p {
  margin: 0px;
}
.ghost > div {
  visibility: hidden;
}
</style>