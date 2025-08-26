export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  const larafetch = $fetch.create({
    baseURL: config.public.apiBase || "http://127.0.0.1:8000",
    credentials: "include", // ضروري للكوكيز (Sanctum/جلسات)
    onRequest({ options }) {
      // أثناء SSR: مرّر كوكي المتصفح لباكند Laravel
      if (process.server) {
        options.headers = {
          ...options.headers,
          ...useRequestHeaders(["cookie"]),
        };
      }
      // لو كنت تستخدم JWT بدلاً من الجلسات:
      const token = useCookie("token").value;
      if (token) {
        options.headers = {
          ...(options.headers || {}),
          Authorization: `Bearer ${token}`,
        };
      }
    },
    async onResponseError({ response, request, options }) {
      // إن حصل 419 CSRF مع Sanctum: خذ الكوكي ثم أعد المحاولة مرة واحدة
      if (response.status === 419 && request !== "/sanctum/csrf-cookie") {
        await $fetch("/sanctum/csrf-cookie", {
          baseURL: config.public.apiBase || "http://127.0.0.1:8000",
          credentials: "include",
        });
        return await $fetch(request, {
          ...options,
          baseURL: config.public.apiBase || "http://127.0.0.1:8000",
          credentials: "include",
        });
      }
      throw response;
    },
  });

  return { provide: { larafetch } };
});
