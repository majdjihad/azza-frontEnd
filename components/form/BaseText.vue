<template>
  <div class="mb-3">
    <label v-if="label" :for="id" class="form-label mb-2 fw-medium text-dark">{{
      label
    }}</label>

    <div class="input-group">
      <span
        v-if="$slots.prepend"
        class="input-group-text bg-white border-end-0 rounded-start-1"
      >
        <slot name="prepend" />
      </span>

      <input
        :id="id"
        :type="type"
        class="form-control text-end fs-6 rounded-1"
        :class="{
          'is-invalid': !!error,
          'border-start-0': !!$slots.prepend,
          'border-end-0': !!$slots.append,
        }"
        :placeholder="placeholder"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        :autocomplete="autocomplete"
        :inputmode="inputmode"
        :maxlength="maxlength"
        :disabled="disabled"
        :dir="dir"
      />

      <span
        v-if="$slots.append"
        class="input-group-text bg-white border-start-0 rounded-end-1"
      >
        <slot name="append" />
      </span>
    </div>

    <div v-if="hint && !error" class="form-text mt-1 text-muted small">
      {{ hint }}
    </div>
    <div v-if="error" class="invalid-feedback d-block">{{ error }}</div>
  </div>
</template>

<script setup>
defineProps({
  label: String,
  placeholder: String,
  modelValue: [String, Number],
  error: String,
  hint: String,
  type: { type: String, default: "text" },
  id: {
    type: String,
    default: () => `in-${Math.random().toString(36).slice(2)}`,
  },
  autocomplete: String,
  inputmode: String,
  maxlength: Number,
  disabled: Boolean,
  dir: { type: String, default: "auto" },
});
defineEmits(["update:modelValue"]);
</script>

<style scoped>
.form-control {
  background-color: #f6f6f6;
}
.form-control::placeholder {
  color: #a5acb9;
  opacity: 1;
  font-size: 14px;
}
</style>
