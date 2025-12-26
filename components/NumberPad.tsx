import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../contexts';
import { spacing, fontSize, borderRadius } from '../constants/theme';

interface NumberPadProps {
  onNumberPress: (num: number) => void;
  onClearPress: () => void;
  isPencilMode: boolean;
  numberCounts?: Record<number, number>;
}

export default function NumberPad({
  onNumberPress,
  onClearPress,
  isPencilMode,
  numberCounts = {},
}: NumberPadProps) {
  const { colors } = useTheme();
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <View style={styles.container}>
      <View style={styles.numbersRow}>
        {numbers.map((num) => {
          const isCompleted = (numberCounts[num] || 0) >= 9;

          return (
            <TouchableOpacity
              key={num}
              style={[
                styles.numberButton,
                { backgroundColor: colors.surface },
                isPencilMode && [styles.numberButtonPencil, {
                  backgroundColor: colors.cellSelected,
                  borderColor: colors.primary,
                }],
                isCompleted && {
                  backgroundColor: colors.numberCompleted,
                },
              ]}
              onPress={() => onNumberPress(num)}
              activeOpacity={0.7}
              disabled={isCompleted}
            >
              <Text
                style={[
                  styles.numberText,
                  { color: colors.text },
                  isPencilMode && { color: colors.primary },
                  isCompleted && { color: colors.numberCompletedText },
                ]}
              >
                {num}
              </Text>
              {isCompleted && (
                <View style={[styles.completedBadge, { backgroundColor: colors.success }]}>
                  <Text style={styles.completedCheck}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={[styles.clearButton, { backgroundColor: colors.buttonSecondary }]}
        onPress={onClearPress}
        activeOpacity={0.7}
      >
        <Text style={[styles.clearText, { color: colors.buttonTextSecondary }]}>Clear</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  numbersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  numberButton: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  numberButtonPencil: {
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  numberButtonHighlighted: {
    borderWidth: 2,
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  numberText: {
    fontSize: fontSize.xl,
    fontWeight: '600',
  },
  completedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedCheck: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  clearButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  clearText: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});
