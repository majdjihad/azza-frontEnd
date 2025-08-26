import { defineStore } from "pinia";
import { useCategory } from "~/composables/useCategory";

export const useCategoryStore = defineStore("useCategory", () => {
  // declear all category variables
  let Allcategories = ref(null);
  const { getAllCategories } = useCategory();
  // get categories details
  const getCategories = async () => {
    try {
      const categoriesResponse = await getAllCategories();
      Allcategories.value = categoriesResponse.data;
    } catch (error) {
      console.log(error);
      return navigateTo(`/`, { replace: true });
    }
  };

  return {
    Allcategories,
    getCategories,
  };
});
