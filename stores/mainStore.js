import { defineStore } from "pinia";
import { useMain } from "~/composables/useMain";

export const useMainStore = defineStore("useMain", () => {
  // declear all category variables
  let homePageData = ref(null);
  let adsPageData = ref(null);
  let adsFavorites = ref(null);
  let productsPageData = ref(null);
  let filterData = ref(null);
  const {
    getHomePageData,
    getAllAds,
    getAdsFavorites,
    toggleFavoriteAds,
    getDataFilter,
    filterAds,
    getAllProducts,
  } = useMain();
  // get categories details
  const getHomeData = async () => {
    try {
      const response = await getHomePageData();
      homePageData.value = response.data;
    } catch (error) {
      console.log(error);
      return navigateTo(`/`, { replace: true });
    }
  };
  const getAds = async (pageId) => {
    try {
      const response = await getAllAds(pageId);
      adsPageData.value = response;
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
      const response = await getAdsFavorites();
      adsFavorites.value = response.data;
    } catch (error) {
      console.log(error);
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

  const FavoriteAds = async (adsId) => {
    try {
      await toggleFavoriteAds(adsId);
      await getAllAdsFavorites();
    } catch (error) {
      console.log(error);
    }
  };
  function buildFilterParamsFromQuery(query = {}) {
    // subcategory_ids[] قد تصل كـ string أو array
    let subIds = query["subcategory_ids[]"] ?? query.subcategory_ids ?? [];
    if (!Array.isArray(subIds)) subIds = [subIds].filter(Boolean);

    return {
      category_id: query.category_id ? Number(query.category_id) : undefined,
      subcategory_ids: subIds
        .map((x) => Number(x))
        .filter((x) => !Number.isNaN(x)),
      city_id: query.city_id ? Number(query.city_id) : undefined,
      min_price: query.min_price ? Number(query.min_price) : undefined,
      max_price: query.max_price ? Number(query.max_price) : undefined,
      page: query.page ? Math.max(1, Number(query.page)) : 1,
    };
  }

  function setAdsData(res) {
    adsPageData.value = res; // نفس البنية القادمة من API
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

  return {
    homePageData,
    adsPageData,
    getProducts,
    productsPageData,
    setAdsData,
    filterData,
    getFilterData,
    getAds,
    adsFavorites,
    getHomeData,
    getAllAdsFavorites,
    FavoriteAds,
    buildFilterParamsFromQuery,
    getFilteredAds,
  };
});
