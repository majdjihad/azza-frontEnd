<template>
  <div class="mb-3">
    <label
      v-if="label"
      :for="id"
      class="form-label mb-2 fw-medium fs-5 text-dark"
    >
      {{ label }}
      <span v-if="req" class="text-danger">*</span>
    </label>

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
        class="form-control text-end rounded-1"
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
  req: { type: Boolean, default: false }, // ⭐️ إضافة req
});
defineEmits(["update:modelValue"]);
</script>

<style scoped>
.form-control {
  background-color: white !important;
}
.form-control::placeholder {
  color: rgba(110, 110, 110, 0.8) !important;
  opacity: 1;
  font-weight: 400;
  font-size: 12px;
}
</style>
