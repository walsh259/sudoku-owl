import { Grid, CellValue, TechniqueName, Hint, Position } from '../types';
import {
  cloneGrid,
  getBoxCells,
  getBoxStart,
  getColCells,
  getRelatedCells,
  getRowCells,
  isValidPlacement,
} from './validator';

// Candidate grid - which numbers are possible in each cell
type Candidates = Set<number>[][];

/**
 * Initializes candidates for all empty cells
 */
function initializeCandidates(grid: Grid): Candidates {
  const candidates: Candidates = Array(9)
    .fill(null)
    .map(() =>
      Array(9)
        .fill(null)
        .map(() => new Set<number>())
    );

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) {
        // Cell is empty - find all valid candidates
        for (let num = 1; num <= 9; num++) {
          if (isValidPlacement(grid, row, col, num as CellValue)) {
            candidates[row][col].add(num);
          }
        }
      }
    }
  }

  return candidates;
}

/**
 * Removes a candidate from all cells related to the given position
 */
function eliminateCandidate(
  candidates: Candidates,
  row: number,
  col: number,
  num: number
): void {
  const related = getRelatedCells(row, col);
  for (const [r, c] of related) {
    candidates[r][c].delete(num);
  }
}

/**
 * Finds a naked single - a cell with only one possible candidate
 */
function findNakedSingle(
  grid: Grid,
  candidates: Candidates
): Hint | null {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0 && candidates[row][col].size === 1) {
        const value = Array.from(candidates[row][col])[0];

        // Get all related cells to show why this is the only option
        const relatedCells = getRelatedCells(row, col).filter(
          ([r, c]) => grid[r][c] !== 0
        );

        return {
          technique: 'naked_single',
          description: `Cell can only contain ${value}`,
          targetCell: [row, col],
          targetValue: value,
          highlightCells: [[row, col], ...relatedCells.slice(0, 5)],
        };
      }
    }
  }
  return null;
}

/**
 * Finds a hidden single - a number that can only go in one place in a row/col/box
 */
function findHiddenSingle(
  grid: Grid,
  candidates: Candidates
): Hint | null {
  // Check each number 1-9
  for (let num = 1; num <= 9; num++) {
    // Check rows
    for (let row = 0; row < 9; row++) {
      const possibleCols: number[] = [];
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === 0 && candidates[row][col].has(num)) {
          possibleCols.push(col);
        }
      }

      if (possibleCols.length === 1) {
        const col = possibleCols[0];
        return {
          technique: 'hidden_single',
          description: `${num} can only go in one place in this row`,
          targetCell: [row, col],
          targetValue: num,
          highlightCells: getRowCells(row),
          highlightRegion: 'row',
        };
      }
    }

    // Check columns
    for (let col = 0; col < 9; col++) {
      const possibleRows: number[] = [];
      for (let row = 0; row < 9; row++) {
        if (grid[row][col] === 0 && candidates[row][col].has(num)) {
          possibleRows.push(row);
        }
      }

      if (possibleRows.length === 1) {
        const row = possibleRows[0];
        return {
          technique: 'hidden_single',
          description: `${num} can only go in one place in this column`,
          targetCell: [row, col],
          targetValue: num,
          highlightCells: getColCells(col),
          highlightRegion: 'col',
        };
      }
    }

    // Check 3x3 boxes
    for (let boxRow = 0; boxRow < 3; boxRow++) {
      for (let boxCol = 0; boxCol < 3; boxCol++) {
        const possibleCells: Position[] = [];
        const startRow = boxRow * 3;
        const startCol = boxCol * 3;

        for (let r = startRow; r < startRow + 3; r++) {
          for (let c = startCol; c < startCol + 3; c++) {
            if (grid[r][c] === 0 && candidates[r][c].has(num)) {
              possibleCells.push([r, c]);
            }
          }
        }

        if (possibleCells.length === 1) {
          const [row, col] = possibleCells[0];
          return {
            technique: 'hidden_single',
            description: `${num} can only go in one place in this box`,
            targetCell: [row, col],
            targetValue: num,
            highlightCells: getBoxCells(row, col),
            highlightRegion: 'box',
          };
        }
      }
    }
  }

  return null;
}

/**
 * Finds a naked pair - two cells in the same unit with the same two candidates
 */
function findNakedPair(
  grid: Grid,
  candidates: Candidates
): Hint | null {
  // Check rows, columns, and boxes
  const units: Position[][] = [];

  // Add rows
  for (let row = 0; row < 9; row++) {
    units.push(getRowCells(row));
  }

  // Add columns
  for (let col = 0; col < 9; col++) {
    units.push(getColCells(col));
  }

  // Add boxes
  for (let boxRow = 0; boxRow < 3; boxRow++) {
    for (let boxCol = 0; boxCol < 3; boxCol++) {
      units.push(getBoxCells(boxRow * 3, boxCol * 3));
    }
  }

  for (const unit of units) {
    // Find cells with exactly 2 candidates
    const pairCells = unit.filter(([r, c]) => {
      return grid[r][c] === 0 && candidates[r][c].size === 2;
    });

    // Look for matching pairs
    for (let i = 0; i < pairCells.length; i++) {
      for (let j = i + 1; j < pairCells.length; j++) {
        const [r1, c1] = pairCells[i];
        const [r2, c2] = pairCells[j];

        const cands1 = Array.from(candidates[r1][c1]).sort().join(',');
        const cands2 = Array.from(candidates[r2][c2]).sort().join(',');

        if (cands1 === cands2) {
          // Found a naked pair!
          const pairValues = Array.from(candidates[r1][c1]);

          // Check if this pair eliminates candidates from other cells
          let hasElimination = false;
          for (const [r, c] of unit) {
            if ((r !== r1 || c !== c1) && (r !== r2 || c !== c2)) {
              if (grid[r][c] === 0) {
                for (const val of pairValues) {
                  if (candidates[r][c].has(val)) {
                    hasElimination = true;
                    break;
                  }
                }
              }
            }
            if (hasElimination) break;
          }

          if (hasElimination) {
            return {
              technique: 'naked_pair',
              description: `These two cells form a naked pair with ${pairValues.join(' and ')}`,
              targetCell: [r1, c1],
              targetValue: pairValues[0],
              highlightCells: [
                [r1, c1],
                [r2, c2],
              ],
            };
          }
        }
      }
    }
  }

  return null;
}

/**
 * Finds the next hint using available techniques
 */
export function findNextHint(
  grid: Grid,
  allowedTechniques: TechniqueName[] = [
    'naked_single',
    'hidden_single',
    'naked_pair',
    'pointing_pair',
  ]
): Hint | null {
  const candidates = initializeCandidates(grid);

  // Try techniques in order of difficulty
  if (allowedTechniques.includes('naked_single')) {
    const hint = findNakedSingle(grid, candidates);
    if (hint) return hint;
  }

  if (allowedTechniques.includes('hidden_single')) {
    const hint = findHiddenSingle(grid, candidates);
    if (hint) return hint;
  }

  if (allowedTechniques.includes('naked_pair')) {
    const hint = findNakedPair(grid, candidates);
    if (hint) return hint;
  }

  // pointing_pair would go here

  return null;
}

/**
 * Attempts to solve a puzzle using only the specified techniques
 * Returns whether it was solvable and which techniques were used
 */
export function solvePuzzleWithTechniques(
  puzzle: Grid,
  allowedTechniques: TechniqueName[]
): { solved: boolean; techniques: TechniqueName[] } {
  const grid = cloneGrid(puzzle);
  const techniquesUsed: TechniqueName[] = [];
  let iterations = 0;
  const maxIterations = 1000;

  while (iterations < maxIterations) {
    iterations++;

    // Check if solved
    let isSolved = true;
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === 0) {
          isSolved = false;
          break;
        }
      }
      if (!isSolved) break;
    }

    if (isSolved) {
      return { solved: true, techniques: techniquesUsed };
    }

    // Find and apply next hint
    const hint = findNextHint(grid, allowedTechniques);
    if (!hint) {
      // Can't make progress with allowed techniques
      return { solved: false, techniques: techniquesUsed };
    }

    // Apply the hint
    grid[hint.targetCell[0]][hint.targetCell[1]] = hint.targetValue as CellValue;
    techniquesUsed.push(hint.technique);
  }

  return { solved: false, techniques: techniquesUsed };
}

/**
 * Gets all candidates for empty cells in the current board state
 */
export function getCandidatesForBoard(grid: Grid): Candidates {
  return initializeCandidates(grid);
}
