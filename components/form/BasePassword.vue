<template>
  <div class="mb-3">
    <label v-if="label" :for="id" class="form-label">{{ label }}</label>

    <div class="input-group position-relative">
      <input
        :id="id"
        :type="visible ? 'text' : 'password'"
        class="form-control rounded-1"
        :class="{ 'is-invalid': !!error }"
        :placeholder="placeholder"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        autocomplete="new-password"
      />

      <button
        type="button"
        class="btn d-flex align-items-center justify-content-center position-absolute top-0 start-0"
        @click="visible = !visible"
        :aria-label="visible ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'"
      >
        <!-- Nuxt Icon -->
        <Icon :name="visible ? hideIcon : showIcon" :size="iconSize" />
      </button>
    </div>
    <div v-if="error" class="invalid-feedback d-block mt-1">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const visible = ref(false);

defineProps({
  label: String,
  placeholder: String,
  modelValue: String,
  error: String,
  id: {
    type: String,
    default: () => `pw-${Math.random().toString(36).slice(2)}`,
  },

  showIcon: { type: String, default: "ph:eye" },
  hideIcon: { type: String, default: "ph:eye-slash" },
  iconSize: { type: [Number, String], default: 18 },
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
  font-weight: 400;
  font-size: 14px;
}
.input-group button {
  z-index: 100;
}
</style>