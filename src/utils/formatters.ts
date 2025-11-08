/**
 * Formatting Utilities
 * Helper functions for displaying data in UI with consistent formatting
 */

/**
 * Formats a numeric amount as GBP currency.
 * Always displays 2 decimal places with proper UK formatting.
 *
 * @param amount - The numeric amount to format
 * @returns Formatted currency string (e.g., "£1,234.56")
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Formats a numeric value as a percentage with specified decimal places.
 *
 * @param value - The numeric value to format (e.g., 15.5)
 * @param decimals - Number of decimal places to display (default: 1)
 * @returns Formatted percentage string (e.g., "15.5%")
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Formats a number with thousands separators using UK locale.
 *
 * @param number - The number to format
 * @returns Formatted number string (e.g., "1,234,567")
 */
export function formatNumber(number: number): string {
  return new Intl.NumberFormat('en-GB').format(number);
}

/**
 * Returns a Tailwind CSS color class based on whether the amount represents savings or loss.
 * Positive amounts (savings) return green, negative amounts (loss) return red.
 *
 * @param amount - The numeric amount to evaluate
 * @returns Tailwind color class string ('text-green-600' or 'text-red-600')
 */
export function getSavingsColor(amount: number): string {
  return amount >= 0 ? 'text-green-600' : 'text-red-600';
}

/**
 * Truncates text to a maximum length and appends ellipsis if needed.
 *
 * @param text - The text to potentially truncate
 * @param maxLength - Maximum number of characters before truncation
 * @returns Original text if within limit, otherwise truncated text with '...'
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Formats a date to a readable string using UK locale formatting.
 *
 * @param date - Date object, date string, or timestamp
 * @returns Formatted date string (e.g., "15 March 2024")
 */
export function formatDate(date: Date | string | number): string {
  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date));
}

/**
 * Pluralizes a word based on count.
 * Simple pluralization that adds 's' for counts other than 1.
 *
 * @param word - The word to potentially pluralize
 * @param count - The count to determine singular vs plural
 * @returns Singular word if count is 1, otherwise plural form with 's'
 */
export function pluralize(word: string, count: number): string {
  return count === 1 ? word : `${word}s`;
}
