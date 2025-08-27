import { defineStore } from "pinia";
import { useMain } from "~/composables/useMain";

export const useMainStore = defineStore("useMain", () => {
  // declear all category variables
  let homePageData = ref(null);
  let adsData = ref(null);
  let adsFavorites = ref(null);
  const { getHomePageData, getAllAds, getAdsFavorites, toggleFavoriteAds } =
    useMain();
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
  const getAds = async () => {
    try {
      const response = await getAllAds();
      adsData.value = response.data;
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
  const FavoriteAds = async (adsId) => {
    try {
      await toggleFavoriteAds(adsId);
      await getAllAdsFavorites();
    } catch (error) {
      console.log(error);
    }
  };

  return {
    homePageData,
    adsData,
    getAds,
    adsFavorites,
    getHomeData,
    getAllAdsFavorites,
    FavoriteAds,
  };
});
