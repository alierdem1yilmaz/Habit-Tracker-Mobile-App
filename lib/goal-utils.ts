import type { Goal, ReminderDaysBefore } from '@/types/goal';

export function isOverdue(goal: Goal, now: Date = new Date()): boolean {
  return goal.status === 'active' && new Date(goal.deadline).getTime() < now.getTime();
}

export function formatDeadline(deadline: string): string {
  const date = new Date(deadline);
  return date.toLocaleString('tr-TR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeDeadline(goal: Goal, now: Date = new Date()): string {
  const diffMs = new Date(goal.deadline).getTime() - now.getTime();
  const diffMinutes = Math.round(diffMs / 60000);
  const diffHours = Math.round(diffMs / 3600000);
  const diffDays = Math.round(diffMs / 86400000);

  if (goal.status === 'completed') return 'Tamamlandı';

  if (diffMs >= 0) {
    if (diffMinutes < 60) return `${Math.max(diffMinutes, 0)} dakika kaldı`;
    if (diffHours < 24) return `${diffHours} saat kaldı`;
    return `${diffDays} gün kaldı`;
  }

  const overdueMinutes = Math.abs(diffMinutes);
  const overdueHours = Math.abs(diffHours);
  const overdueDays = Math.abs(diffDays);
  if (overdueMinutes < 60) return `${overdueMinutes} dakika gecikti`;
  if (overdueHours < 24) return `${overdueHours} saat gecikti`;
  return `${overdueDays} gün gecikti`;
}

export const REMINDER_OPTIONS: { value: ReminderDaysBefore | null; label: string }[] = [
  { value: null, label: 'Yok' },
  { value: 0, label: 'Aynı gün' },
  { value: 1, label: '1 gün önce' },
  { value: 2, label: '2 gün önce' },
  { value: 3, label: '3 gün önce' },
  { value: 7, label: '1 hafta önce' },
];

export function formatReminderLabel(reminderDaysBefore: ReminderDaysBefore | null): string {
  const found = REMINDER_OPTIONS.find((o) => o.value === reminderDaysBefore);
  return found ? found.label : 'Yok';
}

export function computeReminderDate(deadline: string, daysBefore: ReminderDaysBefore | null): Date | null {
  if (daysBefore === null) return null;
  const date = new Date(deadline);
  date.setDate(date.getDate() - daysBefore);
  return date;
}
