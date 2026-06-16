import { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';

interface OnboardingScreenProps {
    onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSaveProfile = async () => {
        if (!firstName.trim() || !lastName.trim()) {
            Alert.alert('Missing fields', 'Please enter both first name and last name');
            return;
        }

        try {
            setLoading(true);

            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) throw new Error('No active session found.');

            // 1. Try to upsert to 'profiles' table if it exists
            try {
                const { error: dbError } = await supabase.from('profiles').upsert({
                    id: user.id,
                    first_name: firstName.trim(),
                    last_name: lastName.trim(),
                    updated_at: new Date().toISOString(),
                });
                if (dbError) {
                    console.warn(
                        'Database profiles update failed, falling back to metadata:',
                        dbError.message
                    );
                }
            } catch (err: any) {
                console.warn('Failed database write. Falling back to metadata.', err.message ?? err);
            }

            // 2. Write details to auth metadata so user state is updated
            const { error: metaError } = await supabase.auth.updateUser({
                data: {
                    first_name: firstName.trim(),
                    last_name: lastName.trim(),
                },
            });

            if (metaError) throw metaError;

            onComplete();
        } catch (err: any) {
            Alert.alert('Profile save failed', err.message ?? 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

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
