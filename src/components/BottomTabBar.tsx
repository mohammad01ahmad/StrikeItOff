import { View, Text, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

export type TabName = 'today' | 'tasks' | 'profile';

interface TabItem {
  name: TabName;
  label: string;
  icon: keyof typeof Feather.glyphMap;
}

const TABS: TabItem[] = [
  { name: 'today', label: 'TODAY', icon: 'sun' },
  { name: 'tasks', label: 'TASKS', icon: 'check-square' },
  { name: 'profile', label: 'PROFILE', icon: 'user' },
];

interface BottomTabBarProps {
  activeTab: TabName;
  onTabPress: (tab: TabName) => void;
}

export default function BottomTabBar({ activeTab, onTabPress }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <BlurView
      intensity={60}
      tint="light"
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTopWidth: 1,
        borderTopColor: '#cfc4bd',
        paddingBottom: insets.bottom,
      }}>
      <View className="flex-row items-center justify-around px-6 pb-1 pt-3">
        {TABS.map((tab) => {
          const active = activeTab === tab.name;
          return (
            <Pressable
              key={tab.name}
              onPress={() => onTabPress(tab.name)}
              className="flex-1 items-center gap-1 py-1"
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={tab.label}>
              <Feather name={tab.icon} size={20} color={active ? '#181512' : '#7e756f'} />
              <Text
                className="font-jetbrains-mono text-[9px] tracking-[0.08em]"
                style={{ color: active ? '#181512' : '#7e756f' }}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </BlurView>
  );
}
