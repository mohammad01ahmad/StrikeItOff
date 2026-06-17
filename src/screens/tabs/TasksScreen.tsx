import { View, Text } from 'react-native';

export default function TasksScreen() {
    return (
        <View className="flex-1 items-center justify-center bg-surface px-6">
            <Text className="font-manrope-semibold text-[24px] leading-8 tracking-[-0.01em] text-primary">
                All Tasks
            </Text>
            <Text className="mt-2 font-manrope text-base leading-6 text-outline">
                Coming soon.
            </Text>
        </View>
    );
}
