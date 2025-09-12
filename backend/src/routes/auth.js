// routes/auth.js
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role key for server-side operations
);

// Helper function to check if user exists
const checkUserExists = async (phone) => {
  try {
    // Get auth user by phone
    const { data: authUser, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) throw authError;
    
    const user = authUser.users.find(u => u.phone === phone);
    
    if (!user) return { exists: false };
    
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
    return { exists: false };
  }
};

// Check if user exists endpoint
router.post('/check-user', async (req, res) => {
  try {
    const { phone } = req.body;
    
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const result = await checkUserExists(phone);
    
    res.json({ 
      exists: result.exists,
      profile: result.profile 
    });
  } catch (error) {
    console.error('Error checking user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Sign up - send OTP for new user
router.post('/signup', async (req, res) => {
  try {
    const { phone, name } = req.body;
    
    if (!phone || !name) {
      return res.status(400).json({ error: 'Phone number and name are required' });
    }

    // Check if user already exists
    const { exists } = await checkUserExists(phone);
    if (exists) {
      return res.status(400).json({ error: 'User already exists. Please sign in instead.' });
    }

    const { data, error } = await supabase.auth.signInWithOtp({
      phone: phone,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Store signup data temporarily (in production, use Redis or similar)
    // For now, we'll return it to be stored on client side
    res.json({ 
      message: 'OTP sent successfully for signup',
      data: data,
      signUpData: { phone, name }
    });
  } catch (error) {
    console.error('Error in signup:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Sign in - send OTP for existing user
router.post('/signin', async (req, res) => {
  try {
    const { phone } = req.body;
    
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    // Check if user exists
    const { exists } = await checkUserExists(phone);
    if (!exists) {
      return res.status(400).json({ error: 'User not found. Please sign up first.' });
    }

    const { data, error } = await supabase.auth.signInWithOtp({
      phone: phone,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ 
      message: 'OTP sent successfully for signin',
      data: data 
    });
  } catch (error) {
    console.error('Error in signin:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify OTP endpoint
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, token, isSignUp, signUpData } = req.body;
    
    if (!phone || !token) {
      return res.status(400).json({ error: 'Phone number and OTP are required' });
    }

    if (isSignUp && (!signUpData || !signUpData.name)) {
      return res.status(400).json({ error: 'Name is required for signup' });
    }

    const { data, error } = await supabase.auth.verifyOtp({
      phone: phone,
      token: token,
      type: 'sms'
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    let profile = null;

    // If this is a sign up, create the profile
    if (isSignUp && data.user) {
      try {
        const { data: newProfile, error: profileError } = await supabase
          .from('profiles')
          .insert([{
            auth_user_id: data.user.id,
            name: signUpData.name,
            streak: 0,
            avatar_url: null
          }])
          .select()
          .single();

        if (profileError) {
          console.error('Error creating profile:', profileError);
          return res.status(400).json({ error: 'Failed to create user profile' });
        }

        profile = newProfile;
      } catch (profileError) {
        console.error('Error creating profile:', profileError);
        return res.status(400).json({ error: 'Failed to create user profile' });
      }
    } else if (data.user) {
      // For sign in, fetch existing profile
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('auth_user_id', data.user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return res.status(400).json({ error: 'Failed to fetch user profile' });
      }

      profile = existingProfile;
    }

    res.json({ 
      message: 'OTP verified successfully',
      user: data.user,
      session: data.session,
      profile: profile
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user profile endpoint
router.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('auth_user_id', userId)
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ profile });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile endpoint
router.put('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    
    // Remove fields that shouldn't be updated directly
    delete updates.id;
    delete updates.auth_user_id;
    delete updates.created_at;
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('auth_user_id', userId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ 
      message: 'Profile updated successfully',
      profile 
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Sign out endpoint
router.post('/signout', async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Signed out successfully' });
  } catch (error) {
    console.error('Error signing out:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;