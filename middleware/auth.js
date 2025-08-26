// Import user state management composable
import { useUser } from "~/composables/useAuth";

export default defineNuxtRouteMiddleware(async () => {
  const user = useUser();
  if (!user?.value) return navigateTo("/login", { replace: true });
});
