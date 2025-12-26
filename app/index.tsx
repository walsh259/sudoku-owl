import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts';
import { spacing, fontSize, borderRadius } from '../constants/theme';
import { useGameStore } from '../store';
import { Difficulty } from '../types';
import { getTutorialsByDifficulty } from '../data/tutorials';

// Technique summaries for each difficulty (displayed in collapsed state)
const difficultySummaries: Record<Difficulty, string> = {
  easy: 'Great for learning the basics',
  medium: 'Requires logical deduction',
  hard: 'Advanced strategies needed',
};

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { newGame, startDailyChallenge, hasSavedGame, difficulty: savedDifficulty, isDailyChallenge, timer } = useGameStore();
  const [expandedDifficulty, setExpandedDifficulty] = useState<Difficulty | null>(null);

  const handleNewGame = (difficulty: Difficulty) => {
    newGame(difficulty);
    router.push('/game');
  };

  const handleDailyChallenge = () => {
    startDailyChallenge();
    router.push('/game');
  };

  const handleContinue = () => {
    router.push('/game');
  };

  const toggleTechniqueGuide = (difficulty: Difficulty) => {
    setExpandedDifficulty(expandedDifficulty === difficulty ? null : difficulty);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const hasGame = hasSavedGame();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Logo/Title Section */}
        <View style={styles.header}>
          <View style={[styles.logoContainer, { backgroundColor: colors.surface }]}>
            <Image
              source={require('../assets/icon.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={[styles.title, { color: colors.primary }]}>Sudoku Owl</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Sudoku-Hoo-Hoo
          </Text>
        </View>

        {/* Continue Button - Show if there's a saved game */}
        {hasGame && (
          <TouchableOpacity
            style={[styles.continueButton, { backgroundColor: colors.success }]}
            onPress={handleContinue}
          >
            <Text style={styles.continueIcon}>▶</Text>
            <View style={styles.continueTextContainer}>
              <Text style={[styles.continueButtonText, { color: '#FFFFFF' }]}>
                Continue Game
              </Text>
              <Text style={[styles.continueDescription, { color: 'rgba(255,255,255,0.8)' }]}>
                {isDailyChallenge ? 'Daily Challenge' : savedDifficulty.charAt(0).toUpperCase() + savedDifficulty.slice(1)} • {formatTime(timer)}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Daily Challenge */}
        <View style={styles.dailyRow}>
          <TouchableOpacity
            style={[styles.dailyButton, { backgroundColor: colors.primary }]}
            onPress={handleDailyChallenge}
          >
            <Text style={styles.dailyIcon}>🌙</Text>
            <View style={styles.dailyTextContainer}>
              <Text style={[styles.dailyButtonText, { color: colors.buttonText }]}>
                Daily Challenge
              </Text>
              <Text style={[styles.dailyDescription, { color: colors.buttonText, opacity: 0.8 }]}>
                New puzzle every day
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.calendarButton, { backgroundColor: colors.surface }]}
            onPress={() => router.push('/stats?tab=daily')}
          >
            <Text style={styles.calendarIcon}>📅</Text>
          </TouchableOpacity>
        </View>

        {/* Difficulty Selection */}
        <ScrollView style={styles.difficultySection} showsVerticalScrollIndicator={false}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>New Game</Text>

          {/* Easy */}
          <View style={styles.difficultyContainer}>
            <TouchableOpacity
              style={[styles.difficultyButton, styles.easyButton]}
              onPress={() => handleNewGame('easy')}
            >
              <View style={styles.difficultyRow}>
                <View style={styles.difficultyTextSection}>
                  <Text style={styles.difficultyButtonText}>Easy</Text>
                  <Text style={styles.difficultyDescription}>
                    {difficultySummaries.easy}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.infoButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    toggleTechniqueGuide('easy');
                  }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.infoIcon}>{expandedDifficulty === 'easy' ? '▲' : 'ℹ'}</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
            {expandedDifficulty === 'easy' && (
              <View style={[styles.techniqueGuide, { backgroundColor: colors.surface, borderColor: '#4CAF50' }]}>
                <Text style={[styles.techniqueTitle, { color: colors.text }]}>Techniques Used:</Text>
                {getTutorialsByDifficulty('easy').map((tutorial) => (
                  <TouchableOpacity
                    key={tutorial.id}
                    style={styles.techniqueLink}
                    onPress={() => router.push(`/learn/${tutorial.id}`)}
                  >
                    <Text style={[styles.techniqueItem, { color: colors.primary }]}>
                      • {tutorial.name}
                    </Text>
                    <Text style={[styles.viewExample, { color: colors.primary }]}>View →</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Medium */}
          <View style={styles.difficultyContainer}>
            <TouchableOpacity
              style={[styles.difficultyButton, styles.mediumButton]}
              onPress={() => handleNewGame('medium')}
            >
              <View style={styles.difficultyRow}>
                <View style={styles.difficultyTextSection}>
                  <Text style={styles.difficultyButtonText}>Medium</Text>
                  <Text style={styles.difficultyDescription}>
                    {difficultySummaries.medium}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.infoButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    toggleTechniqueGuide('medium');
                  }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.infoIcon}>{expandedDifficulty === 'medium' ? '▲' : 'ℹ'}</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
            {expandedDifficulty === 'medium' && (
              <View style={[styles.techniqueGuide, { backgroundColor: colors.surface, borderColor: '#FF9800' }]}>
                <Text style={[styles.techniqueTitle, { color: colors.text }]}>Techniques Used:</Text>
                {getTutorialsByDifficulty('medium').map((tutorial) => (
                  <TouchableOpacity
                    key={tutorial.id}
                    style={styles.techniqueLink}
                    onPress={() => router.push(`/learn/${tutorial.id}`)}
                  >
                    <Text style={[styles.techniqueItem, { color: colors.primary }]}>
                      • {tutorial.name}
                    </Text>
                    <Text style={[styles.viewExample, { color: colors.primary }]}>View →</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Hard */}
          <View style={styles.difficultyContainer}>
            <TouchableOpacity
              style={[styles.difficultyButton, styles.hardButton]}
              onPress={() => handleNewGame('hard')}
            >
              <View style={styles.difficultyRow}>
                <View style={styles.difficultyTextSection}>
                  <Text style={styles.difficultyButtonText}>Hard</Text>
                  <Text style={styles.difficultyDescription}>
                    {difficultySummaries.hard}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.infoButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    toggleTechniqueGuide('hard');
                  }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.infoIcon}>{expandedDifficulty === 'hard' ? '▲' : 'ℹ'}</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
            {expandedDifficulty === 'hard' && (
              <View style={[styles.techniqueGuide, { backgroundColor: colors.surface, borderColor: '#F44336' }]}>
                <Text style={[styles.techniqueTitle, { color: colors.text }]}>Techniques Used:</Text>
                {getTutorialsByDifficulty('hard').map((tutorial) => (
                  <TouchableOpacity
                    key={tutorial.id}
                    style={styles.techniqueLink}
                    onPress={() => router.push(`/learn/${tutorial.id}`)}
                  >
                    <Text style={[styles.techniqueItem, { color: colors.primary }]}>
                      • {tutorial.name}
                    </Text>
                    <Text style={[styles.viewExample, { color: colors.primary }]}>View →</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => router.push('/learn')}
          >
            <Text style={styles.navButtonIcon}>📚</Text>
            <Text style={[styles.navButtonText, { color: colors.textSecondary }]}>Learn</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navButton}
            onPress={() => router.push('/stats')}
          >
            <Text style={styles.navButtonIcon}>📊</Text>
            <Text style={[styles.navButtonText, { color: colors.textSecondary }]}>Stats</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navButton}
            onPress={() => router.push('/settings')}
          >
            <Text style={styles.navButtonIcon}>⚙️</Text>
            <Text style={[styles.navButtonText, { color: colors.textSecondary }]}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing.lg,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    overflow: 'hidden',
  },
  logoImage: {
    width: 90,
    height: 90,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.sm,
    fontStyle: 'italic',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  continueIcon: {
    fontSize: 24,
    marginRight: spacing.md,
    color: '#FFFFFF',
  },
  continueTextContainer: {
    flex: 1,
  },
  continueButtonText: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
  },
  continueDescription: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  dailyRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  dailyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  calendarButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  calendarIcon: {
    fontSize: 24,
  },
  dailyIcon: {
    fontSize: 28,
    marginRight: spacing.md,
  },
  dailyTextContainer: {
    flex: 1,
  },
  dailyButtonText: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
  },
  dailyDescription: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  difficultySection: {
    flex: 1,
    paddingVertical: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  difficultyContainer: {
    marginBottom: spacing.sm,
  },
  difficultyButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  difficultyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  difficultyTextSection: {
    flex: 1,
  },
  easyButton: {
    backgroundColor: '#4CAF50', // Green
  },
  mediumButton: {
    backgroundColor: '#FF9800', // Orange
  },
  hardButton: {
    backgroundColor: '#F44336', // Red
  },
  difficultyButtonText: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  difficultyDescription: {
    fontSize: fontSize.xs,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
  },
  infoButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  infoIcon: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  techniqueGuide: {
    marginTop: spacing.xs,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderLeftWidth: 3,
  },
  techniqueTitle: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  techniqueLink: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  techniqueItem: {
    fontSize: fontSize.xs,
    lineHeight: 18,
    flex: 1,
  },
  viewExample: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl,
    paddingBottom: spacing.md,
  },
  navButton: {
    alignItems: 'center',
    padding: spacing.sm,
  },
  navButtonIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  navButtonText: {
    fontSize: fontSize.xs,
  },
});
