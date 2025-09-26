<script setup>
import {
  ref,
  computed,
  onMounted,
  watch,
  nextTick,
  onBeforeUnmount,
} from "vue";
import { useRouter } from "#app";
import { useAuth } from "~/composables/useAuth";
import { useMain } from "~/composables/useMain";
import NotificationRow from "~/components/NotificationRow.vue";
import moment from "moment";

const router = useRouter();
const { isLoggedIn } = useAuth();
const {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  showNotification,
  deleteNotification,
  deleteAllNotifications,
} = useMain();

// الحالة
const open = ref(false);
const loading = ref(false);
const error = ref(null);

const items = ref([]);
const pagination = ref({
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
});
const unreadCount = ref(0);

// فتح/إغلاق
async function toggle() {
  if (!isLoggedIn.value) return router.push("/login");
  const willOpen = !open.value;
  open.value = willOpen;
  if (willOpen) await fetchAll(1);
}
function closePanel() {
  open.value = false;
}

// جلب البيانات
async function fetchAll(page = 1) {
  try {
    loading.value = true;
    error.value = null;

    const res = await getNotifications({
      page,
      per_page: pagination.value.per_page,
      onlyUnread: false,
    });

    const data = res?.data || {};
    items.value = data.notifications || [];
    const pg = data.pagination || {};
    pagination.value = {
      current_page: pg.current_page ?? 1,
      last_page: pg.last_page ?? 1,
      per_page: pg.per_page ?? 10,
      total: pg.total ?? data.notifications?.length ?? 0,
    };

    const countRes = await getUnreadCount();
    unreadCount.value = countRes?.data?.unread_count ?? 0;
  } catch (e) {
    error.value = "حدث خطأ أثناء جلب الإشعارات.";
  } finally {
    loading.value = false;
  }
}

// تحويل عنصر الإشعار
function mapNotification(n) {
  const d = n?.data || {};
  return {
    id: n?.id,
    title: d.title || "إشعار",
    message: d.message || d.body || "—",
    details: d.details || "",
    status: d.status || (n?.read_at ? "مقروء" : "غير مقروء"),
    read_at: n?.read_at,
    created_at: n?.created_at,
    time: moment(n?.created_at).calendar().toLocaleString("ar-EG"),
  };
}
const mappedItems = computed(() => items.value.map(mapNotification));

// إجراءات على عنصر
async function handleOpen(id) {
  await showNotification(id);
  await fetchAll(pagination.value.current_page);
}
async function handleMarkRead(id) {
  await markNotificationAsRead(id);
  await fetchAll(pagination.value.current_page);
}
async function handleDelete(id) {
  await deleteNotification(id);
  const nextPage =
    items.value.length === 1 && pagination.value.current_page > 1
      ? pagination.value.current_page - 1
      : pagination.value.current_page;
  await fetchAll(nextPage);
}

// إجراءات عامة
async function handleMarkAll() {
  await markAllNotificationsAsRead();
  await fetchAll(pagination.value.current_page);
}
async function handleDeleteAll() {
  await deleteAllNotifications();
  await fetchAll(1);
}

// ترقيم
function goTo(page) {
  if (page < 1 || page > pagination.value.last_page) return;
  fetchAll(page);
}

// تحديث عدّاد عند التركيب (اختياري)
onMounted(async () => {
  if (isLoggedIn.value) {
    const countRes = await getUnreadCount();
    unreadCount.value = countRes?.data?.unread_count ?? 0;
  }
});

// عدد عناصر السكيلتون عند التحميل
const skeletonCount = computed(() =>
  Math.min(5, pagination.value.per_page || 5)
);

let tooltipInstances = [];
function initTooltips() {
  const els = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  // نظّف القديمة
  tooltipInstances.forEach((t) => t.dispose?.());
  tooltipInstances = [];

  const bootstrap = window.bootstrap;
  if (!bootstrap?.Tooltip) return;

  els.forEach((el) => {
    // امنع التكرار
    if (bootstrap.Tooltip.getInstance(el)) {
      bootstrap.Tooltip.getInstance(el).dispose();
    }
    tooltipInstances.push(new bootstrap.Tooltip(el, { container: "body" }));
  });
}

watch(
  () => open.value,
  async (v) => {
    if (v) {
      await nextTick();
      initTooltips();
    }
  }
);

onMounted(() => {
  initTooltips();
});

onBeforeUnmount(() => {
  tooltipInstances.forEach((t) => t.dispose?.());
  tooltipInstances = [];
});
</script>

<template>
  <div class="position-relative dropdown">
    <!-- زر الجرس + العدّاد -->
    <button
      @click="toggle"
      class="btn btn-link text-decoration-none d-flex flex-column align-items-center position-relative"
      :class="open ? 'text-primary' : 'text-secondary'"
      aria-label="عرض الإشعارات"
    >
      <Icon name="fa-solid:bell" class="fs-2" />
      <span v-if="unreadCount > 0" class="notif-badge">{{ unreadCount }}</span>
      <span class="fs-5 mt-4">الإشعارات</span>
    </button>

    <!-- القائمة -->
    <div
      v-if="open"
      v-click-outside="() => (open = false)"
      class="notif-menu dropdown-menu show p-0 position-absolute start-0"
      role="dialog"
      aria-modal="true"
    >
      <!-- 🔘 ترويسة الهاتف (تظهر فقط على الشاشات الصغيرة) -->
      <div class="mobile-header d-md-none sticky-top bg-white border-bottom">
        <div
          class="d-flex align-items-center justify-content-between px-3"
          style="height: 56px"
        >
          <h6 class="fw-bold m-0">الإشعارات ({{ unreadCount }})</h6>
          <button
            type="button"
            class="btn-close"
            aria-label="إغلاق"
            @click="closePanel"
          ></button>
        </div>
      </div>

      <!-- رأس الديسكتوب — يظهر فقط على الشاشات الكبيرة -->
      <div
        class="notif-header d-none d-md-flex justify-content-between align-items-center py-1"
      >
        <div class="text-end">
          <div class="fw-bold">الإشعارات({{ unreadCount }})</div>
        </div>
        <div class="d-flex gap-2">
          <!-- Mark all read -->
          <span
            class="d-inline-block"
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            data-bs-title="الكل مقروء"
          >
            <button
              type="button"
              class="btn btn-sm btn-outline-muted rounded-pill"
              @click="handleMarkAll"
              :disabled="loading || unreadCount === 0"
            >
              <Icon name="fa6-regular:envelope-open" class="fs-3 text-muted" />
            </button>
          </span>

          <!-- Delete all -->
          <span
            class="d-inline-block"
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            data-bs-title="حذف كل الإشعارات"
          >
            <button
              type="button"
              class="btn btn-sm btn-delete rounded-pill"
              @click="handleDeleteAll"
              :disabled="loading || unreadCount === 0"
            >
              <Icon name="fa6-regular:trash-can" class="fs-3" />
            </button>
          </span>
        </div>
      </div>

      <!-- المحتوى -->
      <div class="notif-body">
        <div v-if="error" class="alert alert-danger text-end mb-2 mx-3">
          {{ error }}
        </div>

        <!-- Skeleton state -->
        <ul v-else-if="loading" class="list-group p-0">
          <li v-for="i in skeletonCount" :key="i" class="skeleton-row">
            <div class="skeleton-title shimmer"></div>
            <div class="skeleton-line shimmer"></div>
            <div class="skeleton-line short shimmer"></div>
          </li>
        </ul>

        <!-- قائمة فعلية -->
        <ul v-else class="list-group p-0">
          <NotificationRow
            v-for="n in mappedItems"
            :key="n.id"
            :notification="n"
            @open="handleOpen"
            @mark-read="handleMarkRead"
            @delete="handleDelete"
          />
          <li v-if="mappedItems.length === 0" class="empty-state">
            <Icon name="fa6-regular:bell" class="display-1 mb-4" />
            <div class="fw-bold">لا توجد إشعارات</div>
            <small class="text-muted">عند وصول إشعارات جديدة ستظهر هنا.</small>
          </li>
        </ul>
      </div>

      <!-- (اختياري) الترقيم
      <div class="notif-footer d-none d-md-flex justify-content-between align-items-center">
        <small class="text-muted">
          الصفحة {{ pagination.current_page }} من {{ pagination.last_page }} — إجمالي {{ pagination.total }}
        </small>
        <div class="btn-group">
          <button
            class="btn btn-sm btn-outline-secondary rounded-pill"
            @click="goTo(pagination.current_page - 1)"
            :disabled="pagination.current_page <= 1 || loading"
          >
            السابق
          </button>
          <button
            class="btn btn-sm btn-outline-secondary rounded-pill"
            @click="goTo(pagination.current_page + 1)"
            :disabled="pagination.current_page >= pagination.last_page || loading"
          >
            التالي
          </button>
        </div>
      </div>
      -->
    </div>
  </div>
</template>

<style scoped>
/* زر الجرس */
.notif-trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--bs-secondary);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 999px;
  transition: all 0.2s ease;
}
.notif-trigger:hover,
.notif-trigger.active {
  color: var(--bs-primary);
  background: rgba(var(--bs-primary-rgb), 0.06);
  border-color: rgba(var(--bs-primary-rgb), 0.2);
}
.notif-label {
  font-size: 0.95rem;
}
.notif-badge {
  position: absolute;
  top: 0;
  inset-inline-start: 70%;
  transform: translate(200%, 0%);
  background: var(--bs-danger);
  color: #fff;
  border-radius: 999px;
  font-size: 0.72rem;
  padding: 0.15rem 0.45rem;
  line-height: 1;
  box-shadow: 0 0 0 2px #fff;
}

/* القائمة (الديسكتوب/الافتراضي) */
.notif-menu {
  width: 420px;
  max-width: calc(100vw - 24px);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 18px rgba(0, 0, 0, 0.06), 0 2px 6px rgba(0, 0, 0, 0.04);
  background: #fff;
}

/* الرأس (الديسكتوب) */
.notif-header {
  padding: 14px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  background: radial-gradient(
      60% 100% at 100% 0%,
      rgba(var(--bs-primary-rgb), 0.04),
      transparent 60%
    ),
    #fff;
}
.header-icon {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  background: rgba(var(--bs-primary-rgb), 0.08);
  color: var(--bs-primary);
  border-radius: 12px;
}

/* الجسم */
.notif-body {
  max-height: 420px;
  overflow-y: auto;
  padding: 8px 0;
}

/* التذييل */
.notif-footer {
  padding: 12px 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  background: #fff;
}

/* Skeleton */
.skeleton-row {
  padding: 14px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  direction: rtl;
}
.skeleton-title {
  height: 16px;
  width: 40%;
  margin: 2px 0 10px;
  border-radius: 8px;
  background: #eee;
}
.skeleton-line {
  height: 12px;
  width: 90%;
  margin: 6px 0;
  border-radius: 8px;
  background: #eee;
}
.skeleton-line.short {
  width: 60%;
}
@keyframes shimmer {
  0% {
    background-position: -450px 0;
  }
  100% {
    background-position: 450px 0;
  }
}
.shimmer {
  background: linear-gradient(90deg, #eee 25%, #f7f7f7 37%, #eee 63%);
  background-size: 400% 100%;
  animation: shimmer 1.2s ease-in-out infinite;
}

/* Empty state */
.empty-state {
  padding: 36px 16px;
  text-align: center;
  color: var(--bs-secondary);
}
.btn-delete:hover {
  color: var(--bs-danger) !important;
}

/* ===== الهاتف: ملء الشاشة + زر إغلاق علوي ===== */
@media (max-width: 768px) {
  .notif-menu {
    position: fixed !important;
    top: 0;
    left: 0 !important;
    right: 0 !important;
    bottom: 0;
    width: 100% !important;
    height: 100% !important;
    max-width: 100% !important;
    max-height: none !important;
    min-width: auto !important;
    border-radius: 0 !important;
    overflow: hidden; /* الجسم نفسه فيه سكرول داخلي */
    z-index: 1050;
    box-shadow: none;
  }
  .mobile-header + .notif-body {
    /* اجعل المحتوى تحت الترويسة مع سكرول داخلي */
    height: calc(100% - 56px);
    max-height: none;
    overflow-y: auto;
  }
}
</style>
