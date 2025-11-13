<template>
  <div class="row g-4 flex-row-reverse">
    <!-- ======= Main ======= -->
    <main class="col-lg-9 order-1 order-lg-2">
      <div class="card border-0 p-9">
        <!-- عنوان + أكشنز -->
        <div
          class="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-2 mb-8"
        >
          <div class="w-100">
            <div class="sk sk-line" style="width: 60%; height: 24px"></div>
            <div class="d-flex align-items-center gap-4 mt-3">
              <div class="sk sk-line" style="width: 160px; height: 14px"></div>
              <div class="sk sk-line" style="width: 140px; height: 14px"></div>
            </div>
          </div>
          <div class="d-flex align-items-center gap-2 mt-3 mt-md-0">
            <div class="sk sk-pill" style="width: 120px; height: 38px"></div>
          </div>
        </div>

        <!-- المعرض -->
        <div class="row g-3 mb-3">
          <div class="col-md-8">
            <div class="sk sk-rect rounded-1" style="height: 322px"></div>
          </div>
          <div class="col-md-4 col-6">
            <div class="d-md-grid d-flex gap-3">
              <div class="sk sk-rect rounded-1" style="height: 154px"></div>
              <div class="sk sk-rect rounded-1" style="height: 154px"></div>
            </div>
          </div>
        </div>

        <!-- الوصف -->
        <div class="my-4">
          <div class="sk sk-line mb-2" style="height: 14px; width: 95%"></div>
          <div class="sk sk-line mb-2" style="height: 14px; width: 88%"></div>
          <div class="sk sk-line mb-2" style="height: 14px; width: 92%"></div>
          <div class="sk sk-line" style="height: 14px; width: 70%"></div>
        </div>

        <!-- تفاصيل إضافية -->
        <div class="ads-data">
          <div class="py-4">
            <div class="sk sk-line" style="height: 22px; width: 180px"></div>
          </div>
          <div class="row g-3">
            <div v-for="i in 6" :key="'sk-detail-' + i" class="col-6 col-md-3">
              <div class="p-3 pe-0 text-end">
                <div
                  class="sk sk-line mb-2"
                  style="height: 14px; width: 60%"
                ></div>
                <div class="sk sk-line" style="height: 16px; width: 40%"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- ======= Sidebar ======= -->
    <aside class="col-lg-3 order-2 order-lg-1" v-if="showSidebar">
      <!-- السعر -->
      <div class="card mb-3">
        <div class="card-body d-flex align-items-center gap-2">
          <div class="sk sk-line" style="height: 28px; width: 200px"></div>
        </div>
      </div>

      <!-- بيانات الناشر -->
      <div class="card mb-3">
        <div class="card-body p-0">
          <div class="my-3 text-center">
            <div class="sk sk-circle m-auto"></div>
            <div
              class="sk sk-line m-auto mt-3"
              style="height: 18px; width: 120px"
            ></div>
          </div>

          <div class="mx-3 my-5 text-center">
            <div class="sk sk-pill mb-3" style="height: 46px; width: 100%"></div>
            <div class="sk sk-pill mb-3" style="height: 46px; width: 100%"></div>
            <div class="sk sk-pill mb-3" style="height: 46px; width: 100%"></div>
          </div>
        </div>
      </div>

      <!-- نصائح -->
      <div class="card">
        <div class="card-body">
          <div class="sk sk-line mb-3" style="height: 20px; width: 80px"></div>
          <div class="sk sk-line mb-4" style="height: 15px; width: 95%"></div>
          <div class="sk sk-line mb-4" style="height: 15px; width: 82%"></div>
          <div class="sk sk-line mb-4" style="height: 15px; width: 90%"></div>
          <div class="sk sk-line" style="height: 12px; width: 70%"></div>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup>
defineProps({
  /** إظهار/إخفاء السايدبار */
  showSidebar: { type: Boolean, default: true },
});
</script>

<style scoped>
/* ====== Skeleton Base ====== */
@keyframes shimmer {
  0% {
    transform: translateX(-150px);
  }
  100% {
    transform: translateX(100%);
  }
}
.sk {
  position: relative;
  overflow: hidden;
  background: #eef1f5;
  border-radius: 8px;
}
.sk::after {
  content: "";
  position: absolute;
  top: 0;
  height: 100%;
  width: 150px;
  left: -150px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.6),
    transparent
  );
  animation: shimmer 1.2s infinite;
}
.sk-line {
  display: block;
}
.sk-rect {
  display: block;
}
.sk-pill {
  border-radius: 999px;
}
.sk-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
}
.sk-icon {
  width: 28px;
  height: 28px;
  border-radius: 6px;
}
/* ارتفاعات معرض الصور في صفحتك */
.gallery-thumbs img {
  height: 154px;
  object-fit: cover;
}
.gallery-main img {
  height: 322px;
  object-fit: cover;
}
</style>
