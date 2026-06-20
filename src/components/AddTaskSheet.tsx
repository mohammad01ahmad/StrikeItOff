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
import DateTimePicker, {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Task, TaskInput, Priority } from '../types/task';
import { createTask } from '../utils/createTask/createTask';

interface AddTaskSheetProps {
  visible: boolean;
  onClose: () => void;
  onAddTask: (input: TaskInput) => Promise<void>;
  editingTask?: Task | null;
  onUpdateTask?: (id: string, input: TaskInput) => Promise<void>;
}

const PRIORITIES: { label: string; value: Priority | undefined }[] = [
  { label: 'NONE', value: undefined },
  { label: 'HIGH', value: 'high' },
  { label: 'MEDIUM', value: 'medium' },
  { label: 'LOW', value: 'low' },
];

const formatTimeLabel = (d: Date) =>
  d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

export default function AddTaskSheet({
  visible,
  onClose,
  onAddTask,
  editingTask,
  onUpdateTask,
}: AddTaskSheetProps) {
  const [name, setName] = useState('');
  const [priority, setPriority] = useState<Priority | undefined>(undefined);
  const [isDaily, setIsDaily] = useState(false);
  const [timeDate, setTimeDate] = useState<Date | null>(null);
  const [existingTimeStr, setExistingTimeStr] = useState<string | undefined>(undefined);
  const [showIosPicker, setShowIosPicker] = useState(false);

  // Pre-fill when switching to edit mode
  useEffect(() => {
    if (editingTask) {
      setName(editingTask.name);
      setPriority(editingTask.priority);
      setIsDaily(editingTask.isDaily);
      setExistingTimeStr(editingTask.time);
      setTimeDate(null);
      setShowIosPicker(false);
    }
  }, [editingTask]);

  // Reset when sheet closes
  useEffect(() => {
    if (!visible) {
      setName('');
      setPriority(undefined);
      setIsDaily(false);
      setTimeDate(null);
      setExistingTimeStr(undefined);
      setShowIosPicker(false);
    }
  }, [visible]);

  const onTimeChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      if (event.type === 'set' && date) setTimeDate(date);
    } else if (date) {
      setTimeDate(date);
    }
  };

  const openTimePicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: timeDate ?? new Date(),
        mode: 'time',
        is24Hour: false,
        display: 'default',
        onChange: onTimeChange,
      });
    } else {
      if (!timeDate) setTimeDate(new Date());
      setShowIosPicker(true);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;
    const input = createTask({
      name,
      priority,
      isDaily,
      time: timeDate ? formatTimeLabel(timeDate) : existingTimeStr,
    });
    if (editingTask && onUpdateTask) {
      await onUpdateTask(editingTask.id, input);
    } else {
      await onAddTask(input);
    }
    onClose();
  };

  const isEditing = Boolean(editingTask);
  const hasTime = timeDate !== null || existingTimeStr !== undefined;

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
              {isEditing ? 'Edit Task' : 'New Task'}
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
            <View className="mt-1 flex-row items-center border-b border-surface-dim py-2">
              <Pressable className="flex-1" onPress={openTimePicker}>
                <Text
                  className="font-manrope text-base leading-6"
                  style={{ color: hasTime ? '#181512' : '#7e756f' }}>
                  {timeDate ? formatTimeLabel(timeDate) : (existingTimeStr ?? 'e.g. 9:00 AM')}
                </Text>
              </Pressable>
              {hasTime && (
                <Pressable
                  onPress={() => {
                    setTimeDate(null);
                    setExistingTimeStr(undefined);
                  }}
                  className="ml-2 px-1">
                  <Text className="font-jetbrains-mono text-[10px] tracking-[0.08em] text-outline">
                    CLEAR
                  </Text>
                </Pressable>
              )}
            </View>

            {/* iOS inline spinner */}
            {Platform.OS === 'ios' && showIosPicker && (
              <>
                <DateTimePicker
                  value={timeDate ?? new Date()}
                  mode="time"
                  display="spinner"
                  onChange={onTimeChange}
                />
                <Pressable onPress={() => setShowIosPicker(false)} className="items-end py-1">
                  <Text className="font-manrope-medium text-sm text-primary">Done</Text>
                </Pressable>
              </>
            )}

            {/* Submit */}
            <Pressable
              onPress={handleSubmit}
              disabled={!name.trim()}
              className="mt-8 w-full items-center rounded bg-primary px-6 py-3.5"
              style={{ opacity: name.trim() ? 1 : 0.35 }}>
              <Text className="font-manrope-medium text-base text-on-primary">
                {isEditing ? 'Save Changes' : 'Add Task'}
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
