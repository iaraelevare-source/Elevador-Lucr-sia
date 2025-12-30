/**
 * Formatting utilities for the application
 */

/**
 * Formats a value in cents to Brazilian Real currency format
 * @param value - Value in cents (e.g., 5000 = R$ 50.00)
 * @returns Formatted currency string (e.g., "R$ 50,00")
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }).format(value / 100);
};

/**
 * Formats a date to Brazilian format
 * @param date - Date to format
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export const formatDate = (
  date: Date | string, 
  options?: Intl.DateTimeFormatOptions
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('pt-BR', options);
};
