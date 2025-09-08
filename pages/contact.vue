<!-- pages/contact.vue (أو نفس صفحتك الحالية) -->
<script setup>
import { reactive, ref } from "vue";
import BaseText from "@/components/form/BaseText.vue";
import { useMain } from "~/composables/useMain";
import { showToast } from "~/composables/useToast";
useSeo({
  title: "تواصل معنا | منصّة AZZA",
  description:
    "تواصل مع فريق الدعم عبر صفحة اتصل بنا للإجابة على استفساراتك أو ملاحظاتك حول الإعلانات والمنتجات والخدمات على المنصّة.",
  image: "/media/avatars/logo.png",
  canonicalPath: "/contact-us",
  type: "website",
});

useHead({ title: "تواصل معنا" });

const router = useRouter();
const { sendMessage } = useMain();

const form = reactive({
  phone: "",
  name: "",
  subject: "",
  email: "",
  message: "",
});

const errors = reactive({
  phone: "",
  name: "",
  subject: "",
  email: "",
  message: "",
});

const sending = ref(false);

function resetErrors() {
  Object.keys(errors).forEach((k) => (errors[k] = ""));
}

function validate() {
  resetErrors();
  let ok = true;

  if (!form.phone || !/^(\+?\d{8,15})$/.test(form.phone)) {
    errors.phone = "يرجى إدخال رقم جوال صحيح";
    ok = false;
  }
  if (!form.name || form.name.trim().length < 3) {
    errors.name = "الاسم يجب أن لا يقل عن 3 أحرف";
    ok = false;
  }
  if (!form.subject || form.subject.trim().length === 0) {
    errors.subject = "يرجى إدخال عنوان الرسالة";
    ok = false;
  }
  if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) {
    errors.email = "البريد الإلكتروني غير صحيح";
    ok = false;
  }
  if (!form.message || form.message.trim().length < 20) {
    errors.message = "الرسالة يجب أن لا تقل عن 20 حرف";
    ok = false;
  }

  return ok;
}

function fillBackendErrors(be = {}) {
  // ربط الأخطاء القادمة من Laravel (422) بالحقول المحلية
  if (be.phone?.[0]) errors.phone = be.phone[0];
  if (be.name?.[0]) errors.name = be.name[0];
  if (be.name?.[0]) errors.name = be.name[0]; // لو السيرفر يستخدم name
  if (be.subject?.[0]) errors.subject = be.subject[0];
  if (be.email?.[0]) errors.email = be.email[0];
  if (be.message?.[0]) errors.message = be.message[0];
  if (be.message?.[0]) errors.message = be.message[0];
}

function resetForm() {
  form.phone = "";
  form.name = "";
  form.subject = "";
  form.email = "";
  form.message = "";
  resetErrors();
}

async function onSubmit() {
  if (!validate()) return;

  sending.value = true;

  try {
    const fd = new FormData();
    fd.append("phone", form.phone);
    fd.append("name", form.name);
    fd.append("subject", form.subject);
    fd.append("email", form.email);
    fd.append("message", form.message);

    const res = await sendMessage(fd);
    router.push({ path: "/" });
    showToast(
      "success",
      res?.message ||
        res?.data?.message ||
        "تم إرسال رسالتك بنجاح، سنقوم بالرد في أقرب وقت 👌"
    );
    resetForm();
  } catch (e) {
    // معالجة 422 Validation
    if (e?.status === 422) {
      fillBackendErrors(e?.data?.errors || {});
      showToast(
        "danger",
        e?.data?.message || "تعذر إرسال الرسالة. يرجى مراجعة الحقول."
      );
    } else {
      showToast(
        "danger",
        e?.data?.message || e?.message || "حدث خطأ غير متوقع أثناء الإرسال"
      );
    }
  } finally {
    sending.value = false;
  }
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
          <div class="row g-4 rounded-1 p-9 bg-white shadow-sm">
            <div class="mb-4 py-4">
              <h2 class="fw-bold text-primary mb-2">نحن هنا من أجلك!</h2>
              <p class="fs-5 text-dark mb-0">
                يسعدنا تواصلك معنا للإجابة عن استفساراتك واستقبال اقتراحاتك. لا
                تتردد في مراسلتنا وسنرد عليك في أقرب وقت ممكن.
              </p>
            </div>

            <div class="row">
              <div class="col-md-6">
                <BaseText
                  label="الاسم الكامل"
                  placeholder="الاسم الكامل"
                  v-model="form.name"
                  :error="errors.name"
                  @input="errors.name = ''"
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
                  @input="errors.phone = ''"
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
                  @input="errors.email = ''"
                />
              </div>

              <div class="col-md-6">
                <BaseText
                  label="عنوان الرسالة"
                  placeholder="عنوان الرسالة"
                  type="text"
                  v-model="form.subject"
                  :error="errors.subject"
                  @input="errors.subject = ''"
                />
              </div>
            </div>

            <div class="col-12">
              <label class="form-label fw-semibold">موضوع الرسالة</label>
              <textarea
                name="message"
                class="form-control form-control-lg rounded-1"
                rows="8"
                placeholder="اكتب تفاصيل طلبك هنا..."
                v-model="form.message"
                :class="{ 'is-invalid': !!errors.message }"
                @input="errors.message = ''"
              ></textarea>
              <div v-if="errors.message" class="invalid-feedback d-block mt-1">
                {{ errors.message }}
              </div>
            </div>
          </div>

          <div class="text-center my-8">
            <button
              type="submit"
              class="btn btn-lg btn-view-all"
              :disabled="sending"
            >
              <template v-if="!sending">
                <span class="mb-0 text-white">إرسال الرسالة</span>
                <Icon
                  name="material-symbols:arrow-back-rounded"
                  class="text-white"
                  size="20"
                />
              </template>
              <icon
                v-else
                name="svg-spinners:ring-resize"
                class="indicator-label fs-1"
              />
            </button>
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
