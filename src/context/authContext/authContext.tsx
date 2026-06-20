// authContext.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import GoogleSigninService from './GoogleSigninService';
import { supabase } from '../../../lib/supabase';

interface AuthContextValue {
  session: Session | null;
  initializing: boolean;
  isOnboarded: boolean;
  checkingOnboardStatus: boolean;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<unknown>;
  signOut: () => Promise<void>;
  markOnboarded: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [checkingOnboardStatus, setCheckingOnboardStatus] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // function: to check if the user is onboarded or not
  const checkOnboardStatus = async (userSession: Session | null) => {
    if (!userSession?.user) {
      setIsOnboarded(false);
      setCheckingOnboardStatus(false);
      return;
    }

    try {
      const { data, error: dbError } = await supabase
        .from('users')
        .select('onboarded')
        .eq('id', userSession.user.id)
        .maybeSingle();

      setIsOnboarded(!dbError && data?.onboarded === true);
    } catch (err) {
      console.warn('Error fetching onboard status:', err);
      setIsOnboarded(false);
    } finally {
      setCheckingOnboardStatus(false);
    }
  };

  // useEffect: to configure the google sign in service
  useEffect(() => {
    GoogleSigninService.configure();
  }, []);

  // useEffect: to get the session and check the onboard status
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      checkOnboardStatus(currentSession);
      setInitializing(false);
    });

    // subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      // Re-check onboard status in the background; don't blank the screen with the
      // loading gate on every auth event (e.g. the USER_UPDATED fired by updateUser).
      checkOnboardStatus(currentSession);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Signs in with Google natively, then exchanges the ID token for a Supabase session.
  // The onAuthStateChange listener above picks up the resulting session.
  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await GoogleSigninService.signIn();
      if (!result) return null;

      const { error: supabaseError } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: result.idToken,
      });
      if (supabaseError) throw supabaseError;

      return result;
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    setError(null);

    try {
      await GoogleSigninService.signOut();
    } catch (err) {
      console.warn('Google sign-out error:', err);
    }

    try {
      const { error: supabaseError } = await supabase.auth.signOut();
      if (supabaseError) throw supabaseError;
    } catch (err: any) {
      setError(err.message || 'Sign out failed.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const markOnboarded = () => setIsOnboarded(true);

  return (
    <AuthContext.Provider
      value={{
        session,
        initializing,
        isOnboarded,
        checkingOnboardStatus,
        loading,
        error,
        signInWithGoogle,
        signOut,
        markOnboarded,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
