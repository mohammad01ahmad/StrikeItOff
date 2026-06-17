import { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    Pressable,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { Task, Priority } from '../types/task';
import { createTask } from '../utils/createTask';

interface AddTaskSheetProps {
    visible: boolean;
    onClose: () => void;
    onAddTask: (task: Task) => void;
}

const PRIORITIES: { label: string; value: Priority | undefined }[] = [
    { label: 'NONE', value: undefined },
    { label: 'HIGH', value: 'high' },
    { label: 'MEDIUM', value: 'medium' },
    { label: 'LOW', value: 'low' },
];

export default function AddTaskSheet({ visible, onClose, onAddTask }: AddTaskSheetProps) {
    const [name, setName] = useState('');
    const [priority, setPriority] = useState<Priority | undefined>(undefined);
    const [isDaily, setIsDaily] = useState(false);
    const [time, setTime] = useState('');

    useEffect(() => {
        if (!visible) {
            setName('');
            setPriority(undefined);
            setIsDaily(false);
            setTime('');
        }
    }, [visible]);

    const handleSubmit = () => {
        if (!name.trim()) return;
        onAddTask(createTask({ name, priority, isDaily, time }));
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            {/* Backdrop */}
            <Pressable
                className="flex-1"
                style={{ backgroundColor: 'rgba(24,21,18,0.4)' }}
                onPress={onClose}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
                <View
                    className="bg-surface-container-lowest px-6 pb-10 pt-3"
                    style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>

                    {/* Drag handle */}
                    <View className="mb-6 items-center">
                        <View className="h-1 w-8 rounded-full bg-outline-variant" />
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                        {/* Task name */}
                        <Text className="font-jetbrains-mono text-[11px] uppercase leading-4 tracking-[0.08em] text-outline">
                            New Task
                        </Text>
                        <TextInput
                            value={name}
                            onChangeText={setName}
                            placeholder="What needs doing?"
                            placeholderTextColor="#7e756f"
                            autoFocus
                            className="mt-1 border-b border-surface-dim py-2 font-manrope text-base leading-6 text-primary"
                            returnKeyType="done"
                        />

                        {/* Priority */}
                        <Text className="mt-6 font-jetbrains-mono text-[11px] uppercase leading-4 tracking-[0.08em] text-outline">
                            Priority
                        </Text>
                        <View className="mt-2 flex-row gap-2">
                            {PRIORITIES.map((p) => {
                                const active = priority === p.value;
                                return (
                                    <Pressable
                                        key={p.label}
                                        onPress={() => setPriority(p.value)}
                                        className={`rounded px-3 py-1.5 ${active ? 'bg-primary' : 'bg-surface-container'}`}>
                                        <Text
                                            className={`font-jetbrains-mono text-[10px] tracking-[0.08em] ${active ? 'text-on-primary' : 'text-outline'}`}>
                                            {p.label}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>

                        {/* Recurring */}
                        <Text className="mt-6 font-jetbrains-mono text-[11px] uppercase leading-4 tracking-[0.08em] text-outline">
                            Recurring
                        </Text>
                        <View className="mt-2 flex-row">
                            <Pressable
                                onPress={() => setIsDaily((v) => !v)}
                                className={`rounded px-3 py-1.5 ${isDaily ? 'bg-primary' : 'bg-surface-container'}`}>
                                <Text
                                    className={`font-jetbrains-mono text-[10px] tracking-[0.08em] ${isDaily ? 'text-on-primary' : 'text-outline'}`}>
                                    DAILY
                                </Text>
                            </Pressable>
                        </View>

                        {/* Time */}
                        <Text className="mt-6 font-jetbrains-mono text-[11px] uppercase leading-4 tracking-[0.08em] text-outline">
                            Time (optional)
                        </Text>
                        <TextInput
                            value={time}
                            onChangeText={setTime}
                            placeholder="e.g. 9:00 AM"
                            placeholderTextColor="#7e756f"
                            className="mt-1 border-b border-surface-dim py-2 font-manrope text-base leading-6 text-primary"
                            returnKeyType="done"
                        />

                        {/* Submit */}
                        <Pressable
                            onPress={handleSubmit}
                            disabled={!name.trim()}
                            className="mt-8 w-full items-center rounded bg-primary px-6 py-3.5"
                            style={{ opacity: name.trim() ? 1 : 0.35 }}>
                            <Text className="font-manrope-medium text-base text-on-primary">
                                Add Task
                            </Text>
                        </Pressable>
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}
