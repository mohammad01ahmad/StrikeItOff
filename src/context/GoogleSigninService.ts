// GoogleSigninService.ts
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { Platform } from 'react-native';

interface GoogleSignInTokenResult {
    idToken: string;
}

class GoogleSigninService {
    private configured = false;

    configure() {
        if (this.configured) return;

        GoogleSignin.configure({
            webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
            iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
            offlineAccess: true,
            scopes: ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'],
        });

        this.configured = true;
    }

    // Returns the Google ID token needed for supabase.auth.signInWithIdToken, or null if the user cancelled.
    async signIn(): Promise<GoogleSignInTokenResult | null> {
        try {
            if (Platform.OS === 'android') {
                await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
            }

            const response = await GoogleSignin.signIn();
            if (!response.idToken) {
                throw new Error('No ID token returned from Google');
            }

            return { idToken: response.idToken };
        } catch (error: any) {
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                console.log('User cancelled the login flow');
                return null;
            } else if (error.code === statusCodes.IN_PROGRESS) {
                console.log('Sign in is in progress already');
                return null;
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                console.log('Play services not available');
                return null;
            } else {
                console.error('Google Sign In Error:', error);
                throw error;
            }
        }
    }

    async signOut(): Promise<void> {
        try {
            await GoogleSignin.signOut();
        } catch (error) {
            console.error('Google Sign Out Error:', error);
            throw error;
        }
    }

    async isSignedIn(): Promise<boolean> {
        try {
            return await GoogleSignin.isSignedIn();
        } catch (error) {
            console.error('Is Signed In Error:', error);
            return false;
        }
    }
}

export default new GoogleSigninService();
