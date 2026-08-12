export type GoalStatus = 'active' | 'completed';

export type ReminderDaysBefore = 0 | 1 | 2 | 3 | 7;

export interface Goal {
  id: string;
  title: string;
  description: string | null;
  deadline: string; // ISO date string
  reminderDaysBefore: ReminderDaysBefore | null; // null = no reminder
  notificationId: string | null;
  status: GoalStatus;
  completedAt: string | null; // ISO date string
  createdAt: string; // ISO date string
}

export interface StreakState {
  currentStreak: number;
  bestStreak: number;
  lastCompletionDate: string | null; // YYYY-MM-DD
}

export type GoalInput = {
  title: string;
  description: string | null;
  deadline: string;
  reminderDaysBefore: ReminderDaysBefore | null;
};
