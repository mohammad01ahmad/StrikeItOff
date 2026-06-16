import { useState, useEffect } from 'react';
import { View, Text, Pressable, ActivityIndicator, Alert, Linking } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import { makeRedirectUri } from 'expo-auth-session';
import { AntDesign } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

WebBrowser.maybeCompleteAuthSession();

const redirectTo = makeRedirectUri();

//
async function createSessionFromUrl(url: string) {
    // Extract parameters from the hash fragment (#) instead of the search query (?)
    // Supabase sends tokens after a '#' sign

    const { params, errorCode } = QueryParams.getQueryParams(url);
    if (errorCode) throw new Error(errorCode);

    const { access_token, refresh_token } = params;
    if (!access_token) return null;

    const { data, error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
    });
    if (error) throw error;
    return data.session;
}

export default function SignUpScreen() {
    const [loading, setLoading] = useState(false);

    // FIX 2: Listen for deep links to handle the return from Safari
    useEffect(() => {
        const subscription = Linking.addEventListener('url', async ({ url }) => {
            if (url.includes('access_token')) {
                try {
                    setLoading(true);
                    await createSessionFromUrl(url);
                } catch (err: any) {
                    Alert.alert('Session recovery failed', err.message);
                } finally {
                    setLoading(false);
                }
            }
        });

        return () => subscription.remove();
    }, []);

    const handleGoogleSignUp = async () => {
        try {
            setLoading(true);

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo,
                    skipBrowserRedirect: true,
                },
            });
            if (error) throw error;

            await WebBrowser.openBrowserAsync(data.url);
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
