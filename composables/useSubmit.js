
 // Composable for handling form submissions with validation and error handling

export function useSubmit(fetchable, options = {}) {
  // State management for form submission
  const validationErrors = ref({});
  const error = ref(null);
  const inProgress = ref(false);
  const succeeded = ref(null);

  async function submit() {
    // Reset state before submission
    validationErrors.value = {};
    error.value = null;
    inProgress.value = true;
    succeeded.value = null;

    try {
      // Attempt to submit form data
      const data = await fetchable();
      succeeded.value = true;
      // Call success callback if provided
      options?.onSuccess?.(data);
      return data;
    } catch (e) {
      // Handle submission errors
      error.value = e;
      succeeded.value = false;
      // Call error callback if provided
      options?.onError?.(e);
      // Store validation errors if present
      validationErrors.value = e.data?.errors;

      // Re-throw non-validation errors
      if (e.response?.status !== 422) throw e;
    } finally {
      // Reset progress state
      inProgress.value = false;
    }
  }

  // Return submit handler and state variables
  return {
    submit,
    inProgress,
    succeeded,
    validationErrors,
    error,
  };
}
