import { View, Text, Pressable, Alert } from 'react-native';
import { useAuth } from '../../context/authContext';

export default function ProfileScreen() {
    const { session, signOut } = useAuth();
    const firstName = session?.user.user_metadata?.first_name;
    const lastName = session?.user.user_metadata?.last_name;
    const email = session?.user.email;

    const handleSignOut = async () => {
        try {
            await signOut();
        } catch (error: any) {
            Alert.alert('Error signing out', error.message);
        }
    };

    return (
        <View className="flex-1 bg-surface px-6 pt-14">
            <Text className="font-jetbrains-mono text-[11px] uppercase leading-4 tracking-[0.08em] text-outline">
                Profile
            </Text>
            <Text className="mt-3 font-manrope-semibold text-[32px] leading-10 tracking-[-0.02em] text-primary">
                {firstName} {lastName}
            </Text>
            {email && (
                <Text className="mt-1 font-manrope text-base leading-6 text-outline">{email}</Text>
            )}

            <Pressable
                onPress={handleSignOut}
                className="mt-10 rounded border border-surface-dim bg-transparent px-6 py-3 active:opacity-75">
                <Text className="text-center font-manrope-medium text-base text-primary">
                    Sign out
                </Text>
            </Pressable>
        </View>
    );
}
