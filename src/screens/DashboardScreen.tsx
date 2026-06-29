import { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import BottomTabBar, { TabName } from '../components/BottomTabBar';
import TodayScreen from './tabs/TodayScreen';
import TasksScreen from './tabs/TasksScreen';
import GroceryScreen from './tabs/GroceryScreen';
import ProfileScreen from './tabs/ProfileScreen';
import AddTaskSheet from '../components/AddTaskSheet';
import { useTasks } from '../hooks/useTasks/useTasks';
import { Task } from '../types/task';

export default function DashboardScreen() {
  const [activeTab, setActiveTab] = useState<TabName>('today');
  const { tasks, loading, addTask, completeTask, updateTask, deleteTask } = useTasks();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  const openAdd = () => {
    setEditingTask(null);
    setSheetVisible(true);
  };
  const openEdit = (task: Task) => {
    setEditingTask(task);
    setSheetVisible(true);
  };
  const closeSheet = () => setSheetVisible(false);

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
        {activeTab === 'today' && (
          <TodayScreen
            tasks={tasks}
            onComplete={completeTask}
            onEdit={openEdit}
            onDelete={deleteTask}
          />
        )}
        {activeTab === 'tasks' && (
          <TasksScreen
            tasks={tasks}
            onComplete={completeTask}
            onEdit={openEdit}
            onDelete={deleteTask}
            onOpenAdd={openAdd}
          />
        )}
        {activeTab === 'grocery' && <GroceryScreen />}
        {activeTab === 'profile' && <ProfileScreen />}

        <BottomTabBar activeTab={activeTab} onTabPress={setActiveTab} />
      </View>

      <AddTaskSheet
        visible={sheetVisible}
        onClose={closeSheet}
        onAddTask={addTask}
        editingTask={editingTask}
        onUpdateTask={updateTask}
      />
    </SafeAreaProvider>
  );
}
