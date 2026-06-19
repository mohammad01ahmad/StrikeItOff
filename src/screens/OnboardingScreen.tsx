import { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../context/authContext/authContext';

// Onboarding screen, right after SignUpScreen and before DashboardScreen.

type ScreenState = 'form' | 'success' | 'error';

export default function OnboardingScreen() {
  const { markOnboarded } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [screenState, setScreenState] = useState<ScreenState>('form');

  // todo: upsert/update might need to be updated
  const handleSaveProfile = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Missing fields', 'Please enter both First name and Last name');
      return;
    }

    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('No active session found.');
      const now = new Date().toISOString();

      // 1. Persist the profile. Upsert (not update) so it works whether or not the
      //    sign-up trigger already created the row; .select() makes RLS/permission
      //    failures throw instead of silently matching 0 rows.
      const { data: savedRow, error: dbError } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          onboarded: true,
          updated_at: now,
        })
        .select()
        .single();
      console.log('[onboarding] saved row:', savedRow, 'dbError:', dbError);
      if (dbError) throw dbError;
      if (!savedRow?.onboarded) {
        throw new Error(
          'Profile did not persist — no row was written (check the users table / RLS policies).'
        );
      }

      // 2. Write to auth metadata for dashboard greeting
      const { error: metaError } = await supabase.auth.updateUser({
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
        },
      });
      if (metaError) throw metaError;

      setScreenState('success');
      setTimeout(() => markOnboarded(), 1500);
    } catch (err: any) {
      console.error('Onboarding error:', err);
      setScreenState('error');
      setTimeout(() => setScreenState('form'), 2000);
    } finally {
      setLoading(false);
    }
  };

  if (screenState === 'success') {
    return (
      <View className="flex-1 items-center justify-center bg-surface px-6">
        <Text className="font-manrope-semibold text-[32px] leading-10 tracking-[-0.02em] text-primary">
          You{"'"}re all set!
        </Text>
        <Text className="mt-2 font-manrope text-base leading-6 text-on-surface-variant">
          Welcome, {firstName}.
        </Text>
      </View>
    );
  }

  if (screenState === 'error') {
    return (
      <View className="flex-1 items-center justify-center bg-surface px-6">
        <Text className="font-manrope-semibold text-[24px] leading-8 text-primary">
          Something went wrong
        </Text>
        <Text className="mt-2 font-manrope text-base leading-6 text-on-surface-variant">
          Please try again.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 justify-center bg-surface px-6">
      <View className="mb-10">
        <Text className="font-manrope-semibold text-[32px] leading-10 tracking-[-0.02em] text-primary">
          About You
        </Text>
        <Text className="mt-2 font-manrope text-base leading-6 text-on-surface-variant">
          Let{"'"}s set up your profile to start organizing.
        </Text>
      </View>

      <View className="rounded-xl border border-surface-dim bg-surface-container-low p-6">
        <View className="mb-6">
          <Text className="font-jetbrains-mono text-[11px] uppercase leading-4 tracking-[0.08em] text-outline">
            First Name
          </Text>
          <TextInput
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Enter your first name"
            placeholderTextColor="#7e756f"
            className="mt-1 border-b border-surface-dim py-2 font-manrope text-base leading-6 text-primary focus:border-primary"
            autoCapitalize="words"
            autoCorrect={false}
          />
        </View>

        <View className="mb-6">
          <Text className="font-jetbrains-mono text-[11px] uppercase leading-4 tracking-[0.08em] text-outline">
            Last Name
          </Text>
          <TextInput
            value={lastName}
            onChangeText={setLastName}
            placeholder="Enter your last name"
            placeholderTextColor="#7e756f"
            className="mt-1 border-b border-surface-dim py-2 font-manrope text-base leading-6 text-primary focus:border-primary"
            autoCapitalize="words"
            autoCorrect={false}
          />
        </View>

        <Pressable
          onPress={handleSaveProfile}
          disabled={loading}
          className="mt-2 w-full flex-row items-center justify-center rounded bg-primary px-6 py-3.5 active:opacity-95">
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="font-manrope-medium text-base text-on-primary">
              Complete Onboarding
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
