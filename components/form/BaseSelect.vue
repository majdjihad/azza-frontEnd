<script setup>
const props = defineProps({
  label: String,
  placeholder: String,
  modelValue: [String, Number],
  error: String,
  options: { type: Array, default: () => [] },
  id: {
    type: String,
    default: () => `sel-${Math.random().toString(36).slice(2)}`,
  },
});
defineEmits(["update:modelValue"]);
</script>

<template>
  <div class="mb-3">
    <label v-if="label" :for="id" class="form-label">{{ label }}</label>
    <select
      :id="id"
      class="form-select"
      :class="{ 'is-invalid': !!error }"
      :value="modelValue"
      @change="$emit('update:modelValue', $event.target.value)"
    >
      <option value="" disabled selected hidden>
        {{ placeholder || "اختر" }}
      </option>
      <option
        v-for="opt in options"
        :key="opt.value"
        :value="opt.value"
        class="text-dark"
      >
        {{ opt.label }}
      </option>
    </select>
    <div v-if="error" class="invalid-feedback">{{ error }}</div>
  </div>
</template>
<style scoped>
.form-select {
  background-color: #f6f6f6;

  color: #dbdfe9;
}
</style>