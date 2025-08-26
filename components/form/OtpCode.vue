<script setup>
const props = defineProps({
  modelValue: { type: String, default: "" },
  length: { type: Number, default: 4 },
  label: String,
  error: String,
  disabled: Boolean,
  autofocus: { type: Boolean, default: true },
});
const emit = defineEmits(["update:modelValue", "complete"]);

const boxes = ref(Array.from({ length: props.length }, () => ""));
const inputs = ref([]);
const errorId = `otp-err-${Math.random().toString(36).slice(2)}`;
const shaking = ref(false);

watch(
  () => props.error,
  (v) => {
    if (v) {
      shaking.value = false;
      requestAnimationFrame(() => {
        shaking.value = true;
        setTimeout(() => (shaking.value = false), 300);
      });
    }
  }
);
onMounted(async () => {
  await nextTick();
  if (props.autofocus && !props.modelValue) {
    inputs.value?.[0]?.focus();
  }
});

function updateModel() {
  const code = boxes.value.join("");
  emit("update:modelValue", code);
  if (code.length === props.length) emit("complete", code);
}

function focusIndex(i) {
  inputs.value?.[i]?.focus();
  inputs.value?.[i]?.select?.();
}

function onInput(i, e) {
  let v = e.target.value.replace(/\D/g, "");
  if (v.length > 1) {
    const rest = v.split("");
    for (let k = 0; k < rest.length && i + k < props.length; k++) {
      boxes.value[i + k] = rest[k];
    }
    const next = Math.min(i + rest.length, props.length - 1);
    updateModel();
    if (next < props.length - 1) focusIndex(next + 1);
    else inputs.value?.[next]?.blur?.();
    return;
  }

  boxes.value[i] = v;
  updateModel();
  if (v && i < props.length - 1) focusIndex(i + 1);
}

function onKeydown(i, e) {
  const key = e.key;
  if (key === "Backspace") {
    if (boxes.value[i]) {
      boxes.value[i] = "";
      updateModel();
    } else if (i > 0) {
      focusIndex(i - 1);
      boxes.value[i - 1] = "";
      updateModel();
    }
    e.preventDefault();
  } else if (key === "ArrowLeft") {
    if (i > 0) focusIndex(i - 1);
    e.preventDefault();
  } else if (key === "ArrowRight") {
    if (i < props.length - 1) focusIndex(i + 1);
    e.preventDefault();
  }
}

function onPaste(e) {
  e.preventDefault();
  const text = (e.clipboardData || window.clipboardData).getData("text") || "";
  const digits = text.replace(/\D/g, "").slice(0, props.length).split("");
  if (!digits.length) return;

  boxes.value = Array.from({ length: props.length }, (_, i) => digits[i] || "");
  updateModel();

  const lastFilled = Math.min(digits.length, props.length) - 1;
  if (lastFilled >= 0 && lastFilled < props.length - 1)
    focusIndex(lastFilled + 1);
  else inputs.value?.[lastFilled]?.blur?.();
}
</script>

<template>
  <div class="otp-wrapper">
    <label v-if="label" class="form-label">{{ label }}</label>
    <div class="d-flex gap-3 justify-content-start">
      <input
        v-for="(val, i) in boxes"
        :key="i"
        ref="inputs"
        name="otp-{{ i }}"
        type="tel"
        inputmode="numeric"
        pattern="[0-9]*"
        maxlength="1"
        :aria-invalid="!!error"
        :aria-describedby="error ? errorId : undefined"
        class="form-control otp-input"
        :value="val"
        :disabled="disabled"
        @input="onInput(i, $event)"
        @keydown="onKeydown(i, $event)"
        @paste="onPaste"
      />
    </div>

    <!-- رسالة الخطأ -->
    <div v-if="error" :id="errorId" class="otp-error mt-2">
      <Icon name="ph:warning-circle" :size="18" class="flex-shrink-0" />
      <span>{{ error }}</span>
    </div>
  </div>
</template>
<style scoped>
.otp-input {
  width: 50px !important;
  height: 64px;
  text-align: center;
  font-size: 28px;
  line-height: 1;
  border: 0;
  border-radius: 1rem;
  background-color: #fff;
}
.otp-input:focus {
  outline: 0;
  box-shadow: 0 12px 36px rgba(24, 56, 163, 0.18),
    0 0 0 2px rgba(24, 56, 163, 0.15);
  transform: translateY(-1px);
}
.otp-error {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--bs-danger, #dc3545);
  font-size: 0.9rem;
  font-weight: 500;
}
</style>