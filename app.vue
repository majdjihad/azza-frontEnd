<template>
  <div>
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