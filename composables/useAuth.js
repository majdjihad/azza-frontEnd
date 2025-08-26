// Value is initialized in: ~/plugins/auth.js
import { $larafetch } from "~/utils/$larafetch";

export const useUser = () => useState("user", () => null);

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
    const response = await $larafetch("/api/register", {
      method: "post",
      body: credentials,
    });
    return response;
  }

  async function verify(credentials) {
    const response = await $larafetch("/api/verify", {
      method: "post",
      body: credentials,
    });
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
    if (isLoggedIn.value) return;

    const response = await $larafetch("/api/login", {
      method: "post",
      body: credentials,
    });
    return [response, await refresh()];
  }

  // async function checkToken(credentials) {
  //   const response = await $larafetch("/check-token", {
  //     method: "post",
  //     body: credentials,
  //   });
  //   return response;
  // }

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
    verify,
    resendVerification,
    forgetPassword,
    resetPassword,
    logout,
  };
};

export const fetchCurrentUser = async () => {
  try {
    return await $larafetch("/api/user", {
      redirectIfNotAuthenticated: false,
    });
  } catch (error) {
    if ([401, 419].includes(error?.response?.status)) return null;
    throw error;
  }
};
