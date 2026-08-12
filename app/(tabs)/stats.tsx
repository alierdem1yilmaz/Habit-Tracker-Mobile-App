import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useGoals } from '@/context/goals-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { addDaysToKey, getCompletionDateStrings, toDateKey } from '@/lib/streak';
import { isOverdue } from '@/lib/goal-utils';

const DAY_LABELS = ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'];

export default function StatsScreen() {
  const theme = Colors[useColorScheme() ?? 'light'];
  const { goals, streak, now } = useGoals();

  const counts = useMemo(() => {
    let active = 0;
    let overdue = 0;
    let completed = 0;
    for (const goal of goals) {
      if (goal.status === 'completed') completed++;
      else if (isOverdue(goal, now)) overdue++;
      else active++;
    }
    return { active, overdue, completed };
  }, [goals, now]);

  const last14Days = useMemo(() => {
    const dateSet = getCompletionDateStrings(goals);
    const todayKey = toDateKey(now);
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const key = addDaysToKey(todayKey, -i);
      const date = new Date(key);
      days.push({
        key,
        completed: dateSet.has(key),
        label: DAY_LABELS[(date.getDay() + 6) % 7],
      });
    }
    return days;
  }, [goals, now]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title">İstatistikler</ThemedText>

        <View style={styles.streakRow}>
          <ThemedView style={[styles.streakCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <IconSymbol name="flame.fill" size={28} color={theme.warning} />
            <ThemedText type="title" style={styles.streakNumber}>
              {streak.currentStreak}
            </ThemedText>
            <ThemedText style={{ color: theme.muted }}>Güncel Streak</ThemedText>
          </ThemedView>
          <ThemedView style={[styles.streakCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <IconSymbol name="checkmark.circle.fill" size={28} color={theme.success} />
            <ThemedText type="title" style={styles.streakNumber}>
              {streak.bestStreak}
            </ThemedText>
            <ThemedText style={{ color: theme.muted }}>En İyi Streak</ThemedText>
          </ThemedView>
        </View>

        <ThemedText style={{ color: theme.muted }}>
          {streak.lastCompletionDate
            ? `Son tamamlama: ${streak.lastCompletionDate}`
            : 'Henüz hiçbir hedef tamamlanmadı.'}
        </ThemedText>

        <ThemedView style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Son 14 Gün
          </ThemedText>
          <View style={styles.dayStrip}>
            {last14Days.map((day) => (
              <View key={day.key} style={styles.dayColumn}>
                <View
                  style={[
                    styles.dayDot,
                    {
                      backgroundColor: day.completed ? theme.success : theme.border,
                    },
                  ]}
                />
                <ThemedText style={[styles.dayLabel, { color: theme.muted }]}>{day.label}</ThemedText>
              </View>
            ))}
          </View>
        </ThemedView>

        <ThemedView style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Hedef Özeti
          </ThemedText>
          <View style={styles.countRow}>
            <CountItem label="Aktif" value={counts.active} color={theme.primary} />
            <CountItem label="Gecikmiş" value={counts.overdue} color={theme.danger} />
            <CountItem label="Tamamlandı" value={counts.completed} color={theme.success} />
          </View>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

function CountItem({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.countItem}>
      <ThemedText type="title" style={{ color, fontSize: 24 }}>
        {value}
      </ThemedText>
      <ThemedText style={styles.countLabel}>{label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  streakRow: {
    flexDirection: 'row',
    gap: 12,
  },
  streakCard: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 20,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  streakNumber: {
    fontSize: 36,
  },
  section: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    marginBottom: 4,
  },
  dayStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayColumn: {
    alignItems: 'center',
    gap: 6,
  },
  dayDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  dayLabel: {
    fontSize: 10,
  },
  countRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  countItem: {
    alignItems: 'center',
    gap: 2,
  },
  countLabel: {
    fontSize: 12,
  },
});
