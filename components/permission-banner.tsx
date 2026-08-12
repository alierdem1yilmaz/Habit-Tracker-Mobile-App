import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function PermissionBanner() {
  const theme = Colors[useColorScheme() ?? 'light'];

  return (
    <View style={[styles.container, { backgroundColor: theme.warning + '22', borderColor: theme.warning }]}>
      <IconSymbol name="bell.slash.fill" size={20} color={theme.warning} />
      <View style={styles.textColumn}>
        <ThemedText type="defaultSemiBold" style={{ color: theme.warning }}>
          Bildirim izni verilmedi
        </ThemedText>
        <ThemedText style={styles.message}>
          Hatırlatmaların gönderilebilmesi için ayarlardan bildirim izni vermen gerekiyor.
        </ThemedText>
        <Pressable onPress={() => Linking.openSettings()} hitSlop={8}>
          <ThemedText type="link">Ayarlara Git</ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'flex-start',
  },
  textColumn: {
    flex: 1,
    gap: 4,
  },
  message: {
    fontSize: 13,
  },
});
