const express = require('express');
const { supabase } = require('../config/supabaseClient');
const router = express.Router();

// Utility function to validate phone number
const validatePhone = (phone) => {
  const phoneRegex = /^\\+?[1-9]\\d{1,14}$/;
  return phoneRegex.test(phone);
};

// Check if user exists
const checkUserExists = async (phone) => {
  try {
    const { data: users, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error('Error listing users:', error);
      return { exists: false, user: null };
    }

    const user = users.users.find(u => u.phone === phone);
    
    if (!user) {
      return { exists: false, user: null };
    }

    // Check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('auth_user_id', user.id)
      .single();

    return {
      exists: !!profile,
      user: user,
      profile: profile || null
    };
  } catch (error) {
    console.error('Error checking user existence:', error);
    return { exists: false, user: null };
  }
};

// POST /auth/signup - Send OTP for new user registration
router.post('/signup', async (req, res) => {
  try {
    const { phone, name } = req.body;

    // Validate input
    if (!phone || !name) {
      return res.status(400).json({ 
        error: 'Phone number and name are required' 
      });
    }

    // if (!validatePhone(phone)) {
    //   return res.status(400).json({ 
    //     error: 'Invalid phone number format' 
    //   });
    // }

    // Check if user already exists
    const { exists } = await checkUserExists(phone);
    
    if (exists) {
      return res.status(409).json({ 
        error: 'User already exists. Please sign in instead.' 
      });
    }

    // Send OTP
    const { data, error } = await supabase.auth.signInWithOtp({
      phone: phone,
    });

    if (error) {
      console.error('OTP sending error:', error);
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json({
      message: 'OTP sent successfully for signup',
      data: data
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /auth/signin - Send OTP for existing user login
router.post('/signin', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ 
        error: 'Phone number is required' 
      });
    }

    if (!validatePhone(phone)) {
      return res.status(400).json({ 
        error: 'Invalid phone number format' 
      });
    }

    // Check if user exists
    const { exists } = await checkUserExists(phone);
    
    if (!exists) {
      return res.status(404).json({ 
        error: 'User not found. Please sign up first.' 
      });
    }

    // Send OTP
    const { data, error } = await supabase.auth.signInWithOtp({
      phone: phone,
    });

    if (error) {
      console.error('OTP sending error:', error);
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json({
      message: 'OTP sent successfully for signin',
      data: data
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /auth/verify-otp - Verify OTP and complete authentication
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, token, isSignUp, userData } = req.body;

    if (!phone || !token) {
      return res.status(400).json({ 
        error: 'Phone number and OTP are required' 
      });
    }

    if (isSignUp && (!userData || !userData.name)) {
      return res.status(400).json({ 
        error: 'Name is required for signup' 
      });
    }

    // Verify OTP
    const { data, error } = await supabase.auth.verifyOtp({
      phone: phone,
      token: token,
      type: 'sms'
    });

    if (error) {
      console.error('OTP verification error:', error);
      return res.status(400).json({ error: error.message });
    }

    if (!data.user) {
      return res.status(400).json({ error: 'Verification failed' });
    }

    let profile = null;

    if (isSignUp) {
      // Create new profile for signup
      try {
        const { data: newProfile, error: profileError } = await supabase
          .from('profiles')
          .insert([{
            auth_user_id: data.user.id,
            name: userData.name,
            streak: 0,
            avatar_url: null
          }])
          .select()
          .single();

        if (profileError) {
          console.error('Profile creation error:', profileError);
          return res.status(400).json({ error: 'Failed to create user profile' });
        }

        profile = newProfile;
      } catch (profileError) {
        console.error('Profile creation error:', profileError);
        return res.status(400).json({ error: 'Failed to create user profile' });
      }
    } else {
      // Fetch existing profile for signin
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('auth_user_id', data.user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        return res.status(400).json({ error: 'Failed to fetch user profile' });
      }

      profile = existingProfile;
    }

    res.status(200).json({
      message: 'OTP verified successfully',
      user: data.user,
      session: data.session,
      profile: profile
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /auth/profile - Get current user profile (protected route)
router.get('/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Fetch profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('auth_user_id', user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.status(200).json({ profile });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /auth/profile - Update user profile (protected route)
router.put('/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const updates = req.body;

    // Remove fields that shouldn't be updated
    delete updates.id;
    delete updates.auth_user_id;
    delete updates.created_at;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    // Update profile
    const { data: profile, error: updateError } = await supabase
      .from('profiles')
      .update(updates)
      .eq('auth_user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Profile update error:', updateError);
      return res.status(400).json({ error: updateError.message });
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      profile
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /auth/signout - Sign out user
router.post('/signout', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      
      // Sign out from Supabase
      const { error } = await supabase.auth.admin.signOut(token);
      
      if (error) {
        console.error('Signout error:', error);
        return res.status(400).json({ error: error.message });
      }
    }

    res.status(200).json({ message: 'Signed out successfully' });
  } catch (error) {
    console.error('Signout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
