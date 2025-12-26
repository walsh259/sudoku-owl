import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Difficulty, Stats } from '../types';

// Game history entry
export interface GameHistoryEntry {
  id: string;
  date: string; // ISO date string
  difficulty: Difficulty;
  time: number; // seconds
  score: number; // points earned
  isDaily: boolean;
  dailyDate?: string; // YYYY-MM-DD for daily challenges
}

/**
 * Calculate score for completing a puzzle
 * Base points by difficulty: Easy=100, Medium=200, Hard=300
 * Time bonus: Up to 2x multiplier for fast completion
 * Daily bonus: +50 points
 * Streak bonus: +10 points per streak day (up to 100)
 */
export function calculateScore(
  difficulty: Difficulty,
  timeSeconds: number,
  isDaily: boolean,
  currentStreak: number
): number {
  // Base points by difficulty
  const basePoints: Record<Difficulty, number> = {
    easy: 100,
    medium: 200,
    hard: 300,
  };

  // Target times for max time bonus (in seconds)
  const targetTimes: Record<Difficulty, number> = {
    easy: 180,   // 3 minutes
    medium: 300, // 5 minutes
    hard: 600,   // 10 minutes
  };

  let score = basePoints[difficulty];

  // Time bonus: faster = more points (up to 2x)
  // If completed in half the target time or less, get full 2x
  // If completed at target time, get 1x
  // If completed slower, still get base points (no penalty)
  const targetTime = targetTimes[difficulty];
  if (timeSeconds < targetTime) {
    const timeRatio = timeSeconds / targetTime;
    // Linear interpolation: at 0 time = 2x, at target time = 1x
    const timeMultiplier = 2 - timeRatio;
    score = Math.round(score * timeMultiplier);
  }

  // Daily challenge bonus
  if (isDaily) {
    score += 50;
  }

  // Streak bonus: +10 per day, max +100
  const streakBonus = Math.min(currentStreak * 10, 100);
  score += streakBonus;

  return score;
}

// Daily challenge completion record
export interface DailyCompletion {
  date: string; // YYYY-MM-DD
  time: number;
  completedAt: string; // ISO timestamp
}

interface StatsStore extends Stats {
  // Game history (last 100 games)
  gameHistory: GameHistoryEntry[];

  // Daily challenge completions
  dailyCompletions: DailyCompletion[];

  // Total score
  totalScore: number;

  // Last game score (for display on win screen)
  lastGameScore: number;

  // Actions
  recordWin: (difficulty: Difficulty, time: number, isDaily?: boolean, dailyDate?: string) => void;
  recordLoss: () => void;
  resetStats: () => void;
  loadMockData: () => void; // For screenshots

  // Daily challenge actions
  markDailyComplete: (date: string, time: number) => void;
  isDailyComplete: (date: string) => boolean;
  getDailyCompletion: (date: string) => DailyCompletion | undefined;
  getCompletedDaysInMonth: (year: number, month: number) => string[];

  // Computed getters
  getWinRate: () => number;
  getBestTimeFormatted: (difficulty: Difficulty) => string;
  getAverageTime: (difficulty: Difficulty) => number | null;
  getAverageTimeFormatted: (difficulty: Difficulty) => string;
  getRecentAverageTime: (difficulty: Difficulty, days?: number) => number | null;
  getImprovementTrend: (difficulty: Difficulty) => 'improving' | 'steady' | 'declining' | 'none';
  getGamesCountByDifficulty: (difficulty: Difficulty) => number;
  getTotalPlayTime: () => number;
  getTotalScore: () => number;
  getHighScore: () => number;
  getMilestones: () => Milestone[];
}

// Milestone definitions
export interface Milestone {
  id: string;
  title: string;
  description: string;
  achieved: boolean;
  achievedDate?: string;
}

const initialStats: Stats = {
  gamesPlayed: 0,
  gamesWon: 0,
  bestTime: {
    easy: null,
    medium: null,
    hard: null,
  },
  currentStreak: 0,
  bestStreak: 0,
  lastPlayed: null,
};

/**
 * Formats seconds into MM:SS or HH:MM:SS
 */
function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Generate mock data for screenshots
function generateMockData() {
  const now = new Date();
  const gameHistory: GameHistoryEntry[] = [];
  const dailyCompletions: DailyCompletion[] = [];

  // Generate 47 games over the past 2 months
  const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];
  for (let i = 0; i < 47; i++) {
    const daysAgo = Math.floor(Math.random() * 60);
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);

    const difficulty = difficulties[Math.floor(Math.random() * 3)];
    const baseTime = difficulty === 'easy' ? 180 : difficulty === 'medium' ? 360 : 600;
    const time = baseTime + Math.floor(Math.random() * 300) - 100;

    gameHistory.push({
      id: `mock-${i}`,
      date: date.toISOString(),
      difficulty,
      time: Math.max(60, time),
      score: calculateScore(difficulty, time, false, i % 10),
      isDaily: false,
    });
  }

  // Generate daily completions for most of the current month
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();

  // Complete most days this month (skip a few for realism)
  const skippedDays = [5, 12, 19]; // Days to skip
  for (let day = 1; day <= today; day++) {
    if (skippedDays.includes(day)) continue;

    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const time = 180 + Math.floor(Math.random() * 300);

    dailyCompletions.push({
      date: dateStr,
      time,
      completedAt: new Date(year, month, day, 12, 0, 0).toISOString(),
    });
  }

  // Add some from last month too
  const lastMonth = month === 0 ? 11 : month - 1;
  const lastMonthYear = month === 0 ? year - 1 : year;
  for (let day = 15; day <= 28; day++) {
    const dateStr = `${lastMonthYear}-${String(lastMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const time = 200 + Math.floor(Math.random() * 250);

    dailyCompletions.push({
      date: dateStr,
      time,
      completedAt: new Date(lastMonthYear, lastMonth, day, 12, 0, 0).toISOString(),
    });
  }

  const totalScore = gameHistory.reduce((sum, g) => sum + g.score, 0);

  return {
    gamesPlayed: 52,
    gamesWon: 47,
    bestTime: {
      easy: 142,    // 2:22
      medium: 289,  // 4:49
      hard: 512,    // 8:32
    },
    currentStreak: 7,
    bestStreak: 14,
    lastPlayed: now.toISOString(),
    gameHistory,
    dailyCompletions,
    totalScore,
    lastGameScore: 285,
  };
}

export const useStatsStore = create<StatsStore>()(
  persist(
    (set, get) => ({
      ...initialStats,
      gameHistory: [],
      dailyCompletions: [],
      totalScore: 0,
      lastGameScore: 0,

      recordWin: (difficulty, time, isDaily = false, dailyDate) => {
        const { bestTime, currentStreak, bestStreak, gamesPlayed, gamesWon, gameHistory, totalScore } =
          get();

        const newStreak = currentStreak + 1;
        const currentBest = bestTime[difficulty];

        // Calculate score for this game
        const gameScore = calculateScore(difficulty, time, isDaily, currentStreak);

        // Create history entry
        const historyEntry: GameHistoryEntry = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          date: new Date().toISOString(),
          difficulty,
          time,
          score: gameScore,
          isDaily,
          dailyDate,
        };

        // Keep last 100 games
        const newHistory = [historyEntry, ...gameHistory].slice(0, 100);

        set({
          gamesPlayed: gamesPlayed + 1,
          gamesWon: gamesWon + 1,
          bestTime: {
            ...bestTime,
            [difficulty]:
              currentBest === null ? time : Math.min(currentBest, time),
          },
          currentStreak: newStreak,
          bestStreak: Math.max(bestStreak, newStreak),
          lastPlayed: new Date().toISOString(),
          gameHistory: newHistory,
          totalScore: totalScore + gameScore,
          lastGameScore: gameScore,
        });

        // Also mark daily as complete if applicable
        if (isDaily && dailyDate) {
          get().markDailyComplete(dailyDate, time);
        }
      },

      recordLoss: () => {
        const { gamesPlayed } = get();
        set({
          gamesPlayed: gamesPlayed + 1,
          currentStreak: 0,
          lastPlayed: new Date().toISOString(),
        });
      },

      resetStats: () => {
        set({
          ...initialStats,
          gameHistory: [],
          dailyCompletions: [],
          totalScore: 0,
          lastGameScore: 0,
        });
      },

      loadMockData: () => {
        const mockData = generateMockData();
        set(mockData);
      },

      // Daily challenge methods
      markDailyComplete: (date, time) => {
        const { dailyCompletions } = get();

        // Don't duplicate
        if (dailyCompletions.some(d => d.date === date)) return;

        const completion: DailyCompletion = {
          date,
          time,
          completedAt: new Date().toISOString(),
        };

        set({
          dailyCompletions: [...dailyCompletions, completion],
        });
      },

      isDailyComplete: (date) => {
        const { dailyCompletions } = get();
        return dailyCompletions.some(d => d.date === date);
      },

      getDailyCompletion: (date) => {
        const { dailyCompletions } = get();
        return dailyCompletions.find(d => d.date === date);
      },

      getCompletedDaysInMonth: (year, month) => {
        const { dailyCompletions } = get();
        const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
        return dailyCompletions
          .filter(d => d.date.startsWith(prefix))
          .map(d => d.date);
      },

      // Stat getters
      getWinRate: () => {
        const { gamesPlayed, gamesWon } = get();
        if (gamesPlayed === 0) return 0;
        return Math.round((gamesWon / gamesPlayed) * 100);
      },

      getBestTimeFormatted: (difficulty) => {
        const { bestTime } = get();
        const time = bestTime[difficulty];
        if (time === null) return '--:--';
        return formatTime(time);
      },

      getAverageTime: (difficulty) => {
        const { gameHistory } = get();
        const games = gameHistory.filter(g => g.difficulty === difficulty);
        if (games.length === 0) return null;
        const total = games.reduce((sum, g) => sum + g.time, 0);
        return Math.round(total / games.length);
      },

      getAverageTimeFormatted: (difficulty) => {
        const avg = get().getAverageTime(difficulty);
        if (avg === null) return '--:--';
        return formatTime(avg);
      },

      getRecentAverageTime: (difficulty, days = 7) => {
        const { gameHistory } = get();
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);

        const recentGames = gameHistory.filter(g =>
          g.difficulty === difficulty &&
          new Date(g.date) >= cutoff
        );

        if (recentGames.length === 0) return null;
        const total = recentGames.reduce((sum, g) => sum + g.time, 0);
        return Math.round(total / recentGames.length);
      },

      getImprovementTrend: (difficulty) => {
        const { gameHistory } = get();
        const games = gameHistory.filter(g => g.difficulty === difficulty);

        if (games.length < 4) return 'none';

        // Compare last 5 games average to previous 5 games average
        const recent = games.slice(0, Math.min(5, games.length));
        const previous = games.slice(5, Math.min(10, games.length));

        if (previous.length < 2) return 'none';

        const recentAvg = recent.reduce((sum, g) => sum + g.time, 0) / recent.length;
        const previousAvg = previous.reduce((sum, g) => sum + g.time, 0) / previous.length;

        const percentChange = ((previousAvg - recentAvg) / previousAvg) * 100;

        if (percentChange > 5) return 'improving';
        if (percentChange < -5) return 'declining';
        return 'steady';
      },

      getGamesCountByDifficulty: (difficulty) => {
        const { gameHistory } = get();
        return gameHistory.filter(g => g.difficulty === difficulty).length;
      },

      getTotalPlayTime: () => {
        const { gameHistory } = get();
        return gameHistory.reduce((sum, g) => sum + g.time, 0);
      },

      getTotalScore: () => {
        const { totalScore } = get();
        return totalScore;
      },

      getHighScore: () => {
        const { gameHistory } = get();
        if (gameHistory.length === 0) return 0;
        return Math.max(...gameHistory.map(g => g.score || 0));
      },

      getMilestones: () => {
        const { gamesWon, bestTime, bestStreak, gameHistory, dailyCompletions, totalScore } = get();
        const highScore = gameHistory.length > 0 ? Math.max(...gameHistory.map(g => g.score || 0)) : 0;

        const milestones: Milestone[] = [
          {
            id: 'first_win',
            title: 'First Victory',
            description: 'Complete your first puzzle',
            achieved: gamesWon >= 1,
          },
          {
            id: 'ten_wins',
            title: 'Getting Started',
            description: 'Complete 10 puzzles',
            achieved: gamesWon >= 10,
          },
          {
            id: 'fifty_wins',
            title: 'Dedicated Player',
            description: 'Complete 50 puzzles',
            achieved: gamesWon >= 50,
          },
          {
            id: 'hundred_wins',
            title: 'Sudoku Master',
            description: 'Complete 100 puzzles',
            achieved: gamesWon >= 100,
          },
          {
            id: 'streak_7',
            title: 'Week Warrior',
            description: 'Achieve a 7-day win streak',
            achieved: bestStreak >= 7,
          },
          {
            id: 'streak_30',
            title: 'Monthly Champion',
            description: 'Achieve a 30-day win streak',
            achieved: bestStreak >= 30,
          },
          {
            id: 'easy_sub3',
            title: 'Speed Demon (Easy)',
            description: 'Complete an easy puzzle in under 3 minutes',
            achieved: bestTime.easy !== null && bestTime.easy < 180,
          },
          {
            id: 'medium_sub5',
            title: 'Speed Demon (Medium)',
            description: 'Complete a medium puzzle in under 5 minutes',
            achieved: bestTime.medium !== null && bestTime.medium < 300,
          },
          {
            id: 'hard_sub10',
            title: 'Speed Demon (Hard)',
            description: 'Complete a hard puzzle in under 10 minutes',
            achieved: bestTime.hard !== null && bestTime.hard < 600,
          },
          {
            id: 'all_difficulties',
            title: 'Well Rounded',
            description: 'Complete a puzzle on each difficulty',
            achieved: bestTime.easy !== null && bestTime.medium !== null && bestTime.hard !== null,
          },
          {
            id: 'daily_7',
            title: 'Daily Devotee',
            description: 'Complete 7 daily challenges',
            achieved: dailyCompletions.length >= 7,
          },
          {
            id: 'daily_30',
            title: 'Daily Master',
            description: 'Complete 30 daily challenges',
            achieved: dailyCompletions.length >= 30,
          },
          {
            id: 'score_1k',
            title: 'Point Collector',
            description: 'Earn 1,000 total points',
            achieved: totalScore >= 1000,
          },
          {
            id: 'score_10k',
            title: 'Score Hunter',
            description: 'Earn 10,000 total points',
            achieved: totalScore >= 10000,
          },
          {
            id: 'high_score_300',
            title: 'High Scorer',
            description: 'Score 300+ points in a single game',
            achieved: highScore >= 300,
          },
          {
            id: 'high_score_500',
            title: 'Score Master',
            description: 'Score 500+ points in a single game',
            achieved: highScore >= 500,
          },
        ];

        return milestones;
      },
    }),
    {
      name: 'sudoku-owl-stats',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        gamesPlayed: state.gamesPlayed,
        gamesWon: state.gamesWon,
        bestTime: state.bestTime,
        currentStreak: state.currentStreak,
        bestStreak: state.bestStreak,
        lastPlayed: state.lastPlayed,
        gameHistory: state.gameHistory,
        dailyCompletions: state.dailyCompletions,
        totalScore: state.totalScore,
      }),
    }
  )
);

/**
 * Hook to get formatted time display
 */
export function formatTimeDisplay(seconds: number): string {
  return formatTime(seconds);
}
