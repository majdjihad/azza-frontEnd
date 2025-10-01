// middleware/auth.global.js (مثال)
import { useAuth } from "~/composables/useAuth";

export default defineNuxtRouteMiddleware((to) => {
  const { isLoggedIn } = useAuth();

  // ✅ استثناء الصفحة الرئيسية "/"
  if (to.path === "/") return;

  if (!isLoggedIn?.value) {
    return navigateTo("/login", { replace: true });
  }
});
