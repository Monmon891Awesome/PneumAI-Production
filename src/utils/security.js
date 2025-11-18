/**
 * Security Utilities
 * Input sanitization, encryption, and SQL injection prevention
 */

/**
 * Caesar Cipher encryption
 * Simple shift cipher for basic data obfuscation
 * @param {string} text - Text to encrypt
 * @param {number} shift - Shift amount (default: 13 for ROT13)
 * @returns {string} - Encrypted text
 */
export const caesarEncrypt = (text, shift = 13) => {
  return text.replace(/[a-zA-Z]/g, (char) => {
    const code = char.charCodeAt(0);
    const isUpperCase = code >= 65 && code <= 90;
    const base = isUpperCase ? 65 : 97;

    return String.fromCharCode(
      ((code - base + shift) % 26) + base
    );
  });
};

/**
 * Caesar Cipher decryption
 * @param {string} text - Text to decrypt
 * @param {number} shift - Shift amount (default: 13 for ROT13)
 * @returns {string} - Decrypted text
 */
export const caesarDecrypt = (text, shift = 13) => {
  // Decryption is encryption with negative shift
  return caesarEncrypt(text, -shift);
};

/**
 * Sanitize user input to prevent XSS attacks
 * @param {string} input - User input string
 * @returns {string} - Sanitized string
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') {
    return '';
  }

  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '');

  // Escape special characters
  const entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  sanitized = sanitized.replace(/[&<>"'/]/g, (char) => entityMap[char]);

  return sanitized;
};

/**
 * Sanitize object for SQL injection prevention
 * @param {Object} obj - Object with potentially dangerous inputs
 * @returns {Object} - Sanitized object
 */
export const sanitizeObject = (obj) => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  const sanitized = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];

      if (typeof value === 'string') {
        sanitized[key] = sanitizeSQLInput(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
  }

  return sanitized;
};

/**
 * Sanitize input to prevent SQL injection
 * @param {string} input - User input
 * @returns {string} - Sanitized input
 */
export const sanitizeSQLInput = (input) => {
  if (typeof input !== 'string') {
    return input;
  }

  // Remove or escape dangerous SQL characters
  let sanitized = input.replace(/['";\\]/g, ''); // Remove quotes and backslashes
  sanitized = sanitized.replace(/--/g, ''); // Remove SQL comments
  sanitized = sanitized.replace(/\/\*/g, ''); // Remove block comment start
  sanitized = sanitized.replace(/\*\//g, ''); // Remove block comment end
  sanitized = sanitized.replace(/xp_/gi, ''); // Remove xp_ commands
  sanitized = sanitized.replace(/sp_/gi, ''); // Remove sp_ commands

  // Remove SQL keywords that could be used maliciously
  const dangerousKeywords = [
    'DROP', 'DELETE', 'TRUNCATE', 'EXEC', 'EXECUTE',
    'UNION', 'INSERT', 'UPDATE', 'SCRIPT', 'JAVASCRIPT',
    'ONERROR', 'ONCLICK', 'ONLOAD'
  ];

  dangerousKeywords.forEach((keyword) => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    sanitized = sanitized.replace(regex, '');
  });

  return sanitized.trim();
};

/**
 * Validate email format
 * @param {string} email - Email address
 * @returns {boolean} - True if valid email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate patient ID format
 * @param {string} patientId - Patient ID (e.g., PAT-2023-001)
 * @returns {boolean} - True if valid format
 */
export const isValidPatientId = (patientId) => {
  const patIdRegex = /^PAT-\d{4}-\d{3,6}$/;
  return patIdRegex.test(patientId);
};

/**
 * Validate scan ID format
 * @param {string} scanId - Scan ID (e.g., scan_abc123def456)
 * @returns {boolean} - True if valid format
 */
export const isValidScanId = (scanId) => {
  const scanIdRegex = /^scan_[a-f0-9]{12}$/;
  return scanIdRegex.test(scanId);
};

/**
 * Generate a secure random token
 * @param {number} length - Token length (default: 32)
 * @returns {string} - Random token
 */
export const generateSecureToken = (length = 32) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    token += characters[randomIndex];
  }

  return token;
};

/**
 * Mask sensitive data for display
 * @param {string} data - Sensitive data (email, phone, etc.)
 * @param {number} visibleChars - Number of visible characters at start/end
 * @returns {string} - Masked data
 */
export const maskSensitiveData = (data, visibleChars = 3) => {
  if (!data || data.length <= visibleChars * 2) {
    return data;
  }

  const start = data.substring(0, visibleChars);
  const end = data.substring(data.length - visibleChars);
  const masked = '*'.repeat(data.length - visibleChars * 2);

  return `${start}${masked}${end}`;
};

/**
 * Rate limiting check (client-side)
 * @param {string} key - Unique key for the action
 * @param {number} maxAttempts - Maximum attempts allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {boolean} - True if action is allowed
 */
export const checkRateLimit = (key, maxAttempts = 5, windowMs = 60000) => {
  const now = Date.now();
  const storageKey = `rateLimit_${key}`;

  // Get previous attempts
  const storedData = localStorage.getItem(storageKey);
  let attempts = storedData ? JSON.parse(storedData) : [];

  // Filter out old attempts outside the window
  attempts = attempts.filter((timestamp) => now - timestamp < windowMs);

  // Check if limit exceeded
  if (attempts.length >= maxAttempts) {
    return false;
  }

  // Add new attempt
  attempts.push(now);
  localStorage.setItem(storageKey, JSON.stringify(attempts));

  return true;
};

/**
 * Clear rate limit for a key
 * @param {string} key - Unique key for the action
 */
export const clearRateLimit = (key) => {
  const storageKey = `rateLimit_${key}`;
  localStorage.removeItem(storageKey);
};

/**
 * Validate file upload (type and size)
 * @param {File} file - File to validate
 * @param {Array} allowedTypes - Allowed MIME types
 * @param {number} maxSizeMB - Maximum file size in MB
 * @returns {Object} - {valid: boolean, error: string}
 */
export const validateFileUpload = (file, allowedTypes = [], maxSizeMB = 100) => {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  // Check file type
  const fileExtension = file.name.split('.').pop().toLowerCase();
  const allowedExtensions = allowedTypes.map((type) =>
    type.split('/').pop().toLowerCase()
  );

  if (allowedTypes.length > 0 && !allowedExtensions.includes(fileExtension)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${allowedExtensions.join(', ')}`,
    };
  }

  // Check file size
  const maxSize = maxSizeMB * 1024 * 1024; // Convert to bytes
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    };
  }

  return { valid: true, error: null };
};

/**
 * Encode data for safe URL transmission
 * @param {string} data - Data to encode
 * @returns {string} - URL-safe encoded data
 */
export const encodeForUrl = (data) => {
  return encodeURIComponent(btoa(data));
};

/**
 * Decode URL-encoded data
 * @param {string} encoded - Encoded data
 * @returns {string} - Decoded data
 */
export const decodeFromUrl = (encoded) => {
  try {
    return atob(decodeURIComponent(encoded));
  } catch (error) {
    console.error('Failed to decode URL data:', error);
    return null;
  }
};

export default {
  caesarEncrypt,
  caesarDecrypt,
  sanitizeInput,
  sanitizeObject,
  sanitizeSQLInput,
  isValidEmail,
  isValidPatientId,
  isValidScanId,
  generateSecureToken,
  maskSensitiveData,
  checkRateLimit,
  clearRateLimit,
  validateFileUpload,
  encodeForUrl,
  decodeFromUrl,
};
