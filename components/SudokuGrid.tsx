import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { BoardState, Position } from '../types';
import { useTheme } from '../contexts';
import Cell from './Cell';
import { getRelatedCellsForHighlight, getSameNumberCells } from '../engine';

interface SudokuGridProps {
  board: BoardState;
  selectedCell: Position | null;
  onCellPress: (row: number, col: number) => void;
}

export default function SudokuGrid({
  board,
  selectedCell,
  onCellPress,
}: SudokuGridProps) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();

  // Calculate grid size based on screen width (with padding)
  const gridSize = Math.min(width - 32, 400);
  const cellSize = (gridSize - 4) / 9; // Account for thick borders

  // Get cells to highlight
  const relatedCells = getRelatedCellsForHighlight(selectedCell);
  const sameNumberCells = getSameNumberCells(board, selectedCell);

  return (
    <View
      style={[
        styles.grid,
        {
          width: gridSize,
          height: gridSize,
          backgroundColor: colors.gridLineThick,
          borderColor: colors.gridLineThick,
        },
      ]}
    >
      {board.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((cell, colIndex) => {
            const isSelected =
              selectedCell?.[0] === rowIndex && selectedCell?.[1] === colIndex;
            const isRelated = relatedCells.has(`${rowIndex},${colIndex}`);
            const isSameNumber = sameNumberCells.has(`${rowIndex},${colIndex}`);

            // Determine border styles for 3x3 box boundaries
            const isRightBorder = (colIndex + 1) % 3 === 0 && colIndex < 8;
            const isBottomBorder = (rowIndex + 1) % 3 === 0 && rowIndex < 8;

            return (
              <Cell
                key={`${rowIndex}-${colIndex}`}
                cell={cell}
                size={cellSize}
                isSelected={isSelected}
                isRelated={isRelated}
                isSameNumber={isSameNumber}
                onPress={() => onCellPress(rowIndex, colIndex)}
                style={[
                  isRightBorder && {
                    borderRightWidth: 2,
                    borderRightColor: colors.gridLineThick,
                  },
                  isBottomBorder && {
                    borderBottomWidth: 2,
                    borderBottomColor: colors.gridLineThick,
                  },
                ]}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    borderWidth: 2,
    borderRadius: 4,
  },
  row: {
    flexDirection: 'row',
  },
});
