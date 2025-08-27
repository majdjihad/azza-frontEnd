import { defineStore } from "pinia";
import { useCategory } from "~/composables/useCategory";

export const useCategoryStore = defineStore("useCategory", () => {
  // declear all category variables
  let categoryData = ref(null);
  let citiesData = ref(null);
  const { getCategoryBySlug, getCities } = useCategory();
  // get categories details
  const getCategory = async (slug) => {
    try {
      const response = await getCategoryBySlug(slug);
      categoryData.value = response.data;
    } catch (error) {
      console.log(error);
      return navigateTo(`/`, { replace: true });
    }
  };
  const getCitiesData = async () => {
    try {
      const response = await getCities();
      citiesData.value = response.data;
    } catch (error) {
      console.log(error);
      return navigateTo(`/`, { replace: true });
    }
  };

  return {
    citiesData,
    getCitiesData,
    categoryData,
    getCategory,
  };
});
