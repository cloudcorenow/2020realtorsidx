/**
 * Formats a number as a price with currency symbol
 */
export const formatPrice = (price: number, currency: string = '$'): string => {
  return `${currency}${price.toLocaleString()}`;
};

/**
 * Formats a date string in the desired format
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

/**
 * Creates a user-friendly property type display string
 */
export const formatPropertyType = (type: string): string => {
  const types: Record<string, string> = {
    'single-family': 'Single Family Home',
    'condo': 'Condominium',
    'townhouse': 'Townhouse',
    'multi-family': 'Multi-Family',
    'land': 'Land',
    'commercial': 'Commercial Property'
  };
  
  return types[type] || type;
};

/**
 * Truncates text to a specified length and adds ellipsis
 */
export const truncateText = (text: string, maxLength: number = 150): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};