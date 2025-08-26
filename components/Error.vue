<script setup>
// props
const props = defineProps(["message", "errType", "statusCode"]);

// === computed === //
const errorImage = computed(() => {
  if (props.statusCode === 404) {
    return "~/public/media/auth/404-error.svg";
  } else if (props.statusCode === 500) {
    return "~/public/media/auth/500-error.png";
  } else if (props.statusCode === 403) {
    return "~/public/media/auth/403-error.svg";
  }
  return "~/public/media/auth/404-error.svg";
});

const isMobileError = computed(() =>
  props.errType === "mobile" ? true : false
);

// === methods === //
const handleClearError = () => clearError({ redirect: "/" });
</script>

<template>
  <!--begin::Root-->
  <div class="d-flex flex-column flex-root" id="kt_app_root">
    <!--begin::Page bg image-->
    <!--end::Page bg image-->
    <!--begin::Authentication - Signup Welcome Message -->
    <div class="d-flex flex-column flex-center flex-column-fluid">
      <!--begin::Content-->
      <div class="d-flex flex-column flex-center text-center p-10">
        <!--begin::Wrapper-->
        <div class="card card-flush w-lg-650px py-5">
          <div class="card-body py-15 py-lg-20">
            <!--begin::Title-->
            <h1 class="fw-bolder fs-2hx text-gray-900 mb-4">حدث خطأ ما…!</h1>
            <!--end::Title-->
            <!--begin::Text-->
            <div
              v-if="isMobileError"
              class="fw-bold fs-1 text-capitalize text-center mb-6"
            >
              {{ message }}
            </div>
            <div v-else class="fw-semibold fs-6 text-gray-500 mb-7">
              {{ message }}
            </div>
            <!--end::Text-->
            <!--begin::Illustration-->
            <div class="mb-3">
              <i
                v-if="isMobileError"
                class="pi pi-exclamation-circle mw-100 mh-300px text-warning"
                style="font-size: 200px"
              ></i>
              <img
                v-else
                :src="errorImage"
                class="mw-100 mh-300px theme-light-show"
                alt=""
              />
            </div>
            <!--end::Illustration-->
            <!--begin::Link-->
            <div
              class="mb-0 mt-8 d-flex justify-content-center"
              v-if="!isMobileError"
            >
              <button class="btn btn-sm btn-main" @click="handleClearError">
                الرجوع للصفحة الرئيسية
                <Icon
                  name="material-symbols:arrow-back-rounded"
                  class="text-white me-2"
                  size="22"
                />
              </button>
            </div>
            <!--end::Link-->
          </div>
        </div>
        <!--end::Wrapper-->
      </div>
      <!--end::Content-->
    </div>
  </div>
  <!--end::Root-->
</template>