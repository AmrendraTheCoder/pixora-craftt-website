import Joi from 'joi';
import { UserRole } from '@pixora-craftt/shared/types/common.js';

// Registration schema
export const registerSchema = Joi.object({
  email: Joi.string()
    .email()
    .min(5)
    .max(255)
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'string.min': 'Email must be at least 5 characters long',
      'string.max': 'Email must not exceed 255 characters',
      'any.required': 'Email is required'
    }),
  
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.max': 'Password must not exceed 128 characters',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'Password is required'
    }),
  
  firstName: Joi.string()
    .min(1)
    .max(100)
    .trim()
    .required()
    .messages({
      'string.min': 'First name is required',
      'string.max': 'First name must not exceed 100 characters',
      'any.required': 'First name is required'
    }),
  
  lastName: Joi.string()
    .min(1)
    .max(100)
    .trim()
    .required()
    .messages({
      'string.min': 'Last name is required',
      'string.max': 'Last name must not exceed 100 characters',
      'any.required': 'Last name is required'
    }),
  
  phone: Joi.string()
    .pattern(new RegExp('^[+]?[1-9]\\d{1,14}$'))
    .optional()
    .messages({
      'string.pattern.base': 'Please provide a valid phone number'
    }),
  
  company: Joi.string()
    .max(100)
    .trim()
    .optional(),
  
  title: Joi.string()
    .max(100)
    .trim()
    .optional()
});

// Login schema
export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    }),
  
  twoFactorCode: Joi.string()
    .pattern(new RegExp('^\\d{6}$'))
    .optional()
    .messages({
      'string.pattern.base': 'Two-factor code must be 6 digits'
    }),
  
  rememberMe: Joi.boolean()
    .default(false)
});

// Forgot password schema
export const forgotPasswordSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    })
});

// Reset password schema
export const resetPasswordSchema = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      'any.required': 'Reset token is required'
    }),
  
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.max': 'Password must not exceed 128 characters',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'Password is required'
    })
});

// Change password schema
export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'any.required': 'Current password is required'
    }),
  
  newPassword: Joi.string()
    .min(8)
    .max(128)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
    .required()
    .messages({
      'string.min': 'New password must be at least 8 characters long',
      'string.max': 'New password must not exceed 128 characters',
      'string.pattern.base': 'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'New password is required'
    })
});

// Refresh token schema
export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string()
    .required()
    .messages({
      'any.required': 'Refresh token is required'
    })
});

// Verify email schema
export const verifyEmailSchema = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      'any.required': 'Verification token is required'
    })
});

// Setup two-factor authentication schema
export const setupTwoFactorSchema = Joi.object({
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required to setup two-factor authentication'
    })
});

// Verify two-factor authentication schema
export const verifyTwoFactorSchema = Joi.object({
  code: Joi.string()
    .pattern(new RegExp('^\\d{6}$'))
    .required()
    .messages({
      'string.pattern.base': 'Two-factor code must be 6 digits',
      'any.required': 'Two-factor code is required'
    })
});

// Update user profile schema
export const updateProfileSchema = Joi.object({
  firstName: Joi.string()
    .min(1)
    .max(100)
    .trim()
    .optional(),
  
  lastName: Joi.string()
    .min(1)
    .max(100)
    .trim()
    .optional(),
  
  phone: Joi.string()
    .pattern(new RegExp('^[+]?[1-9]\\d{1,14}$'))
    .optional()
    .allow('')
    .messages({
      'string.pattern.base': 'Please provide a valid phone number'
    }),
  
  bio: Joi.string()
    .max(500)
    .optional()
    .allow(''),
  
  company: Joi.string()
    .max(100)
    .trim()
    .optional()
    .allow(''),
  
  title: Joi.string()
    .max(100)
    .trim()
    .optional()
    .allow(''),
  
  website: Joi.string()
    .uri()
    .optional()
    .allow('')
    .messages({
      'string.uri': 'Please provide a valid website URL'
    }),
  
  location: Joi.string()
    .max(100)
    .trim()
    .optional()
    .allow('')
});

// Update user role schema (admin only)
export const updateUserRoleSchema = Joi.object({
  role: Joi.string()
    .valid(...Object.values(UserRole))
    .required()
    .messages({
      'any.only': 'Invalid role specified',
      'any.required': 'Role is required'
    })
});

// Update user status schema (admin only)
export const updateUserStatusSchema = Joi.object({
  isActive: Joi.boolean()
    .required()
    .messages({
      'any.required': 'Status is required'
    })
});

// Query parameters for users list
export const getUsersQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(20),
  
  search: Joi.string()
    .max(255)
    .optional(),
  
  role: Joi.string()
    .valid(...Object.values(UserRole))
    .optional(),
  
  isActive: Joi.boolean()
    .optional(),
  
  sortBy: Joi.string()
    .valid('createdAt', 'updatedAt', 'email', 'firstName', 'lastName', 'lastLoginAt')
    .default('createdAt'),
  
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
}); 