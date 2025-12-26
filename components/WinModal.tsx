import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../contexts';
import { spacing, fontSize, borderRadius } from '../constants/theme';

interface WinModalProps {
  visible: boolean;
  onClose: () => void;
  onNewGame: () => void;
  onMainMenu: () => void;
  time: number;
  difficulty: string;
  score: number;
  totalScore?: number;
  isNewBestTime?: boolean;
  isDailyChallenge?: boolean;
}

function formatTimeDisplay(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function WinModal({
  visible,
  onClose,
  onNewGame,
  onMainMenu,
  time,
  difficulty,
  score,
  totalScore = 1285,
  isNewBestTime = false,
  isDailyChallenge = false,
}: WinModalProps) {
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: colors.surface }]}>
          <Text style={styles.emoji}>🎉</Text>
          <Text style={[styles.title, { color: colors.primary }]}>Congratulations!</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            You completed the {isDailyChallenge ? 'daily challenge' : `${difficulty} puzzle`}
          </Text>

          {isNewBestTime && (
            <View style={[styles.newBestBadge, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.newBestText, { color: colors.primary }]}>New Best Time!</Text>
            </View>
          )}

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Time</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {formatTimeDisplay(time)}
              </Text>
            </View>
            <View style={[styles.statItem, styles.statHighlight, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.statLabel, { color: colors.primary }]}>Score</Text>
              <Text style={[styles.statValue, styles.scoreValue, { color: colors.primary }]}>
                +{score}
              </Text>
            </View>
          </View>

          <Text style={[styles.totalScore, { color: colors.textSecondary }]}>
            Total: {totalScore.toLocaleString()} pts
          </Text>

          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.buttonPrimary }]}
              onPress={onNewGame}
            >
              <Text style={[styles.buttonTextPrimary, { color: colors.buttonText }]}>
                Play Again
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.buttonSecondary }]}
              onPress={onMainMenu}
            >
              <Text style={[styles.buttonTextSecondary, { color: colors.buttonTextSecondary }]}>
                Menu
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modal: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    maxWidth: 320,
    width: '100%',
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
    marginBottom: spacing.md,
  },
  newBestBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  newBestText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  statItem: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    minWidth: 100,
  },
  statHighlight: {
    borderRadius: borderRadius.md,
  },
  statLabel: {
    fontSize: fontSize.xs,
    marginBottom: 2,
  },
  statValue: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  scoreValue: {
    fontWeight: 'bold',
  },
  totalScore: {
    fontSize: fontSize.sm,
    marginBottom: spacing.lg,
  },
  buttons: {
    width: '100%',
    gap: spacing.sm,
  },
  button: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  buttonTextPrimary: {
    fontWeight: '600',
    fontSize: fontSize.md,
  },
  buttonTextSecondary: {
    fontWeight: '600',
    fontSize: fontSize.md,
  },
});
