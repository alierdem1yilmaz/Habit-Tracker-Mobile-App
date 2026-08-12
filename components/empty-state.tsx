import { StyleSheet, View } from 'react-native';

import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function EmptyState({ icon, title, message }: { icon: IconSymbolName; title: string; message: string }) {
  const theme = Colors[useColorScheme() ?? 'light'];

  return (
    <View style={styles.container}>
      <IconSymbol name={icon} size={40} color={theme.muted} />
      <ThemedText type="subtitle" style={styles.title}>
        {title}
      </ThemedText>
      <ThemedText style={[styles.message, { color: theme.muted }]}>{message}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
    gap: 8,
  },
  title: {
    marginTop: 8,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
  },
});
