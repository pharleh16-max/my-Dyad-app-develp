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
    console.log('useAuthState: Setting up auth state listener');
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('useAuthState: Auth state changed:', event, session);
        setAuthState(prev => ({
          ...prev,
          session,
          user: session?.user ?? null,
          isAuthenticated: !!session?.user,
          isLoading: false,
        }));

        // Fetch user profile when authenticated
        if (session?.user) {
          console.log('useAuthState: User session found, fetching profile...');
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          console.log('useAuthState: No user session, clearing profile.');
          setAuthState(prev => ({ ...prev, profile: null }));
        }
      }
    );

    console.log('useAuthState: Checking for existing session...');
    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('useAuthState: Existing session check result:', session);
      setAuthState(prev => ({
        ...prev,
        session,
        user: session?.user ?? null,
        isAuthenticated: !!session?.user,
        isLoading: false,
      }));

      if (session?.user) {
        console.log('useAuthState: Existing user session found, fetching profile...');
        setTimeout(() => {
          fetchUserProfile(session.user.id);
        }, 0);
      }
    });

    return () => {
      console.log('useAuthState: Unsubscribing from auth state changes.');
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    console.log('fetchUserProfile: Attempting to fetch profile for userId:', userId);
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('fetchUserProfile: Error fetching profile:', error);
        return;
      }
      console.log('fetchUserProfile: Profile fetched:', profile);
      setAuthState(prev => ({ ...prev, profile: profile as Profile | null }));
    } catch (error) {
      console.error('fetchUserProfile: Error fetching user profile:', error);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    // Removed emailRedirectTo as email confirmation is being disabled in Supabase settings
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    });

    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
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