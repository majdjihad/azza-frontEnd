<script setup>
import moment from "moment";
import { useProfile } from "~/composables/useProfile";
import { useMain } from "~/composables/useMain";

const { getProfile } = useProfile();
const { getMyAds } = useMain();

const loading = ref(true);
const error = ref(null);
const route = useRoute();
const userInfo = ref(null); // { id, name, photo, joined_at, phone, email, whatsapp, city, ads_count }
const adsPager = ref({ data: [] });

useHead(() => ({
  title: userInfo.value?.name ? `${userInfo.value.name}` : "الملف الشخصي",
}));

/* أدوات العرض */
const defaultAvatar = "/media/avatars/user.png";
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

/* تحويل من user (من API) إلى الشكل المعروض */
function mapUser(u) {
  return {
    id: u?.id,
    name: u?.name || "—",
    photo: u?.photo || defaultAvatar,
    joined_at:
      u?.joined_at ||
      (u?.created_at ? moment(u.created_at).format("YYYY/MM/DD") : "—"),
    phone: u?.phone || "",
    email: u?.email || "",
    whatsapp: u?.whatsapp || "",
    city: typeof u?.city === "object" ? u?.city?.name : u?.city || "",
    ads_count: u?.ads_count ?? (Array.isArray(u?.ads) ? u.ads.length : 0),
  };
}

/* تحميل البيانات من API */
async function loadProfile() {
  loading.value = true;
  error.value = null;

  try {
    const res = await getProfile(route.query.id || route.params.id);
    const userData = res?.data?.user || res?.data || res;

    if (!userData) throw new Error("لم يتم العثور على بيانات المستخدم.");

    userInfo.value = mapUser(userData);

    // إن كانت الإعلانات مرفقة مع الملف الشخصي
    if (Array.isArray(userData?.ads)) {
      adsPager.value = { data: userData.ads };
    } else {
      // جلب الإعلانات الخاصة بالمستخدم
      try {
        const adsRes = await getMyAds({ page: 1, per_page: 10 });
        adsPager.value = adsRes?.data ?? { data: [] };
      } catch {
        adsPager.value = { data: [] };
      }
    }
  } catch (e) {
    console.error(e);
    error.value = "تعذّر تحميل بيانات الملف الشخصي.";
  } finally {
    loading.value = false;
  }
}

/* تحميل عند الدخول */
onMounted(() => {
  loadProfile();
});
</script>

<template>
  <div class="container mx-auto p-4">
    <div class="page-content my-6" v-if="!loading && userInfo">
      <div class="d-flex align-items-center my-9">
        <NuxtLink to="/" class="fs-5 m-0 fw-medium text-primary d-inline"
          >الرئيسية</NuxtLink
        >
        <Icon
          name="mdi:chevron-left-circle-outline"
          class="fs-3 mx-3 fw-medium text-muted"
        />
        <h2 class="fs-3 m-0 fw-medium text-muted">{{ userInfo.name }}</h2>
      </div>
      <div
        class="d-flex align-items-center justify-content-between flex-column flex-md-row"
      >
        <div
          class="d-flex align-items-center gap-9 flex-column flex-md-row w-100"
        >
          <div>
            <img
              :src="userInfo.photo || defaultAvatar"
              :alt="userInfo.name"
              class="rounded-circle shadow-sm img-fluid"
              width="200"
            />
          </div>
          <div class="pb-4 w-100">
            <h1 class="display-5">{{ userInfo.name }}</h1>
            <span class="text-muted"
              >تاريخ الانضمام: {{ userInfo.joined_at }}</span
            >
            <ul class="list-unstyled mt-4 p-0">
              <li class="d-flex align-items-center my-3">
                <p class="ms-2 p-2 card rounded-circle">
                  <Icon
                    name="material-symbols:phone-in-talk-watchface-indicator"
                    class="text-primary fs-1"
                  />
                </p>
                <p class="ms-1 text-muted">
                  {{ userInfo.phone || "لم يتم اضافة الهاتف من قبل المستخدم" }}
                </p>
              </li>
              <li class="d-flex align-items-center my-3">
                <p class="ms-2 p-2 card rounded-circle">
                  <Icon name="bi:envelope-fill" class="text-primary fs-1" />
                </p>
                <p class="ms-1 text-muted">
                  {{
                    userInfo.email ||
                    "لم يتم اضافة البريد الالكترني من قبل المستخدم"
                  }}
                </p>
              </li>
              <li class="d-flex align-items-center my-3">
                <p class="ms-2 p-2 card rounded-circle">
                  <Icon
                    name="akar-icons:whatsapp-fill"
                    class="text-primary fs-1"
                  />
                </p>
                <p class="ms-1 text-muted">
                  {{
                    userInfo.whatsapp || "لم يتم اضافة واتساب من قبل المستخدم"
                  }}
                </p>
              </li>
              <li class="d-flex align-items-center my-3">
                <p class="ms-2 p-2 card rounded-circle">
                  <Icon
                    name="material-symbols:location-on-rounded"
                    class="text-primary fs-1"
                  />
                </p>
                <p class="ms-1 text-muted">
                  {{ userInfo.city || "لم يتم اضافة المدينة من قبل المستخدم" }}
                </p>
              </li>
            </ul>
          </div>
        </div>
        <div
          v-if="userInfo?.whatsapp || userInfo?.email"
          class="user-data card gap-2 my-3 py-9 px-5 w-lg-50 w-md-75 w-100"
        >
          <h2 class="fs-2">تواصل مع {{ userInfo.name }}</h2>
          <NuxtLink
            :to="`tel:${userInfo?.phone}`"
            class="d-flex w-md-75 w-100 align-items-center btn p-0 mb-4"
            v-if="userInfo?.phone"
          >
            <span class="p-6 bg-primary rounded">
              <Icon
                name="material-symbols:phone-in-talk-watchface-indicator"
                class="text-white fs-1"
              />
            </span>
            <div class="d-flex flex-column rounded">
              <span class="text-muted text-end">اتصل الآن</span>
              <span class="text-muted text-end fw-bold">{{
                userInfo?.phone
              }}</span>
            </div>
          </NuxtLink>
          <NuxtLink
            :to="`https://wa.me/${userInfo?.whatsapp}`"
            class="d-flex w-md-75 w-100 align-items-center btn p-0 mb-4"
            v-if="userInfo?.whatsapp"
          >
            <span class="p-6 rounded" style="background-color: #4fad52">
              <Icon name="bx:bxl-whatsapp" class="text-white fs-1" />
            </span>
            <div class="d-flex flex-column rounded">
              <span class="text-muted text-end">تواصل عبر الواتساب</span>
              <span class="text-muted text-end fw-bold">{{
                userInfo?.whatsapp
              }}</span>
            </div>
          </NuxtLink>
          <NuxtLink
            :to="`mailto:${userInfo?.email}`"
            class="d-flex w-md-75 w-100 align-items-center btn p-0 mb-4"
            v-if="userInfo?.email"
          >
            <span class="p-6 rounded" style="background-color: #a5acb9">
              <Icon
                name="material-symbols:stacked-email-rounded"
                class="text-white fs-1"
              />
            </span>
            <div class="d-flex flex-column rounded">
              <span class="text-muted text-end"
                >تواصل عبر البريد الالكتروني</span
              >
              <span class="text-muted text-end fw-bold">{{
                userInfo?.email
              }}</span>
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- تحميل -->
    <div v-else-if="loading" class="text-center py-10">
      <div class="spinner-border text-primary"></div>
      <p class="mt-3 text-muted">جاري تحميل الملف الشخصي...</p>
    </div>

    <!-- خطأ -->
    <div v-else-if="error" class="alert alert-danger text-center my-10">
      {{ error }}
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
