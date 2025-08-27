import { $larafetch } from "~/utils/$larafetch";

export const useCategory = () => {
  async function getAllCategories() {
    return await $larafetch(`api/categories`, {
      method: "get",
    });
  }
  async function getCities() {
    return await $larafetch(`api/cities`, {
      method: "get",
    });
  }
  async function getCategoryBySlug(slug) {
    return await $larafetch(`api/category/${slug}/items`, {
      method: "get",
    });
  }
  /** Fetch  category data including ads */
  async function getSubCategory(categoryId) {
    return await $larafetch(`api/category/${categoryId}/items`, {
      method: "get",
    });
  }

  return {
    getCategoryBySlug,
    getAllCategories,
    getCities,
    getSubCategory,
  };
};
