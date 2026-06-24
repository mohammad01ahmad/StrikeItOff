import { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { GroceryList, GroceryItem } from '../../types/grocery';
import { useGroceryLists } from '../../hooks/useGroceryLists';
import { useGroceryItems } from '../../hooks/useGroceryItems';
import AddGroceryListSheet from '../../components/AddGroceryListSheet';
import AddGroceryItemSheet from '../../components/AddGroceryItemSheet';

const TAB_BAR_HEIGHT = 80;

// ─── Lists View ──────────────────────────────────────────────────────────────

interface ListCardProps {
  list: GroceryList;
  onPress: () => void;
  onDelete: (id: string) => void;
}

function ListCard({ list, onPress, onDelete }: ListCardProps) {
  const allChecked = list.totalCount > 0 && list.checkedCount === list.totalCount;
  const progress = list.totalCount > 0 ? list.checkedCount / list.totalCount : 0;

  const handleDelete = () => {
    Alert.alert('Delete List', `Delete "${list.name}" and all its items?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete(list.id) },
    ]);
  };

  return (
    <Pressable
      onPress={onPress}
      className="mb-3 rounded-xl border border-outline-variant bg-surface-container-low px-4 py-4 active:opacity-70">
      <View className="flex-row items-start justify-between">
        <Text className="flex-1 font-manrope-medium text-[20px] leading-7 text-primary">
          {list.name}
        </Text>
        <Pressable onPress={handleDelete} hitSlop={8} className="ml-3 p-1">
          <Feather name="trash-2" size={17} color="#7e756f" />
        </Pressable>
      </View>

      {/* Progress bar */}
      {list.totalCount > 0 && (
        <View className="mt-3">
          <View className="h-0.5 overflow-hidden rounded-full bg-surface-dim">
            <View
              className="h-full rounded-full bg-primary"
              style={{ width: `${progress * 100}%` }}
            />
          </View>
          <View className="mt-2 flex-row items-center justify-between">
            <Text className="font-jetbrains-mono text-[10px] tracking-[0.04em] text-outline">
              {list.checkedCount} / {list.totalCount} checked
            </Text>
            {allChecked && (
              <Text className="font-jetbrains-mono text-[10px] tracking-[0.04em] text-outline">
                All done ✓
              </Text>
            )}
          </View>
        </View>
      )}

      {list.totalCount === 0 && (
        <Text className="mt-1 font-jetbrains-mono text-[10px] tracking-[0.04em] text-outline">
          No items yet
        </Text>
      )}
    </Pressable>
  );
}

interface ListsViewProps {
  lists: GroceryList[];
  loading: boolean;
  onSelectList: (id: string) => void;
  onDeleteList: (id: string) => void;
  onNewList: () => void;
}

function ListsView({ lists, loading, onSelectList, onDeleteList, onNewList }: ListsViewProps) {
  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1 bg-surface"
        contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + 80 }}
        showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-14">
          <Text className="font-jetbrains-mono text-[11px] uppercase leading-4 tracking-[0.08em] text-outline">
            Grocery
          </Text>
          <Text className="mt-3 font-manrope-semibold text-[32px] leading-10 tracking-[-0.02em] text-primary">
            Get your Grocery Right.
          </Text>

          <View className="mb-5 mt-10 flex-row items-baseline justify-between">
            <Text className="font-manrope-medium text-[20px] leading-7 text-primary">
              Your Lists
            </Text>
            <Text className="font-jetbrains-mono text-[11px] tracking-[0.04em] text-outline">
              {lists.length} list{lists.length !== 1 ? 's' : ''}
            </Text>
          </View>

          {loading ? (
            <ActivityIndicator className="py-10" />
          ) : (
            <>
              {lists.length === 0 && (
                <View className="items-center py-10">
                  <Text className="font-manrope text-base leading-6 text-outline">
                    No lists yet. Start one below.
                  </Text>
                </View>
              )}
              {lists.map((list) => (
                <ListCard
                  key={list.id}
                  list={list}
                  onPress={() => onSelectList(list.id)}
                  onDelete={onDeleteList}
                />
              ))}
            </>
          )}
        </View>
      </ScrollView>

      {/* New list button */}
      <View
        className="absolute bottom-0 left-0 right-0 px-6"
        style={{ paddingBottom: TAB_BAR_HEIGHT + 16 }}>
        <Pressable
          onPress={onNewList}
          className="w-full flex-row items-center justify-center gap-2 rounded bg-primary px-6 py-3.5 active:opacity-80">
          <Feather name="plus" size={16} color="#ffffff" />
          <Text className="font-manrope-medium text-base text-on-primary">New List</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Items View ───────────────────────────────────────────────────────────────

interface ItemRowProps {
  item: GroceryItem;
  onToggle: (id: string, checked: boolean) => void;
  onDelete: (id: string) => void;
}

function ItemRow({ item, onToggle, onDelete }: ItemRowProps) {
  const handleDeletePress = () => {
    Alert.alert('Remove Item', `Remove "${item.name}" from the list?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => onDelete(item.id) },
    ]);
  };

  return (
    <View className="mb-3 flex-row items-center gap-3">
      {/* Circular checkbox */}
      <Pressable
        onPress={() => onToggle(item.id, !item.checked)}
        hitSlop={8}
        className="h-6 w-6 items-center justify-center rounded-full border-2"
        style={{ borderColor: item.checked ? '#181512' : '#cfc4bd', backgroundColor: item.checked ? '#181512' : 'transparent' }}>
        {item.checked && <Feather name="check" size={13} color="#ffffff" />}
      </Pressable>

      {/* Name + quantity */}
      <View className="flex-1">
        <Text
          className="font-manrope text-base leading-6"
          style={{
            color: item.checked ? '#7e756f' : '#1e1b16',
            textDecorationLine: item.checked ? 'line-through' : 'none',
          }}>
          {item.name}
        </Text>
        {item.quantity && (
          <Text className="font-jetbrains-mono text-[10px] tracking-[0.04em] text-outline">
            {item.quantity}
          </Text>
        )}
      </View>

      {/* Delete */}
      <Pressable onPress={handleDeletePress} hitSlop={8} className="p-1">
        <Feather name="trash-2" size={15} color="#cfc4bd" />
      </Pressable>
    </View>
  );
}

interface ItemsViewProps {
  listName: string;
  loading: boolean;
  onBack: () => void;
  onAddItem: () => void;
  items: GroceryItem[];
  onToggle: (id: string, checked: boolean) => void;
  onDelete: (id: string) => void;
  onClearChecked: () => void;
}

function ItemsView({
  listName,
  loading,
  onBack,
  onAddItem,
  items,
  onToggle,
  onDelete,
  onClearChecked,
}: ItemsViewProps) {
  const unchecked = items.filter((i) => !i.checked);
  const checked = items.filter((i) => i.checked);

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1 bg-surface"
        contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + 80 }}
        showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-14">
          {/* Back + title */}
          <Pressable
            onPress={onBack}
            className="mb-6 flex-row items-center gap-2 active:opacity-60"
            hitSlop={8}>
            <Feather name="arrow-left" size={18} color="#4d4540" />
            <Text className="font-jetbrains-mono text-[11px] uppercase tracking-[0.08em] text-outline">
              Lists
            </Text>
          </Pressable>

          <Text className="font-manrope-semibold text-[24px] leading-8 tracking-[-0.01em] text-primary">
            {listName}
          </Text>

          <View className="mb-5 mt-8 flex-row items-baseline justify-between">
            <Text className="font-manrope-medium text-[20px] leading-7 text-primary">Items</Text>
            <Text className="font-jetbrains-mono text-[11px] tracking-[0.04em] text-outline">
              {unchecked.length} left
            </Text>
          </View>

          {loading ? (
            <ActivityIndicator className="py-10" />
          ) : (
            <>
              {items.length === 0 && (
                <View className="items-center py-10">
                  <Text className="font-manrope text-base leading-6 text-outline">
                    Nothing here yet. Add your first item.
                  </Text>
                </View>
              )}

              {/* Unchecked items */}
              {unchecked.map((item) => (
                <ItemRow key={item.id} item={item} onToggle={onToggle} onDelete={onDelete} />
              ))}

              {/* Checked section */}
              {checked.length > 0 && (
                <>
                  <View className="my-4 flex-row items-center justify-between">
                    <View className="flex-1 border-t border-outline-variant" />
                    <Text className="mx-3 font-jetbrains-mono text-[10px] uppercase tracking-[0.08em] text-outline">
                      In basket
                    </Text>
                    <View className="flex-1 border-t border-outline-variant" />
                  </View>
                  {checked.map((item) => (
                    <ItemRow key={item.id} item={item} onToggle={onToggle} onDelete={onDelete} />
                  ))}
                  <Pressable
                    onPress={onClearChecked}
                    className="mt-2 self-start rounded border border-outline-variant px-4 py-2 active:opacity-60">
                    <Text className="font-jetbrains-mono text-[10px] uppercase tracking-[0.08em] text-outline">
                      Clear checked
                    </Text>
                  </Pressable>
                </>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Add item button */}
      <View
        className="absolute bottom-0 left-0 right-0 px-6"
        style={{ paddingBottom: TAB_BAR_HEIGHT + 16 }}>
        <Pressable
          onPress={onAddItem}
          className="w-full flex-row items-center justify-center gap-2 rounded bg-primary px-6 py-3.5 active:opacity-80">
          <Feather name="plus" size={16} color="#ffffff" />
          <Text className="font-manrope-medium text-base text-on-primary">Add Item</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function GroceryScreen() {
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [listSheetVisible, setListSheetVisible] = useState(false);
  const [itemSheetVisible, setItemSheetVisible] = useState(false);

  const { lists, loading: listsLoading, createList, deleteList } = useGroceryLists();
  const { items, loading: itemsLoading, addItem, toggleItem, deleteItem, clearChecked } = useGroceryItems(selectedListId);

  const selectedList = lists.find((l) => l.id === selectedListId);

  if (selectedListId && selectedList) {
    return (
      <>
        <ItemsView
          listName={selectedList.name}
          loading={itemsLoading}
          onBack={() => setSelectedListId(null)}
          onAddItem={() => setItemSheetVisible(true)}
          items={items}
          onToggle={toggleItem}
          onDelete={deleteItem}
          onClearChecked={clearChecked}
        />
        <AddGroceryItemSheet
          visible={itemSheetVisible}
          onClose={() => setItemSheetVisible(false)}
          onAddItem={addItem}
        />
      </>
    );
  }

  return (
    <>
      <ListsView
        lists={lists}
        loading={listsLoading}
        onSelectList={setSelectedListId}
        onDeleteList={deleteList}
        onNewList={() => setListSheetVisible(true)}
      />
      <AddGroceryListSheet
        visible={listSheetVisible}
        onClose={() => setListSheetVisible(false)}
        onCreateList={createList}
      />
    </>
  );
}
