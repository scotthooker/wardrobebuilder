/**
 * Formatting Utilities
 * Helper functions for displaying data in UI
 */

/**
 * Format currency in GBP
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Format percentage
 */
export function formatPercent(value, decimals = 1) {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format number with commas
 */
export function formatNumber(number) {
  return new Intl.NumberFormat('en-GB').format(number);
}

/**
 * Get savings color class
 */
export function getSavingsColor(amount) {
  return amount >= 0 ? 'text-green-600' : 'text-red-600';
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Format date to readable string
 */
export function formatDate(date) {
  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date));
}

/**
 * Pluralize word based on count
 */
export function pluralize(word, count) {
  return count === 1 ? word : `${word}s`;
}
