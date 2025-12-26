import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts';
import { spacing, fontSize, borderRadius } from '../../constants/theme';
import { getTutorialById } from '../../data/tutorials';
import TutorialBoard from '../../components/TutorialBoard';
import { Difficulty } from '../../types';

const difficultyColors: Record<Difficulty, string> = {
  easy: '#4CAF50',
  medium: '#FF9800',
  hard: '#F44336',
};

export default function TechniqueScreen() {
  const router = useRouter();
  const { technique: techniqueId } = useLocalSearchParams<{ technique: string }>();
  const { colors } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);

  const tutorial = getTutorialById(techniqueId || '');

  if (!tutorial) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.text }]}>
            Technique not found
          </Text>
          <TouchableOpacity
            style={[styles.backButtonLarge, { backgroundColor: colors.primary }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.backButtonLargeText, { color: colors.buttonText }]}>
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const step = tutorial.steps[currentStep];
  const totalSteps = tutorial.steps.length;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStep(currentStep + 1);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: colors.primary }]}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
              {tutorial.name}
            </Text>
            <View style={[styles.difficultyBadge, { backgroundColor: difficultyColors[tutorial.difficulty] }]}>
              <Text style={styles.difficultyText}>
                {tutorial.difficulty.charAt(0).toUpperCase() + tutorial.difficulty.slice(1)}
              </Text>
            </View>
          </View>
          <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
            {tutorial.description}
          </Text>
        </View>
      </View>

      {/* Step Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          {tutorial.steps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                {
                  backgroundColor: index <= currentStep ? colors.primary : colors.gridLine,
                },
                index === currentStep && styles.progressDotActive,
              ]}
            />
          ))}
        </View>
        <Text style={[styles.stepCounter, { color: colors.textSecondary }]}>
          Step {currentStep + 1} of {totalSteps}
        </Text>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Step Title & Explanation */}
        <View style={[styles.stepCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.stepTitle, { color: colors.primary }]}>
            {step.title}
          </Text>
          <Text style={[styles.stepExplanation, { color: colors.text }]}>
            {step.explanation}
          </Text>
        </View>

        {/* Tutorial Board */}
        <View style={styles.boardContainer}>
          <TutorialBoard board={tutorial.board} step={step} />
        </View>

        {/* Legend */}
        <View style={[styles.legend, { backgroundColor: colors.surface }]}>
          <Text style={[styles.legendTitle, { color: colors.textSecondary }]}>Legend</Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: colors.cellHighlighted }]} />
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>Focus</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: colors.cellSameNumber }]} />
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>Related</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: colors.cellError }]} />
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>Eliminated</Text>
            </View>
            <View style={styles.legendItem}>
              <Text style={[styles.legendSample, { color: colors.success }]}>5</Text>
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>Solution</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Navigation */}
      <View style={[styles.navigation, { backgroundColor: colors.surface, borderTopColor: colors.gridLine }]}>
        <TouchableOpacity
          style={[
            styles.navButton,
            { backgroundColor: isFirstStep ? colors.buttonDisabled : colors.buttonSecondary },
          ]}
          onPress={handlePrevious}
          disabled={isFirstStep}
        >
          <Text
            style={[
              styles.navButtonText,
              { color: isFirstStep ? colors.buttonTextDisabled : colors.buttonTextSecondary },
            ]}
          >
            ← Previous
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navButton,
            styles.navButtonPrimary,
            { backgroundColor: isLastStep ? colors.success : colors.primary },
          ]}
          onPress={isLastStep ? () => router.back() : handleNext}
        >
          <Text style={[styles.navButtonText, { color: colors.buttonText }]}>
            {isLastStep ? 'Done ✓' : 'Next →'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: fontSize.lg,
    marginBottom: spacing.lg,
  },
  backButtonLarge: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  backButtonLargeText: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  backButton: {
    marginBottom: spacing.xs,
  },
  backButtonText: {
    fontSize: fontSize.md,
    fontWeight: '500',
  },
  headerContent: {
    marginTop: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    flex: 1,
  },
  difficultyBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  difficultyText: {
    color: '#FFFFFF',
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  description: {
    fontSize: fontSize.xs,
    lineHeight: 16,
  },
  progressContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  progressBar: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  progressDotActive: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  stepCounter: {
    fontSize: fontSize.xs,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  stepCard: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  stepTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  stepExplanation: {
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  boardContainer: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  legend: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  legendTitle: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 3,
  },
  legendSample: {
    fontSize: fontSize.sm,
    fontWeight: 'bold',
    width: 16,
    textAlign: 'center',
  },
  legendText: {
    fontSize: fontSize.xs,
  },
  navigation: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.md,
    borderTopWidth: 1,
  },
  navButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonPrimary: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  navButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});
