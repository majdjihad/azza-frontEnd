<script setup>
useHead({
  title: "الملف الشخصي",
});
const userInfo = reactive({
  name: "مجد قويدر",
  email: "majdjihad@gmail.com",
  phone: "0592142714",
  whatsapp: "972592142714+",
  city: "مدينة غزة",
});
</script>
<template>
  <div class="container mx-auto p-4">
    <div class="page-content">
      <div class="d-flex align-items-center my-9">
        <h2 class="fs-3 m-0 fw-normal text-primary d-inline">الرئيسية</h2>
        <Icon
          name="mdi:chevron-left-circle-outline"
          class="fs-3 mx-3 text-secondary"
        />
        <h2 class="fs-3 m-0 fw-normal text-muted">{{ userInfo.name }}</h2>
      </div>
      <div class="d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center gap-9">
          <div>
            <img
              src="/media/avatars/user.png"
              :alt="userInfo.name"
              class="rounded-circle shadow-sm img-fluid"
              width="200"
            />
          </div>
          <div class="pb-4">
            <h1 class="display-5">{{ userInfo.name }}</h1>
            <p class="text-muted">تاريخ الانضمام: 15/02/2025</p>
            <ul class="list-unstyled mt-4 p-0">
              <li class="d-flex align-items-center my-3">
                <span class="ms-2 p-2 card rounded-circle">
                  <Icon
                    name="material-symbols:phone-in-talk-watchface-indicator"
                    class="text-primary fs-2"
                  />
                </span>
                <span class="ms-1 text-muted"> {{ userInfo.phone }}</span>
              </li>
              <li class="d-flex align-items-center my-3">
                <span class="ms-2 p-2 card rounded-circle">
                  <Icon name="bi:envelope-fill" class="text-primary fs-2" />
                </span>
                <span class="ms-1 text-muted">{{ userInfo.email }}</span>
              </li>
              <li class="d-flex align-items-center my-3">
                <span class="ms-2 p-2 card rounded-circle">
                  <Icon
                    name="akar-icons:whatsapp-fill"
                    class="text-primary fs-2"
                  />
                </span>
                <span class="ms-1 text-muted">{{ userInfo.whatsapp }}</span>
              </li>
              <li class="d-flex align-items-center my-3">
                <span class="ms-2 p-2 card rounded-circle">
                  <Icon
                    name="material-symbols:location-on-rounded"
                    class="text-primary fs-2"
                  />
                </span>
                <span class="ms-1 text-muted">{{ userInfo.city }}</span>
              </li>
            </ul>
          </div>
        </div>
        <div class="user-data card gap-2 my-3 py-9 px-5">
          <h2 class="fs-2">تواصل مع {{ userInfo.name }}</h2>
          <NuxtLink
            :to="`tel:${userInfo?.phone}`"
            class="d-flex w-md-100 w-50 mx-auto align-items-center btn p-0 mb-4"
            v-if="userInfo?.phone"
          >
            <span class="p-6 bg-primary rounded">
              <Icon
                name="material-symbols:phone-in-talk-watchface-indicator"
                class="text-white fs-1"
              />
            </span>
            <div class="d-flex flex-column rounded">
              <span class="text-end">اتصل الآن</span>
            </div>
          </NuxtLink>
          <NuxtLink
            :to="`https://wa.me/${userInfo?.whatsapp}`"
            class="d-flex w-md-100 w-50 mx-auto align-items-center btn p-0 mb-4"
            v-if="userInfo?.whatsapp"
          >
            <span class="p-6 rounded" style="background-color: #4fad52">
              <Icon name="bx:bxl-whatsapp" class="text-white fs-1" />
            </span>
            <div class="d-flex flex-column rounded">
              <span class="text-end">تواصل عبر الواتساب</span>
            </div>
          </NuxtLink>
          <NuxtLink
            :to="`mailto:${userInfo?.email}`"
            class="d-flex w-md-100 w-50 mx-auto align-items-center btn p-0 mb-4"
            v-if="userInfo?.email"
          >
            <span class="p-6 rounded" style="background-color: #a5acb9">
              <Icon
                name="material-symbols:stacked-email-rounded"
                class="text-white fs-1"
              />
            </span>
            <div class="d-flex flex-column rounded">
              <span class="text-end">تواصل عبر البريد الالكتروني</span>
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.user-data div {
  border: #e6e6e6 1px dashed !important;
  border-right: none !important;
  border-top-right-radius: 0px !important;
  border-bottom-right-radius: 0px !important;
  padding: 18px 10px;
  width: 100%;
}
</style>