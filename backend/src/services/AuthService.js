const { supabaseAnon } = require('../config/supabaseClient');

class AuthService {

  static validateIndianPhone(phone) {
    if (!phone) {
      return { isValid: false, message: 'Phone number is required' };
    }

    const cleanPhone = phone.replace(/[^\d]/g, '');

    console.log('Cleaned phone number:', cleanPhone);

    // Check 12-digit format with 91 prefix
    if (/^91[6-9]\d{9}$/.test(cleanPhone)) {
      return { 
        isValid: true, 
        formatted: `+${cleanPhone}`,
        numeric: cleanPhone // For database storage
      };
    }
    return { 
      isValid: false, 
      message: 'Invalid phone number format. Use 10 digits starting with 6-9' 
    };
  }

  static validateName(name) {
    if (!name || typeof name !== 'string') {
      return { isValid: false, message: 'Name is required' };
    }

    const trimmedName = name.trim();

    if (trimmedName.length < 2) {
      return { isValid: false, message: 'Name must be at least 2 characters' };
    }

    if (trimmedName.length > 50) {
      return { isValid: false, message: 'Name must be less than 50 characters' };
    }

    return { isValid: true, cleaned: trimmedName };
  }

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

static async checkUserExists(credential, authType) {
    const column = authType === 'phone' ? 'phone' : 'email';
    
    const { data, error } = await supabaseAnon
      .from('profiles')
      .select('*')
      .eq(column, credential)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      throw new Error(`Database error: ${error.message}`);
    }
    
    return {
      exists: !!data,
      profile: data || null
    };
  }


  static async sendOTP(phone) {
    try {
      const phoneValidation = this.validateIndianPhone(phone);
      console.log('Phone validation result:', phoneValidation);
      if (!phoneValidation.isValid) {
        throw new Error(phoneValidation.message);
      }
      // const cleanPhone = phone.replace(/[^\d]/g, '');
      console.log('Phone validated:', phoneValidation);
      // console.log('cleanPhone:', cleanPhone);
      // Check if user exists

      // Send OTP
      const { data, error } = await supabaseAnon.auth.signInWithOtp({
        phone: phoneValidation.formatted,
      });

      if (error) {
        throw error;
      }

      return {
        message: 'OTP sent successfully ',
        data: data
      };
    } catch (error) {
      console.error('OTP error:', error);
      throw error;
    }
  }

  static async verifyOTP(phone, token, ) {
    try {
      const phoneValidation = this.validateIndianPhone(phone);
      if (!phoneValidation.isValid) {
        throw new Error(phoneValidation.message);
      }

      const otpValidation = this.validateOTP(token);
      if (!otpValidation.isValid) {
        throw new Error(otpValidation.message);
      }



      // Verify OTP
      const { data, error } = await supabaseAnon.auth.verifyOtp({
        phone: phoneValidation.formatted,
        token: otpValidation.cleaned,
        type: 'sms'
      });

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error('Verification failed');
      }
      return {
        message: 'OTP verified successfully',
        user: data.user,
        session: data.session,
      };
    } catch (error) {
      console.error('OTP verification error:', error);
      throw error;
    }
  }

  static async signOut(token) {
    try {
      if (token) {
        const { error } = await supabaseAnon.auth.admin.signOut(token);

        if (error) {
          throw error;
        }
      }

      return { message: 'Signed out successfully' };
    } catch (error) {
      console.error('Signout error:', error);
      throw error;
    }
  }
}

module.exports = AuthService;