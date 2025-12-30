import { useState } from "react";

/**
 * Hook for managing modal state
 * @param initialState - Initial open/closed state
 * @returns Modal state management utilities
 */
export function useModalState(initialState: boolean = false) {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen((prev) => !prev);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
}
