import { useFonts } from 'expo-font';
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
} from '@expo-google-fonts/manrope';
import { JetBrainsMono_500Medium } from '@expo-google-fonts/jetbrains-mono';
import { ActivityIndicator, View, Text, Pressable, Alert } from 'react-native';
import SignUpScreen from './src/screens/SignUpScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import { AuthProvider, useAuth } from './src/context/authContext';
import './global.css';

// Consumes auth state from AuthProvider and renders the correct screen for the session.
function RootNavigator() {
  const { session, initializing, isOnboarded, checkingOnboardStatus, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error: any) {
      Alert.alert('Error signing out', error.message);
    }
  };

  if (initializing || (session !== null && checkingOnboardStatus)) {
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
    return <OnboardingScreen />;
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

export default function App() {
  const [fontsLoaded] = useFonts({
    'Manrope-Regular': Manrope_400Regular,
    'Manrope-Medium': Manrope_500Medium,
    'Manrope-SemiBold': Manrope_600SemiBold,
    'JetBrainsMono-Medium': JetBrainsMono_500Medium,
  });

  if (!fontsLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator size="large" color="#181512" />
      </View>
    );
  }

  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
