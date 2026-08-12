import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { generateId } from '@/lib/id';
import { cancelReminder, scheduleReminder, setupAndroidChannel } from '@/lib/notifications';
import { getGoals, getStreakCache, saveGoals, saveStreakCache } from '@/lib/storage';
import { computeStreakState } from '@/lib/streak';
import type { Goal, GoalInput, StreakState } from '@/types/goal';

interface GoalsContextValue {
  goals: Goal[];
  streak: StreakState;
  isLoading: boolean;
  now: Date;
  addGoal: (input: GoalInput) => Promise<void>;
  updateGoal: (id: string, input: GoalInput) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  completeGoal: (id: string) => Promise<void>;
  undoComplete: (id: string) => Promise<void>;
}

const GoalsContext = createContext<GoalsContextValue | null>(null);

export function GoalsProvider({ children }: { children: React.ReactNode }) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [streak, setStreak] = useState<StreakState>({ currentStreak: 0, bestStreak: 0, lastCompletionDate: null });
  const [isLoading, setIsLoading] = useState(true);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    setupAndroidChannel();
    (async () => {
      const [loadedGoals, loadedStreak] = await Promise.all([getGoals(), getStreakCache()]);
      setGoals(loadedGoals);
      setStreak(computeStreakState(loadedGoals, loadedStreak.bestStreak));
      setIsLoading(false);
    })();
  }, []);

  // Keeps derived "overdue" status live without requiring user interaction.
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const persist = useCallback(async (nextGoals: Goal[]) => {
    setGoals(nextGoals);
    await saveGoals(nextGoals);
    setStreak((prevStreak) => {
      const next = computeStreakState(nextGoals, prevStreak.bestStreak);
      saveStreakCache(next);
      return next;
    });
  }, []);

  const addGoal = useCallback(
    async (input: GoalInput) => {
      const notificationId = await scheduleReminder(input);
      const goal: Goal = {
        id: generateId(),
        title: input.title,
        description: input.description,
        deadline: input.deadline,
        reminderDaysBefore: input.reminderDaysBefore,
        notificationId,
        status: 'active',
        completedAt: null,
        createdAt: new Date().toISOString(),
      };
      await persist([goal, ...goals]);
    },
    [goals, persist]
  );

  const updateGoal = useCallback(
    async (id: string, input: GoalInput) => {
      const target = goals.find((g) => g.id === id);
      if (!target) return;
      await cancelReminder(target.notificationId);
      const notificationId = await scheduleReminder(input);
      const nextGoals = goals.map((g) =>
        g.id === id
          ? {
              ...g,
              title: input.title,
              description: input.description,
              deadline: input.deadline,
              reminderDaysBefore: input.reminderDaysBefore,
              notificationId,
            }
          : g
      );
      await persist(nextGoals);
    },
    [goals, persist]
  );

  const deleteGoal = useCallback(
    async (id: string) => {
      const target = goals.find((g) => g.id === id);
      if (target) await cancelReminder(target.notificationId);
      await persist(goals.filter((g) => g.id !== id));
    },
    [goals, persist]
  );

  const completeGoal = useCallback(
    async (id: string) => {
      const target = goals.find((g) => g.id === id);
      if (target) await cancelReminder(target.notificationId);
      const nextGoals = goals.map((g) =>
        g.id === id
          ? { ...g, status: 'completed' as const, completedAt: new Date().toISOString(), notificationId: null }
          : g
      );
      await persist(nextGoals);
    },
    [goals, persist]
  );

  const undoComplete = useCallback(
    async (id: string) => {
      const target = goals.find((g) => g.id === id);
      if (!target) return;
      const notificationId = await scheduleReminder(target);
      const nextGoals = goals.map((g) =>
        g.id === id ? { ...g, status: 'active' as const, completedAt: null, notificationId } : g
      );
      await persist(nextGoals);
    },
    [goals, persist]
  );

  const value = useMemo<GoalsContextValue>(
    () => ({ goals, streak, isLoading, now, addGoal, updateGoal, deleteGoal, completeGoal, undoComplete }),
    [goals, streak, isLoading, now, addGoal, updateGoal, deleteGoal, completeGoal, undoComplete]
  );

  return <GoalsContext.Provider value={value}>{children}</GoalsContext.Provider>;
}

export function useGoals(): GoalsContextValue {
  const ctx = useContext(GoalsContext);
  if (!ctx) throw new Error('useGoals must be used within a GoalsProvider');
  return ctx;
}
