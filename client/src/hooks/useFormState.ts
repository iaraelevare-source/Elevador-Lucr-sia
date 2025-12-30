import { useState } from "react";

/**
 * Generic form state management hook
 * @param initialState - Initial form data
 * @returns Form state management utilities
 */
export function useFormState<T extends Record<string, any>>(initialState: T) {
  const [formData, setFormData] = useState<T>(initialState);

  const updateField = <K extends keyof T>(field: K, value: T[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateMultipleFields = (updates: Partial<T>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const resetForm = () => {
    setFormData(initialState);
  };

  return {
    formData,
    setFormData,
    updateField,
    updateMultipleFields,
    resetForm,
  };
}
