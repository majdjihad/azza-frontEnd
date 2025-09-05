// Value is initialized in: ~/plugins/auth.js
import { $larafetch } from "~/utils/$larafetch";

export const useUser = () => {
  return useState("user", () => undefined);
};

export const useAuth = () => {
  const user = useUser();
  const isLoggedIn = computed(() => !!user.value);

  async function refresh() {
    try {
      user.value = await fetchCurrentUser();
    } catch {
      user.value = null;
    }
  }

  async function register(credentials) {
    const response = await $larafetch("/register", {
      method: "post",
      body: credentials,
    });
    return response;
  }

  async function authWithGoogle() {
    const response = await $larafetch("/api/google/redirect", {
      method: "get",
    });
    return response;
  }

  async function verify(credentials) {
    const response = await $larafetch("/verify", {
      method: "post",
      body: credentials,
    });
    await refresh();
    await navigateTo("/", { replace: true });
    return response;
  }
  async function resendVerification(credentials) {
    const response = await $larafetch("/api/resend-verification-code", {
      method: "post",
      body: credentials,
    });
    return response;
  }

  async function login(credentials) {
    const response = await $larafetch("/login", {
      method: "post",
      body: credentials,
    });
    await refresh();
    await navigateTo("/", { replace: true });
    return response;
  }

  async function forgetPassword(credentials) {
    const response = await $larafetch("/api/forgot-password", {
      method: "post",
      body: credentials,
    });
    return response;
  }

  async function resetPassword(credentials) {
    return await $larafetch("/api/reset-password", {
      method: "post",
      body: credentials,
    });
  }
  async function logout() {
    if (!isLoggedIn.value) return;
    await $larafetch("/api/logout", { method: "post" });
    user.value = null;
    await navigateTo("/login", { replace: true }); // ✅ بدل /api/login
    window.location.reload();
  }

  return {
    user,
    isLoggedIn,
    login,
    register,
    authWithGoogle,
    verify,
    resendVerification,
    forgetPassword,
    resetPassword,
    logout,
  };
};
export const fetchCurrentUser = async () => {
  try {
    const res = await $larafetch("/check-auth", {
      redirectIfNotAuthenticated: false, // لا تعمّل ريديركت تلقائي هنا
    });
    // API عندك يرجع { success, message, data:{ authenticated, user } }
    const isAuth = !!res?.data?.authenticated;
    return isAuth ? res?.data?.user ?? null : null;
  } catch (error) {
    if ([401, 419].includes(error?.response?.status)) return null;
    throw error;
  }
};
