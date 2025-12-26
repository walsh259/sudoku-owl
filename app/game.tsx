import { useEffect, useRef, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts';
import { spacing, fontSize, borderRadius } from '../constants/theme';
import { useGameStore, useStatsStore, formatTimeDisplay } from '../store';
import { techniqueInfo } from '../constants/techniques';
import { playHintSound, playWinSound } from '../utils/sounds';
import { onGameComplete } from '../utils/ads';
import SudokuGrid from '../components/SudokuGrid';
import NumberPad from '../components/NumberPad';
import AdBanner from '../components/AdBanner';

export default function GameScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    board,
    difficulty,
    selectedCell,
    isPencilMode,
    timer,
    isComplete,
    isPaused,
    currentHint,
    isDailyChallenge,
    dailyDate,
    selectCell,
    enterNumber,
    clearCell,
    togglePencilMode,
    undo,
    requestHint,
    dismissHint,
    tick,
    pause,
    resume,
    reset,
  } = useGameStore();

  const { recordWin, lastGameScore, totalScore } = useStatsStore();


  // Calculate number counts for completion indicator
  const numberCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    for (let i = 1; i <= 9; i++) {
      counts[i] = 0;
    }
    if (board) {
      for (const row of board) {
        for (const cell of row) {
          if (cell.value !== 0) {
            counts[cell.value]++;
          }
        }
      }
    }
    return counts;
  }, [board]);

  // Timer effect
  useEffect(() => {
    if (board && !isComplete) {
      timerRef.current = setInterval(() => {
        tick();
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [board, isComplete, tick]);

  // Handle game completion
  useEffect(() => {
    if (isComplete) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      playWinSound(); // Hoo-hoo!
      recordWin(difficulty, timer, isDailyChallenge, dailyDate || undefined);
      // Show ad after every 3 games
      onGameComplete();
    }
  }, [isComplete, difficulty, timer, isDailyChallenge, dailyDate, recordWin]);

  const handleNumberPress = (num: number) => {
    // If a cell is selected, enter the number
    if (selectedCell) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      enterNumber(num);
    }
  };

  const handleClearPress = () => {
    if (selectedCell) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      clearCell();
    }
  };

  const handleUndoPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    undo();
  };

  const handleHintPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    playHintSound(); // Wise owl hoo
    requestHint();
  };

  const handlePencilToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    togglePencilMode();
  };

  const handleResetPress = () => {
    Alert.alert(
      'Reset Puzzle',
      'Are you sure you want to start over?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            reset();
          },
        },
      ]
    );
  };

  // Format display title
  const displayTitle = isDailyChallenge
    ? 'Daily Challenge'
    : difficulty.charAt(0).toUpperCase() + difficulty.slice(1);

  if (!board) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading puzzle...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <View style={styles.content}>
        {/* Header with timer and difficulty */}
        <View style={styles.header}>
          <View style={[styles.difficultyBadge, { backgroundColor: colors.primary }]}>
            <Text style={[styles.difficultyText, { color: colors.buttonText }]}>
              {displayTitle}
            </Text>
          </View>
          <View style={[styles.timerContainer, { backgroundColor: colors.timerBackground }]}>
            <Text style={[styles.timerText, { color: colors.timerText }]}>
              {formatTimeDisplay(timer)}
            </Text>
          </View>
        </View>

        {/* Sudoku Grid */}
        <View style={styles.gridContainer}>
          <SudokuGrid
            board={board}
            selectedCell={selectedCell}
            onCellPress={selectCell}
          />
        </View>

        {/* Control Bar */}
        <View style={styles.controlBar}>
          <TouchableOpacity style={styles.controlButton} onPress={handleUndoPress}>
            <Text style={styles.controlIcon}>↩️</Text>
            <Text style={[styles.controlLabel, { color: colors.textSecondary }]}>Undo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.controlButton,
              isPencilMode && [styles.controlButtonActive, { backgroundColor: colors.cellSelected }],
            ]}
            onPress={handlePencilToggle}
          >
            <Text style={styles.controlIcon}>✏️</Text>
            <Text style={[styles.controlLabel, { color: colors.textSecondary }]}>
              {isPencilMode ? 'Notes ON' : 'Notes'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton} onPress={handleHintPress}>
            <Text style={styles.controlIcon}>💡</Text>
            <Text style={[styles.controlLabel, { color: colors.textSecondary }]}>Hint</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton} onPress={handleResetPress}>
            <Text style={styles.controlIcon}>🔄</Text>
            <Text style={[styles.controlLabel, { color: colors.textSecondary }]}>Reset</Text>
          </TouchableOpacity>
        </View>

        {/* Number Pad */}
        <NumberPad
          onNumberPress={handleNumberPress}
          onClearPress={handleClearPress}
          isPencilMode={isPencilMode}
          numberCounts={numberCounts}
        />

        {/* Banner Ad at bottom */}
        <View style={styles.adContainer}>
          <AdBanner size="banner" />
        </View>
      </View>

      {/* Hint Modal */}
      <Modal
        visible={currentHint !== null}
        transparent
        animationType="fade"
        onRequestClose={dismissHint}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.hintModal, { backgroundColor: colors.surface }]}>
            <Text style={styles.hintOwl}>🦉</Text>
            {currentHint && (
              <>
                <Text style={[styles.hintTitle, { color: colors.primary }]}>
                  {techniqueInfo[currentHint.technique].name}
                </Text>
                <Text style={[styles.hintDescription, { color: colors.text }]}>
                  {techniqueInfo[currentHint.technique].template(currentHint)}
                </Text>
              </>
            )}
            <TouchableOpacity
              style={[styles.hintButton, { backgroundColor: colors.buttonPrimary }]}
              onPress={dismissHint}
            >
              <Text style={[styles.hintButtonText, { color: colors.buttonText }]}>Got it!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Win Modal */}
      <Modal
        visible={isComplete}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.winModal, { backgroundColor: colors.surface }]}>
            <Text style={styles.winEmoji}>🎉</Text>
            <Text style={[styles.winTitle, { color: colors.primary }]}>Congratulations!</Text>
            <Text style={[styles.winSubtitle, { color: colors.textSecondary }]}>
              You completed the {isDailyChallenge ? 'daily challenge' : `${difficulty} puzzle`}
            </Text>
            <View style={styles.winStatsRow}>
              <View style={styles.winStatItem}>
                <Text style={[styles.winStatLabel, { color: colors.textSecondary }]}>Time</Text>
                <Text style={[styles.winStatValue, { color: colors.text }]}>
                  {formatTimeDisplay(timer)}
                </Text>
              </View>
              <View style={[styles.winStatItem, styles.winStatHighlight, { backgroundColor: colors.primary + '20' }]}>
                <Text style={[styles.winStatLabel, { color: colors.primary }]}>Score</Text>
                <Text style={[styles.winStatValue, styles.winScoreValue, { color: colors.primary }]}>
                  +{lastGameScore}
                </Text>
              </View>
            </View>
            <Text style={[styles.winTotalScore, { color: colors.textSecondary }]}>
              Total: {totalScore.toLocaleString()} pts
            </Text>

            <View style={styles.winButtons}>
              <TouchableOpacity
                style={[styles.winButton, { backgroundColor: colors.buttonPrimary }]}
                onPress={() => {
                  const { newGame } = useGameStore.getState();
                  newGame(difficulty);
                }}
              >
                <Text style={[styles.winButtonTextPrimary, { color: colors.buttonText }]}>
                  Play Again
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.winButton, { backgroundColor: colors.buttonSecondary }]}
                onPress={() => router.back()}
              >
                <Text style={[styles.winButtonTextSecondary, { color: colors.buttonTextSecondary }]}>
                  Menu
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  adContainer: {
    paddingVertical: spacing.xs,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: fontSize.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  difficultyBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  difficultyText: {
    fontWeight: '600',
    fontSize: fontSize.sm,
  },
  timerContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  timerText: {
    fontWeight: 'bold',
    fontSize: fontSize.lg,
    fontVariant: ['tabular-nums'],
  },
  gridContainer: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  controlBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.md,
  },
  controlButton: {
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    minWidth: 70,
  },
  controlButtonActive: {},
  controlIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  controlLabel: {
    fontSize: fontSize.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  hintModal: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    maxWidth: 320,
    width: '100%',
  },
  hintOwl: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  hintTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  hintDescription: {
    fontSize: fontSize.md,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  hintButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  hintButtonText: {
    fontWeight: '600',
    fontSize: fontSize.md,
  },
  winModal: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    maxWidth: 320,
    width: '100%',
  },
  winEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  winTitle: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  winSubtitle: {
    fontSize: fontSize.md,
    marginBottom: spacing.md,
  },
  winStatsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  winStatItem: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    minWidth: 100,
  },
  winStatHighlight: {
    borderRadius: borderRadius.md,
  },
  winStatLabel: {
    fontSize: fontSize.xs,
    marginBottom: 2,
  },
  winStatValue: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  winScoreValue: {
    fontWeight: 'bold',
  },
  winTotalScore: {
    fontSize: fontSize.sm,
    marginBottom: spacing.lg,
  },
  winButtons: {
    width: '100%',
    gap: spacing.sm,
  },
  winButton: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  winButtonTextPrimary: {
    fontWeight: '600',
    fontSize: fontSize.md,
  },
  winButtonTextSecondary: {
    fontWeight: '600',
    fontSize: fontSize.md,
  },
});
