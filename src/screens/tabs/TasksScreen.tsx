import { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Task } from '../../types/task';
import TaskCard from '../../components/TaskCard';
import AddTaskSheet from '../../components/AddTaskSheet';

const TAB_BAR_HEIGHT = 80;

interface TasksScreenProps {
    tasks: Task[];
    onComplete: (id: string) => void;
    onAddTask: (task: Task) => void;
}

export default function TasksScreen({ tasks, onComplete, onAddTask }: TasksScreenProps) {
    const [sheetVisible, setSheetVisible] = useState(false);
    const dailyTasks = tasks.filter((t) => t.isDaily);

    return (
        <>
            <ScrollView
                className="flex-1 bg-surface"
                contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + 24 }}
                showsVerticalScrollIndicator={false}>
                <View className="px-6 pt-14">
                    {/* Header — matches TodayScreen exactly */}
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

                    {/* Add task CTA card */}
                    <Pressable
                        onPress={() => setSheetVisible(true)}
                        className="flex-row items-center gap-3 rounded-xl border border-outline-variant bg-surface-container px-4 py-5 active:opacity-70"
                        accessibilityRole="button"
                        accessibilityLabel="Add new task">
                        <Feather name="plus" size={16} color="#7e756f" />
                        <Text className="font-manrope-medium text-base text-outline">
                            Add new task
                        </Text>
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
                            <TaskCard key={task.id} task={task} onComplete={onComplete} />
                        ))
                    )}
                </View>
            </ScrollView>

            <AddTaskSheet
                visible={sheetVisible}
                onClose={() => setSheetVisible(false)}
                onAddTask={onAddTask}
            />
        </>
    );
}
