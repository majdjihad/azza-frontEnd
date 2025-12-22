// composables/useMain.js
import { $larafetch } from "~/utils/$larafetch";
import { useMainStore } from "~/stores/mainStore";
export const useMain = () => {
  const mainStore = useMainStore();
  /** الصفحة الرئيسية */
  async function getHomePageData() {
    return await $larafetch(`api/home`, { method: "get" });
  }

  /** جميع الإعلانات (ترقيم) */
  async function getAllAds(pageId) {
    return await $larafetch(`api/ads?page=${pageId}`, { method: "get" });
  }

  /** تفاصيل إعلان */
  async function getAdDetails(adId) {
    return await $larafetch(`api/ads/${adId}`, { method: "get" });
  }

  /** جميع المنتجات (ترقيم) */
  async function getAllProducts(pageId) {
    return await $larafetch(`api/products?page=${pageId}`, { method: "get" });
  }

  /** تفاصيل منتج */
  async function getProductDetails(productId) {
    return await $larafetch(`api/products/${productId}`, { method: "get" });
  }

  /** بيانات الفلترة (تصنيفات، …) */
  async function getDataFilter() {
    return await $larafetch(`api/filter/category`, { method: "get" });
  }

  /** مفضلة الإعلانات */
  async function getAdsFavorites() {
    return await $larafetch(`api/favorites`, { method: "get" });
  }

  /** بيانات مستخدم */
  async function getUserData(id) {
    return await $larafetch(`api/users/${id}`, { method: "get" });
  }

  /** قلب مفضلة إعلان */
  async function toggleAdsFavorite(adsId) {
    return await $larafetch(`api/favorites/ads/${adsId}/toggle`, {
      method: "post",
    });
  }

  /** الحقول المخصصة حسب التصنيف الفرعي */
  async function getCustomFiled(subcategoryId) {
    return await $larafetch(`api/ads/category/${subcategoryId}`, {
      method: "get",
    });
  }

  /** البحث */
  async function getSearch(params = {}) {
    const { query = "", category_id, city_id } = params;
    const q = {};
    if (query !== "") q.query = query;
    if (Number.isFinite(Number(category_id)))
      q.category_id = Number(category_id);
    if (Number.isFinite(Number(city_id))) q.city_id = Number(city_id);

    return await $larafetch(`/api/search`, {
      method: "get",
      query: q,
    });
  }
  async function getAds() {
    console.log("test");
    return await $larafetch("api/ads", {
      method: "get",
    });
  }

  // فلتر الاعلانات
  async function filterAds(params = {}) {
    const {
      category_id,
      subcategory_ids = [],
      city_id,
      min_price,
      max_price,
      page = 1,
    } = params;

    return await $larafetch(`/api/ads/filter`, {
      method: "get",
      query: {
        category_id,
        "subcategory_ids[]": subcategory_ids,
        city_id,
        min_price,
        max_price,
        page,
      },
    });
  }
  // فلتر المنتجات
  async function filterProducts(params = {}) {
    const {
      category_id,
      subcategory_ids = [],
      city_id,
      min_price,
      max_price,
      page = 1,
    } = params;

    return await $larafetch(`/api/products/filter`, {
      method: "get",
      query: {
        category_id,
        city_id,
        min_price,
        max_price,
        page,
        "subcategory_ids[]": subcategory_ids,
      },
    });
  }
  // اضافة إعلان
  async function createAd(formData) {
    if (!(formData instanceof FormData)) {
      throw new Error("createAd expects a FormData instance");
    }
    return await $larafetch(`api/ads`, {
      method: "post",
      body: formData,
    });
  }
  // ✅ الدالة المطلوبة لتحديث الإعلان (PUT)
  async function updateAd(adId, formData) {
    if (!(formData instanceof FormData)) {
      throw new Error("updateAd expects a FormData instance");
    }
    // نرسل مباشرة PUT (لا نحتاج _method=PUT)
    return await $larafetch(`api/ads/edit/${adId}`, {
      method: "put",
      body: formData,
    });
  }
  // خذف إعلانات
  async function deleteAds(ids) {
    // تأكد أنها أعداد صحيحة
    const clean = (ids ?? [])
      .map((x) => Number(x))
      .filter((n) => Number.isInteger(n));

    // ids[]=1&ids[]=22&ids[]=3
    const qs = clean.map((id) => `ids[]=${encodeURIComponent(id)}`).join("&");

    return await $larafetch(`api/ads/bulk-destroy?${qs}`, {
      method: "post",
    });
  }
  // تواصل معنا
  async function sendMessage(formData) {
    return await $larafetch(`api/messages`, {
      method: "post",
      body: formData,
    });
  }
  // اشعارات

  // ========== Notifications API ==========
  async function getNotifications({
    page = 1,
    per_page = 20,
    onlyUnread = false,
  } = {}) {
    const url = onlyUnread ? "api/notifications/unread" : "api/notifications";
    return await $larafetch(url, {
      method: "get",
      params: { page, per_page },
    });
  }

  async function getUnreadCount() {
    return await $larafetch("api/notifications/unread-count", {
      method: "get",
    });
  }

  async function markNotificationAsRead(id) {
    return await $larafetch(`api/notifications/${id}/read`, {
      method: "post",
    });
  }

  async function markAllNotificationsAsRead() {
    return await $larafetch("api/notifications/read-all", {
      method: "post",
    });
  }

  async function showNotification(id) {
    return await $larafetch(`api/notifications/${id}`, {
      method: "get",
    });
  }

  async function deleteNotification(id) {
    return await $larafetch(`api/notifications/${id}`, {
      method: "delete",
    });
  }

  async function deleteAllNotifications() {
    return await $larafetch("api/notifications", {
      method: "delete",
    });
  }
  return {
    getHomePageData,
    getAllAds,
    getAdDetails,
    getAllProducts,
    getProductDetails,
    getDataFilter,
    getAdsFavorites,
    getUserData,
    toggleAdsFavorite,
    getSearch,
    getAds,
    filterAds,
    filterProducts,
    getCustomFiled,
    createAd,
    updateAd,
    deleteAds,
    sendMessage,
    getNotifications,
    getUnreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    showNotification,
    deleteNotification,
    deleteAllNotifications,
  };
};
