import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts';
import { spacing, fontSize, borderRadius } from '../../constants/theme';
import { tutorials, TechniqueTutorial } from '../../data/tutorials';
import { Difficulty } from '../../types';

const difficultyColors: Record<Difficulty, string> = {
  easy: '#4CAF50',
  medium: '#FF9800',
  hard: '#F44336',
};

const difficultyLabels: Record<Difficulty, string> = {
  easy: 'Beginner',
  medium: 'Intermediate',
  hard: 'Advanced',
};

export default function LearnScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const easyTechniques = tutorials.filter(t => t.difficulty === 'easy');
  const mediumTechniques = tutorials.filter(t => t.difficulty === 'medium');
  const hardTechniques = tutorials.filter(t => t.difficulty === 'hard');

  const renderTechniqueCard = (technique: TechniqueTutorial) => (
    <TouchableOpacity
      key={technique.id}
      style={[styles.techniqueCard, { backgroundColor: colors.surface }]}
      onPress={() => router.push(`/learn/${technique.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.techniqueContent}>
        <Text style={[styles.techniqueName, { color: colors.text }]}>
          {technique.name}
        </Text>
        <Text style={[styles.techniqueDescription, { color: colors.textSecondary }]} numberOfLines={2}>
          {technique.description}
        </Text>
      </View>
      <View style={styles.arrowContainer}>
        <Text style={[styles.arrow, { color: colors.textSecondary }]}>›</Text>
      </View>
    </TouchableOpacity>
  );

  const renderSection = (
    title: string,
    techniques: TechniqueTutorial[],
    difficulty: Difficulty
  ) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={[styles.difficultyBadge, { backgroundColor: difficultyColors[difficulty] }]}>
          <Text style={styles.difficultyBadgeText}>{difficultyLabels[difficulty]}</Text>
        </View>
        <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
          {techniques.length} technique{techniques.length !== 1 ? 's' : ''}
        </Text>
      </View>
      {techniques.map(renderTechniqueCard)}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: colors.primary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Learn Techniques</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Master Sudoku solving strategies
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {renderSection('Beginner Techniques', easyTechniques, 'easy')}
        {renderSection('Intermediate Techniques', mediumTechniques, 'medium')}
        {renderSection('Advanced Techniques', hardTechniques, 'hard')}

        <View style={styles.tipCard}>
          <Text style={[styles.tipTitle, { color: colors.primary }]}>Pro Tip</Text>
          <Text style={[styles.tipText, { color: colors.textSecondary }]}>
            Start with beginner techniques and master them before moving on.
            Easy puzzles only need basic techniques, while hard puzzles require
            advanced strategies.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  backButton: {
    marginBottom: spacing.sm,
  },
  backButtonText: {
    fontSize: fontSize.md,
    fontWeight: '500',
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.sm,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  difficultyBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  difficultyBadgeText: {
    color: '#FFFFFF',
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  sectionSubtitle: {
    fontSize: fontSize.xs,
  },
  techniqueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  techniqueContent: {
    flex: 1,
  },
  techniqueName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  techniqueDescription: {
    fontSize: fontSize.xs,
    lineHeight: 16,
  },
  arrowContainer: {
    paddingLeft: spacing.sm,
  },
  arrow: {
    fontSize: 24,
    fontWeight: '300',
  },
  tipCard: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(139, 69, 19, 0.2)',
    backgroundColor: 'rgba(139, 69, 19, 0.05)',
    marginTop: spacing.md,
  },
  tipTitle: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  tipText: {
    fontSize: fontSize.xs,
    lineHeight: 18,
  },
});
