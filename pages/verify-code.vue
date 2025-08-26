<script setup>
import OtpCode from "@/components/form/OtpCode.vue";

useHead({
  title: "تاكيد الرمز",
});

const route = useRoute();
const router = useRouter();
const { verify, resendVerification } = useAuth();
const otp = ref("");
const otpError = ref("");
const inProgress = ref(false);
const resendCodeInProgress = ref(false);
const otpRef = ref(null);

const resendBtn = ref(null);
const timerSpan = ref(null);
const countdown = ref(0.2 * 60);
const isDisabled = ref(true);

onMounted(() => {
  const interval = setInterval(() => {
    const minutes = Math.floor(countdown.value / 60);
    const seconds = countdown.value % 60;

    if (timerSpan.value) {
      timerSpan.value.textContent = `يمكنك إعادة الإرسال بعد: ${minutes}:${seconds
        .toString()
        .padStart(2, "0")}`;
    }

    countdown.value--;

    if (countdown.value < 0) {
      clearInterval(interval);
      isDisabled.value = false;
      if (timerSpan.value) timerSpan.value.textContent = "";
    }
  }, 1000);
});

watch(otp, (v) => {
  if (otpError.value && v) otpError.value = "";
});

const formData = reactive({
  email: route.query.email,
  verification_code: otp,
});
// handle form
const formHandle = async () => {
  otpError.value = "";
  if (!otp.value || otp.value.length < 4) {
    otpError.value = "يرجى إدخال رمز مكوّن من 4 أرقام";
    otpRef.value?.focusFirst?.();
    return;
  }
  try {
    inProgress.value = true;
    const { submit } = useSubmit(() => verify(formData), {
      onSuccess: (response) => {
        // Handle the response
        if (route.query.mode === "forget-password") {
          router.push({
            path: "/reset-password",
            query: { email: formData.email, code: otp.value },
          });
          showToast("success", response.message);
        } else if (route.query.mode === "register") {
          router.push({
            path: "/",
          });
          showToast("success", response.message);
        }
      },
      onError: (error) => {
        showToast("error", error?.data?.message);
        if (error?.data?.code === 400) {
          return navigateTo("/login", { replace: true });
        }
      },
    });
    await submit();
  } catch (error) {
    if (!error?.data?.message) {
      showToast("error", "فشل التسجيل");
    }
  } finally {
    inProgress.value = false;
  }
};

const resendVerificationCode = async () => {
  if (inProgress.value) return;
  try {
    resendCodeInProgress.value = true;
    const { submit } = useSubmit(
      () => resendVerification({ email: formData.email }),
      {
        onSuccess: (response) => {
          // Handle the response
          showToast("success", response.message);
        },
        onError: (error) => {
          showToast("error", error.data.message);
          if (error?.data?.code === 400) {
            return navigateTo("/login", { replace: true });
          }
        },
      }
    );
    await submit();
  } catch (error) {
    showToast("error", error.data?.message || "فشل التسجيل");
  } finally {
    resendCodeInProgress.value = false;
  }
};
</script>

<template>
  <section class="py-5 pb-9">
    <div class="container">
      <div class="row flex-column-reverse flex-md-row g-9 align-items-stretch">
        <div class="col-lg-4">
          <div class="info-panel h-100 text-white rounded-3 p-4 p-md-5">
            <h2 class="text-white fw-normal mb-3 p-4 px-9">
              <span class="fw-bold fs-1">اكتشــــــف آلاف الإعلانــــــات</span>
              من المستخدمين في مختلف الفئات وبأفضل الأسعار
            </h2>
            <ul class="list-unstyled lh-lg mb-0 mt-4">
              <li class="d-flex align-items-start my-4">
                <Icon
                  name="material-symbols:check-circle"
                  class="text-info fs-3 mt-1 ms-2"
                />
                <span class="fs-4">انضم إلى مئات المستخدمين على منصتنا</span>
              </li>
              <li class="d-flex align-items-start my-4">
                <Icon
                  name="material-symbols:check-circle"
                  class="text-info fs-3 mt-1 ms-2"
                />
                <span class="fs-4">تسجيل الدخول سهل وآمن وسريع</span>
              </li>
              <li class="d-flex align-items-start my-4">
                <Icon
                  name="material-symbols:check-circle"
                  class="text-info fs-3 mt-1 ms-2"
                />
                <span class="fs-4">نشر الإعلانات ورفع الصور بسهولة</span>
              </li>
              <li class="d-flex align-items-start my-4">
                <Icon
                  name="material-symbols:check-circle"
                  class="text-info fs-3 mt-1 ms-2"
                />
                <span class="fs-4">استعرض العروض في المنطقة الأقرب لك</span>
              </li>
              <li class="d-flex align-items-start my-4">
                <Icon
                  name="material-symbols:check-circle"
                  class="text-info fs-3 mt-1 ms-2"
                />
                <span class="fs-4">إدارة إعلاناتك وتتبعها في أي وقت</span>
              </li>
              <li class="d-flex align-items-start my-4">
                <Icon
                  name="material-symbols:check-circle"
                  class="text-info fs-3 mt-1 ms-2"
                />
                <span class="fs-4">اضف التفاصيل والصور لوصف إعلانك بدقة</span>
              </li>
            </ul>
          </div>
        </div>
        <div class="col-lg-8 py-9">
          <div class="card border-0 py-9 h-100 bg-white">
            <div class="card-body p-4 p-md-5">
              <form @submit.prevent="formHandle" novalidate>
                <div>
                  <NuxtLink
                    :to="
                      route.query.mode === 'forget-password'
                        ? '/forget-password'
                        : '/register'
                    "
                    class="d-inline-flex align-items-center mb-3 text-primary fw-bold"
                  >
                    <Icon
                      name="material-symbols:arrow-right-alt"
                      class="ms-1"
                      size="28"
                    />
                    <span class="fs-3">رمز التحقق</span>
                  </NuxtLink>
                  <div class="w-md-50 w-75 my-8">
                    <p>
                      لقد ارسلنا رمز تحقق الى بريدك الالكتروني
                      <span class="text-primary">{{ route.query.email }}</span>
                    </p>
                    <OtpCode
                      v-if="!inProgress"
                      v-model="otp"
                      :length="6"
                      :error="otpError"
                      ref="otpRef"
                      class="my-9"
                    />
                    <div v-else class="text-center py-4">
                      <icon
                        name="svg-spinners:ring-resize"
                        class="indicator-label display-4 text-primary"
                      />
                    </div>

                    <p class="my-3 text-muted">
                      الرجاء إدخال الرمز لإكمال العملية
                    </p>
                  </div>
                </div>
                <div class="text-end my-3">
                  <button
                    class="btn btn-main mt-3"
                    :disabled="inProgress"
                    type="submit"
                  >
                    <span class="fw-semibold">تحقق</span>
                    <Icon
                      name="material-symbols:arrow-back-rounded"
                      class="text-white me-2"
                      size="22"
                    />
                  </button>
                  <div class="my-9 fw-semibold" v-if="!resendCodeInProgress">
                    <div>
                      اذا لم تتلقَّ رسالة التحقق؟
                      <span
                        ref="resendBtn"
                        :class="['text-primary', 'text-decoration-underline']"
                        @click="resendVerificationCode"
                        class="cursor-pointer"
                        v-if="!isDisabled"
                      >
                        اضغط هنا لإعادة الأرسال
                      </span>
                    </div>
                    <span
                      class="text-muted d-block mt-3"
                      ref="timerSpan"
                    ></span>
                  </div>
                  <div v-else class="text-muted mt-6">
                    <icon
                      name="svg-spinners:ring-resize"
                      class="indicator-label fs-3"
                    />
                    <span class="fs-4 me-3">يتم الارسال</span>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.info-panel {
  background: linear-gradient(135deg, #264fcf, #1838a3);
  box-shadow: 0 0.5rem 1rem rgba(24, 56, 163, 0.15);
}
.btn-main {
  padding: 10px 40px !important;
}
</style>
