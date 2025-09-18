/**
 * Utility Helper Functions
 * 
 * This module provides a comprehensive collection of utility functions
 * for common operations, data manipulation, validation, formatting,
 * and system operations used throughout the CivilAnki backend application.
 */

const crypto = require('crypto');
const { logger } = require('./logger');

/**
 * String Utilities
 */
class StringUtils {
  static generateRandomString(length = 32, charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789') {
    let result = '';
    const charactersLength = charset.length;
    
    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomInt(0, charactersLength);
      result += charset.charAt(randomIndex);
    }
    
    return result;
  }

  static generateSecureRandomString(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  static toTitleCase(str) {
    if (!str) return '';
    return str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
  }

  static truncate(str, maxLength = 100, suffix = '...') {
    if (!str || str.length <= maxLength) return str;
    return str.substring(0, maxLength - suffix.length) + suffix;
  }

  static stripHtml(str) {
    if (!str) return '';
    return str.replace(/<[^>]*>/g, '');
  }
}

/**
 * Phone Number Utilities
 */
class PhoneUtils {
  static validateIndianPhone(phone) {
    if (!phone) {
      return { isValid: false, message: 'Phone number is required' };
    }

    const cleanPhone = phone.replace(/[^\d]/g, '');
    
    // Check 10-digit format starting with 6-9
    if (/^[6-9]\d{9}$/.test(cleanPhone)) {
      return { isValid: true, formatted: `+91${cleanPhone}` };
    }
    
    // Check 12-digit format with 91 prefix
    if (/^91[6-9]\d{9}$/.test(cleanPhone)) {
      return { isValid: true, formatted: `+${cleanPhone}` };
    }
    
    return { 
      isValid: false, 
      message: 'Invalid Indian phone number format. Use 10 digits starting with 6-9' 
    };
  }

  static formatForDisplay(phone) {
    const validation = this.validateIndianPhone(phone);
    if (validation.isValid) {
      const cleanPhone = phone.replace(/[^\d]/g, '');
      const number = cleanPhone.length === 12 ? cleanPhone.substring(2) : cleanPhone;
      return `+91 ${number.substring(0, 5)} ${number.substring(5)}`;
    }
    return phone;
  }

  static maskForPrivacy(phone) {
    const validation = this.validateIndianPhone(phone);
    if (validation.isValid) {
      const cleanPhone = phone.replace(/[^\d]/g, '');
      const number = cleanPhone.length === 12 ? cleanPhone.substring(2) : cleanPhone;
      return `+91 ${number.substring(0, 2)}***${number.substring(7)}`;
    }
    return '***';
  }
}

/**
 * OTP Utilities
 */
class OTPUtils {
  static generateNumericOTP(length = 6) {
    const digits = '0123456789';
    let otp = '';
    
    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomInt(0, digits.length);
      otp += digits[randomIndex];
    }
    
    return otp;
  }

  static validateOTP(otp, expectedLength = 6) {
    if (!otp) {
      return { isValid: false, message: 'OTP is required' };
    }

    const cleanOTP = otp.replace(/[^\d]/g, '');
    
    if (cleanOTP.length !== expectedLength) {
      return { 
        isValid: false, 
        message: `OTP must be ${expectedLength} digits` 
      };
    }

    return { isValid: true, cleaned: cleanOTP };
  }

  static isExpired(generatedAt, expiryMinutes = 5) {
    const now = new Date();
    const expiryTime = new Date(generatedAt.getTime() + expiryMinutes * 60 * 1000);
    return now > expiryTime;
  }
}

/**
 * Cryptographic Utilities
 */
class CryptoUtils {
  static hashSHA256(str, salt = '') {
    return crypto.createHash('sha256').update(str + salt).digest('hex');
  }

  static generateUUID() {
    return crypto.randomUUID();
  }

  static encrypt(text, key) {
    const algorithm = 'aes-256-gcm';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(algorithm, key);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: cipher.getAuthTag().toString('hex')
    };
  }
}

/**
 * Date and Time Utilities
 */
class DateUtils {
  static toISOString(date = new Date()) {
    return date.toISOString();
  }

  static formatForDisplay(date, locale = 'en-IN') {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  static getRelativeTime(date, now = new Date()) {
    const diffMs = now - date;
    const diffSeconds = Math.floor(diffMs / 1000);
    
    if (diffSeconds < 60) return 'just now';
    
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }

  static addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  static isToday(date) {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }
}

/**
 * Validation Utilities
 */
class ValidationUtils {
  static validateEmail(email) {
    if (!email) {
      return { isValid: false, message: 'Email is required' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
      return { isValid: false, message: 'Invalid email format' };
    }

    return { isValid: true };
  }

  static validateName(name, minLength = 2, maxLength = 50) {
    if (!name || typeof name !== 'string') {
      return { isValid: false, message: 'Name is required' };
    }

    const trimmedName = name.trim();
    
    if (trimmedName.length < minLength) {
      return { 
        isValid: false, 
        message: `Name must be at least ${minLength} characters` 
      };
    }

    if (trimmedName.length > maxLength) {
      return { 
        isValid: false, 
        message: `Name must be less than ${maxLength} characters` 
      };
    }

    if (!/^[a-zA-Z\s.''-]+$/.test(trimmedName)) {
      return { 
        isValid: false, 
        message: 'Name can only contain letters, spaces, and basic punctuation' 
      };
    }

    return { isValid: true, cleaned: trimmedName };
  }

  static sanitizeInput(input) {
    if (!input || typeof input !== 'string') return input;
    
    return input
      .trim()
      .replace(/[<>"'&]/g, '')
      .substring(0, 1000);
  }
}

/**
 * Array and Object Utilities
 */
class DataUtils {
  static deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => this.deepClone(item));
    
    if (typeof obj === 'object') {
      const clonedObj = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          clonedObj[key] = this.deepClone(obj[key]);
        }
      }
      return clonedObj;
    }
    
    return obj;
  }

  static deepMerge(target, source) {
    const result = { ...target };
    
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (
          typeof source[key] === 'object' && 
          source[key] !== null && 
          !Array.isArray(source[key]) &&
          typeof target[key] === 'object' &&
          target[key] !== null &&
          !Array.isArray(target[key])
        ) {
          result[key] = this.deepMerge(target[key], source[key]);
        } else {
          result[key] = source[key];
        }
      }
    }
    
    return result;
  }

  static isEmpty(obj) {
    if (!obj) return true;
    if (Array.isArray(obj)) return obj.length === 0;
    if (typeof obj === 'object') return Object.keys(obj).length === 0;
    return false;
  }

  static shuffleArray(array) {
    const result = [...array];
    
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    
    return result;
  }

  static chunkArray(array, size) {
    const chunks = [];
    
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    
    return chunks;
  }
}

/**
 * Pagination Utilities
 */
class PaginationUtils {
  static calculatePagination(page, limit, total) {
    const currentPage = Math.max(1, parseInt(page) || 1);
    const itemsPerPage = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const totalPages = Math.ceil(total / itemsPerPage);
    const offset = (currentPage - 1) * itemsPerPage;
    
    return {
      currentPage,
      itemsPerPage,
      totalPages,
      totalItems: total,
      offset,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
      nextPage: currentPage < totalPages ? currentPage + 1 : null,
      previousPage: currentPage > 1 ? currentPage - 1 : null
    };
  }
}

/**
 * System Utilities
 */
class SystemUtils {
  static sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static async retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        const delay = baseDelay * Math.pow(2, attempt - 1);
        logger.warn(`Retry attempt ${attempt} failed, retrying in ${delay}ms`, {
          error: error.message,
          attempt,
          maxRetries,
          delay
        });
        
        await this.sleep(delay);
      }
    }
    
    throw lastError;
  }
}

/**
 * Sanitization for logging
 */
const sanitizeForLogging = (obj) => {
  const sensitiveFields = [
    'password', 'token', 'refresh_token', 'access_token', 'otp', 
    'secret', 'key', 'authorization', 'auth', 'credential',
    'phone', 'email', 'mobile'
  ];
  
  const sanitizeObject = (item) => {
    if (typeof item === 'object' && item !== null) {
      const sanitized = DataUtils.deepClone(item);
      
      for (const key in sanitized) {
        if (sensitiveFields.some(field => 
          key.toLowerCase().includes(field.toLowerCase())
        )) {
          if (typeof sanitized[key] === 'string' && sanitized[key].length > 4) {
            sanitized[key] = `${sanitized[key].substring(0, 2)}***${sanitized[key].substring(sanitized[key].length - 2)}`;
          } else {
            sanitized[key] = '[REDACTED]';
          }
        } else if (typeof sanitized[key] === 'object') {
          sanitized[key] = sanitizeObject(sanitized[key]);
        }
      }
      
      return sanitized;
    }
    
    return item;
  };
  
  return sanitizeObject(obj);
};

module.exports = {
  // Utility classes
  StringUtils,
  PhoneUtils,
  OTPUtils,
  CryptoUtils,
  DateUtils,
  ValidationUtils,
  DataUtils,
  PaginationUtils,
  SystemUtils,
  
  // Individual functions for backward compatibility
  generateRandomString: StringUtils.generateRandomString,
  generateOTP: OTPUtils.generateNumericOTP,
  hashString: CryptoUtils.hashSHA256,
  formatPhoneNumber: PhoneUtils.formatForDisplay,
  isValidIndianPhone: PhoneUtils.validateIndianPhone,
  sleep: SystemUtils.sleep,
  deepClone: DataUtils.deepClone,
  sanitizeForLogging,
  formatFileSize: SystemUtils.formatFileSize,
  retryWithBackoff: SystemUtils.retryWithBackoff,
  isValidEmail: ValidationUtils.validateEmail,
  getPaginationInfo: PaginationUtils.calculatePagination,
  formatDate: DateUtils.toISOString,
  isEmpty: DataUtils.isEmpty,
  deepMerge: DataUtils.deepMerge
};
