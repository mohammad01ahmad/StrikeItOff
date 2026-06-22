import { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

interface AddGroceryItemSheetProps {
  visible: boolean;
  onClose: () => void;
  onAddItem: (name: string, quantity?: string) => Promise<void>;
}

export default function AddGroceryItemSheet({
  visible,
  onClose,
  onAddItem,
}: AddGroceryItemSheetProps) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');

  useEffect(() => {
    if (!visible) {
      setName('');
      setQuantity('');
    }
  }, [visible]);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    await onAddItem(name.trim(), quantity.trim() || undefined);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
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
          <View className="mb-6 items-center">
            <View className="h-1 w-8 rounded-full bg-outline-variant" />
          </View>

          <Text className="font-jetbrains-mono text-[11px] uppercase leading-4 tracking-[0.08em] text-outline">
            Add Item
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Pasta, Olive oil…"
            placeholderTextColor="#7e756f"
            autoFocus
            className="mt-1 border-b border-surface-dim py-2 font-manrope text-base leading-6 text-primary"
            returnKeyType="next"
          />

          <Text className="mt-6 font-jetbrains-mono text-[11px] uppercase leading-4 tracking-[0.08em] text-outline">
            Quantity (optional)
          </Text>
          <TextInput
            value={quantity}
            onChangeText={setQuantity}
            placeholder="e.g. 2 packs, 500g, 1L…"
            placeholderTextColor="#7e756f"
            className="mt-1 border-b border-surface-dim py-2 font-manrope text-base leading-6 text-primary"
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
          />

          <Pressable
            onPress={handleSubmit}
            disabled={!name.trim()}
            className="mt-8 w-full items-center rounded bg-primary px-6 py-3.5"
            style={{ opacity: name.trim() ? 1 : 0.35 }}>
            <Text className="font-manrope-medium text-base text-on-primary">Add to List</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
