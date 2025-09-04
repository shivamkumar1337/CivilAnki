// test-auth.js - Run this to get a token
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://exyrfybeadfsgfxfeayz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4eXJmeWJlYWRmc2dmeGZlYXl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5ODMxMTksImV4cCI6MjA3MjU1OTExOX0.-pRxs-MvjEKpLwKCbazHZAkA8mrSnbBrJXeKgEP3Xa8'
);

async function getAuthToken() {
  // Sign up a test user
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: 'testmail43566@gmail.com',
    password: 'test123',
    options: {
      data: {
        full_name: 'Test User',
      }
    }
  });

  if (signUpError) {
    console.log('Signup error:', signUpError.message);
    
    // Try to sign in instead
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'testmail43566@gmail.com',
      password: 'test123'
    });

    if (signInError) {
      console.error('Sign in error:', signInError.message);
      return;
    }

    console.log('✅ Signed in successfully');
    console.log('🔑 Access Token:', signInData.session.access_token);
    console.log('👤 User ID:', signInData.user.id);
    // console.log(signInData);
    return;
  }

  console.log('✅ User created successfully');
  console.log('🔑 Access Token:', signUpData.session?.access_token);
  console.log('👤 User ID:', signUpData.user?.id);
    // console.log(signInData);

}

getAuthToken();