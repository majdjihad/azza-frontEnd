// stores/useMainStore.js
import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import { useMain } from "~/composables/useMain";
import { useProfile } from "~/composables/useProfile";

export const useMainStore = defineStore("useMain", () => {
  /* ======================= Profile ======================= */
  const profilePending = ref(false);
  const profileError = ref(null);
  const profileUser = ref(null); // user object
  const profileAdsPager = ref(null); // data.ads (paginator) من استجابة الـ API

  const { getMyProfile } = useProfile();

  function humanDate(d) {
    if (!d) return "—";
    try {
      const LOCALE = "ar-EG-u-nu-latn";
      return new Intl.DateTimeFormat(LOCALE, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(new Date(d));
    } catch {
      return d;
    }
  }

  const defaultAvatar = "/media/avatars/user.png";

  const profile = computed(() => {
    const u = profileUser.value;
    if (!u) return null;
    return {
      id: u.id,
      fullName: u.name || "—",
      phone: u.phone || "—",
      email: u.email || "—",
      city: u.city || "—",
      joinedAt: humanDate(u.created_at),
      avatar: u.photo || defaultAvatar,
      adsCount: Number(u.ads_count ?? 0),
      activeAdsCount: Number(u.active_ads_count ?? 0),
      raw: u,
    };
  });

  // الإعلانات الخاصة بالمستخدم من API profile
  const profileAds = computed(() => profileAdsPager.value?.data ?? []);
  const profileAdsTotal = computed(() =>
    Number(profileAdsPager.value?.total ?? 0)
  );
  const profileAdsLastPage = computed(() =>
    Number(profileAdsPager.value?.last_page ?? 1)
  );

  // جلب بيانات البروفايل + إعلاناته (تقبل باراميتر page اختياري)
  const fetchProfile = async (page = 1) => {
    profilePending.value = true;
    profileError.value = null;
    try {
      // ملاحظة: إن كان getMyProfile يدعم تمرير { page } فمرّره، وإلا عدّل الـ composable accordingly
      const res = await getMyProfile({ page });
      const u = res?.data?.user ?? res?.user ?? null;
      const adsPg = res?.data?.ads ?? null;

      profileUser.value = u;
      profileAdsPager.value = adsPg;
      return res;
    } catch (e) {
      profileError.value =
        e?.response?.data?.message || e?.data?.message || e?.message || "خطأ";
      profileUser.value = null;
      profileAdsPager.value = null;
      throw e;
    } finally {
      profilePending.value = false;
    }
  };

  const clearProfile = () => {
    profilePending.value = false;
    profileError.value = null;
    profileUser.value = null;
    profileAdsPager.value = null;
  };

  /* ======================= بقية المخزن (كما هو لديك) ======================= */
  const homePageData = ref(null);
  const adsPageData = ref(null);

  const adsFavorites = ref({ ads: { data: [] } });
  const favoritesListLoad = ref(false);
  const hasFetchedFavorites = ref(false);

  const productsPageData = ref(null);
  const filterData = ref(null);

  const isSearching = ref(false);
  const searchError = ref(null);
  const searchPageRaw = ref(null);
  const searchAdsPager = ref(null);
  const searchProductsPager = ref(null);

  const lastToggledAdId = ref(null);

  const {
    getHomePageData,
    getAllAds,
    getAdsFavorites,
    toggleAdsFavorite,
    getDataFilter,
    filterAds,
    getAllProducts,
    getSearch,
  } = useMain();

  const searchAds = computed(() => searchAdsPager.value?.data ?? []);
  const searchProducts = computed(() => searchProductsPager.value?.data ?? []);
  const searchAdsLastPage = computed(() =>
    Number(searchAdsPager.value?.last_page ?? 1)
  );
  const searchProductsLastPage = computed(() =>
    Number(searchProductsPager.value?.last_page ?? 1)
  );
  const searchMaxLastPage = computed(() =>
    Math.max(searchAdsLastPage.value || 1, searchProductsLastPage.value || 1)
  );

  function getFavoriteIds() {
    const set = new Set();
    const favList = adsFavorites.value?.ads?.data ?? [];
    favList.forEach((x) => set.add(Number(x?.id)));
    return set;
  }

  function normalizeAdsArray(arr) {
    if (!Array.isArray(arr)) return;
    const favs = getFavoriteIds();

    const mapped = arr.map((item) => {
      const idNum = Number(item?.id);
      const featuredBase = Object.prototype.hasOwnProperty.call(
        item,
        "featured_base"
      )
        ? Boolean(item.featured_base)
        : Boolean(item.featured);

      const isFav = hasFetchedFavorites.value
        ? favs.has(idNum)
        : Boolean(item.is_favorite);

      return {
        ...item,
        is_favorite: isFav,
        featured_base: featuredBase,
        featured: isFav ? true : featuredBase,
      };
    });

    arr.splice(0, arr.length, ...mapped);
  }

  function normalizePager(pager) {
    if (!pager || !Array.isArray(pager.data)) return;
    normalizeAdsArray(pager.data);
  }

  function normalizeHome() {
    const hp = homePageData.value;
    if (hp && Array.isArray(hp.ads_section)) {
      normalizeAdsArray(hp.ads_section);
    }
  }

  function syncFavoritesMarkersEverywhere() {
    normalizeHome();

    const apd = adsPageData.value;
    if (apd?.data?.ads?.data) normalizePager(apd.data.ads);
    if (apd?.ads?.data) normalizePager(apd.ads);
    if (apd?.data?.data) normalizePager(apd);

    if (searchAdsPager.value?.data) normalizePager(searchAdsPager.value);
    // ملاحظة: profileAdsPager عادة لا يحتوي is_favorite/featured — اتركه كما هو
  }

  function optimisticFlipFavorite(id) {
    const targetId = Number(id);
    lastToggledAdId.value = targetId;

    const flipInArray = (arr) => {
      if (!Array.isArray(arr)) return;
      arr.forEach((it, i) => {
        if (Number(it?.id) === targetId) {
          const base = Object.prototype.hasOwnProperty.call(it, "featured_base")
            ? Boolean(it.featured_base)
            : Boolean(it.featured);
          const nextIsFav = !Boolean(it.is_favorite);
          arr[i] = {
            ...it,
            featured_base: base,
            is_favorite: nextIsFav,
            featured: nextIsFav ? true : base,
          };
        }
      });
    };

    const hp = homePageData.value;
    if (hp?.ads_section) flipInArray(hp.ads_section);

    const apd = adsPageData.value;
    if (apd?.data?.ads?.data) flipInArray(apd.data.ads.data);
    if (apd?.ads?.data) flipInArray(apd.ads.data);
    if (apd?.data?.data) flipInArray(apd.data.data);

    if (searchAdsPager.value?.data) flipInArray(searchAdsPager.value.data);
  }

  const getHomeData = async () => {
    try {
      const response = await getHomePageData();
      homePageData.value = response.data;
      syncFavoritesMarkersEverywhere();
    } catch (error) {
      console.log(error);
      return navigateTo(`/`, { replace: true });
    }
  };

  const getAds = async (pageId) => {
    try {
      const response = await getAllAds(pageId);
      adsPageData.value = response;
      syncFavoritesMarkersEverywhere();
    } catch (error) {
      console.log(error);
      return navigateTo(`/`, { replace: true });
    }
  };

  const getProducts = async (pageId) => {
    try {
      const response = await getAllProducts(pageId);
      productsPageData.value = response;
    } catch (error) {
      console.log(error);
      return navigateTo(`/`, { replace: true });
    }
  };

  const getAllAdsFavorites = async () => {
    try {
      favoritesListLoad.value = true;
      const response = await getAdsFavorites();
      adsFavorites.value = response?.data ?? { ads: { data: [] } };
      hasFetchedFavorites.value = true;
      syncFavoritesMarkersEverywhere();
      return response;
    } catch (error) {
      console.log(error);
      adsFavorites.value = { ads: { data: [] } };
      hasFetchedFavorites.value = true;
      syncFavoritesMarkersEverywhere();
    } finally {
      favoritesListLoad.value = false;
    }
  };

  const changeFavoriteAds = async (adsId) => {
    const idNum = Number(adsId);
    try {
      optimisticFlipFavorite(idNum);

      const set = getFavoriteIds();
      const isFavNow = set.has(idNum);
      if (!hasFetchedFavorites.value) hasFetchedFavorites.value = true;

      if (isFavNow) {
        const list = adsFavorites.value?.ads?.data ?? [];
        const idx = list.findIndex((x) => Number(x?.id) === idNum);
        if (idx !== -1) list.splice(idx, 1);
      } else {
        if (!adsFavorites.value?.ads?.data) {
          adsFavorites.value = { ads: { data: [] } };
        }
        adsFavorites.value.ads.data.push({ id: idNum });
      }
      syncFavoritesMarkersEverywhere();

      await toggleAdsFavorite(idNum);
      await getAllAdsFavorites();
    } catch (error) {
      console.log(error);
      await getAllAdsFavorites();
    }
  };

  const getFilterData = async () => {
    try {
      const response = await getDataFilter();
      filterData.value = response.data;
    } catch (error) {
      console.log(error);
    }
  };

  const getSearchResults = async (params) => {
    try {
      isSearching.value = true;
      searchError.value = null;

      const res = await getSearch(params);
      searchPageRaw.value = res;
      searchAdsPager.value = res?.data?.ads ?? null;
      searchProductsPager.value = res?.data?.products ?? null;

      syncFavoritesMarkersEverywhere();
      return res;
    } catch (e) {
      searchError.value = e;
      searchAdsPager.value = null;
      searchProductsPager.value = null;
      throw e;
    } finally {
      isSearching.value = false;
    }
  };

  function buildFilterParamsFromQuery(query = {}) {
    let subIds = query["subcategory_ids[]"] ?? query.subcategory_ids ?? [];
    if (!Array.isArray(subIds)) subIds = [subIds].filter(Boolean);

    return {
      category_id: query.category_id ? Number(query.category_id) : undefined,
      subcategory_ids: subIds.map(Number).filter((x) => !Number.isNaN(x)),
      city_id: query.city_id ? Number(query.city_id) : undefined,
      min_price: query.min_price ? Number(query.min_price) : undefined,
      max_price: query.max_price ? Number(query.max_price) : undefined,
      page: query.page ? Math.max(1, Number(query.page)) : 1,
    };
  }

  function setAdsData(res) {
    adsPageData.value = res;
    syncFavoritesMarkersEverywhere();
  }

  async function getFilteredAds(params = {}) {
    try {
      const res = await filterAds(params);
      setAdsData(res);
      return res;
    } catch (e) {
      console.log(e);
    }
  }

  watch(
    () => adsFavorites.value,
    () => syncFavoritesMarkersEverywhere(),
    { deep: true }
  );

  return {
    // Profile
    profilePending,
    profileError,
    profileUser,
    profile,
    profileAdsPager,
    profileAds,
    profileAdsTotal,
    profileAdsLastPage,
    fetchProfile,
    clearProfile,

    // Ads/others
    homePageData,
    adsPageData,
    adsFavorites,
    favoritesListLoad,
    hasFetchedFavorites,
    productsPageData,
    filterData,

    getHomeData,
    getAds,
    getProducts,
    getAllAdsFavorites,
    changeFavoriteAds,
    getFilterData,
    getSearchResults,
    getFilteredAds,
    setAdsData,

    buildFilterParamsFromQuery,
    getFavoriteIds,
    syncFavoritesMarkersEverywhere,

    isSearching,
    searchError,
    searchPageRaw,
    searchAdsPager,
    searchProductsPager,
    searchAds,
    searchProducts,
    searchAdsLastPage,
    searchProductsLastPage,
    searchMaxLastPage,

    lastToggledAdId,
  };
});
