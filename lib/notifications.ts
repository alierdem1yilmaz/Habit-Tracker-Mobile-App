import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { computeReminderDate } from '@/lib/goal-utils';
import type { Goal } from '@/types/goal';

export type PermissionState = 'granted' | 'denied' | 'undetermined';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function setupAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('default', {
    name: 'Hedef Hatırlatmaları',
    importance: Notifications.AndroidImportance.HIGH,
  });
}

export async function getPermissionState(): Promise<PermissionState> {
  const result = await Notifications.getPermissionsAsync();
  return toPermissionState(result);
}

export async function ensurePermission(): Promise<PermissionState> {
  const existing = await Notifications.getPermissionsAsync();
  if (toPermissionState(existing) === 'granted') return 'granted';
  const requested = await Notifications.requestPermissionsAsync();
  return toPermissionState(requested);
}

function toPermissionState(result: Notifications.NotificationPermissionsStatus): PermissionState {
  if (Platform.OS === 'ios') {
    if (result.ios?.status === Notifications.IosAuthorizationStatus.AUTHORIZED ||
        result.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
      return 'granted';
    }
    if (result.ios?.status === Notifications.IosAuthorizationStatus.DENIED) return 'denied';
    return 'undetermined';
  }
  if (result.status === 'granted') return 'granted';
  if (result.status === 'denied') return 'denied';
  return 'undetermined';
}

/**
 * Schedules a local reminder for a goal if its reminder time is still in the
 * future. Returns the new notification id, or null if nothing was scheduled
 * (no reminder set, permission missing, or the reminder time already passed).
 */
export async function scheduleReminder(goal: Pick<Goal, 'title' | 'deadline' | 'reminderDaysBefore'>): Promise<string | null> {
  const reminderDate = computeReminderDate(goal.deadline, goal.reminderDaysBefore);
  if (!reminderDate || reminderDate.getTime() <= Date.now()) return null;

  const permission = await ensurePermission();
  if (permission !== 'granted') return null;

  await setupAndroidChannel();

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: `Hedef hatırlatması: ${goal.title}`,
      body: 'Bu hedefinin bitiş tarihi yaklaşıyor.',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: reminderDate,
      channelId: 'default',
    },
  });
  return id;
}

export async function cancelReminder(notificationId: string | null): Promise<void> {
  if (!notificationId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch {
    // Already fired or cancelled — nothing to do.
  }
}
