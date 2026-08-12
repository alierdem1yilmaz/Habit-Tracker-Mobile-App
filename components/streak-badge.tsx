import { StyleSheet, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function StreakBadge({ streak }: { streak: number }) {
  const theme = Colors[useColorScheme() ?? 'light'];

  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <IconSymbol name="flame.fill" size={18} color={streak > 0 ? theme.warning : theme.muted} />
      <ThemedText type="defaultSemiBold" style={{ color: streak > 0 ? theme.warning : theme.muted }}>
        {streak} gün
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
