import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../contexts';
import { TutorialStep } from '../data/tutorials';

interface TutorialBoardProps {
  board: number[][];
  step: TutorialStep;
  cellSize?: number;
}

// Helper to check if position is in array
function isInArray(arr: [number, number][] | undefined, row: number, col: number): boolean {
  if (!arr) return false;
  return arr.some(([r, c]) => r === row && c === col);
}

// Helper to get candidates for a cell from step data
function getCandidatesForCell(
  step: TutorialStep,
  row: number,
  col: number
): number[] | null {
  const found = step.showCandidates?.find(c => c.row === row && c.col === col);
  return found ? found.candidates : null;
}

// Helper to get crossed out candidates for a cell
function getCrossedOutCandidates(
  step: TutorialStep,
  row: number,
  col: number
): number[] {
  const found = step.crossOutCandidates?.find(c => c.row === row && c.col === col);
  return found ? found.candidates : [];
}

// Helper to check if this cell has a placed value in this step
function getPlacedValue(
  step: TutorialStep,
  row: number,
  col: number
): number | null {
  if (step.placeValue && step.placeValue.row === row && step.placeValue.col === col) {
    return step.placeValue.value;
  }
  return null;
}

export default function TutorialBoard({ board, step, cellSize: propCellSize }: TutorialBoardProps) {
  const { colors } = useTheme();

  // Calculate cell size based on screen width if not provided
  const screenWidth = Dimensions.get('window').width;
  const boardPadding = 32;
  const calculatedCellSize = (screenWidth - boardPadding * 2) / 9;
  const cellSize = propCellSize || Math.min(calculatedCellSize, 40);

  const renderCell = (row: number, col: number) => {
    const baseValue = board[row][col];
    const placedValue = getPlacedValue(step, row, col);
    const value = placedValue || baseValue;
    const candidates = getCandidatesForCell(step, row, col);
    const crossedOut = getCrossedOutCandidates(step, row, col);

    // Determine cell background
    const isFocus = isInArray(step.focusCells, row, col);
    const isRelated = isInArray(step.relatedCells, row, col);
    const isElimination = isInArray(step.eliminationCells, row, col);
    const isGiven = baseValue !== 0;

    let backgroundColor = colors.cell;
    if (isElimination) {
      backgroundColor = colors.cellError;
    } else if (isFocus) {
      backgroundColor = colors.cellHighlighted;
    } else if (isRelated) {
      backgroundColor = colors.cellSameNumber;
    } else if (isGiven) {
      backgroundColor = colors.cellGiven;
    }

    // Determine text color
    let textColor = colors.text;
    if (placedValue) {
      textColor = colors.success; // Green for newly placed
    } else if (isGiven) {
      textColor = colors.textGiven;
    }

    // Calculate border widths for 3x3 box separation
    const borderRightWidth = (col + 1) % 3 === 0 && col < 8 ? 2 : 0.5;
    const borderBottomWidth = (row + 1) % 3 === 0 && row < 8 ? 2 : 0.5;

    return (
      <View
        key={`${row}-${col}`}
        style={[
          styles.cell,
          {
            width: cellSize,
            height: cellSize,
            backgroundColor,
            borderColor: colors.gridLine,
            borderRightWidth,
            borderBottomWidth,
            borderRightColor: borderRightWidth > 1 ? colors.gridLineThick : colors.gridLine,
            borderBottomColor: borderBottomWidth > 1 ? colors.gridLineThick : colors.gridLine,
          },
        ]}
      >
        {value !== 0 ? (
          <Text
            style={[
              styles.value,
              {
                fontSize: cellSize * 0.55,
                color: textColor,
                fontWeight: isGiven || placedValue ? '700' : '500',
              },
            ]}
          >
            {value}
          </Text>
        ) : candidates ? (
          <View style={styles.candidatesContainer}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
              const isCandidate = candidates.includes(num);
              const isCrossed = crossedOut.includes(num);

              return (
                <View key={num} style={styles.candidateCell}>
                  {(isCandidate || isCrossed) && (
                    <Text
                      style={[
                        styles.candidate,
                        {
                          fontSize: cellSize * 0.22,
                          color: isCrossed ? colors.error : colors.textCandidate,
                          textDecorationLine: isCrossed ? 'line-through' : 'none',
                          fontWeight: isCandidate && !isCrossed ? '600' : '400',
                        },
                      ]}
                    >
                      {num}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        ) : null}
      </View>
    );
  };

  const renderRow = (row: number) => {
    return (
      <View key={row} style={styles.row}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((col) => renderCell(row, col))}
      </View>
    );
  };

  return (
    <View style={[styles.board, { borderColor: colors.gridLineThick }]}>
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((row) => renderRow(row))}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    borderWidth: 2,
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
  },
  value: {
    textAlign: 'center',
  },
  candidatesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    height: '100%',
    padding: 1,
  },
  candidateCell: {
    width: '33.33%',
    height: '33.33%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  candidate: {
    textAlign: 'center',
  },
});
