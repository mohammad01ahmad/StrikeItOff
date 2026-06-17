import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import BottomTabBar, { TabName } from '../components/BottomTabBar';
import TodayScreen from './tabs/TodayScreen';
import TasksScreen from './tabs/TasksScreen';
import ProfileScreen from './tabs/ProfileScreen';

const SCREENS: Record<TabName, React.ComponentType> = {
    today: TodayScreen,
    tasks: TasksScreen,
    profile: ProfileScreen,
};

export default function DashboardScreen() {
    const [activeTab, setActiveTab] = useState<TabName>('today');
    const ActiveScreen = SCREENS[activeTab];

    return (
        <SafeAreaProvider>
            <View className="flex-1 bg-surface">
                <ActiveScreen />
                <BottomTabBar activeTab={activeTab} onTabPress={setActiveTab} />
            </View>
        </SafeAreaProvider>
    );
}
