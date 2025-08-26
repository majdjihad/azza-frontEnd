<script setup>
const props = defineProps({
  show: Boolean,
});
const items = [
  {
    title: "تم قبول إعلانك",
    message:
      'مبروك! تم مراجعة إعلانك "كاميرا احترافية بحالة ممتازة للبيع" والموافقة عليه.',
    time: "منذ 5 دقائق",
    details: "إعلانك الآن جاهز للزوار.",
    status: "تم القبول",
  },
  {
    title: "تم رفض إعلانك",
    message:
      'نعتذر، لم يتم قبول إعلانك بعنوان "شقة للإيجار". السبب: الصور المرفقة غير واضحة.',
    time: "منذ 6 ساعات",
    details: "حاول رفع صور أوضح.",
    status: "تم الرفض",
  },
  {
    title: "إعلانك قيد المراجعة",
    message: 'إعلانك بعنوان "أجهزة للعناية بالبشرة" قيد المراجعة حالياً.',
    time: "منذ يوم و6 ساعات",
    details: "سنقوم بإبلاغك عند الموافقة أو الرفض.",
    status: "قيد المراجعة",
  },
  {
    title: "تم قبول إعلانك",
    message:
      'مبروك! تم مراجعة إعلانك "كاميرا احترافية بحالة ممتازة للبيع" والموافقة عليه.',
    time: "منذ 5 دقائق",
    details: "إعلانك الآن جاهز للزوار.",
    status: "تم القبول",
  },
  {
    title: "تم رفض إعلانك",
    message:
      'نعتذر، لم يتم قبول إعلانك بعنوان "شقة للإيجار". السبب: الصور المرفقة غير واضحة.',
    time: "منذ 6 ساعات",
    details: "حاول رفع صور أوضح.",
    status: "تم الرفض",
  },
  {
    title: "إعلانك قيد المراجعة",
    message: 'إعلانك بعنوان "أجهزة للعناية بالبشرة" قيد المراجعة حالياً.',
    time: "منذ يوم و6 ساعات",
    details: "سنقوم بإبلاغك عند الموافقة أو الرفض.",
    status: "قيد المراجعة",
  },
];
const getBadgeClass = (status) => {
  switch (status) {
    case "تم القبول":
      return "bg-success";
    case "تم الرفض":
      return "bg-danger";
    case "قيد المراجعة":
      return "bg-info";
    default:
      return "bg-secondary";
  }
};
</script>

<template>
  <div
    v-if="show"
    class="dropdown-menu show shadow w-100 p-3 position-absolute start-0"
    style="max-height: 500px; min-width: 350px; overflow-y: auto"
  >
    <h5 class="fw-bold border-bottom text-end pb-2 mb-3">
      الاشعارات ({{ items.length }})
    </h5>
    <ul class="list-group notifications-scroll p-0">
      <li
        v-for="(notification, index) in items"
        :key="index"
        class="d-flex justify-content-between align-items-start flex-column p-2 border-bottom text-end"
      >
        <div class="d-flex w-100 align-items-center mb-2">
          <!-- العنوان والحالة -->
          <div class="flex-grow-1 text-end">
            <div
              class="fw-bold d-flex justify-content-between align-items-center"
            >
              <div>
                <span class="ps-1"> {{ notification.title }} </span>
                <span
                  class="badge ms-2 text-white"
                  :class="getBadgeClass(notification.status)"
                >
                  {{ notification.status }}
                </span>
              </div>
              <small class="text-muted fw-semibold">{{
                notification.time
              }}</small>
            </div>
          </div>
        </div>

        <!-- الرسالة -->
        <p class="mb-1 pt-1 text-muted">{{ notification.message }}</p>

        <!-- التفاصيل -->
        <div v-if="notification.showDetails" class="mt-2 alert alert-secondary">
          {{ notification.details }}
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.notifications-list {
  direction: rtl; /* دعم اللغة العربية */
  text-align: right;
}

.notifications-scroll {
  max-height: 300px; /* تحديد ارتفاع القائمة */
  overflow-y: auto; /* التمرير عند الطول الكبير */
}

.list-group-item {
  text-align: right;
}

.badge {
  font-size: 0.75rem;
}

i {
  font-size: 1.4rem;
}
</style>
