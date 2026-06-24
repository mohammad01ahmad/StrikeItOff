import { View, Text, ScrollView, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Task } from '../../types/task';
import TaskCard from '../../components/TaskCard';

const TAB_BAR_HEIGHT = 80;

interface TasksScreenProps {
  tasks: Task[];
  onComplete: (id: string) => Promise<void>;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => Promise<void>;
  onOpenAdd: () => void;
}

export default function TasksScreen({
  tasks,
  onComplete,
  onEdit,
  onDelete,
  onOpenAdd,
}: TasksScreenProps) {
  const dailyTasks = tasks.filter((t) => t.isDaily);

  return (
    <ScrollView
      className="flex-1 bg-surface"
      contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + 24 }}
      showsVerticalScrollIndicator={false}>
      <View className="px-6 pt-14">
        {/* Header */}
        <View className="mb-6 flex-row items-center justify-between">
          <Text className="font-manrope-semibold text-[18px] tracking-[-0.01em] text-primary">
            StrikeItOff
          </Text>
          <View className="h-8 w-8 items-center justify-center rounded-full bg-surface-container">
            <Feather name="user" size={16} color="#4d4540" />
          </View>
        </View>

        {/* Add task CTA card */}
        <Pressable
          onPress={onOpenAdd}
          className="flex-row items-center gap-3 rounded-xl border border-outline-variant bg-surface-container px-4 py-5 active:opacity-70"
          accessibilityRole="button"
          accessibilityLabel="Add new task">
          <Feather name="plus" size={16} color="#7e756f" />
          <Text className="font-manrope-medium text-base text-outline">Add new task</Text>
        </Pressable>

        {/* Daily Tasks section */}
        <View className="mb-5 mt-10 flex-row items-baseline justify-between">
          <Text className="font-jetbrains-mono text-[11px] uppercase leading-4 tracking-[0.08em] text-outline">
            Daily Tasks
          </Text>
          <Text className="font-jetbrains-mono text-[11px] tracking-[0.04em] text-outline">
            {dailyTasks.filter((t) => !t.completed).length} left
          </Text>
        </View>

        {dailyTasks.length === 0 ? (
          <View className="mt-4 items-center py-8">
            <Text className="font-manrope text-base leading-6 text-outline">
              No daily tasks yet.
            </Text>
          </View>
        ) : (
          dailyTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onComplete={onComplete}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}
