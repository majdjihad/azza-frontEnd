import { useUser, fetchCurrentUser } from "~/composables/useAuth";

export default defineNuxtPlugin(async () => {
  const user = useUser();
  if (user.value !== undefined) return; // تم التهيئة سابقًا

  user.value = await fetchCurrentUser(); // user أو null
});
