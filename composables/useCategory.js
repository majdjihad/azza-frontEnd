/**
 * Backlog management composable providing functionality for managing sprints,
 * issues, labels, and comments within a project's backlog
 */
import { $larafetch } from "~/utils/$larafetch";
import { useCategoryStore } from "~/stores/categoryStore";

export const useCategory = () => {
  const categoryStore = useCategoryStore();

  /** Fetch  category data including ads */
  async function getAllCategories() {
    return await $larafetch(`api/categories`, {
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
    getAllCategories,
    getSubCategory,
  };
};
