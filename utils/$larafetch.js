const CSRF_COOKIE = "XSRF-TOKEN";
const CSRF_HEADER = "X-XSRF-TOKEN";

export async function $larafetch(path, options = {}) {
  const { backendUrl, frontendUrl } = useRuntimeConfig().public;
  const router = useRouter();

  let token = useCookie(CSRF_COOKIE).value;

  const method = (options?.method || "get").toUpperCase();

  // لطلبات معدِّلة، خذ CSRF أولًا
  if (process.client && ["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    await initCsrf();
    token = getCookie(CSRF_COOKIE);
  }

  let headers = {
    accept: "application/json",
    ...(token && { [CSRF_HEADER]: token }),
    ...(options?.headers || {}),
  };

  // لا تضف X-Requested-With إلا مع الطلبات المعدّلة
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    headers["X-Requested-With"] = "XMLHttpRequest";
  }

  if (process.server) {
    headers = {
      ...headers,
      ...useRequestHeaders(["cookie"]),
      referer: frontendUrl,
    };
  }

  try {
    return await $fetch(path, {
      baseURL: backendUrl,
      ...options,
      headers,
      credentials: "include",
    });
  } catch (error) {
    const status = error?.response?.status ?? -1;

    if ([401, 419].includes(status)) {
      await router.push("/login");
    }
    if ([500, 403].includes(status)) {
      showError({ statusCode: status, message: error.data?.message });
      console.error("[Laravel Error]", error.data?.message, error.data);
    }
    throw error;
  }
}

async function initCsrf() {
  const { backendUrl } = useRuntimeConfig().public;
  await $fetch("/sanctum/csrf-cookie", {
    baseURL: backendUrl,
    credentials: "include",
  });
}

function getCookie(name) {
  const match = document.cookie.match(
    new RegExp("(^|;\\s*)(" + name + ")=([^;]*)")
  );
  return match ? decodeURIComponent(match[3]) : null;
}
