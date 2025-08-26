<script setup>
import BaseText from "@/components/form/BaseText.vue";
import BaseSelect from "~/components/form/BaseSelect.vue";

useHead({
  title: "تواصل معنا",
});
const form = reactive({
  phone: "",
  username: "",
  city: "",
  email: "",
  massage: "",
});

const errors = reactive({
  phone: "",
  username: "",
  city: "",
  email: "",
  massage: "",
});
const cities = [
  { value: "جباليا", label: "جباليا" },
  { value: "خانيونس", label: "خانيونس" },
  { value: "النصيرات", label: "النصيرات" },
  { value: "رفح", label: "رفح" },
  { value: "دير البلح", label: "دير البلح" },
  { value: "مدينة غزة", label: "مدينة غزة" },
  { value: "بيت لاهيا", label: "بيت لاهيا" },
  { value: "بيت حانون", label: "بيت حانون" },
];
function resetErrors() {
  Object.keys(errors).forEach((k) => (errors[k] = ""));
}

function onSubmit() {
  resetErrors();
  if (!form.phone || !/^(\+?\d{8,15})$/.test(form.phone))
    errors.phone = "يرجى إدخال رقم جوال صحيح";
  if (!form.username || form.username.length < 3)
    errors.username = "الاسم يجب ان لا يقل عن 3 أحرف";
  if (!form.city) errors.city = "يرجى إدخال المدينة";
  if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email))
    errors.email = "البريد الإلكتروني غير صحيح";
  if (!form.massage || form.massage.length < 20)
    errors.massage = "الرسالة يجب ان لا تقل عن 20 حرف";
}
</script>
<template>
  <section class="contact-section py-5" dir="rtl">
    <div class="container">
      <div class="p-md-5">
        <div class="p-9">
          <h1>تواصل معنا</h1>
          <div class="d-flex align-items-center">
            <h2 class="fs-3 m-0 fw-normal text-primary d-inline">الرئيسية</h2>
            <Icon
              name="mdi:chevron-left-circle-outline"
              class="fs-3 mx-3 text-secondary"
            />
            <h2 class="fs-3 m-0 fw-semibold text-muted">تواصل معنا</h2>
          </div>
        </div>
        <form class="px-9" @submit.prevent="onSubmit" novalidate>
          <div>
            <div class="row g-4 rounded-1 p-9 bg-white shadow-sm">
              <div class="mb-4 py-4">
                <h2 class="fw-bold text-primary mb-2">نحن هنا من أجلك!</h2>
                <p class="fs-5 text-dark mb-0">
                  يسعدنا تواصلك معنا للإجابة عن استفساراتك، استقبال اقتراحاتك.
                  لا تتردد في مراسلتنا وسنرد عليك في أقرب وقت ممكن.
                </p>
              </div>
              <div class="row">
                <div class="col-md-6">
                  <BaseText
                    label="الاسم الكامل"
                    placeholder="الاسم الكامل"
                    v-model="form.username"
                    :error="errors.username"
                  />
                </div>
                <div class="col-md-6">
                  <BaseText
                    label="رقم الهاتف"
                    placeholder="أدخل رقم الهاتف"
                    v-model="form.phone"
                    :error="errors.phone"
                    type="tel"
                    inputmode="tel"
                  />
                </div>
                <div class="col-md-6">
                  <BaseText
                    label="البريد الإلكتروني"
                    placeholder="البريد الإلكتروني"
                    v-model="form.email"
                    :error="errors.email"
                    type="email"
                    autocomplete="email"
                  />
                </div>
                <div class="col-md-6">
                  <BaseSelect
                    label="المدينة"
                    placeholder="اختر المدينة"
                    :options="cities"
                    v-model="form.city"
                    :error="errors.city"
                  />
                </div>
              </div>
              <div class="col-12">
                <label class="form-label fw-semibold">موضوع الرسالة</label>
                <textarea
                  name="message_subject"
                  class="form-control form-control-lg rounded-1"
                  rows="8"
                  placeholder="اكتب تفاصيل الطلب هنا..."
                  :class="{ 'is-invalid': !!errors.massage }"
                ></textarea>
                <div
                  v-if="errors.massage"
                  class="invalid-feedback d-block mt-1"
                >
                  {{ errors.massage }}
                </div>
              </div>
            </div>
            <div class="text-center my-8">
              <button type="submit" class="btn btn-lg btn-view-all">
                <span class="mb-0 text-white">أرسال الرسالة</span>
                <Icon
                  name="material-symbols:arrow-back-rounded"
                  class="text-white"
                  size="20"
                />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>
<style>
.bg-scandary .form-control-lg,
.form-select-lg {
  min-height: 3.25rem;
}
textarea.form-control-lg {
  min-height: 220px;
}

.bg-light::placeholder {
  color: #b7bcc5;
}
.rounded-4 {
  border-radius: 0.5rem !important;
}
</style>
