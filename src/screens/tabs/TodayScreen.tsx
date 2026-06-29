// Today tab: shows a greeting, an optional step-count card (via HealthKit/Health Connect),
// and the user's task list for the current day.
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../context/authContext/authContext';
import { Task } from '../../types/task';
import TaskCard from '../../components/TaskCard';
import { formatToday, getGreeting } from '../../utils/greeting/greeting';
import HealthKitManager from '@/utils/stepCount/HealthKitManager';

const TAB_BAR_HEIGHT = 80;

interface TodayScreenProps {
  tasks: Task[];
  onComplete: (id: string) => Promise<void>;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => Promise<void>;
}

export default function TodayScreen({ tasks, onComplete, onEdit, onDelete }: TodayScreenProps) {
  const { session } = useAuth();
  const firstName = session?.user.user_metadata?.first_name || 'there';
  const remaining = tasks.filter((t) => !t.completed).length;
  const { hasPermissions, steps } = HealthKitManager(new Date());

  return (
    <ScrollView
      className="flex-1 bg-surface"
      contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + 24 }}
      showsVerticalScrollIndicator={false}>
      <View className="px-6 pt-14">
        {/* App header */}
        <View className="mb-6 flex-row items-center justify-between">
          <Text className="font-manrope-semibold text-[18px] tracking-[-0.01em] text-primary">
            StrikeItOff
          </Text>
          <Pressable
            className="h-8 w-8 items-center justify-center rounded-full bg-surface-container active:opacity-70"
            accessibilityLabel="Profile"
            accessibilityRole="button">
            <Feather name="user" size={16} color="#4d4540" />
          </Pressable>
        </View>

        {/* Date eyebrow */}
        <Text className="font-jetbrains-mono text-[11px] uppercase leading-4 tracking-[0.08em] text-outline">
          {formatToday()}
        </Text>

        {/* Greeting headline */}
        <Text className="mt-3 font-manrope-semibold text-[32px] leading-10 tracking-[-0.02em] text-primary">
          {getGreeting()}, {firstName}.
        </Text>

        {/* Steps — waiting for HealthKit permission/init */}
        {!hasPermissions && (
          <View className="mt-6 flex-row items-center justify-between rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3">
            <View>
              <Text className="font-jetbrains-mono text-[11px] uppercase tracking-[0.08em] text-outline">
                Steps Today
              </Text>
              <Text className="mt-0.5 font-manrope text-sm text-outline">Connecting to Health…</Text>
            </View>
            <Feather name="activity" size={18} color="#cfc4bd" />
          </View>
        )}

        {/* Steps — count card (granted) */}
        {hasPermissions && (
          <View className="mt-6 rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3">
            <Text className="font-jetbrains-mono text-[11px] uppercase tracking-[0.08em] text-outline">
              Steps Today
            </Text>
            <Text className="mt-1 font-manrope-semibold text-[28px] leading-9 tracking-[-0.01em] text-primary">
              {steps.toLocaleString()}
            </Text>
          </View>
        )}

        {/* Section heading + count */}
        <View className="mb-5 mt-10 flex-row items-baseline justify-between">
          <Text className="font-manrope-medium text-[20px] leading-7 text-primary">
            {"Today's Tasks"}
          </Text>
          <Text className="font-jetbrains-mono text-[11px] tracking-[0.04em] text-outline">
            {remaining} left
          </Text>
        </View>

        {/* Task list */}
        {remaining === 0 && (
          <View className="mb-6 items-center">
            <Text className="font-manrope text-base leading-6 text-outline">
              All struck off. Enjoy the calm.
            </Text>
          </View>
        )}
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onComplete={onComplete}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </View>
    </ScrollView>
  );
}
