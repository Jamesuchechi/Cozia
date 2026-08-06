import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  isKidsMode: boolean;
  hasParentalPin: boolean;
  signIn: (email: string, pass: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, pass: string, displayName: string, username: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>;
  toggleKidsMode: (pin?: string) => Promise<{ success: boolean; error?: string }>;
  setParentalPin: (pin: string) => Promise<{ success: boolean }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo Fallback User Profile if unauthenticated
const DEFAULT_DEMO_PROFILE: UserProfile = {
  id: 'demo-user-123',
  username: 'cozia_creator',
  displayName: 'James Cozia',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  bio: 'Building Cozia — family-safe social + streaming platform.',
  websiteUrl: 'https://cozia.app',
  socialLinks: { twitter: '@cozia', youtube: 'coziatv' },
  isKidMode: false,
  role: 'admin',
  createdAt: new Date().toISOString(),
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(DEFAULT_DEMO_PROFILE);
  const [loading, setLoading] = useState<boolean>(true);
  const [isKidsMode, setIsKidsMode] = useState<boolean>(false);
  const [parentalPin, setParentalPinState] = useState<string | null>(null);

  useEffect(() => {
    // 1. Fetch active session from Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // 2. Listen to Auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(DEFAULT_DEMO_PROFILE);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.warn('Profile fetch warning:', error.message);
      }

      if (data) {
        setProfile({
          id: data.id,
          username: data.username,
          displayName: data.display_name,
          avatarUrl: data.avatar_url,
          bannerUrl: data.banner_url,
          bio: data.bio,
          websiteUrl: data.website_url,
          socialLinks: data.social_links || {},
          isKidMode: data.is_kid_mode || false,
          role: data.role || 'user',
          createdAt: data.created_at,
        });
        setIsKidsMode(data.is_kid_mode || false);
        if (data.parental_pin_hash) {
          setParentalPinState(data.parental_pin_hash);
        }
      }
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, pass: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    return { error };
  };

  const signUp = async (email: string, pass: string, displayName: string, username: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          display_name: displayName,
          username,
        },
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(DEFAULT_DEMO_PROFILE);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!profile) return { error: new Error('No profile active') };

    const updatedProfile = { ...profile, ...updates };
    setProfile(updatedProfile);

    if (user) {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: updates.displayName,
          username: updates.username,
          avatar_url: updates.avatarUrl,
          bio: updates.bio,
          website_url: updates.websiteUrl,
          social_links: updates.socialLinks,
          is_kid_mode: updates.isKidMode,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
      return { error };
    }
    return { error: null };
  };

  const setParentalPin = async (pin: string) => {
    setParentalPinState(pin);
    if (profile) {
      setProfile({ ...profile, parentalPinHash: pin });
    }
    if (user) {
      await supabase.from('profiles').update({ parental_pin_hash: pin }).eq('id', user.id);
    }
    return { success: true };
  };

  const toggleKidsMode = async (pin?: string) => {
    if (isKidsMode) {
      // Exiting Kids Mode requires PIN if set
      if (parentalPin && pin !== parentalPin) {
        return { success: false, error: 'Incorrect 4-digit PIN' };
      }
      setIsKidsMode(false);
      await updateProfile({ isKidMode: false });
      return { success: true };
    } else {
      // Entering Kids Mode
      setIsKidsMode(true);
      await updateProfile({ isKidMode: true });
      return { success: true };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isKidsMode,
        hasParentalPin: Boolean(parentalPin),
        signIn,
        signUp,
        signOut,
        updateProfile,
        toggleKidsMode,
        setParentalPin,
      }}
    >
      {children}
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
