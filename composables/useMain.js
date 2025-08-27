import { $larafetch } from "~/utils/$larafetch";

export const useMain = () => {
  /** Fetch  category data including ads */
  async function getHomePageData() {
    return await $larafetch(`api/home`, {
      method: "get",
    });
  }
  async function getAllAds() {
    return await $larafetch(`api/ads`, {
      method: "get",
    });
  }
  async function getAdsFavorites() {
    return await $larafetch(`api/favorites`, {
      method: "get",
    });
  }
  async function toggleFavoriteAds(adsId) {
    return await $larafetch(`api/favorites/ads/${adsId}/toggle`, {
      method: "post",
    });
  }
  return {
    getHomePageData,
    getAllAds,
    getAdsFavorites,
    toggleFavoriteAds,
  };
};
