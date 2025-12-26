import { BoardState, Grid, Hint, Position, CellValue } from '../types';
import { findNextHint, getCandidatesForBoard } from './solver';

/**
 * Converts a BoardState to a Grid (just the values)
 */
function boardToGrid(board: BoardState): Grid {
  return board.map((row) => row.map((cell) => cell.value));
}

/**
 * Gets a hint for the current board state
 * Explains the technique and which cells are involved
 */
export function getHint(board: BoardState): Hint | null {
  const grid = boardToGrid(board);
  return findNextHint(grid);
}

/**
 * Auto-fills all candidates for empty cells
 * This is the "pencil marks" feature
 */
export function autoFillCandidates(board: BoardState): BoardState {
  const grid = boardToGrid(board);
  const candidates = getCandidatesForBoard(grid);

  return board.map((row, rowIdx) =>
    row.map((cell, colIdx) => ({
      ...cell,
      candidates:
        cell.value === 0 && !cell.isGiven
          ? candidates[rowIdx][colIdx]
          : new Set<number>(),
    }))
  );
}

/**
 * Clears all candidates from the board
 */
export function clearAllCandidates(board: BoardState): BoardState {
  return board.map((row) =>
    row.map((cell) => ({
      ...cell,
      candidates: new Set<number>(),
    }))
  );
}

/**
 * Highlights cells related to a hint
 */
export function applyHintHighlights(
  board: BoardState,
  hint: Hint
): BoardState {
  // First, clear all highlights
  const newBoard = board.map((row) =>
    row.map((cell) => ({
      ...cell,
      candidates: new Set(cell.candidates),
      isHighlighted: false,
    }))
  );

  // Apply highlights to hint cells
  for (const [row, col] of hint.highlightCells) {
    if (row >= 0 && row < 9 && col >= 0 && col < 9) {
      newBoard[row][col].isHighlighted = true;
    }
  }

  return newBoard;
}

/**
 * Clears all highlights from the board
 */
export function clearHighlights(board: BoardState): BoardState {
  return board.map((row) =>
    row.map((cell) => ({
      ...cell,
      candidates: new Set(cell.candidates),
      isHighlighted: false,
    }))
  );
}

/**
 * Gets cells that share a row, column, or box with the selected cell
 * Used for visual highlighting during gameplay
 */
export function getRelatedCellsForHighlight(
  selectedCell: Position | null
): Set<string> {
  if (!selectedCell) return new Set();

  const [row, col] = selectedCell;
  const related = new Set<string>();

  // Same row
  for (let c = 0; c < 9; c++) {
    related.add(`${row},${c}`);
  }

  // Same column
  for (let r = 0; r < 9; r++) {
    related.add(`${r},${col}`);
  }

  // Same 3x3 box
  const boxStartRow = Math.floor(row / 3) * 3;
  const boxStartCol = Math.floor(col / 3) * 3;
  for (let r = boxStartRow; r < boxStartRow + 3; r++) {
    for (let c = boxStartCol; c < boxStartCol + 3; c++) {
      related.add(`${r},${c}`);
    }
  }

  // Remove the selected cell itself
  related.delete(`${row},${col}`);

  return related;
}

/**
 * Gets all cells that contain the same number as the selected cell
 * Used for highlighting matching numbers
 */
export function getSameNumberCells(
  board: BoardState,
  selectedCell: Position | null
): Set<string> {
  if (!selectedCell) return new Set();

  const [row, col] = selectedCell;
  const value = board[row][col].value;

  if (value === 0) return new Set();

  const sameNumber = new Set<string>();
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c].value === value && (r !== row || c !== col)) {
        sameNumber.add(`${r},${c}`);
      }
    }
  }

  return sameNumber;
}
