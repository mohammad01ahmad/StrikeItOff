import { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Alert } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useAuth } from '../context/authContext';

export default function SignUpScreen() {
    const [loading, setLoading] = useState(false);
    const { signInWithGoogle } = useAuth();

    const handleGoogleSignUp = async () => {
        try {
            setLoading(true);
            await signInWithGoogle();
            // App.tsx's onAuthStateChange listener picks up the new session automatically
        } catch (err: any) {
            Alert.alert('Sign up failed', err.message ?? 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 justify-center bg-surface px-6">
            <View className="mb-10">
                <Text className="font-manrope-semibold text-[32px] leading-10 tracking-[-0.02em] text-primary">
                    StrikeItOff
                </Text>
                <Text className="mt-2 font-manrope text-base leading-6 text-on-surface-variant">
                    Strike through the chaos, find your focus.
                </Text>
            </View>

            <Text className="mb-4 font-jetbrains-mono text-[11px] uppercase leading-4 tracking-[0.08em] text-outline">
                Create your account
            </Text>

            <Pressable
                onPress={handleGoogleSignUp}
                disabled={loading}
                className="w-full flex-row items-center justify-center rounded bg-primary px-6 py-3.5 active:opacity-95">
                {loading ? (
                    <ActivityIndicator color="#ffffff" />
                ) : (
                    <>
                        <AntDesign name="google" size={18} color="#ffffff" />
                        <Text className="ml-3 font-manrope-medium text-base text-on-primary">
                            Sign In with Google
                        </Text>
                    </>
                )}
            </Pressable>
        </View>
    );
}
