import { Pressable, StyleSheet, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatReminderLabel, formatRelativeDeadline, isOverdue } from '@/lib/goal-utils';
import type { Goal } from '@/types/goal';

interface GoalCardProps {
  goal: Goal;
  now: Date;
  onComplete: () => void;
  onUndo: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function GoalCard({ goal, now, onComplete, onUndo, onEdit, onDelete }: GoalCardProps) {
  const theme = Colors[useColorScheme() ?? 'light'];
  const overdue = isOverdue(goal, now);
  const completed = goal.status === 'completed';

  const accentColor = completed ? theme.success : overdue ? theme.danger : theme.primary;

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, borderLeftColor: accentColor }]}>
      <View style={styles.row}>
        <Pressable
          onPress={completed ? onUndo : onComplete}
          hitSlop={8}
          style={({ pressed }) => [styles.checkButton, { opacity: pressed ? 0.6 : 1 }]}
          accessibilityLabel={completed ? 'Geri al' : 'Tamamlandı olarak işaretle'}>
          <IconSymbol
            name={completed ? 'checkmark.circle.fill' : 'circle'}
            size={26}
            color={completed ? theme.success : theme.primary}
          />
        </Pressable>

        <View style={styles.content}>
          <ThemedText
            type="defaultSemiBold"
            style={completed ? styles.strikethrough : undefined}
            numberOfLines={2}>
            {goal.title}
          </ThemedText>

          {goal.description ? (
            <ThemedText style={[styles.description, { color: theme.muted }]} numberOfLines={2}>
              {goal.description}
            </ThemedText>
          ) : null}

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <ThemedText style={[styles.metaText, { color: overdue ? theme.danger : theme.muted }]}>
                {formatRelativeDeadline(goal, now)}
              </ThemedText>
            </View>
            {goal.reminderDaysBefore !== null && (
              <View style={styles.metaItem}>
                <IconSymbol name="bell.fill" size={12} color={theme.muted} />
                <ThemedText style={[styles.metaText, { color: theme.muted }]}>
                  {formatReminderLabel(goal.reminderDaysBefore)}
                </ThemedText>
              </View>
            )}
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={onEdit}
            hitSlop={8}
            style={({ pressed }) => [styles.actionButton, { opacity: pressed ? 0.5 : 1 }]}
            accessibilityLabel="Düzenle">
            <IconSymbol name="pencil" size={18} color={theme.muted} />
          </Pressable>
          <Pressable
            onPress={onDelete}
            hitSlop={8}
            style={({ pressed }) => [styles.actionButton, { opacity: pressed ? 0.5 : 1 }]}
            accessibilityLabel="Sil">
            <IconSymbol name="trash" size={18} color={theme.danger} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderLeftWidth: 4,
    padding: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  checkButton: {
    paddingTop: 2,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  description: {
    fontSize: 13,
  },
  strikethrough: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 2,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 4,
  },
  actionButton: {
    padding: 4,
  },
});
