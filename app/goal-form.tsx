import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PermissionBanner } from '@/components/permission-banner';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useGoals } from '@/context/goals-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { computeReminderDate, REMINDER_OPTIONS } from '@/lib/goal-utils';
import { getPermissionState } from '@/lib/notifications';
import type { ReminderDaysBefore } from '@/types/goal';

function openAndroidDateTimePicker(current: Date, onPicked: (date: Date) => void) {
  DateTimePickerAndroid.open({
    value: current,
    mode: 'date',
    minimumDate: new Date(),
    onChange: (event, pickedDate) => {
      if (event.type !== 'set' || !pickedDate) return;
      DateTimePickerAndroid.open({
        value: current,
        mode: 'time',
        onChange: (timeEvent, pickedTime) => {
          if (timeEvent.type !== 'set' || !pickedTime) return;
          const combined = new Date(pickedDate);
          combined.setHours(pickedTime.getHours(), pickedTime.getMinutes(), 0, 0);
          onPicked(combined);
        },
      });
    },
  });
}

export default function GoalFormScreen() {
  const theme = Colors[useColorScheme() ?? 'light'];
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { goals, addGoal, updateGoal } = useGoals();

  const existingGoal = useMemo(() => goals.find((g) => g.id === id), [goals, id]);
  const isEdit = Boolean(existingGoal);

  const [title, setTitle] = useState(existingGoal?.title ?? '');
  const [description, setDescription] = useState(existingGoal?.description ?? '');
  const [deadline, setDeadline] = useState<Date>(
    existingGoal ? new Date(existingGoal.deadline) : new Date(Date.now() + 60 * 60 * 1000)
  );
  const [reminderDaysBefore, setReminderDaysBefore] = useState<ReminderDaysBefore | null>(
    existingGoal?.reminderDaysBefore ?? null
  );
  const [showIosPicker, setShowIosPicker] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    if (reminderDaysBefore === null) return;
    getPermissionState().then((state) => setPermissionDenied(state === 'denied'));
  }, [reminderDaysBefore]);

  const titleError = submitted && title.trim().length === 0 ? 'Başlık zorunludur.' : null;
  const deadlineError = deadline.getTime() <= Date.now() ? 'Bitiş tarihi geçmişte olamaz.' : null;

  const reminderWarning = useMemo(() => {
    if (reminderDaysBefore === null) return null;
    const reminderDate = computeReminderDate(deadline.toISOString(), reminderDaysBefore);
    if (reminderDate && reminderDate.getTime() <= Date.now()) {
      return 'Hesaplanan hatırlatma zamanı geçmişte kaldığı için bildirim planlanmayacak.';
    }
    return null;
  }, [deadline, reminderDaysBefore]);

  const handleDeadlinePress = () => {
    if (Platform.OS === 'android') {
      openAndroidDateTimePicker(deadline, setDeadline);
    } else {
      setShowIosPicker((prev) => !prev);
    }
  };

  const handleSave = async () => {
    setSubmitted(true);
    if (title.trim().length === 0 || deadlineError) return;

    setSaving(true);
    const input = {
      title: title.trim(),
      description: description.trim().length > 0 ? description.trim() : null,
      deadline: deadline.toISOString(),
      reminderDaysBefore,
    };
    if (isEdit && existingGoal) {
      await updateGoal(existingGoal.id, input);
    } else {
      await addGoal(input);
    }
    setSaving(false);
    router.back();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['bottom']}>
      <Stack.Screen options={{ title: isEdit ? 'Hedefi Düzenle' : 'Yeni Hedef' }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.field}>
          <ThemedText type="defaultSemiBold">Başlık *</ThemedText>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Örn. Her gün 30 dakika koş"
            placeholderTextColor={theme.muted}
            style={[styles.input, { color: theme.text, borderColor: titleError ? theme.danger : theme.border, backgroundColor: theme.card }]}
            maxLength={100}
          />
          {titleError && <ThemedText style={[styles.errorText, { color: theme.danger }]}>{titleError}</ThemedText>}
        </View>

        <View style={styles.field}>
          <ThemedText type="defaultSemiBold">Açıklama (opsiyonel)</ThemedText>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Detay ekle..."
            placeholderTextColor={theme.muted}
            style={[styles.input, styles.multiline, { color: theme.text, borderColor: theme.border, backgroundColor: theme.card }]}
            multiline
            numberOfLines={3}
            maxLength={300}
          />
        </View>

        <View style={styles.field}>
          <ThemedText type="defaultSemiBold">Bitiş Tarihi *</ThemedText>
          <Pressable
            onPress={handleDeadlinePress}
            style={[styles.input, { borderColor: deadlineError ? theme.danger : theme.border, backgroundColor: theme.card }]}>
            <ThemedText>
              {deadline.toLocaleString('tr-TR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </ThemedText>
          </Pressable>
          {deadlineError && <ThemedText style={[styles.errorText, { color: theme.danger }]}>{deadlineError}</ThemedText>}
          {Platform.OS === 'ios' && showIosPicker && (
            <DateTimePicker
              value={deadline}
              mode="datetime"
              display="spinner"
              minimumDate={new Date()}
              onChange={(_event, selectedDate) => {
                if (selectedDate) setDeadline(selectedDate);
              }}
            />
          )}
        </View>

        <View style={styles.field}>
          <ThemedText type="defaultSemiBold">Hatırlatma</ThemedText>
          <View style={styles.chipRow}>
            {REMINDER_OPTIONS.map((option) => {
              const isSelected = option.value === reminderDaysBefore;
              return (
                <Pressable
                  key={String(option.value)}
                  onPress={() => setReminderDaysBefore(option.value as ReminderDaysBefore | null)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isSelected ? theme.tint : theme.card,
                      borderColor: isSelected ? theme.tint : theme.border,
                    },
                  ]}>
                  <ThemedText style={{ color: isSelected ? '#fff' : theme.text, fontSize: 13 }}>
                    {option.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
          {reminderWarning && (
            <ThemedText style={[styles.errorText, { color: theme.warning }]}>{reminderWarning}</ThemedText>
          )}
          {permissionDenied && (
            <View style={{ marginTop: 8 }}>
              <PermissionBanner />
            </View>
          )}
        </View>

        <Pressable
          onPress={handleSave}
          disabled={saving}
          style={[styles.saveButton, { backgroundColor: theme.tint, opacity: saving ? 0.6 : 1 }]}>
          <ThemedText type="defaultSemiBold" style={{ color: '#fff' }}>
            {isEdit ? 'Kaydet' : 'Hedefi Oluştur'}
          </ThemedText>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 20,
  },
  field: {
    gap: 8,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  saveButton: {
    marginTop: 12,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
});
