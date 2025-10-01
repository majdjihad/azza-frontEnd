<script setup>
import moment from "moment";
import { useAuth } from "~/composables/useAuth";
import { useMain } from "~/composables/useMain";

const { user } = useAuth();
const { getMyAds } = useMain(); // سنضيفها بالأسفل في useMain

const loading = ref(true);
const error = ref(null);

/** مطابق لشكل العرض السابق */
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

/* تحويل من user (من useAuth) إلى الشكل المعروض */
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

/* التحميل من كائن user مباشرة، مع جلب الإعلانات إن لم تكن مدمجة */
async function hydrateFromAuthUser(u) {
  userInfo.value = mapUser(u);

  // إن كانت الإعلانات موجودة داخل كائن المستخدم، استخدمها مباشرة
  if (Array.isArray(u?.ads)) {
    adsPager.value = { data: u.ads };
    return;
  }

  // وإلا: جلب إعلاناتي (حلّ احتياطي)
  try {
    const res = await getMyAds({ page: 1, per_page: 10 });
    // تماشياً مع استجاباتك السابقة: نتوقع res.data يحوي pager
    adsPager.value = res?.data ?? { data: [] };
  } catch (e) {
    // في حال فشل جلب الإعلانات، لا نفشل الصفحة كلها
    adsPager.value = { data: [] };
  }
}

/* راقب تغيّر user واملأ البيانات */
watchEffect(async () => {
  loading.value = true;
  error.value = null;

  try {
    const u = user.value?.data?.user ?? user.value?.user ?? user.value ?? null;

    if (!u) {
      // لم يتم تحميل المستخدم بعد (أو غير مسجل دخول)
      userInfo.value = null;
      adsPager.value = { data: [] };
      return;
    }

    await hydrateFromAuthUser(u);
  } catch (e) {
    console.error(e);
    error.value = "تعذّر تحميل بيانات المستخدم من حسابك.";
  } finally {
    loading.value = false;
  }
});
</script>
