import { useState, useEffect } from 'react';
import { useFonts } from 'expo-font';
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
} from '@expo-google-fonts/manrope';
import { JetBrainsMono_500Medium } from '@expo-google-fonts/jetbrains-mono';
import { ActivityIndicator, View, Text, Pressable, Alert } from 'react-native';
import { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import SignUpScreen from './src/screens/SignUpScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import './global.css';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isOnboarded, setIsOnboarded] = useState<boolean>(false);
  const [checkingOnboardStatus, setCheckingOnboardStatus] = useState<boolean>(true);

  const [fontsLoaded] = useFonts({
    'Manrope-Regular': Manrope_400Regular,
    'Manrope-Medium': Manrope_500Medium,
    'Manrope-SemiBold': Manrope_600SemiBold,
    'JetBrainsMono-Medium': JetBrainsMono_500Medium,
  });

  const checkOnboardStatus = async (userSession: Session | null) => {
    if (!userSession?.user) {
      setIsOnboarded(false);
      setCheckingOnboardStatus(false);
      return;
    }

    try {
      // 1. Check metadata first
      const metadata = userSession.user.user_metadata;
      if (metadata?.first_name && metadata?.last_name) {
        setIsOnboarded(true);
        setCheckingOnboardStatus(false);
        return;
      }

      // 2. Check profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', userSession.user.id)
        .maybeSingle();

      if (!error && data?.first_name && data?.last_name) {
        setIsOnboarded(true);
      } else {
        setIsOnboarded(false);
      }
    } catch (err) {
      console.warn('Error fetching onboarding profile:', err);
      setIsOnboarded(false);
    } finally {
      setCheckingOnboardStatus(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      checkOnboardStatus(currentSession);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      checkOnboardStatus(currentSession);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Error signing out', error.message);
    }
  };

  const showLoading = !fontsLoaded || (session !== null && checkingOnboardStatus);

  if (showLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator size="large" color="#181512" />
      </View>
    );
  }

  // 1. User not logged in
  if (!session) {
    return <SignUpScreen />;
  }

  // 2. User logged in but profile incomplete
  if (!isOnboarded) {
    return <OnboardingScreen onComplete={() => setIsOnboarded(true)} />;
  }

  // 3. User logged in and onboarded - Dashboard
  const firstName = session.user.user_metadata?.first_name || 'there';

  return (
    <View className="flex-1 items-center justify-center bg-surface px-6">
      <Text className="mb-2 font-manrope-semibold text-[32px] leading-10 tracking-[-0.02em] text-primary">
        StrikeItOff
      </Text>
      <Text className="max-w-[280px] text-center font-manrope text-base leading-6 text-on-surface-variant">
        Welcome back, {firstName}! You are ready to start finding your focus.
      </Text>

      <Pressable
        onPress={handleSignOut}
        className="mt-8 rounded border border-surface-dim bg-transparent px-6 py-3 active:opacity-75">
        <Text className="font-manrope-medium text-base text-primary">Sign Out</Text>
      </Pressable>
    </View>
  );
}
