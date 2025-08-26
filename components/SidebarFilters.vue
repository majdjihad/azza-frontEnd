<script setup>
import { reactive, ref, computed, watch } from "vue";

const props = defineProps({
  categories: { type: Array, default: () => [] },
  currencies: { type: Array, default: () => ["شيكل", "دولار", "يورو"] },
  defaultFilters: {
    type: Object,
    default: () => ({
      categories: [],
      city: "",
      region: "",
      priceMin: null,
      priceMax: null,
      currency: "شيكل",
    }),
  },
  sticky: { type: Boolean, default: true },
});

const emit = defineEmits(["update:filters"]);

const formatNum = (n) =>
  new Intl.NumberFormat("en-us", { maximumFractionDigits: 0 }).format(
    Number(n ?? 0)
  );

const filters = reactive({
  categories: [...(props.defaultFilters.categories || [])],
  city: props.defaultFilters.city || "",
  region: props.defaultFilters.region || "",
  priceMin: props.defaultFilters.priceMin ?? null,
  priceMax: props.defaultFilters.priceMax ?? null,
  currency: props.defaultFilters.currency || props.currencies[0],
});

const selectedCategories = ref([...filters.categories]);

const expanded = reactive({});

const totalCount = computed(() => {
  let sum = 0;
  for (const p of props.categories) {
    if (p.children?.length)
      sum += p.children.reduce((s, ch) => s + (Number(ch.count) || 0), 0);
    else sum += Number(p.count) || 0;
  }
  return sum;
});

const parentCount = (p) => {
  if (p.children?.length)
    return p.children.reduce((s, ch) => s + (Number(ch.count) || 0), 0);
  return Number(p.count) || 0;
};

function toggleParent(p) {
  const childVals = (p.children || []).map((ch) => ch.value);
  if (!childVals.length) {
    const exists = selectedCategories.value.includes(p.value);
    selectedCategories.value = exists
      ? selectedCategories.value.filter((v) => v !== p.value)
      : [...selectedCategories.value, p.value];
    return;
  }
  const allSelected = childVals.every((v) =>
    selectedCategories.value.includes(v)
  );
  if (allSelected) {
    selectedCategories.value = selectedCategories.value.filter(
      (v) => !childVals.includes(v)
    );
  } else {
    selectedCategories.value = Array.from(
      new Set([...selectedCategories.value, ...childVals])
    );
  }
}

function isParentChecked(p) {
  const childVals = (p.children || []).map((ch) => ch.value);
  if (!childVals.length) return selectedCategories.value.includes(p.value);
  return (
    childVals.length &&
    childVals.every((v) => selectedCategories.value.includes(v))
  );
}
function isParentIndeterminate(p) {
  const childVals = (p.children || []).map((ch) => ch.value);
  if (!childVals.length) return false;
  const hit = childVals.filter((v) =>
    selectedCategories.value.includes(v)
  ).length;
  return hit > 0 && hit < childVals.length;
}

const allValues = computed(() => {
  const vals = [];
  for (const p of props.categories) {
    if (p?.children?.length) {
      vals.push(...p.children.map((ch) => ch.value));
    } else if (p?.value) {
      vals.push(p.value);
    }
  }
  return vals;
});

const allChecked = computed(
  () =>
    allValues.value.length > 0 &&
    allValues.value.every((v) => selectedCategories.value.includes(v))
);

const isIndeterminate = computed(
  () => selectedCategories.value.length > 0 && !allChecked.value
);
function toggleAll(e) {
  const checked = e.target.checked;
  selectedCategories.value = checked ? [...allValues.value] : [];
}

watch(
  [
    selectedCategories,
    () => filters.city,
    () => filters.region,
    () => filters.priceMin,
    () => filters.priceMax,
    () => filters.currency,
  ],
  () => {
    filters.categories = [...selectedCategories.value];
    emit("update:filters", { ...filters });
  },
  { deep: true }
);
</script>

<template>
  <aside class="filters-sidebar mx-2 position-relative top-0">
    <div class="card border-0 mb-3">
      <div class="card-body">
        <h4 class="fw-bold pb-3 mb-3 border-bottom">الأقسام</h4>
        <div class="form-check form-check-reverse mb-2">
          <input
            class="form-check-input"
            type="checkbox"
            :checked="allChecked"
            :indeterminate.prop="isIndeterminate"
            @change="toggleAll($event)"
            id="cat-all"
          />
          <label
            class="form-check-label w-100 d-inline-flex gap-2"
            for="cat-all"
          >
            <span>جميع الأقسام</span>
            <span class="text-muted">({{ formatNum(totalCount) }})</span>
          </label>
        </div>
        <div v-for="(p, i) in categories" :key="p.value || i" class="mb-2">
          <div
            class="d-flex align-items-center justify-content-between app-item"
          >
            <div class="form-check form-check-reverse m-0">
              <input
                class="form-check-input"
                type="checkbox"
                :id="`p-${i}`"
                :checked="isParentChecked(p)"
                :indeterminate.prop="isParentIndeterminate(p)"
                @change="toggleParent(p)"
              />
              <label
                class="form-check-label d-inline-flex gap-2"
                :for="`p-${i}`"
              >
                <span>{{ p.name }}</span>
                <span class="text-muted"
                  >({{ formatNum(parentCount(p)) }})</span
                >
              </label>
            </div>

            <button
              class="btn btn-sm btn-link text-decoration-none"
              type="button"
              @click="expanded[p.value] = !expanded[p.value]"
              :aria-expanded="!!expanded[p.value]"
            >
              <Icon
                :name="
                  expanded[p.value] ? 'mdi:chevron-up' : 'mdi:chevron-down'
                "
              />
            </button>
          </div>
          <div
            v-if="p.children && p.children.length && expanded[p.value]"
            class="mt-2 ps-4"
          >
            <div
              v-for="(ch, j) in p.children"
              :key="ch.value || j"
              class="form-check child-item form-check-reverse mb-2"
            >
              <input
                class="form-check-input ms-2"
                type="checkbox"
                :id="`c-${i}-${j}`"
                :value="ch.value"
                v-model="selectedCategories"
              />
              <label class="form-check-label w-100 d-flex" :for="`c-${i}-${j}`">
                <span>{{ ch.name }}</span>
                <span class="text-muted me-2">({{ formatNum(ch.count) }})</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="border bg-white my-5 rounded">
      <div class="card border-0 my-9">
        <div class="card-body py-0">
          <h4 class="fw-bold mb-3">المدينة</h4>
          <div class="input-group">
            <span
              class="input-group-text text-secondary rounded-0 border-secondary rounded-end border-start-0"
            >
              <i class="bi bi-search"></i>
            </span>
            <input
              type="text"
              class="form-control rounded-0 border-end-0 rounded-start p-0"
              placeholder="ابحث عن المدينة.."
              v-model.trim="filters.city"
            />
          </div>
        </div>
      </div>
      <div class="card border-0 my-9">
        <div class="card-body py-0">
          <h4 class="fw-bold mb-3">المنطقة</h4>
          <div class="input-group">
            <span
              class="input-group-text text-secondary rounded-0 border-secondary rounded-end border-start-0 bg-white"
            >
              <i class="bi bi-search"></i>
            </span>
            <input
              type="text"
              class="form-control rounded-0 border-end-0 rounded-start p-0"
              placeholder="ابحث عن المنطقة.."
              v-model.trim="filters.region"
            />
          </div>
        </div>
      </div>
      <div class="card border-0 my-9">
        <div class="card-body py-0">
          <div class="d-flex justify-content-between align-items-center">
            <h4 class="fw-bold mb-3">السعر</h4>
            <div class="btn-group">
              <button
                type="button"
                class="btn btn-currency p-1 dropdown-toggle"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                {{ filters.currency }}
                <Icon class="fs-1 icon-down" name="mdi:chevron-down" />
                <!-- up -->
                <Icon class="fs-1 icon-up" name="mdi:chevron-up" />
              </button>
              <ul class="dropdown-menu">
                <li v-for="(cur, i) in currencies" :key="i">
                  <button class="dropdown-item" @click="filters.currency = cur">
                    {{ cur }}
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div class="d-flex align-items-stretch gap-2 w-75">
            <div class="input-group">
              <span
                class="input-group-text text-secondary rounded-0 border-secondary rounded-end border-start-0 bg-white"
                >من...</span
              >
              <input
                type="text"
                inputmode="numeric"
                class="form-control rounded-0 border-end-0 rounded-start p-0"
                v-model="priceMinText"
                @input="sanitizePrice('min')"
              />
            </div>
            <div class="input-group">
              <span
                class="input-group-text text-secondary rounded-0 border-secondary rounded-end border-start-0 bg-white"
                >إلى...</span
              >
              <input
                type="text"
                inputmode="numeric"
                class="form-control rounded-0 border-end-0 rounded-start p-0"
                v-model="priceMaxText"
                @input="sanitizePrice('max')"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="text-center">
      <img
        src="~/public/media/bg-home/jawwal1.jpg"
        class="w-100 mb-3 rounded-1"
        alt="jawwal"
      />
      <img
        src="~/public/media/bg-home/jawwal2.jpg"
        class="w-100 mb-3 rounded-1"
        alt="jawwal"
      />
    </div>
  </aside>
</template>

<style scoped>
.filters-sidebar {
  width: 100%;
}
.card {
  border-radius: 12px;
}
.child-item {
  padding-right: 50px;
}
.btn-currency::after {
  display: none;
}
.dropdown-toggle .icon-up {
  display: none;
}
.dropdown-toggle[aria-expanded="true"] .icon-down {
  display: none;
}
.dropdown-toggle[aria-expanded="true"] .icon-up {
  display: inline;
}
@media (min-width: 992px) {
  .filters-sidebar {
    position: sticky;
    top: 1rem;
  }
}
</style>
