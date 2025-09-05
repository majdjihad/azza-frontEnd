<script setup>
import BaseSelect from "~/components/form/BaseSelect.vue";
import { useMainStore } from "~/stores/mainStore";
import { useCategoryStore } from "~/stores/categoryStore";
useHead({ title: "إعلاناتي" });
definePageMeta({ middleware: ["auth"] });
const mainStore = useMainStore();
const categoryStore = useCategoryStore();

// اجلب بروفايل + إعلاناته + المدن عند التحميل
onMounted(async () => {
  try {
    const tasks = [mainStore.fetchProfile(1)];
    if (!categoryStore.citiesData) tasks.push(categoryStore.getCitiesData());
    await Promise.all(tasks);
  } catch (e) {
    console.error("init error:", e);
  }
});

// إعلانات البروفايل + حالة التحميل
const ads = computed(() => mainStore.profileAds ?? []);
const loadingAds = computed(() => mainStore.profilePending);

// خيارات المدن من الستور (إذا كانت citiesData مصفوفة عناصر فيها name/id)
const citiesOptions = computed(() => {
  const data = categoryStore.citiesData;
  if (!Array.isArray(data)) return [];
  return data.map((c) => ({
    value: c?.id ?? c?.name ?? "",
    label: c?.name ?? String(c?.id ?? ""),
  }));
});
const citiesLoading = computed(() => !Array.isArray(categoryStore.citiesData));

// باقي الفلاتر (ثابتة)
const timers = [
  { value: "الاقدام", label: "الاقدام" },
  { value: "الاحداث", label: "الاحداث" },
];
const statuses = [
  { value: "النشط", label: "نشط" },
  { value: "الذي يتم مراجعته", label: "الذي يتم مراجعته" },
  { value: "المنتهي", label: "المنتهي" },
  { value: "المرفوض", label: "المرفوض" },
];

// إدارة التحديد
const selectedIds = ref([]);
const total = computed(() => ads.value.length);
const allSelected = computed(
  () => total.value > 0 && selectedIds.value.length === total.value
);
const someSelected = computed(
  () => selectedIds.value.length > 0 && selectedIds.value.length < total.value
);

const masterRef = ref(null);
watch([allSelected, someSelected], () => {
  if (masterRef.value) {
    masterRef.value.indeterminate = !allSelected.value && someSelected.value;
  }
});

function toggleOne(id) {
  const i = selectedIds.value.indexOf(id);
  if (i === -1) selectedIds.value.push(id);
  else selectedIds.value.splice(i, 1);
}

function toggleAll(e) {
  const checked = e.target.checked;
  selectedIds.value = checked ? ads.value.map((a) => a.id) : [];
}

// نظّف المحددات عند تغيّر مصدر الإعلانات
watch(ads, () => {
  const ids = new Set(ads.value.map((a) => a.id));
  selectedIds.value = selectedIds.value.filter((id) => ids.has(id));
});
</script>

<template>
  <div class="container py-4 py-md-5">
    <div class="d-flex align-items-start justify-content-between mb-3 mb-md-4">
      <div>
        <h3 class="fw-bold mb-1">إعلاناتي</h3>
        <div class="d-flex align-items-center my-9">
          <h2 class="fs-3 m-0 fw-normal text-primary d-inline">الرئيسية</h2>
          <Icon
            name="mdi:chevron-left-circle-outline"
            class="fs-3 mx-3 text-secondary"
          />
          <h2 class="fs-3 m-0 fw-normal text-muted">إعلاناتي</h2>
        </div>
      </div>
    </div>

    <div class="card rounded">
      <div class="card-body p-0">
        <div class="table-responsive">
          <!-- Skeleton أثناء جلب الإعلانات -->
          <div v-if="loadingAds" class="p-3">
            <div class="skeleton skeleton-line h-32 w-200 mb-3"></div>
            <div class="table table-custom mb-0 align-middle">
              <div class="skeleton-row" v-for="i in 6" :key="'sk-row-' + i">
                <div class="skeleton skeleton-box w-24"></div>
                <div class="skeleton skeleton-thumb"></div>
                <div class="skeleton skeleton-line w-260"></div>
                <div class="skeleton skeleton-line w-120"></div>
                <div class="skeleton skeleton-line w-100"></div>
                <div class="skeleton skeleton-line w-120"></div>
                <div class="skeleton skeleton-line w-140"></div>
                <div class="skeleton skeleton-line w-100"></div>
                <div class="skeleton skeleton-pill w-80 h-28"></div>
                <div class="skeleton skeleton-icon w-24 h-24"></div>
              </div>
            </div>
          </div>

          <!-- جدول الإعلانات -->
          <table
            v-else-if="ads.length > 0"
            class="table table-custom mb-0 align-middle table-hover"
          >
            <thead class="bg-white">
              <tr>
                <th>
                  <input
                    ref="masterRef"
                    class="form-check-input ms-2"
                    type="checkbox"
                    :checked="allSelected"
                    @change="toggleAll"
                  />
                </th>
                <th>صورة الإعلان</th>
                <th>اسم الإعلان</th>
                <th>القسم</th>
                <th>المدة</th>
                <th>تاريخ النشر</th>
                <th>العنوان</th>
                <th>السعر</th>
                <th>الحالة</th>
                <th class="table-filter text-end">
                  <button
                    class="btn btn-muted p-0 d-inline-flex align-items-center justify-content-center"
                    title="فلترة"
                    data-bs-toggle="modal"
                    data-bs-target="#fillterModal"
                  >
                    <Icon
                      name="material-symbols-light:filter-list"
                      class="display-6 text-secondary"
                    />
                  </button>
                </th>
              </tr>
            </thead>

            <tbody>
              <!-- AdsRow يعرض الإعلان كما يأتي من API -->
              <AdsRow
                v-for="ad in ads"
                :key="ad.id"
                :ad="ad"
                :selected="selectedIds.includes(ad.id)"
                @toggle="toggleOne"
              />
            </tbody>
          </table>

          <!-- لا توجد إعلانات -->
          <div v-else class="text-center p-4">
            <img src="/media/empty-ads.png" alt="اعلانات فارغة" />
            <h3>صفحتـك الإعلانيـة ما زالـت فارغـة</h3>
            <p class="text-muted">
              انشر أول إعلان لتبدأ رحلتك مع الزبائن المهتمين!
            </p>
            <div>
              <NuxtLink
                to="/ads/create"
                class="btn btn-lg mt-4 btn-main d-inline-flex align-items-center gap-2"
              >
                <Icon class="fs-3" name="fa-solid:plus" />
                <span class="fs-3">إضافة إعلان</span>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- أزرار مجمّعة -->
    <div
      v-if="selectedIds.length > 0"
      class="d-flex justify-content-center my-5 w-100"
    >
      <button class="btn btn-main">حذف الكل</button>
    </div>

    <!-- Modal -->
    <div
      class="modal fade"
      id="fillterModal"
      tabindex="-1"
      aria-labelledby="fillterModal"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div
            class="modal-header d-flex align-items-center justify-content-between"
          >
            <h3 class="modal-title fs-5" id="fillterModal">فلترة الاعلانات</h3>
            <button
              type="button"
              class="btn-close m-0"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>

          <div class="modal-body">
            <!-- المدن: skeleton أثناء الجلب ثم BaseSelect عند الجاهزية -->
            <div class="col-md-6 m-auto">
              <template v-if="citiesLoading">
                <div class="label-muted fw-bold fs-4 mb-2">
                  الترتيب حسب المدينة
                </div>
                <div
                  class="skeleton skeleton-line h-40 w-100 mb-3 rounded"
                ></div>
              </template>
              <BaseSelect
                v-else
                label="الترتيب حسب المدينة"
                placeholder="اختر المدينة"
                :options="citiesOptions"
              />
            </div>

            <div class="col-md-6 m-auto">
              <BaseSelect
                label="الترتيب حسب التاريخ"
                placeholder="اختر التاريخ"
                :options="timers"
              />
            </div>

            <div class="col-md-6 m-auto">
              <BaseSelect
                label="الترتيب حسب حالة الاعلان"
                placeholder="اختر الحالة"
                :options="statuses"
              />
            </div>
          </div>

          <div class="modal-footer text-center justify-content-center">
            <button type="button" class="btn btn-main fw-normal">
              <span class="mb-0 text-white">فلترة</span>
              <Icon
                name="material-symbols:arrow-back-rounded"
                class="text-white"
                size="20"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ====== Skeleton (Shimmer) ====== */
.skeleton {
  position: relative;
  overflow: hidden;
  background: #eef1f5;
  border-radius: 0.5rem;
}
.skeleton::after {
  content: "";
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background-image: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.7) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  animation: shimmer 1.6s infinite;
}
@media (prefers-reduced-motion: reduce) {
  .skeleton::after {
    animation: none;
  }
}
@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

/* عناصر الجدول الوهمية */
.skeleton-row {
  display: grid;
  grid-template-columns: 32px 80px 260px 120px 100px 120px 140px 100px 100px 40px;
  gap: 12px;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--line, #eef0f3);
}
.skeleton-box {
  height: 20px;
  border-radius: 6px;
}
.skeleton-thumb {
  width: 58px;
  height: 58px;
  border-radius: 12px;
  background: #f3f5f8;
}
.skeleton-line {
  height: 14px;
}
.skeleton-pill {
  border-radius: 9999px;
}
.skeleton-icon {
  border-radius: 6px;
}

/* أبعاد مساعدة */
.h-28 {
  height: 28px;
}
.h-32 {
  height: 32px;
}
.h-40 {
  height: 40px;
}
.w-24 {
  width: 24px;
}
.w-80 {
  width: 80px;
}
.w-100 {
  width: 100%;
}
.w-120 {
  width: 120px;
}
.w-140 {
  width: 140px;
}
.w-200 {
  width: 200px;
}
.w-240 {
  width: 240px;
}
.w-260 {
  width: 260px;
}

/* ====== بقية الأنماط ====== */
.bg-soft {
  background: var(--soft-bg);
}
.table-custom thead th {
  color: #6b7384;
  font-weight: 700;
  font-size: 0.92rem;
}
.table-custom tbody tr {
  border-bottom: 1px solid var(--line);
}
.table-custom td,
.table-custom th {
  vertical-align: middle;
  padding: 1rem 0.75rem;
}
.row-thumb {
  width: 58px;
  height: 58px;
  border-radius: 12px;
  object-fit: cover;
}
.cell-image {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.6rem;
}
.breadcrumb-slim {
  --bs-breadcrumb-divider: "›";
}
</style>
