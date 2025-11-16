<script setup>
const route = useRoute();
const noFooterRoutes = [
  "/login",
  "/forget-password",
  "/register",
  "/forget-verify-code",
  "/reset-password",
  "/verify-code",
];
</script>

<template>
  <div>
    <MainHeader />
    <slot />
    <MainFooter v-if="!noFooterRoutes.includes(route.path)" />
  </div>
</template>
<style scoped>
* {
  font-family: "Expo Arabic", sans-serif !important;
}
</style>