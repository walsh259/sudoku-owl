import { Grid, CellValue, BoardState, Position } from '../types';

/**
 * Creates an empty 9x9 grid filled with zeros
 */
export function createEmptyGrid(): Grid {
  return Array(9)
    .fill(null)
    .map(() => Array(9).fill(0) as CellValue[]);
}

/**
 * Creates a deep copy of a grid
 */
export function cloneGrid(grid: Grid): Grid {
  return grid.map((row) => [...row]);
}

/**
 * Gets the top-left position of the 3x3 box containing the given cell
 */
export function getBoxStart(row: number, col: number): [number, number] {
  return [Math.floor(row / 3) * 3, Math.floor(col / 3) * 3];
}

/**
 * Checks if placing a number at the given position is valid
 * (doesn't conflict with row, column, or 3x3 box)
 */
export function isValidPlacement(
  grid: Grid,
  row: number,
  col: number,
  num: CellValue
): boolean {
  if (num === 0) return true; // Empty is always valid

  // Check row
  for (let c = 0; c < 9; c++) {
    if (c !== col && grid[row][c] === num) {
      return false;
    }
  }

  // Check column
  for (let r = 0; r < 9; r++) {
    if (r !== row && grid[r][col] === num) {
      return false;
    }
  }

  // Check 3x3 box
  const [boxStartRow, boxStartCol] = getBoxStart(row, col);
  for (let r = boxStartRow; r < boxStartRow + 3; r++) {
    for (let c = boxStartCol; c < boxStartCol + 3; c++) {
      if ((r !== row || c !== col) && grid[r][c] === num) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Gets all cells in the same row as the given position
 */
export function getRowCells(row: number): Position[] {
  const cells: Position[] = [];
  for (let col = 0; col < 9; col++) {
    cells.push([row, col]);
  }
  return cells;
}

/**
 * Gets all cells in the same column as the given position
 */
export function getColCells(col: number): Position[] {
  const cells: Position[] = [];
  for (let row = 0; row < 9; row++) {
    cells.push([row, col]);
  }
  return cells;
}

/**
 * Gets all cells in the same 3x3 box as the given position
 */
export function getBoxCells(row: number, col: number): Position[] {
  const cells: Position[] = [];
  const [boxStartRow, boxStartCol] = getBoxStart(row, col);

  for (let r = boxStartRow; r < boxStartRow + 3; r++) {
    for (let c = boxStartCol; c < boxStartCol + 3; c++) {
      cells.push([r, c]);
    }
  }
  return cells;
}

/**
 * Gets all cells that share a row, column, or box with the given position
 * (excluding the position itself)
 */
export function getRelatedCells(row: number, col: number): Position[] {
  const related = new Set<string>();

  // Row
  for (let c = 0; c < 9; c++) {
    if (c !== col) related.add(`${row},${c}`);
  }

  // Column
  for (let r = 0; r < 9; r++) {
    if (r !== row) related.add(`${r},${col}`);
  }

  // Box
  const [boxStartRow, boxStartCol] = getBoxStart(row, col);
  for (let r = boxStartRow; r < boxStartRow + 3; r++) {
    for (let c = boxStartCol; c < boxStartCol + 3; c++) {
      if (r !== row || c !== col) {
        related.add(`${r},${c}`);
      }
    }
  }

  return Array.from(related).map((s) => {
    const [r, c] = s.split(',').map(Number);
    return [r, c] as Position;
  });
}

/**
 * Checks if a board is completely and correctly filled
 */
export function isBoardComplete(board: BoardState): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col].value === 0 || board[row][col].isError) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Validates the entire board and marks error cells
 */
export function validateBoard(board: BoardState): BoardState {
  // Create a copy of the board
  const newBoard: BoardState = board.map((row) =>
    row.map((cell) => ({ ...cell, candidates: new Set(cell.candidates) }))
  );

  // Reset all error flags
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      newBoard[row][col].isError = false;
    }
  }

  // Check for conflicts
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const value = newBoard[row][col].value;
      if (value !== 0) {
        // Check if this value conflicts with any related cell
        const related = getRelatedCells(row, col);
        for (const [r, c] of related) {
          if (newBoard[r][c].value === value) {
            newBoard[row][col].isError = true;
            newBoard[r][c].isError = true;
          }
        }
      }
    }
  }

  return newBoard;
}

/**
 * Compares the current board values against the solution
 */
export function checkAgainstSolution(
  board: BoardState,
  solution: Grid
): { correct: boolean; errors: Position[] } {
  const errors: Position[] = [];

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const value = board[row][col].value;
      if (value !== 0 && value !== solution[row][col]) {
        errors.push([row, col]);
      }
    }
  }

  return { correct: errors.length === 0, errors };
}
