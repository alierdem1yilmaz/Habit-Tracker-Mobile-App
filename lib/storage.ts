import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Goal, StreakState } from '@/types/goal';

const GOALS_KEY = '@habit_tracker/goals';
const STREAK_KEY = '@habit_tracker/streak';

const DEFAULT_STREAK: StreakState = {
  currentStreak: 0,
  bestStreak: 0,
  lastCompletionDate: null,
};

export async function getGoals(): Promise<Goal[]> {
  const raw = await AsyncStorage.getItem(GOALS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveGoals(goals: Goal[]): Promise<void> {
  await AsyncStorage.setItem(GOALS_KEY, JSON.stringify(goals));
}

export async function getStreakCache(): Promise<StreakState> {
  const raw = await AsyncStorage.getItem(STREAK_KEY);
  if (!raw) return DEFAULT_STREAK;
  try {
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_STREAK, ...parsed };
  } catch {
    return DEFAULT_STREAK;
  }
}

export async function saveStreakCache(streak: StreakState): Promise<void> {
  await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(streak));
}
