import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useTheme } from '../contexts';
import { spacing, fontSize, borderRadius } from '../constants/theme';
import { useStatsStore, formatTimeDisplay } from '../store';

interface DailyCalendarProps {
  onSelectDate: (date: string) => void;
  onWatchAdForDate: (date: string) => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Motivational messages based on streak
const getStreakMessage = (streak: number): string => {
  if (streak === 0) return 'Start your streak today!';
  if (streak === 1) return 'Great start! Keep going!';
  if (streak < 7) return 'Building momentum!';
  if (streak < 14) return "You're on fire!";
  if (streak < 30) return 'Unstoppable!';
  return 'Legendary streak!';
};

export default function DailyCalendar({ onSelectDate, onWatchAdForDate }: DailyCalendarProps) {
  const { colors } = useTheme();
  const {
    isDailyComplete,
    getDailyCompletion,
    getCompletedDaysInMonth,
    currentStreak,
    bestStreak,
  } = useStatsStore();

  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedMissedDate, setSelectedMissedDate] = useState<string | null>(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // Get days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  // Get completed days
  const completedDays = getCompletedDaysInMonth(year, month);

  // Calculate days that have passed (for progress calculation)
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();
  const daysPassed = isCurrentMonth ? today.getDate() : daysInMonth;
  const completionRate = daysPassed > 0 ? Math.round((completedDays.length / daysPassed) * 100) : 0;

  // Format date as YYYY-MM-DD
  const formatDate = (day: number): string => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  // Check if date is in the past (before today)
  const isPastDate = (day: number): boolean => {
    const date = new Date(year, month, day);
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return date < todayStart;
  };

  // Check if date is today
  const isToday = (day: number): boolean => {
    return year === today.getFullYear() &&
           month === today.getMonth() &&
           day === today.getDate();
  };

  // Check if date is in the future
  const isFutureDate = (day: number): boolean => {
    const date = new Date(year, month, day);
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return date > todayStart;
  };

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(year, month + 1, 1);
    // Don't go beyond current month
    if (nextMonth <= new Date(today.getFullYear(), today.getMonth(), 1)) {
      setViewDate(nextMonth);
    }
  };

  const handleDayPress = (day: number) => {
    const dateStr = formatDate(day);
    const isComplete = isDailyComplete(dateStr);

    if (isToday(day)) {
      // Today - play or view result
      onSelectDate(dateStr);
    } else if (isPastDate(day) && !isComplete) {
      // Missed day - show ad prompt
      setSelectedMissedDate(dateStr);
    } else if (isComplete) {
      // Already complete - could show stats
      const completion = getDailyCompletion(dateStr);
      // For now, just ignore or show a toast
    }
    // Future dates - do nothing
  };

  const handleWatchAd = () => {
    if (selectedMissedDate) {
      onWatchAdForDate(selectedMissedDate);
      setSelectedMissedDate(null);
    }
  };

  // Can we go to next month?
  const canGoNext = new Date(year, month + 1, 1) <= new Date(today.getFullYear(), today.getMonth(), 1);

  // Render calendar grid
  const renderCalendarDays = () => {
    const days = [];

    // Empty cells for days before first of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<View key={`empty-${i}`} style={styles.dayCell} />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDate(day);
      const isComplete = completedDays.includes(dateStr);
      const isTodayDate = isToday(day);
      const isPast = isPastDate(day);
      const isFuture = isFutureDate(day);
      const isMissed = isPast && !isComplete;

      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.dayCell,
            isTodayDate && [styles.todayCell, { borderColor: colors.primary, backgroundColor: colors.primary + '15' }],
            isComplete && styles.completeCell,
            isMissed && [styles.missedCell, { backgroundColor: colors.warning }],
            isFuture && styles.futureCell,
          ]}
          onPress={() => handleDayPress(day)}
          disabled={isFuture}
          activeOpacity={0.7}
        >
          {isComplete ? (
            // Completed day - show star with gradient background
            <View style={styles.completeDayContent}>
              <View style={[styles.starBackground, { backgroundColor: colors.success }]}>
                <Text style={styles.starIcon}>⭐</Text>
              </View>
              <Text style={styles.completeDayNumber}>{day}</Text>
            </View>
          ) : (
            <>
              <Text
                style={[
                  styles.dayText,
                  { color: colors.text },
                  isMissed && styles.missedDayText,
                  isFuture && { color: colors.textSecondary, opacity: 0.4 },
                  isTodayDate && { color: colors.primary, fontWeight: '700' },
                ]}
              >
                {day}
              </Text>
              {isTodayDate && (
                <View style={[styles.todayDot, { backgroundColor: colors.primary }]} />
              )}
            </>
          )}
        </TouchableOpacity>
      );
    }

    return days;
  };

  return (
    <View style={styles.outerContainer}>
      {/* Streak Banner */}
      <View style={[styles.streakBanner, { backgroundColor: currentStreak > 0 ? '#FF6B35' : colors.surface }]}>
        <View style={styles.streakMain}>
          <Text style={styles.flameIcon}>{currentStreak > 0 ? '🔥' : '🦉'}</Text>
          <View style={styles.streakInfo}>
            <View style={styles.streakNumberRow}>
              <Text style={[styles.streakNumber, { color: currentStreak > 0 ? '#FFFFFF' : colors.text }]}>
                {currentStreak}
              </Text>
              <Text style={[styles.streakLabel, { color: currentStreak > 0 ? '#FFFFFF' : colors.textSecondary }]}>
                day streak
              </Text>
            </View>
            <Text style={[styles.streakMessage, { color: currentStreak > 0 ? 'rgba(255,255,255,0.9)' : colors.textSecondary }]}>
              {getStreakMessage(currentStreak)}
            </Text>
          </View>
        </View>
        {bestStreak > 0 && (
          <View style={[styles.bestStreakBadge, { backgroundColor: currentStreak > 0 ? 'rgba(255,255,255,0.2)' : colors.primary + '20' }]}>
            <Text style={[styles.bestStreakText, { color: currentStreak > 0 ? '#FFFFFF' : colors.primary }]}>
              Best: {bestStreak} 🏆
            </Text>
          </View>
        )}
      </View>

      {/* Monthly Progress */}
      <View style={[styles.progressSection, { backgroundColor: colors.surface }]}>
        <View style={styles.progressHeader}>
          <Text style={[styles.progressTitle, { color: colors.text }]}>
            {MONTH_NAMES[month]} Progress
          </Text>
          <Text style={[styles.progressPercent, { color: colors.primary }]}>
            {completionRate}%
          </Text>
        </View>
        <View style={[styles.progressBarContainer, { backgroundColor: colors.gridLine }]}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${completionRate}%`,
                backgroundColor: completionRate >= 80 ? colors.success : completionRate >= 50 ? colors.warning : colors.primary,
              }
            ]}
          />
        </View>
        <Text style={[styles.progressSubtext, { color: colors.textSecondary }]}>
          {completedDays.length} of {daysPassed} days completed
        </Text>
      </View>

      {/* Calendar */}
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        {/* Header with month navigation */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handlePrevMonth} style={styles.navButton}>
            <Text style={[styles.navText, { color: colors.primary }]}>‹</Text>
          </TouchableOpacity>

          <Text style={[styles.monthTitle, { color: colors.text }]}>
            {MONTH_NAMES[month]} {year}
          </Text>

          <TouchableOpacity
            onPress={handleNextMonth}
            style={[styles.navButton, !canGoNext && styles.navButtonDisabled]}
            disabled={!canGoNext}
          >
            <Text style={[styles.navText, { color: canGoNext ? colors.primary : colors.textSecondary }]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Day names */}
        <View style={styles.dayNamesRow}>
          {DAY_NAMES.map(name => (
            <Text key={name} style={[styles.dayName, { color: colors.textSecondary }]}>
              {name}
            </Text>
          ))}
        </View>

        {/* Calendar grid */}
        <View style={styles.calendarGrid}>
          {renderCalendarDays()}
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <Text style={styles.legendIcon}>⭐</Text>
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>Completed</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>Missed</Text>
          </View>
        </View>
      </View>

      {/* Missed day modal */}
      <Modal
        visible={selectedMissedDate !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedMissedDate(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={styles.modalEmoji}>🦉</Text>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Missed Challenge
            </Text>
            <Text style={[styles.modalDescription, { color: colors.textSecondary }]}>
              You missed this day's challenge. Watch a short ad to unlock it and keep your streak going!
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleWatchAd}
              >
                <Text style={[styles.modalButtonText, { color: colors.buttonText }]}>
                  Watch Ad & Play
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButtonSecondary, { borderColor: colors.gridLine }]}
                onPress={() => setSelectedMissedDate(null)}
              >
                <Text style={[styles.modalButtonTextSecondary, { color: colors.textSecondary }]}>
                  Maybe Later
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    gap: spacing.md,
  },
  // Streak Banner Styles
  streakBanner: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  streakMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  flameIcon: {
    fontSize: 40,
  },
  streakInfo: {
    gap: 2,
  },
  streakNumberRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  streakLabel: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  streakMessage: {
    fontSize: fontSize.sm,
  },
  bestStreakBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  bestStreakText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  // Progress Section Styles
  progressSection: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  progressTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  progressPercent: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressSubtext: {
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  // Calendar Styles
  container: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  navButton: {
    padding: spacing.sm,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  navText: {
    fontSize: 28,
    fontWeight: '300',
  },
  monthTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  dayNamesRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  dayName: {
    flex: 1,
    textAlign: 'center',
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.sm,
    marginVertical: 2,
  },
  todayCell: {
    borderWidth: 2,
    borderRadius: borderRadius.round,
  },
  completeCell: {
    // Styling handled by inner content
  },
  missedCell: {
    borderRadius: borderRadius.round,
  },
  futureCell: {
    opacity: 0.5,
  },
  dayText: {
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  completeDayContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  starBackground: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  starIcon: {
    fontSize: 16,
  },
  completeDayNumber: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    position: 'absolute',
    bottom: -2,
  },
  missedDayText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendIcon: {
    fontSize: 14,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: fontSize.xs,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    maxWidth: 320,
    width: '100%',
  },
  modalEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  modalDescription: {
    fontSize: fontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  modalButtons: {
    width: '100%',
    gap: spacing.sm,
  },
  modalButton: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  modalButtonText: {
    fontWeight: '600',
    fontSize: fontSize.md,
  },
  modalButtonSecondary: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
  },
  modalButtonTextSecondary: {
    fontWeight: '500',
    fontSize: fontSize.md,
  },
});
