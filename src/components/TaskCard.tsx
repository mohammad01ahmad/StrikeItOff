import { useEffect } from 'react';
import { View, Text, Alert, AccessibilityInfo, LayoutChangeEvent, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { Task, Priority } from '../types/task';

const PRIORITY_COLORS: Record<Priority, string> = {
  high: '#181512',
  medium: '#7e756f',
  low: '#cfc4bd',
};

const THRESHOLD_RATIO = 0.45;

interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => Promise<void>;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => Promise<void>;
}

function CompletedCard({ task, onDelete, }: { task: Task; onDelete: (id: string) => Promise<void>; }) {
  const handleDeletePress = () => {
    Alert.alert('Delete Task', `Are you sure you want to delete "${task.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete(task.id) },
    ]);
  };

  return (
    <View className="mb-3 rounded-xl border border-outline-variant bg-surface-container-low px-4 py-4 opacity-40">
      <View className="flex-row items-center">
        <Text
          className="flex-1 font-manrope text-base leading-6 text-outline"
          style={{ textDecorationLine: 'line-through' }}>
          {task.name}
        </Text>
        <Pressable onPress={handleDeletePress} hitSlop={8} className="ml-3 p-1">
          <Feather name="trash-2" size={17} color="#7e756f" />
        </Pressable>
      </View>
      <View className="mt-2 flex-row items-center gap-3">
        {task.priority && (
          <View className="flex-row items-center gap-1">
            <View
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: PRIORITY_COLORS[task.priority] }}
            />
            <Text className="font-jetbrains-mono text-[10px] uppercase tracking-[0.08em] text-outline">
              {task.priority}
            </Text>
          </View>
        )}
        {task.isDaily && (
          <Text className="font-jetbrains-mono text-[10px] uppercase tracking-[0.08em] text-outline">
            Daily
          </Text>
        )}
        {task.time && (
          <Text className="font-jetbrains-mono text-[10px] tracking-[0.04em] text-outline">
            {task.time}
          </Text>
        )}
      </View>
    </View>
  );
}

export default function TaskCard({ task, onComplete, onEdit, onDelete }: TaskCardProps) {
  const translateX = useSharedValue(0);
  const strikeScale = useSharedValue(0);
  const cardHeight = useSharedValue<number | undefined>(undefined);
  const cardOpacity = useSharedValue(1);
  const reduceMotion = useSharedValue(false);
  const cardWidth = useSharedValue(0);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      reduceMotion.value = enabled;
    });
    // reduceMotion is a Reanimated shared value — not a React dep
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // All animated styles declared before any conditional return (rules of hooks)
  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const strikeStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: strikeScale.value }],
    opacity: strikeScale.value > 0 ? 1 : 0,
  }));

  const wrapperStyle = useAnimatedStyle(() => ({
    height: cardHeight.value,
    opacity: cardOpacity.value,
    overflow: 'hidden',
  }));

  if (task.completed) {
    return <CompletedCard task={task} onDelete={onDelete} />;
  }

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const collapseAndComplete = (id: string) => {
    'worklet';
    cardHeight.value = withTiming(0, { duration: 280 }, () => {
      runOnJS(onComplete)(id);
    });
    cardOpacity.value = withTiming(0, { duration: 220 });
  };

  const completeInstant = (id: string) => {
    'worklet';
    runOnJS(onComplete)(id);
  };

  const handleDeletePress = () => {
    Alert.alert('Delete Task', `Are you sure you want to delete "${task.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete(task.id) },
    ]);
  };

  const pan = Gesture.Pan()
    .activeOffsetX([8, 9999])
    .failOffsetY([-25, 25])
    .onUpdate((e) => {
      if (e.translationX < 0) return;
      translateX.value = e.translationX;
      const progress = Math.min(e.translationX / (cardWidth.value * THRESHOLD_RATIO), 1);
      strikeScale.value = progress;
    })
    .onEnd((e) => {
      const threshold = cardWidth.value * THRESHOLD_RATIO;
      if (e.translationX >= threshold) {
        runOnJS(triggerHaptic)();
        strikeScale.value = withTiming(1, { duration: 120 });
        translateX.value = withTiming(cardWidth.value, { duration: 200 });
        if (reduceMotion.value) {
          completeInstant(task.id);
        } else {
          collapseAndComplete(task.id);
        }
      } else {
        translateX.value = withSpring(0, { damping: 18, stiffness: 200 });
        strikeScale.value = withSpring(0, { damping: 18, stiffness: 200 });
      }
    });

  // trashTap must be created before cardTap so cardTap can reference it
  const trashTap = Gesture.Tap().onEnd(() => runOnJS(handleDeletePress)());
  const cardTap = Gesture.Tap()
    .maxDistance(10)
    .requireExternalGestureToFail(trashTap)
    .onEnd(() => runOnJS(onEdit)(task));
  const composed = Gesture.Race(pan, cardTap);

  const onLayout = (e: LayoutChangeEvent) => {
    cardWidth.value = e.nativeEvent.layout.width;
    if (cardHeight.value === undefined) {
      cardHeight.value = e.nativeEvent.layout.height;
    }
  };

  return (
    <Animated.View style={wrapperStyle} onLayout={onLayout}>
      <GestureDetector gesture={composed}>
        <Animated.View
          style={rowStyle}
          className="mb-3 rounded-xl border border-outline-variant bg-surface-container-low px-4 py-4">
          {/* Name row + trash icon */}
          <View className="flex-row items-center">
            <View className="relative flex-1">
              <Text className="font-manrope text-base leading-6 text-primary">{task.name}</Text>
              {/* Ink strike line — scaleX from left origin */}
              <Animated.View
                style={[
                  {
                    position: 'absolute',
                    top: 11,
                    left: 0,
                    right: 0,
                    height: 2,
                    backgroundColor: '#181512',
                    borderRadius: 1,
                    transformOrigin: 'left',
                  },
                  strikeStyle,
                ]}
              />
            </View>
            <GestureDetector gesture={trashTap}>
              <Animated.View className="ml-3 p-1">
                <Feather name="trash-2" size={17} color="#7e756f" />
              </Animated.View>
            </GestureDetector>
          </View>

          {/* Meta row */}
          <View className="mt-2 flex-row items-center gap-3">
            {task.priority && (
              <View className="flex-row items-center gap-1">
                <View
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: PRIORITY_COLORS[task.priority] }}
                />
                <Text className="font-jetbrains-mono text-[10px] uppercase tracking-[0.08em] text-outline">
                  {task.priority}
                </Text>
              </View>
            )}
            {task.isDaily && (
              <Text className="font-jetbrains-mono text-[10px] uppercase tracking-[0.08em] text-outline">
                Daily
              </Text>
            )}
            {task.time && (
              <Text className="font-jetbrains-mono text-[10px] tracking-[0.04em] text-outline">
                {task.time}
              </Text>
            )}
          </View>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}
