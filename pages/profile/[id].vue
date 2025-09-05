<script setup>
import moment from "moment";
import { useMain } from "~/composables/useMain";

const route = useRoute();
const { getUserData } = useMain();

const loading = ref(true);
const error = ref(null);

// مطابق لشكل الـ response: data.user و data.ads (pager)
const userInfo = ref(null); // { id, name, photo, joined_at, ads_count }
const adsPager = ref({ data: [] }); // كائن ترقيم الصفحات القادم من الـ API
const ads = computed(() => adsPager.value?.data ?? []);

// عنوان الصفحة = اسم المستخدم
useHead(() => ({
  title: userInfo.value?.name
    ? `الملف الشخصي – ${userInfo.value.name}`
    : "الملف الشخصي",
}));

// أدوات تنسيق العرض
const imageOf = (ad) => ad?.main_image || ad?.image || "/media/placeholder.png";
const titleOf = (ad) => ad?.title || ad?.name || `#${ad?.id}`;
const cityOf = (ad) =>
  (typeof ad?.city === "object" ? ad?.city?.name : ad?.city) || "—";
const catOf = (ad) =>
  ad?.category?.name || ad?.subcategory?.name || ad?.category || "—";
const priceOf = (ad) => {
  const p = ad?.price ?? "";
  const c = ad?.currency ?? "";
  return [p, c].filter(Boolean).join(" ");
};
function statusBadge(ad) {
  const now = new Date();
  const approved = !!ad?.approved_at;
  const exp = ad?.expires_at ? new Date(ad.expires_at) : null;

  if (approved && exp && exp > now)
    return { text: "منشور", cls: "bg-success-subtle text-success" };
  if (approved && exp && exp <= now)
    return { text: "منتهي", cls: "bg-secondary-subtle text-secondary" };
  if (!approved)
    return { text: "قيد المراجعة", cls: "bg-warning-subtle text-warning" };
  return { text: "—", cls: "bg-light text-muted" };
}

// جلب البيانات
async function loadUser() {
  try {
    loading.value = true;
    error.value = null;

    const id = route.params.id;
    if (!id) return;

    const res = await getUserData(id);
    const data = res?.data ?? res;

    userInfo.value = data?.user ?? null; // ← شكل response
    adsPager.value = data?.ads ?? { data: [] };
  } catch (e) {
    console.error(e);
    error.value = "تعذّر تحميل بيانات المستخدم.";
  } finally {
    loading.value = false;
  }
}

onMounted(loadUser);
watch(() => route.params.id, loadUser);
</script>

<template>
  <div class="container py-4 py-md-5">
    <div class="d-flex align-items-start justify-content-between mb-3 mb-md-4">
      <div>
        <h3 class="fw-bold mb-1">{{ userInfo?.name || "الملف الشخصي" }}</h3>
        <div class="d-flex align-items-center my-9">
          <h2 class="fs-3 m-0 fw-normal text-primary d-inline">الرئيسية</h2>
          <Icon
            name="mdi:chevron-left-circle-outline"
            class="fs-3 mx-3 text-secondary"
          />
          <h2 class="fs-3 m-0 fw-normal text-muted">
            {{ userInfo?.name || "المستخدم" }}
          </h2>
        </div>
      </div>
    </div>

    <!-- بطاقة بيانات المستخدم + سكلتون -->
    <div class="d-flex align-items-center justify-content-between">
      <!-- سكلتون احترافي أثناء التحميل -->
      <template v-if="loading">
        <div class="d-flex align-items-center gap-9">
          <div>
            <div
              class="rounded-circle shimmer"
              style="width: 200px; height: 200px"
            ></div>
          </div>
          <div class="pb-4">
            <div
              class="shimmer rounded mb-3"
              style="width: 260px; height: 32px"
            ></div>
            <div
              class="shimmer rounded"
              style="width: 200px; height: 16px"
            ></div>

            <ul class="list-unstyled mt-4 p-0">
              <li class="d-flex align-items-center my-3">
                <span
                  class="ms-2 p-0 rounded-circle shimmer"
                  style="width: 44px; height: 44px"
                ></span>
                <span
                  class="ms-2 shimmer rounded"
                  style="width: 240px; height: 14px"
                ></span>
              </li>
              <li class="d-flex align-items-center my-3">
                <span
                  class="ms-2 p-0 rounded-circle shimmer"
                  style="width: 44px; height: 44px"
                ></span>
                <span
                  class="ms-2 shimmer rounded"
                  style="width: 220px; height: 14px"
                ></span>
              </li>
              <li class="d-flex align-items-center my-3">
                <span
                  class="ms-2 p-0 rounded-circle shimmer"
                  style="width: 44px; height: 44px"
                ></span>
                <span
                  class="ms-2 shimmer rounded"
                  style="width: 200px; height: 14px"
                ></span>
              </li>
              <li class="d-flex align-items-center my-3">
                <span
                  class="ms-2 p-0 rounded-circle shimmer"
                  style="width: 44px; height: 44px"
                ></span>
                <span
                  class="ms-2 shimmer rounded"
                  style="width: 180px; height: 14px"
                ></span>
              </li>
            </ul>
          </div>
        </div>

        <div
          class="user-data card gap-2 my-3 py-9 px-5"
          style="min-width: 360px; max-width: 420px"
        >
          <div
            class="shimmer rounded mb-4"
            style="width: 70%; height: 22px"
          ></div>
          <div class="d-flex w-100 align-items-center mb-4">
            <span
              class="rounded shimmer"
              style="width: 56px; height: 56px"
            ></span>
            <div class="ms-3 w-100">
              <div
                class="shimmer rounded mb-2"
                style="width: 50%; height: 14px"
              ></div>
              <div
                class="shimmer rounded"
                style="width: 35%; height: 12px"
              ></div>
            </div>
          </div>
          <div class="d-flex w-100 align-items-center mb-4">
            <span
              class="rounded shimmer"
              style="width: 56px; height: 56px"
            ></span>
            <div class="ms-3 w-100">
              <div
                class="shimmer rounded mb-2"
                style="width: 55%; height: 14px"
              ></div>
              <div
                class="shimmer rounded"
                style="width: 40%; height: 12px"
              ></div>
            </div>
          </div>
          <div class="d-flex w-100 align-items-center">
            <span
              class="rounded shimmer"
              style="width: 56px; height: 56px"
            ></span>
            <div class="ms-3 w-100">
              <div
                class="shimmer rounded mb-2"
                style="width: 60%; height: 14px"
              ></div>
              <div
                class="shimmer rounded"
                style="width: 45%; height: 12px"
              ></div>
            </div>
          </div>
        </div>
      </template>

      <!-- المحتوى الحقيقي -->
      <template v-else>
        <div class="d-flex align-items-center gap-9">
          <div>
            <img
              :src="userInfo?.photo"
              :alt="userInfo?.name || 'المستخدم'"
              class="rounded-circle shadow-sm img-fluid"
              width="200"
              height="200"
            />
          </div>

          <div class="pb-4">
            <h1 class="display-5 mb-2">{{ userInfo?.name || "—" }}</h1>
            <p class="text-muted mb-0">
              تاريخ الانضمام: {{ userInfo?.joined_at || "—" }}
            </p>

            <ul class="list-unstyled mt-4 p-0">
              <li class="d-flex align-items-center my-3" v-if="userInfo?.phone">
                <span class="ms-2 p-2 card rounded-circle">
                  <Icon
                    name="material-symbols:phone-in-talk-watchface-indicator"
                    class="text-primary fs-2"
                  />
                </span>
                <span class="ms-1 text-muted">{{ userInfo?.phone }}</span>
              </li>

              <li class="d-flex align-items-center my-3" v-if="userInfo?.email">
                <span class="ms-2 p-2 card rounded-circle">
                  <Icon name="bi:envelope-fill" class="text-primary fs-2" />
                </span>
                <span class="ms-1 text-muted">{{ userInfo?.email }}</span>
              </li>

              <li
                class="d-flex align-items-center my-3"
                v-if="userInfo?.whatsapp"
              >
                <span class="ms-2 p-2 card rounded-circle">
                  <Icon
                    name="akar-icons:whatsapp-fill"
                    class="text-primary fs-2"
                  />
                </span>
                <span class="ms-1 text-muted">{{ userInfo?.whatsapp }}</span>
              </li>

              <li class="d-flex align-items-center my-3" v-if="userInfo?.city">
                <span class="ms-2 p-2 card rounded-circle">
                  <Icon
                    name="material-symbols:location-on-rounded"
                    class="text-primary fs-2"
                  />
                </span>
                <span class="ms-1 text-muted">{{ userInfo?.city }}</span>
              </li>
            </ul>
          </div>
        </div>

        <div
          class="user-data card gap-2 my-3 py-9 px-5"
          style="min-width: 360px; max-width: 420px"
        >
          <h2 class="fs-2 mb-4">تواصل مع {{ userInfo?.name || "المستخدم" }}</h2>

          <!-- استخدم <a> للروابط الخارجية بدل NuxtLink -->
          <a
            :href="`tel:${userInfo?.phone}`"
            class="d-flex w-md-100 w-50 mx-auto align-items-center btn p-0 mb-4"
            v-if="userInfo?.phone"
          >
            <span
              class="p-3 bg-primary rounded d-inline-flex align-items-center justify-content-center"
              style="width: 56px; height: 56px"
            >
              <Icon
                name="material-symbols:phone-in-talk-watchface-indicator"
                class="text-white fs-1"
              />
            </span>
            <div class="d-flex flex-column rounded ms-3">
              <span class="text-end">اتصل الآن</span>
            </div>
          </a>

          <a
            :href="`https://wa.me/${userInfo?.whatsapp}`"
            target="_blank"
            rel="noopener"
            class="d-flex w-md-100 w-50 mx-auto align-items-center btn p-0 mb-4"
            v-if="userInfo?.whatsapp"
          >
            <span
              class="p-3 rounded d-inline-flex align-items-center justify-content-center"
              style="background-color: #4fad52; width: 56px; height: 56px"
            >
              <Icon name="bx:bxl-whatsapp" class="text-white fs-1" />
            </span>
            <div class="d-flex flex-column rounded ms-3">
              <span class="text-end">تواصل عبر الواتساب</span>
            </div>
          </a>

          <a
            :href="`mailto:${userInfo?.email}`"
            class="d-flex w-md-100 w-50 mx-auto align-items-center btn p-0 mb-0"
            v-if="userInfo?.email"
          >
            <span
              class="p-3 rounded d-inline-flex align-items-center justify-content-center"
              style="background-color: #a5acb9; width: 56px; height: 56px"
            >
              <Icon
                name="material-symbols:stacked-email-rounded"
                class="text-white fs-1"
              />
            </span>
            <div class="d-flex flex-column rounded ms-3">
              <span class="text-end">تواصل عبر البريد الالكتروني</span>
            </div>
          </a>
        </div>
      </template>
    </div>
    <!-- أخطاء إن وجدت -->
    <div v-if="error" class="alert alert-danger mb-4">{{ error }}</div>

    <!-- الكارت الذي طلبت وضع الجدول بداخله -->
    <div class="card rounded">
      <div class="card-body p-0">
        <div class="table-responsive">
          <!-- سكلتون أثناء التحميل -->
          <table v-if="loading" class="table table-custom mb-0 align-middle">
            <thead class="bg-white">
              <tr>
                <th>صورة الإعلان</th>
                <th>اسم الإعلان</th>
                <th>القسم</th>
                <th>تاريخ النشر</th>
                <th>المدينة</th>
                <th>السعر</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="i in 6" :key="'sk-' + i">
                <td class="cell-image">
                  <div class="row-thumb shimmer"></div>
                </td>
                <td>
                  <div
                    class="shimmer rounded"
                    style="width: 180px; height: 16px"
                  ></div>
                </td>
                <td>
                  <div
                    class="shimmer rounded"
                    style="width: 140px; height: 14px"
                  ></div>
                </td>
                <td>
                  <div
                    class="shimmer rounded"
                    style="width: 80px; height: 14px"
                  ></div>
                </td>
                <td>
                  <div
                    class="shimmer rounded"
                    style="width: 100px; height: 14px"
                  ></div>
                </td>
                <td>
                  <div
                    class="shimmer rounded"
                    style="width: 90px; height: 14px"
                  ></div>
                </td>
                <td>
                  <div
                    class="shimmer rounded"
                    style="width: 80px; height: 24px"
                  ></div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- الجدول الحقيقي -->
          <table
            v-else-if="ads.length > 0"
            class="table table-custom mb-0 align-middle table-hover"
          >
            <thead class="bg-white">
              <tr>
                <th>صورة الإعلان</th>
                <th>اسم الإعلان</th>
                <th>القسم</th>
                <th>تاريخ النشر</th>
                <th>المدينة</th>
                <th>السعر</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="ad in ads" :key="ad.id">
                <td class="cell-image d-flex justify-content-start">
                  <img
                    :src="imageOf(ad)"
                    :alt="titleOf(ad)"
                    class="row-thumb"
                  />
                </td>
                <td class="fw-semibold">{{ titleOf(ad) }}</td>
                <td>{{ catOf(ad) }}</td>
                <td>{{ moment(ad?.created_at).calendar() || "—" }}</td>
                <td>{{ cityOf(ad) }}</td>
                <td class="fw-bold text-primary">{{ priceOf(ad) }}</td>
                <td>
                  <span
                    class="badge rounded-pill px-3 py-2"
                    :class="statusBadge(ad).cls"
                  >
                    {{ statusBadge(ad).text }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- لا توجد إعلانات -->
          <div v-else class="text-center p-5">
            <img src="/media/empty-ads.png" alt="اعلانات فارغة" class="mb-3" />
            <h3 class="mb-2">لا توجد إعلانات لهذا المستخدم</h3>
            <p class="text-muted mb-0">عند نشر إعلانات ستظهر هنا.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* جدول */
.table-custom thead th {
  color: #6b7384;
  font-weight: 700;
  font-size: 0.92rem;
}
.table-custom tbody tr {
  border-bottom: 1px solid var(--line, #eee);
}
.table-custom td,
.table-custom th {
  vertical-align: middle;
  padding: 1rem 0.75rem;
}
.cell-image {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.6rem;
}
.row-thumb {
  width: 58px;
  height: 58px;
  border-radius: 12px;
  object-fit: cover;
  background-color: #f3f4f6;
}

/* بطاقة المستخدم أثناء التحميل */
.avatar-skel {
  display: flex;
  align-items: center;
  gap: 12px;
}
.avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
}

/* سكلتون احترافي */
.shimmer {
  position: relative;
  overflow: hidden;
  background: #eef1f6;
  border-radius: 8px;
}
.shimmer::after {
  content: "";
  position: absolute;
  inset: 0;
  transform: translateX(-150px);
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.6) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  animation: shimmer 1.2s infinite;
}
@keyframes shimmer {
  100% {
    transform: translateX(150px);
  }
}
</style>
