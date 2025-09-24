import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  user_id: string;
  employee_id?: string;
  full_name: string;
  profile_photo_url?: string;
  role: 'employee' | 'admin';
  status: 'active' | 'pending' | 'suspended';
  department?: string;
  location?: string;
  phone_number?: string;
  biometric_enrolled: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuthState() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change event:', event, 'Session:', session);
        setAuthState(prev => ({
          ...prev,
          session,
          user: session?.user ?? null,
          isAuthenticated: !!session?.user,
          isLoading: false,
        }));

        // Fetch user profile when authenticated
        if (session?.user) {
          console.log('Auth state changed to SIGNED_IN, fetching profile for user:', session.user.id);
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          console.log('Auth state changed to SIGNED_OUT or no user, clearing profile.');
          setAuthState(prev => ({ ...prev, profile: null }));
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session);
      setAuthState(prev => ({
        ...prev,
        session,
        user: session?.user ?? null,
        isAuthenticated: !!session?.user,
        isLoading: false,
      }));

      if (session?.user) {
        console.log('Initial session found, fetching profile for user:', session.user.id);
        setTimeout(() => {
          fetchUserProfile(session.user.id);
        }, 0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    console.log('Attempting to fetch profile for userId:', userId);
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      if (profile) {
        console.log('Profile fetched successfully:', profile);
        setAuthState(prev => ({ ...prev, profile: profile as Profile | null }));
      } else {
        console.log('No profile found for userId:', userId);
        setAuthState(prev => ({ ...prev, profile: null }));
      }
    } catch (error) {
      console.error('Unexpected error fetching user profile:', error);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    console.log('Calling Supabase signUp for:', email);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    });
    console.log('Supabase signUp response - data:', data, 'error:', error);
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    console.log('Calling Supabase signInWithPassword for:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    console.log('Supabase signInWithPassword response - data:', data, 'error:', error);
    return { data, error };
  };

  const signOut = async () => {
    console.log('Calling Supabase signOut');
    const { error } = await supabase.auth.signOut();
    console.log('Supabase signOut response - error:', error);
    return { error };
  };

  return {
    ...authState,
    signUp,
    signIn,
    signOut,
    refetchProfile: () => authState.user && fetchUserProfile(authState.user.id),
  };
}