import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithPhone: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, token: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign-in error:', error.message);
        if (error.message.includes('Database error querying schema')) {
          throw new Error('A database error occurred during sign-in. Please try again later.');
        } else {
          throw new Error(`Sign-in failed: ${error.message}`);
        }
      }

      console.log('Sign-in successful for email:', email);
    } catch (error: any) {
      console.error('Error during sign-in:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('Sign-up error:', error.message);
        throw new Error(`Sign-up failed: ${error.message}`);
      }

      console.log('Sign-up successful for email:', email);
    } catch (error: any) {
      console.error('Error during sign-up:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error during sign-out:', error.message);
        throw new Error(`Sign-out failed: ${error.message}`);
      }
      console.log('User signed out successfully.');
    } catch (error: any) {
      console.error('Unexpected error during sign-out:', error);
      throw error;
    }
  };

  const signInWithPhone = async (phone: string) => {
    try {
      const sanitizedPhone = `+91${phone.replace(/\D/g, '')}`;
      console.log(`Attempting phone sign-in with: ${sanitizedPhone}`);

      const { error } = await supabase.auth.signInWithOtp({
        phone: sanitizedPhone,
      });

      if (error) {
        console.error('Error during phone sign-in:', error.message);
        throw new Error(`Phone sign-in failed: ${error.message}`);
      }

      console.log(`Phone sign-in initiated for: ${sanitizedPhone}`);
    } catch (error: any) {
      console.error('Unexpected error during phone sign-in:', error);
      throw error;
    }
  };

  const verifyOtp = async (phone: string, token: string) => {
    try {
      const sanitizedPhone = `+91${phone.replace(/\D/g, '')}`;
      console.log(`Verifying OTP for phone: ${sanitizedPhone}`);

      const { error } = await supabase.auth.verifyOtp({
        phone: sanitizedPhone,
        token,
        type: 'sms',
      });

      if (error) {
        console.error('Error during OTP verification:', error.message);
        throw new Error(`OTP verification failed: ${error.message}`);
      }

      console.log(`OTP verified successfully for phone: ${sanitizedPhone}`);
    } catch (error: any) {
      console.error('Unexpected error during OTP verification:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'https://flnjoacimkqueukypdcw.supabase.co/auth/v1/callback',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('Error during Google sign-in:', error.message);
        throw new Error(`Google sign-in failed: ${error.message}`);
      }
    } catch (error: any) {
      console.error('Unexpected error during Google sign-in:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        signInWithPhone,
        verifyOtp,
        signInWithGoogle,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};