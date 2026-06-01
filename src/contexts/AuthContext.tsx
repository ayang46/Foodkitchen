import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  configError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Supabase configuration
const SUPABASE_URL = 'https://qgdkcfbbsvzuqttrghlz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnZGtjZmJic3Z6dXF0dHJnaGx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3MDMzMjQsImV4cCI6MjA5NDI3OTMyNH0.O8L6ohMo49bnddngyOELaw3LJHMuccZBDlTs2UiM1XA';

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const initializeSupabase = async () => {
  // Client is already initialized
  return;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        await initializeSupabase();

        if (!supabaseClient) {
          setConfigError('Failed to initialize Supabase client');
          setLoading(false);
          return;
        }

        const { data: { session }, error } = await supabaseClient.auth.getSession();

        if (error) {
          console.error('Session check error:', error);
          // Don't show error for initial session check, just log it
          setLoading(false);
          return;
        }

        if (session) {
          setUser({
            id: session.user.id,
            email: session.user.email!,
          });
          setAccessToken(session.access_token);
        }
        setLoading(false);
      } catch (error: any) {
        console.error('Session check error:', error);
        // Don't set config error for session check failures
        setLoading(false);
      }
    };

    checkSession();

    // Set up auth state listener after initialization
    (async () => {
      try {
        await initializeSupabase();
        if (!supabaseClient) return;

        const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_event, session) => {
          if (session) {
            setUser({
              id: session.user.id,
              email: session.user.email!,
            });
            setAccessToken(session.access_token);
          } else {
            setUser(null);
            setAccessToken(null);
          }
        });

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Failed to set up auth listener:', error);
      }
    })();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await initializeSupabase();

      if (!supabaseClient) {
        throw new Error('Supabase client not initialized. Please check your configuration.');
      }

      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        // Provide more helpful error messages
        if (error.message.includes('Failed to fetch')) {
          throw new Error('Unable to connect to authentication service. Please check your network connection and try again.');
        }
        throw new Error(error.message || 'Failed to sign in');
      }

      if (data.session) {
        setUser({
          id: data.user.id,
          email: data.user.email!,
        });
        setAccessToken(data.session.access_token);
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Unable to connect to authentication service. Please check your network connection and try again.');
      }
      throw error;
    }
  };

  const signOut = async () => {
    if (supabaseClient) {
      await supabaseClient.auth.signOut();
    }
    setUser(null);
    setAccessToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, signIn, signOut, loading, configError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
