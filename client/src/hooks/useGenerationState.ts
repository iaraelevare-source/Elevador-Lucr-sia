import { useState } from "react";

/**
 * Hook for managing AI generation states
 * @returns Generation state management utilities
 */
export function useGenerationState<T = string>() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startGeneration = () => {
    setIsGenerating(true);
    setResult(null);
    setError(null);
  };

  const completeGeneration = (data: T) => {
    setIsGenerating(false);
    setResult(data);
    setError(null);
  };

  const failGeneration = (errorMessage: string) => {
    setIsGenerating(false);
    setResult(null);
    setError(errorMessage);
  };

  const reset = () => {
    setIsGenerating(false);
    setResult(null);
    setError(null);
  };

  return {
    isGenerating,
    result,
    error,
    startGeneration,
    completeGeneration,
    failGeneration,
    reset,
  };
}
