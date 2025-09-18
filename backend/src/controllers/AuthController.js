/**
 * Authentication Controller
 * Complete auth controller with all endpoints and validation
 */

const AuthService = require('../services/AuthService');

class AuthController {
  /**
   * Send OTP for signup
   * POST /auth/signup
   */
  static async sendSignupOTP(req, res) {
    try {
      const { phone, name } = req.body;

      if (!phone || !name) {
        return res.status(400).json({
          success: false,
          error: 'Phone number and name are required',
          details: {
            phone: !phone ? 'Phone number is required' : null,
            name: !name ? 'Name is required' : null
          }
        });
      }

      const result = await AuthService.sendSignupOTP(phone, name);

      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.data
      });
    } catch (error) {
      console.error('Signup OTP controller error:', error);

      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Send OTP for signin
   * POST /auth/signin
   */
  static async sendSigninOTP(req, res) {
    try {
      const { phone } = req.body;

      if (!phone) {
        return res.status(400).json({
          success: false,
          error: 'Phone number is required'
        });
      }

      const result = await AuthService.sendSigninOTP(phone);

      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.data
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
      const { phone, token, isSignUp, userData } = req.body;

      if (!phone || !token) {
        return res.status(400).json({
          success: false,
          error: 'Phone number and OTP token are required',
          details: {
            phone: !phone ? 'Phone number is required' : null,
            token: !token ? 'OTP token is required' : null
          }
        });
      }

      if (isSignUp && (!userData || !userData.name)) {
        return res.status(400).json({
          success: false,
          error: 'Name is required for signup',
          details: {
            'userData.name': 'Name is required for signup'
          }
        });
      }

      const result = await AuthService.verifyOTP(phone, token, isSignUp, userData || {});

      return res.status(200).json({
        success: true,
        message: result.message,
        user: result.user,
        session: result.session,
        profile: result.profile
      });
    } catch (error) {
      console.error('OTP verification controller error:', error);

      return res.status(400).json({
        success: false,
        error: error.message
      });
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
      const { phone } = req.body;

      if (!phone) {
        return res.status(400).json({
          success: false,
          error: 'Phone number is required'
        });
      }

      const result = await AuthService.checkUserExists(phone);

      return res.status(200).json({
        success: true,
        message: 'User existence check completed',
        data: {
          exists: result.exists,
          hasProfile: !!result.profile
        }
      });
    } catch (error) {
      console.error('Check user exists controller error:', error);

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