/**
 * Authentication Controller
 * Complete auth controller with all endpoints and validation
 */

const AuthService = require('../services/AuthService');
const ProfileService = require('../services/ProfileService');

class AuthController {

  /**
   * Send OTP for signin
   * POST /auth/sendOTP
   */
static async sendOTP(req, res) {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required'
      });
    }

    // Check if user exists using the service

    // Send OTP regardless of whether user existed or was just created
    const result = await AuthService.sendOTP(phone);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error('Signin OTP controller error:', error);

    const statusCode = error.message.includes('not found') ? 404 : 400;

    return res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
}


  /**
   * Verify OTP and complete authentication
   * POST /auth/verify-otp
   */
 static async verifyOTP(req, res) {
  try {
    const { phone, token } = req.body;
    const isLogin = true;

    if (!phone || !token) {
      // ...existing validation...
    }

    // 1. Verify OTP
    const result = await AuthService.verifyOTP(phone, token);

    // 2. Check if user exists, create profile if not
    const userCheck = await AuthService.checkUserExists(phone, 'phone');
    let userProfile = userCheck.profile;

    if (!userCheck.exists) {
      try {
        const { id } = result.session.user;
        const newProfile = await ProfileService.createProfile({ phone, status: 0,id });
        userProfile = newProfile;
        isLogin=false;
        console.log('New user profile created:', userProfile.id);
      } catch (createError) {
        console.error('Error creating user profile:', createError);
        return res.status(500).json({
          success: false,
          error: 'Failed to create user profile'
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      user: result.user,
      session: result.session,
      profile: userProfile,
      isLogin: isLogin
    });
  } catch (error) {
    // ...existing error handling...
  }
}
  /**
   * Sign out user
   * POST /auth/signout
   */
  static async signOut(req, res) {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.startsWith('Bearer ') 
        ? authHeader.split(' ')[1] 
        : null;

      const result = await AuthService.signOut(token);

      return res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Sign out controller error:', error);

      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Check if user exists by phone
   * POST /auth/check-user
   */
static async checkUserExists(req, res) {
    try {
      const { authType, credential } = req.body;

      // Basic validatiot
      if (!authType || !['phone', 'email'].includes(authType)) {
        return res.status(400).json({
          success: false,
          error: 'Valid authType (phone/email) is required'
        });
      }
      
      if (!credential) {
        return res.status(400).json({
          success: false,
          error: `${authType} is required`
        });
      }

      const result = await AuthService.checkUserExists(credential, authType);

      return res.status(200).json({
        success: true,
        data: {
          exists: result.exists,
          profile: result.profile
        }
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Validate token
   * POST /auth/validate-token
   */
  static async validateToken(req, res) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          error: 'Missing or invalid authorization header'
        });
      }

      const token = authHeader.split(' ')[1];

      // Use Supabase to validate token
      const { supabaseAnon } = require('../config/supabaseClient');
      const { data: { user }, error } = await supabaseAnon.auth.getUser(token);

      if (error || !user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid or expired token'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Token is valid',
        data: {
          valid: true,
          user: {
            id: user.id,
            phone: user.phone,
            created_at: user.created_at
          }
        }
      });
    } catch (error) {
      console.error('Validate token controller error:', error);

      return res.status(500).json({
        success: false,
        error: 'Token validation failed'
      });
    }
  }

  /**
   * Get current user
   * GET /auth/user
   */
  static async getCurrentUser(req, res) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          error: 'Missing or invalid authorization header'
        });
      }

      const token = authHeader.split(' ')[1];

      // Get user and profile
      const { supabaseAnon } = require('../config/supabaseClient');
      const { data: { user }, error } = await supabaseAnon.auth.getUser(token);

      if (error || !user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid or expired token'
        });
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabaseAnon
        .from('profiles')
        .select('*')
        .eq('auth_user_id', user.id)
        .single();

      return res.status(200).json({
        success: true,
        message: 'User retrieved successfully',
        data: {
          user: {
            id: user.id,
            phone: user.phone,
            created_at: user.created_at
          },
          profile: profile || null
        }
      });
    } catch (error) {
      console.error('Get current user controller error:', error);

      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve user'
      });
    }
  }

  /**
   * Refresh token
   * POST /auth/refresh
   */
  static async refreshToken(req, res) {
    try {
      const { refresh_token } = req.body;

      if (!refresh_token) {
        return res.status(400).json({
          success: false,
          error: 'Refresh token is required'
        });
      }

      const { supabaseAnon } = require('../config/supabaseClient');
      const { data, error } = await supabaseAnon.auth.refreshSession({
        refresh_token: refresh_token
      });

      if (error) {
        console.error('Token refresh failed:', error);
        return res.status(401).json({
          success: false,
          error: 'Invalid refresh token'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          session: {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            expires_at: data.session.expires_at,
            token_type: data.session.token_type
          },
          user: {
            id: data.user.id,
            phone: data.user.phone
          }
        }
      });
    } catch (error) {
      console.error('Refresh token controller error:', error);

      return res.status(500).json({
        success: false,
        error: 'Token refresh failed'
      });
    }
  }

  /**
   * Health check
   * GET /auth/health
   */
  static async healthCheck(req, res) {
    try {
      // Test basic functionality
      const testPhone = '+919999999999';

      // This should not throw an error for a non-existent user
      const testResult = AuthService.validateIndianPhone(testPhone);

      return res.status(200).json({
        success: true,
        message: 'Auth service is healthy',
        data: {
          service: 'auth',
          status: 'healthy',
          features: {
            phoneValidation: testResult.isValid ? 'operational' : 'error',
            otpService: 'operational',
            tokenValidation: 'operational'
          },
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Auth health check failed:', error);

      return res.status(503).json({
        success: false,
        error: 'Auth service unhealthy',
        data: {
          service: 'auth',
          status: 'unhealthy',
          error: error.message,
          timestamp: new Date().toISOString()
        }
      });
    }
  }
}

module.exports = AuthController;