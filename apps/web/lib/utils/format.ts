/**
 * Utilities for consistent data formatting across the application
 */

/**
 * Format a number with French locale for consistent server/client rendering
 */
export function formatNumber(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '0';
  }
  return value.toLocaleString('fr-FR');
}

/**
 * Format a currency value in euros
 */
export function formatCurrency(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '0,00€';
  }
  return `${value.toFixed(2).replace('.', ',')}€`;
}

/**
 * Format a percentage value
 */
export function formatPercentage(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '0,0%';
  }
  return `${value.toFixed(1).replace('.', ',')}%`;
}

/**
 * Format a date for French locale
 */
export function formatDate(date: string | Date | undefined | null): string {
  if (!date) {
    return '--/--/----';
  }
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) {
      return '--/--/----';
    }
    return dateObj.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return '--/--/----';
  }
}

/**
 * Format a datetime for French locale
 */
export function formatDateTime(date: string | Date | undefined | null): string {
  if (!date) {
    return '--/--/---- --:--';
  }
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) {
      return '--/--/---- --:--';
    }
    return dateObj.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '--/--/---- --:--';
  }
}
