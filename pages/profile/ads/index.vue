<script setup>
import { ref, computed, watch, onMounted } from "vue";
import BaseSelect from "~/components/form/BaseSelect.vue";
import { useMainStore } from "~/stores/mainStore";
// استدعِ دالة الحذف من الـ composable كما ذكرت:
import { useMain } from "~/composables/useMain"; // تأكد من المسار/الاسم
const { deleteAds } = useMain();

useHead({ title: "إعلاناتي" });
definePageMeta({ middleware: ["auth"] });
useSeo({
  title: "إعلاناتي | منصّة AZZA",
  description:
    "إدارة جميع إعلاناتك المضافة، تعديلها أو حذفها بسهولة، وتتبع حالة النشر.",
  image: "/media/avatars/logo.png",
  canonicalPath: "/my-ads",
  type: "website",
});
const mainStore = useMainStore();

// ====== تحميل البيانات ======
onMounted(async () => {
  try {
    await Promise.all([mainStore.fetchProfile(1)]);
  } catch (e) {
    console.error("init error:", e);
  }
});

// ====== بيانات المتجر ======
const ads = computed(() => mainStore.profileAds ?? []);
const loadingAds = computed(() => mainStore.profilePending);

// ====== خيارات الفلاتر ======
const timers = [
  { value: "newest", label: "الأحدث" },
  { value: "oldest", label: "الأقدم" },
];
const statuses = [
  { value: "approved", label: "نشط" },
  { value: "pending", label: "قيد المراجعة" },
  { value: "expired", label: "منتهي" },
  { value: "rejected", label: "مرفوض" },
];

// ====== قيم مُطبَّقة بالفعل (تؤثر على الجدول) ======
const selectedTimer = ref("newest"); // الافتراضي
const selectedStatus = ref(null); // بدون فلترة حالة افتراضياً

// ====== قيم مؤقتة داخل المودال (لا تؤثر إلا عند تطبيق) ======
const draftTimer = ref(selectedTimer.value);
const draftStatus = ref(selectedStatus.value);

// ====== تطبيق الفلاتر عند الضغط على الزر + إغلاق المودال ======
const filterModalRef = ref(null);

function applyFilters() {
  selectedTimer.value = draftTimer.value;
  selectedStatus.value = draftStatus.value;
  selectedIds.value = [];
  try {
    const anyWin = window;
    const modalApi = anyWin?.bootstrap?.Modal?.getOrCreateInstance?.(
      filterModalRef.value
    );
    modalApi ? modalApi.hide() : fallbackCloseModal();
  } catch {
    fallbackCloseModal();
  }
}
function fallbackCloseModal() {
  const closeBtn = filterModalRef.value?.querySelector(".btn-close");
  if (closeBtn) closeBtn.click();
}

// ====== قائمة العرض (بعد الفلاتر) ======
const viewAds = computed(() => {
  let list = [...ads.value];
  if (selectedStatus.value)
    list = list.filter((a) => a.status === selectedStatus.value);
  if (selectedTimer.value === "newest") {
    list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } else {
    list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  }
  return list;
});

// ====== إدارة التحديد ======
const selectedIds = ref([]);
const total = computed(() => viewAds.value.length);
const allSelected = computed(
  () => total.value > 0 && selectedIds.value.length === total.value
);
const someSelected = computed(
  () => selectedIds.value.length > 0 && selectedIds.value.length < total.value
);

const masterRef = ref(null);
watch([allSelected, someSelected], () => {
  if (masterRef.value)
    masterRef.value.indeterminate = !allSelected.value && someSelected.value;
});

function toggleOne(id) {
  const i = selectedIds.value.indexOf(id);
  if (i === -1) selectedIds.value.push(id);
  else selectedIds.value.splice(i, 1);
}
function toggleAll(e) {
  selectedIds.value = e.target.checked ? viewAds.value.map((a) => a.id) : [];
}
watch([ads, viewAds], () => {
  const ids = new Set(viewAds.value.map((a) => a.id));
  selectedIds.value = selectedIds.value.filter((id) => ids.has(id));
});

// مزامنة مسودات المودال عند فتحه
function syncDraftsWhenOpen() {
  draftTimer.value = selectedTimer.value;
  draftStatus.value = selectedStatus.value;
}

/* ===========================
   الحذف: مفرد + متعدد
   =========================== */
const confirmModalRef = ref(null);
const deleting = ref(false);
const deleteTargetIds = ref([]); // ما سيتم حذفه بعد التأكيد
const errorMsg = ref("");

function openConfirm(ids) {
  deleteTargetIds.value = Array.isArray(ids) ? [...ids] : [ids];
  errorMsg.value = "";
  try {
    const anyWin = window;
    const modalApi = anyWin?.bootstrap?.Modal?.getOrCreateInstance?.(
      confirmModalRef.value
    );
    modalApi?.show?.();
  } catch {
    // تجاهل
  }
}
function closeConfirm() {
  try {
    const anyWin = window;
    const modalApi = anyWin?.bootstrap?.Modal?.getOrCreateInstance?.(
      confirmModalRef.value
    );
    modalApi
      ? modalApi.hide()
      : confirmModalRef.value?.querySelector(".btn-close")?.click();
  } catch {
    confirmModalRef.value?.querySelector(".btn-close")?.click();
  }
}

// استدعِ هذه للدعوة من صف واحد (لو كان AdsRow يطلق حدث delete)
function confirmDeleteOne(id) {
  openConfirm([id]);
}
// استدعِ هذه للزر "حذف المحدد"
function confirmDeleteSelected() {
  if (selectedIds.value.length === 0) return;
  openConfirm([...selectedIds.value]);
}

// التنفيذ الفعلي
async function performDelete() {
  if (!deleteTargetIds.value.length) return;
  deleting.value = true;
  errorMsg.value = "";
  try {
    // استدعاء الـ API بالشكل المطلوب:
    // api/ads/bulk-destroy?ids[1,22,3]
    await deleteAds(deleteTargetIds.value);

    // تحديث واجهة المستخدم:
    // 1) إزالة العناصر المحذوفة من القائمة الحالية (تفاؤلياً)
    const toRemove = new Set(deleteTargetIds.value);
    // ملاحظة: ads هو computed من المتجر؛ إما نعيد جلب أو نضيف أكشن في المتجر.
    // هنا سنعيد الجلب لتبقى الحالة متزامنة مع الخادم:
    await mainStore.fetchProfile(1);

    // 2) تنظيف التحديدات
    selectedIds.value = selectedIds.value.filter((id) => !toRemove.has(id));

    closeConfirm();
  } catch (e) {
    console.error(e);
    errorMsg.value = "فشل حذف الإعلانات. حاول مجدداً.";
  } finally {
    deleting.value = false;
  }
}
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
          <!-- Skeleton -->
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

          <!-- جدول -->
          <table
            v-else-if="viewAds.length > 0"
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
                <th>تاريخ النشر</th>
                <th>العنوان</th>
                <th>السعر</th>
                <th>الحالة</th>
                <th class="text-end">
                  <button
                    class="btn btn-muted p-0 d-inline-flex align-items-center justify-content-center"
                    title="فلترة"
                    data-bs-toggle="modal"
                    data-bs-target="#fillterModal"
                    @click="syncDraftsWhenOpen"
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
              <!-- إن كان AdsRow يطلق حدث delete -->
              <AdsRow
                v-for="ad in viewAds"
                :key="ad.id"
                :ad="ad"
                :selected="selectedIds.includes(ad.id)"
                :deleting-ids="deleteTargetIds"
                @toggle="toggleOne"
                @delete="confirmDeleteOne"
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
      class="d-flex justify-content-center my-5 w-100 gap-2"
    >
      <button class="btn btn-main" @click="confirmDeleteSelected">
        حذف المحدد ({{ selectedIds.length }})
      </button>
    </div>

    <!-- Modal الفلاتر -->
    <div
      class="modal fade"
      id="fillterModal"
      tabindex="-1"
      aria-labelledby="fillterModal"
      aria-hidden="true"
      ref="filterModalRef"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div
            class="modal-header d-flex align-items-center justify-content-between"
          >
            <h3 class="modal-title fs-5" id="fillterModal">فلترة الإعلانات</h3>
            <button
              type="button"
              class="btn-close m-0"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>

          <div class="modal-body">
            <div class="col-md-6 m-auto mb-4">
              <BaseSelect
                v-model="draftTimer"
                label="الترتيب حسب التاريخ"
                placeholder="اختر التاريخ"
                :options="timers"
              />
            </div>
            <div class="col-md-6 m-auto">
              <BaseSelect
                v-model="draftStatus"
                label="الترتيب حسب حالة الإعلان"
                placeholder="اختر الحالة"
                :options="statuses"
              />
            </div>
          </div>

          <div class="modal-footer text-center justify-content-center">
            <button
              type="button"
              class="btn btn-main fw-normal"
              @click="applyFilters"
            >
              <span class="mb-0 text-white">تطبيق الفلاتر</span>
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

    <!-- Modal تأكيد الحذف -->
    <div
      class="modal fade"
      id="confirmDeleteModal"
      tabindex="-1"
      aria-hidden="true"
      ref="confirmModalRef"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div
            class="modal-header d-flex align-items-center justify-content-between"
          >
            <h3 class="modal-title fs-5">تأكيد الحذف</h3>
            <button
              type="button"
              class="btn-close m-0"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <p class="mb-2">
              هل أنت متأكد من حذف
              <strong>{{ deleteTargetIds.length }}</strong>
              إعلان؟
            </p>
            <p v-if="errorMsg" class="text-danger mb-0">{{ errorMsg }}</p>
          </div>
          <div class="modal-footer">
            <button class="btn" :disabled="deleting" data-bs-dismiss="modal">
              إلغاء
            </button>
            <button
              class="btn btn-main"
              :disabled="deleting"
              @click="performDelete"
            >
              <span v-if="!deleting">تأكيد الحذف</span>
              <span v-else>جاري الحذف...</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Skeleton */
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
/* sizes */
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
/* table */
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
</style>
