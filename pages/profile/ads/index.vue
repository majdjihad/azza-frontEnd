<script setup>
import BaseSelect from "~/components/form/BaseSelect.vue";

const ads = ref([
  {
    id: 1,
    name: "كاميرا احترافية بحالة ممتازة للبيع",
    category: "أجهزة",
    duration: "3 شهور",
    clicks: "300 نقرة",
    published: "27/12/2024",
    city: "جباليا",
    price: "600 شيكل",
    status: "active",
    image: "/media/bg-home/bg1.png",
  },
  {
    id: 2,
    name: "فيلّا سياحية وسكنية عظم بسعر مغري",
    category: "عقارات",
    duration: "3 شهور",
    clicks: "300 نقرة",
    published: "27/12/2024",
    city: "جباليا",
    price: "600 شيكل",
    status: "pending",
    image: "/media/bg-home/bg2.png",
  },
  {
    id: 3,
    name: "دراجة هوائية مقاس 26 بحالة ممتازة",
    category: "عقارات",
    duration: "3 شهور",
    clicks: "300 نقرة",
    published: "01/07/2002",
    city: "جباليا",
    price: "600 شيكل",
    status: "scheduled",
    image: "/media/bg-home/bg3.png",
  },
  {
    id: 4,
    name: "أجهزة تأثيث المنزلية بالبلاستيك",
    category: "عقارات",
    duration: "3 شهور",
    clicks: "300 نقرة",
    published: "27/12/2024",
    city: "جباليا",
    price: "600 شيكل",
    status: "rejected",
    image: "/media/bg-home/bg4.png",
  },
  {
    id: 5,
    name: "كاميرا احترافية بحالة ممتازة للبيع",
    category: "أجهزة",
    duration: "3 شهور",
    clicks: "300 نقرة",
    published: "27/12/2024",
    city: "جباليا",
    price: "600 شيكل",
    status: "active",
    image: "/media/bg-home/bg5.png",
  },
  {
    id: 6,
    name: "فيلّا سياحية وسكنية عظم بسعر مغري",
    category: "عقارات",
    duration: "3 شهور",
    clicks: "300 نقرة",
    published: "27/12/2024",
    city: "جباليا",
    price: "600 شيكل",
    status: "pending",
    image: "/media/bg-home/bg6.png",
  },
]);
const cities = [
  { value: "جباليا", label: "جباليا" },
  { value: "خانيونس", label: "خانيونس" },
  { value: "النصيرات", label: "النصيرات" },
  { value: "رفح", label: "رفح" },
  { value: "دير البلح", label: "دير البلح" },
  { value: "مدينة غزة", label: "مدينة غزة" },
  { value: "بيت لاهيا", label: "بيت لاهيا" },
  { value: "بيت حانون", label: "بيت حانون" },
];
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
const selectedIds = ref([]);

// حسابات التحديد
const total = computed(() => ads.value.length);
const allSelected = computed(
  () => total.value > 0 && selectedIds.value.length === total.value
);
const someSelected = computed(
  () => selectedIds.value.length > 0 && selectedIds.value.length < total.value
);

// indeterminate لمربع تحديد الكل (خاصية DOM)
const masterRef = ref(null);
watch([allSelected, someSelected], () => {
  if (masterRef.value) {
    masterRef.value.indeterminate = !allSelected.value && someSelected.value;
  }
});

// وظائف التحكّم
function toggleOne(id) {
  const i = selectedIds.value.indexOf(id);
  if (i === -1) selectedIds.value.push(id);
  else selectedIds.value.splice(i, 1);
}

function toggleAll(e) {
  const checked = e.target.checked;
  selectedIds.value = checked ? ads.value.map((a) => a.id) : [];
}

// (اختياري) لو تغيّر مصدر ads (فلترة/تحميل جديد)، نظّف المحددات غير الموجودة
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
          <table
            v-if="ads.length > 0"
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
              <AdsRow
                v-for="ad in ads"
                :key="ad.id"
                :ad="ad"
                :selected="selectedIds.includes(ad.id)"
                @toggle="toggleOne"
              />
            </tbody>
          </table>
          <div v-else class="text-center p-4">
            <img src="/media/empty-ads.png" alt="اعلانات فارغة" />
            <h3>صفحتـك الإعلانيـة ما زالـت فارغـة</h3>
            <p class="text-muted">
              انشر أول إعلان لتبدأ رحلتك مع الزبائن المهتمين!
            </p>
            <div>
              <NuxtLink
                to="/create-ads"
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
            <div class="col-md-6 m-auto">
              <BaseSelect
                label="الترتيب حسب المدينة"
                placeholder="اختر المدينة"
                :options="cities"
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