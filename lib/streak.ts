import type { Goal, StreakState } from '@/types/goal';

/** Local-timezone YYYY-MM-DD key (not UTC, so streaks match the user's own day). */
export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDaysToKey(dateKey: string, days: number): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  d.setDate(d.getDate() + days);
  return toDateKey(d);
}

export function getCompletionDateStrings(goals: Goal[]): Set<string> {
  const dates = new Set<string>();
  for (const goal of goals) {
    if (goal.status === 'completed' && goal.completedAt) {
      dates.add(toDateKey(new Date(goal.completedAt)));
    }
  }
  return dates;
}

/**
 * Walks backward from today (or yesterday, if today has no completion yet —
 * a day only "breaks" the streak once it's fully over) counting consecutive
 * completed days. Returns 0 if neither today nor yesterday has a completion.
 */
export function computeCurrentStreak(dateSet: Set<string>, todayKey: string): number {
  const yesterdayKey = addDaysToKey(todayKey, -1);

  let anchor: string;
  if (dateSet.has(todayKey)) {
    anchor = todayKey;
  } else if (dateSet.has(yesterdayKey)) {
    anchor = yesterdayKey;
  } else {
    return 0;
  }

  let streak = 0;
  let cursor = anchor;
  while (dateSet.has(cursor)) {
    streak++;
    cursor = addDaysToKey(cursor, -1);
  }
  return streak;
}

export function computeStreakState(goals: Goal[], previousBest: number, now: Date = new Date()): StreakState {
  const dateSet = getCompletionDateStrings(goals);
  const todayKey = toDateKey(now);
  const currentStreak = computeCurrentStreak(dateSet, todayKey);

  let lastCompletionDate: string | null = null;
  for (const key of dateSet) {
    if (!lastCompletionDate || key > lastCompletionDate) {
      lastCompletionDate = key;
    }
  }

  return {
    currentStreak,
    bestStreak: Math.max(previousBest, currentStreak),
    lastCompletionDate,
  };
}
