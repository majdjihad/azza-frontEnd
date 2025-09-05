import { defineStore } from "pinia";
import { ref, watch } from "vue";
import { useCategory } from "~/composables/useCategory";
import { useMainStore } from "~/stores/mainStore";

export const useCategoryStore = defineStore("useCategory", () => {
  const categoryData = ref(null); // response.data
  const citiesData = ref(null);
  const { getCategoryBySlug, getCities } = useCategory();

  function normalizeCategoryAds() {
    const main = useMainStore();
    const pager = categoryData.value?.ads?.items;
    if (!pager || !Array.isArray(pager.data)) return;

    const favs = main.getFavoriteIds();
    const useFavsOnly = main.hasFetchedFavorites; // مهم

    pager.data = pager.data.map((item) => {
      const featuredBase = Object.prototype.hasOwnProperty.call(
        item,
        "featured_base"
      )
        ? Boolean(item.featured_base)
        : Boolean(item.featured);

      const isFav = useFavsOnly
        ? favs.has(Number(item.id))
        : Boolean(item.is_favorite);

      return {
        ...item,
        is_favorite: isFav,
        featured_base: featuredBase,
        featured: isFav ? true : featuredBase,
      };
    });
  }

  function optimisticFlipInCategory(id) {
    const pager = categoryData.value?.ads?.items;
    if (!pager || !Array.isArray(pager.data)) return;

    pager.data = pager.data.map((it) => {
      if (Number(it.id) !== Number(id)) return it;

      const base = Object.prototype.hasOwnProperty.call(it, "featured_base")
        ? Boolean(it.featured_base)
        : Boolean(it.featured);

      const nextIsFav = !Boolean(it.is_favorite);
      return {
        ...it,
        featured_base: base,
        is_favorite: nextIsFav,
        featured: nextIsFav ? true : base,
      };
    });
  }

  const getCategory = async (slug) => {
    categoryData.value = null;
    try {
      const res = await getCategoryBySlug(slug);
      categoryData.value = res.data;
      normalizeCategoryAds();
    } catch (error) {
      console.log(error);
      return navigateTo(`/`, { replace: true });
    }
  };

  const getCitiesData = async () => {
    try {
      const res = await getCities();
      citiesData.value = res.data;
    } catch (error) {
      console.log(error);
      return navigateTo(`/`, { replace: true });
    }
  };

  // أي تغيير بقائمة المفضلة الرسمية ⇒ أعِد التطبيع
  watch(
    () => useMainStore().adsFavorites,
    () => normalizeCategoryAds(),
    { deep: true }
  );

  // القلب المتفائل المتزامن مع الـ MainStore
  watch(
    () => useMainStore().lastToggledAdId,
    (id) => {
      if (id) optimisticFlipInCategory(id);
    }
  );

  return {
    categoryData,
    citiesData,
    getCategory,
    getCitiesData,
    normalizeCategoryAds,
    optimisticFlipInCategory,
  };
});
