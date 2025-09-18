/**
 * Authentication Middleware
 * Complete auth middleware using Supabase for JWT verification
 */

const { supabaseAnon } = require('../config/supabaseClient');

/**
 * Middleware to verify JWT token and attach user to request
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'Authorization header is required',
        message: 'Please provide a valid authorization header'
      });
    }

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Invalid authorization header format',
        message: 'Authorization header must start with "Bearer "'
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided',
        message: 'Bearer token is required'
      });
    }

    // Verify token with Supabase
    const { data: { user }, error } = await supabaseAnon.auth.getUser(token);

    if (error) {
      console.error('Auth middleware - token verification failed:', error);
      return res.status(401).json({
        success: false,
        error: 'Token verification failed',
        message: error.message || 'Invalid or expired token'
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        message: 'Token does not contain valid user information'
      });
    }

    // Check if user account is confirmed/active
    if (!user.email_confirmed_at && !user.phone_confirmed_at) {
      return res.status(401).json({
        success: false,
        error: 'Account not verified',
        message: 'Please verify your account before accessing protected resources'
      });
    }

    // Attach user information to request
    req.user = {
      id: user.id,
      phone: user.phone,
      email: user.email,
      created_at: user.created_at,
      updated_at: user.updated_at,
      email_confirmed_at: user.email_confirmed_at,
      phone_confirmed_at: user.phone_confirmed_at
    };

    // Attach original token for potential use in controllers
    req.token = token;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);

    return res.status(500).json({
      success: false,
      error: 'Authentication error',
      message: 'Internal server error during authentication'
    });
  }
};

/**
 * Optional middleware - doesn't fail if no token provided
 * Useful for endpoints that work with or without authentication
 */
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without user
      req.user = null;
      req.token = null;
      return next();
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      req.user = null;
      req.token = null;
      return next();
    }

    // Try to verify token
    const { data: { user }, error } = await supabaseAnon.auth.getUser(token);

    if (error || !user) {
      // Invalid token, but don't fail - continue without user
      req.user = null;
      req.token = null;
      return next();
    }

    // Valid token - attach user info
    req.user = {
      id: user.id,
      phone: user.phone,
      email: user.email,
      created_at: user.created_at,
      updated_at: user.updated_at,
      email_confirmed_at: user.email_confirmed_at,
      phone_confirmed_at: user.phone_confirmed_at
    };

    req.token = token;
    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);

    // Don't fail on error - continue without user
    req.user = null;
    req.token = null;
    next();
  }
};

/**
 * Admin middleware - requires user to be authenticated and have admin role
 */
const adminMiddleware = async (req, res, next) => {
  try {
    // First run auth middleware
    await new Promise((resolve, reject) => {
      authMiddleware(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Check if user is authenticated (authMiddleware would have failed if not)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'You must be logged in to access admin resources'
      });
    }

    // Check for admin role in user metadata or profile
    // You can implement your own admin check logic here

    // Option 1: Check user metadata
    const { data: { user }, error } = await supabaseAnon.auth.getUser(req.token);

    if (error) {
      return res.status(401).json({
        success: false,
        error: 'Token validation failed',
        message: 'Could not validate admin privileges'
      });
    }

    // Check if user has admin role in app_metadata
    const isAdmin = user.app_metadata?.role === 'admin' || 
                   user.user_metadata?.role === 'admin' ||
                   user.app_metadata?.is_admin === true;

    if (!isAdmin) {
      console.warn('Admin access denied for user:', req.user.id);
      return res.status(403).json({
        success: false,
        error: 'Admin access required',
        message: 'You do not have admin privileges to access this resource'
      });
    }

    // User is admin - continue
    req.isAdmin = true;
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);

    return res.status(500).json({
      success: false,
      error: 'Admin verification error',
      message: 'Internal server error during admin verification'
    });
  }
};

/**
 * Profile required middleware - ensures user has a profile
 */
const profileRequiredMiddleware = async (req, res, next) => {
  try {
    // First run auth middleware
    if (!req.user) {
      return authMiddleware(req, res, next);
    }

    // Check if user has a profile
    const { data: profile, error } = await supabaseAnon
      .from('profiles')
      .select('*')
      .eq('auth_user_id', req.user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Profile check error:', error);
      return res.status(500).json({
        success: false,
        error: 'Profile verification error',
        message: 'Could not verify user profile'
      });
    }

    if (!profile) {
      return res.status(403).json({
        success: false,
        error: 'Profile required',
        message: 'You must complete your profile setup to access this resource'
      });
    }

    // Attach profile to request
    req.profile = profile;
    next();
  } catch (error) {
    console.error('Profile required middleware error:', error);

    return res.status(500).json({
      success: false,
      error: 'Profile verification error',
      message: 'Internal server error during profile verification'
    });
  }
};

/**
 * Rate limiting middleware (simple in-memory implementation)
 */
const rateLimitStore = new Map();

const rateLimitMiddleware = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    // Clean old entries
    for (const [ip, data] of rateLimitStore.entries()) {
      if (now - data.resetTime > windowMs) {
        rateLimitStore.delete(ip);
      }
    }

    const requestData = rateLimitStore.get(key) || {
      count: 0,
      resetTime: now + windowMs
    };

    if (now > requestData.resetTime) {
      requestData.count = 0;
      requestData.resetTime = now + windowMs;
    }

    requestData.count++;
    rateLimitStore.set(key, requestData);

    if (requestData.count > maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil((requestData.resetTime - now) / 1000)
      });
    }

    // Add rate limit headers
    res.set({
      'X-RateLimit-Limit': maxRequests,
      'X-RateLimit-Remaining': maxRequests - requestData.count,
      'X-RateLimit-Reset': Math.ceil(requestData.resetTime / 1000)
    });

    next();
  };
};

/**
 * CORS middleware for API routes
 */
const corsMiddleware = (req, res, next) => {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:19006',
    'exp://localhost:19000',
    process.env.CLIENT_URL
  ].filter(Boolean);

  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
};

/**
 * Request logging middleware
 */
const requestLoggerMiddleware = (req, res, next) => {
  const start = Date.now();

  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - start;

    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms - ${req.ip}`);

    originalSend.call(this, data);
  };

  next();
};

module.exports = {
  authMiddleware,
  optionalAuthMiddleware,
  adminMiddleware,
  profileRequiredMiddleware,
  rateLimitMiddleware,
  corsMiddleware,
  requestLoggerMiddleware
};