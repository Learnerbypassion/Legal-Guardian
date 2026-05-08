/**
 * Format and normalize phone number input
 * Automatically adds country code if missing
 */
export const formatPhoneInput = (input) => {
  if (!input) return '';

  // Remove all non-digit and plus characters
  let cleaned = input.replace(/[^\d+]/g, '');

  // Remove leading zeros if not starting with +
  if (cleaned && !cleaned.startsWith('+')) {
    cleaned = cleaned.replace(/^0+/, '');
  }

  return cleaned;
};

/**
 * Auto-add country code if missing
 * Used for form submission
 */
export const normalizePhoneForSubmit = (phone) => {
  if (!phone) return '';

  let cleaned = phone.replace(/[\s\-()]/g, '');

  // If already starts with +, return as is
  if (cleaned.startsWith('+')) {
    return cleaned;
  }

  // If starts with country code (91 for India), add +
  if (cleaned.startsWith('91') && cleaned.length > 2) {
    return '+' + cleaned;
  }

  // If no country code, add +91 (India)
  if (!cleaned.startsWith('+')) {
    return '+91' + cleaned;
  }

  return cleaned;
};

/**
 * Format phone for display (with dashes/spaces)
 * Example: +91 98765 43210
 */
export const formatPhoneForDisplay = (phone) => {
  if (!phone) return '';

  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    // Just 10 digits (no country code)
    return cleaned.replace(/(\d{5})(\d{5})/, '$1 $2');
  } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
    // 91 + 10 digits
    return '+91 ' + cleaned.slice(2).replace(/(\d{5})(\d{5})/, '$1 $2');
  } else if (cleaned.length >= 10) {
    // International format
    const lastTen = cleaned.slice(-10);
    const countryPart = cleaned.slice(0, -10);
    return '+' + countryPart + ' ' + lastTen.replace(/(\d{5})(\d{5})/, '$1 $2');
  }

  return phone;
};

/**
 * Get display value for input field
 * Shows formatted phone with country code
 */
export const getPhoneDisplayValue = (value) => {
  if (!value) return '';

  // Remove all formatting
  let cleaned = value.replace(/[^\d+]/g, '');

  // If it's just numbers and doesn't start with +91 or 91
  if (cleaned && !cleaned.startsWith('+') && !cleaned.startsWith('91')) {
    // Add country code
    cleaned = '91' + cleaned;
  }

  // Convert to international format
  if (cleaned && !cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }

  return cleaned;
};
