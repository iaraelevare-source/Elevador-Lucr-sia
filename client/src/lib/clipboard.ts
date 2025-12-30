import { toast } from "sonner";

/**
 * Copies text to clipboard and shows a success toast
 * @param text - Text to copy to clipboard
 * @param successMessage - Optional custom success message
 */
export const copyToClipboard = (
  text: string, 
  successMessage: string = "Copiado para a área de transferência!"
): void => {
  navigator.clipboard.writeText(text);
  toast.success(successMessage);
};
