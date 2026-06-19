import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useState } from 'react';
import BottomTabBar, { TabName } from '../components/BottomTabBar';
import TodayScreen from './tabs/TodayScreen';
import TasksScreen from './tabs/TasksScreen';
import ProfileScreen from './tabs/ProfileScreen';
import { useTasks } from '../hooks/useTasks';

export default function DashboardScreen() {
  const [activeTab, setActiveTab] = useState<TabName>('today');
  const { tasks, loading, addTask, completeTask } = useTasks();

  if (loading) {
    return (
      <SafeAreaProvider>
        <View className="flex-1 items-center justify-center bg-surface">
          <ActivityIndicator />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <View className="flex-1 bg-surface">
        {activeTab === 'today' && <TodayScreen tasks={tasks} onComplete={completeTask} />}
        {activeTab === 'tasks' && (
          <TasksScreen tasks={tasks} onComplete={completeTask} onAddTask={addTask} />
        )}
        {activeTab === 'profile' && <ProfileScreen />}

        <BottomTabBar activeTab={activeTab} onTabPress={setActiveTab} />
      </View>
    </SafeAreaProvider>
  );
}
