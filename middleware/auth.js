// Import user state management composable
import { useAuth } from "~/composables/useAuth";
export default defineNuxtRouteMiddleware(async () => {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn?.value) return navigateTo("/login", { replace: true });
});
