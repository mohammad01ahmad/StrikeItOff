import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import BottomTabBar, { TabName } from '../components/BottomTabBar';
import TodayScreen from './tabs/TodayScreen';
import TasksScreen from './tabs/TasksScreen';
import ProfileScreen from './tabs/ProfileScreen';
import { Task } from '../types/task';
import { MOCK_TASKS } from '../data/mockTasks';

export default function DashboardScreen() {
    const [activeTab, setActiveTab] = useState<TabName>('today');
    const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);

    const handleComplete = (id: string) => {
        setTasks((prev) => {
            const task = prev.find((t) => t.id === id);
            if (!task) return prev;
            return [...prev.filter((t) => t.id !== id), { ...task, completed: true }];
        });
    };

    const handleAddTask = (task: Task) => {
        setTasks((prev) => [task, ...prev]);
    };

    return (
        <SafeAreaProvider>
            <View className="flex-1 bg-surface">
                {activeTab === 'today' && (
                    <TodayScreen tasks={tasks} onComplete={handleComplete} />
                )}
                {activeTab === 'tasks' && (
                    <TasksScreen
                        tasks={tasks}
                        onComplete={handleComplete}
                        onAddTask={handleAddTask}
                    />
                )}
                {activeTab === 'profile' && <ProfileScreen />}
                <BottomTabBar activeTab={activeTab} onTabPress={setActiveTab} />
            </View>
        </SafeAreaProvider>
    );
}
