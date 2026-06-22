import { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { updateProfile } from '@/api/profile/profile';

interface EditProfileSheetProps {
  visible: boolean;
  onClose: () => void;
  firstName: string;
  lastName: string;
}

const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function EditProfileSheet({ visible, onClose, firstName, lastName, }: EditProfileSheetProps) {
  const [first, setFirst] = useState(firstName);
  const [last, setLast] = useState(lastName);
  const [saving, setSaving] = useState(false);

  // if component opened then set name in text field
  useEffect(() => {
    if (visible) {
      setFirst(firstName);
      setLast(lastName);
    }
  }, [visible, firstName, lastName]);

  const canSave = first.trim().length > 0 && last.trim().length > 0 && !saving;

  // function to save changes
  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    const result = await updateProfile(first.trim(), last.trim());
    if (result.status === 'success') {
      onClose();
    } else {
      setSaving(false);
      Alert.alert('Update failed', result.message);
    }
  };

  // Delete account. todo.
  const handleDeleteAccount = () => {
    Alert.alert('Coming soon', 'Account deletion will be available in a future update.');
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        testID="backdrop"
        className="flex-1"
        style={{ backgroundColor: 'rgba(24,21,18,0.4)' }}
        onPress={onClose}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: SCREEN_HEIGHT * 0.92 }}>
        <View
          className="flex-1 bg-surface px-6 pb-10 pt-3"
          style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
          {/* Drag handle */}
          <View className="mb-6 items-center">
            <View className="h-1 w-8 rounded-full bg-outline-variant" />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Profile icon */}
            <View className="mb-8 items-center">
              <View className="h-24 w-24 items-center justify-center rounded-full bg-surface-container">
                <Feather name="user" size={44} color="#4d4540" />
              </View>
            </View>

            {/* First name */}
            <View className="mb-6">
              <Text className="font-jetbrains-mono text-[11px] uppercase leading-4 tracking-[0.08em] text-outline">
                First Name
              </Text>
              <TextInput
                testID="first-name-input"
                value={first}
                onChangeText={setFirst}
                placeholder="First name"
                placeholderTextColor="#7e756f"
                className="mt-1 border-b border-surface-dim py-2 font-manrope text-base leading-6 text-primary focus:border-primary"
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            {/* Last name */}
            <View className="mb-8">
              <Text className="font-jetbrains-mono text-[11px] uppercase leading-4 tracking-[0.08em] text-outline">
                Last Name
              </Text>
              <TextInput
                testID="last-name-input"
                value={last}
                onChangeText={setLast}
                placeholder="Last name"
                placeholderTextColor="#7e756f"
                className="mt-1 border-b border-surface-dim py-2 font-manrope text-base leading-6 text-primary focus:border-primary"
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            {/* Save changes */}
            <Pressable
              testID="save-button"
              onPress={handleSave}
              disabled={!canSave}
              className="w-full flex-row items-center justify-center rounded bg-primary px-6 py-3.5 active:opacity-95"
              style={{ opacity: canSave ? 1 : 0.35 }}>
              {saving ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="font-manrope-medium text-base text-on-primary">Save Changes</Text>
              )}
            </Pressable>

            {/* Delete account */}
            <Pressable
              testID="delete-button"
              onPress={handleDeleteAccount}
              className="mt-4 w-full flex-row items-center justify-center rounded border border-surface-dim px-6 py-3.5 active:opacity-75">
              <Text className="font-manrope-medium text-base text-primary">Delete Account</Text>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
