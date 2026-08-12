import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { GoalCard } from '@/components/goal-card';
import { StreakBadge } from '@/components/streak-badge';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useGoals } from '@/context/goals-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { isOverdue } from '@/lib/goal-utils';
import type { Goal } from '@/types/goal';

type Filter = 'active' | 'overdue' | 'completed';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'active', label: 'Aktif' },
  { key: 'overdue', label: 'Gecikmiş' },
  { key: 'completed', label: 'Tamamlandı' },
];

export default function GoalsScreen() {
  const theme = Colors[useColorScheme() ?? 'light'];
  const router = useRouter();
  const { goals, streak, now, completeGoal, undoComplete, deleteGoal } = useGoals();
  const [filter, setFilter] = useState<Filter>('active');

  const grouped = useMemo(() => {
    const active: Goal[] = [];
    const overdue: Goal[] = [];
    const completed: Goal[] = [];
    for (const goal of goals) {
      if (goal.status === 'completed') completed.push(goal);
      else if (isOverdue(goal, now)) overdue.push(goal);
      else active.push(goal);
    }
    active.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    overdue.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    completed.sort((a, b) => new Date(b.completedAt ?? 0).getTime() - new Date(a.completedAt ?? 0).getTime());
    return { active, overdue, completed };
  }, [goals, now]);

  const visibleGoals = grouped[filter];

  const handleDelete = (goal: Goal) => {
    Alert.alert('Hedefi sil', `"${goal.title}" silinsin mi? Bu işlem geri alınamaz.`, [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: () => deleteGoal(goal.id) },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top']}>
      <ThemedView style={styles.header}>
        <View>
          <ThemedText type="title">Hedeflerim</ThemedText>
          <ThemedText style={{ color: theme.muted }}>
            {goals.filter((g) => g.status === 'active').length} aktif hedef
          </ThemedText>
        </View>
        <StreakBadge streak={streak.currentStreak} />
      </ThemedView>

      <View style={styles.filterRow}>
        {FILTERS.map((f) => {
          const count = grouped[f.key].length;
          const isSelected = filter === f.key;
          return (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={({ pressed }) => [
                styles.filterChip,
                {
                  backgroundColor: isSelected ? theme.primary : theme.card,
                  borderColor: isSelected ? theme.primary : theme.border,
                  opacity: pressed ? 0.75 : 1,
                },
              ]}>
              <ThemedText
                style={[styles.filterLabel, { color: isSelected ? theme.onPrimary : theme.text }]}
                type="defaultSemiBold">
                {f.label} ({count})
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={visibleGoals}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <GoalCard
            goal={item}
            now={now}
            onComplete={() => completeGoal(item.id)}
            onUndo={() => undoComplete(item.id)}
            onEdit={() => router.push({ pathname: '/goal-form', params: { id: item.id } })}
            onDelete={() => handleDelete(item)}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={
          <EmptyState
            icon={filter === 'completed' ? 'checkmark.circle.fill' : 'checklist'}
            title={
              filter === 'active'
                ? 'Henüz aktif hedefin yok'
                : filter === 'overdue'
                  ? 'Gecikmiş hedefin yok'
                  : 'Henüz tamamlanan hedef yok'
            }
            message={
              filter === 'active'
                ? 'Aşağıdaki "Yeni Hedef" butonuyla ilk hedefini oluştur.'
                : filter === 'overdue'
                  ? 'Bitiş tarihi geçmiş hedeflerin burada görünür.'
                  : 'Tamamladığın hedefler burada listelenir.'
            }
          />
        }
      />

      <Pressable
        onPress={() => router.push('/goal-form')}
        style={({ pressed }) => [
          styles.fab,
          { backgroundColor: theme.primary, opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
        ]}
        accessibilityLabel="Yeni hedef ekle">
        <IconSymbol name="plus" size={22} color={theme.onPrimary} />
        <ThemedText type="defaultSemiBold" style={{ color: theme.onPrimary }}>
          Yeni Hedef
        </ThemedText>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  filterLabel: {
    fontSize: 13,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    flexGrow: 1,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});
