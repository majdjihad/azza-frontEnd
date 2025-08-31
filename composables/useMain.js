import { $larafetch } from "~/utils/$larafetch";

export const useMain = () => {
  /** Fetch  category data including ads */
  async function getHomePageData() {
    return await $larafetch(`api/home`, {
      method: "get",
    });
  }
  async function getAllAds(pageId) {
    return await $larafetch(`api/ads?page=${pageId}`, {
      method: "get",
    });
  }
  async function getAllProducts(pageId) {
    return await $larafetch(`api/products?page=${pageId}`, {
      method: "get",
    });
  }
  async function getDataFilter() {
    return await $larafetch(`api/filter/category`, {
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
  async function filterAds(params = {}) {
    const {
      category_id,
      subcategory_ids = [],
      city_id,
      min_price,
      max_price,
      page = 1,
    } = params;

    return await $larafetch("/api/filter", {
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
  return {
    getHomePageData,
    getAllAds,
    getAllProducts,
    getDataFilter,
    getAdsFavorites,
    toggleFavoriteAds,
    filterAds,
  };
};
