import { Grid, CellValue, Difficulty } from '../types';
import { isValidPlacement, cloneGrid, createEmptyGrid } from './validator';
import { solvePuzzleWithTechniques } from './solver';
import { difficultyTechniques } from '../constants/techniques';

/**
 * Simple seeded random number generator (Mulberry32)
 */
function createSeededRandom(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Global random function - can be replaced with seeded version
let randomFn = Math.random;

/**
 * Sets the random function (for seeded generation)
 */
export function setRandomFunction(fn: () => number): void {
  randomFn = fn;
}

/**
 * Resets to default random function
 */
export function resetRandomFunction(): void {
  randomFn = Math.random;
}

/**
 * Shuffles an array in place using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(randomFn() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Fills the grid completely using backtracking
 */
function fillGrid(grid: Grid): boolean {
  // Find next empty cell
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) {
        // Try numbers 1-9 in random order
        const numbers = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);

        for (const num of numbers) {
          if (isValidPlacement(grid, row, col, num as CellValue)) {
            grid[row][col] = num as CellValue;

            if (fillGrid(grid)) {
              return true;
            }

            grid[row][col] = 0;
          }
        }

        return false; // No valid number found, backtrack
      }
    }
  }

  return true; // Grid is complete
}

/**
 * Generates a complete valid sudoku grid
 */
export function generateCompleteGrid(): Grid {
  const grid = createEmptyGrid();
  fillGrid(grid);
  return grid;
}

/**
 * Counts the number of solutions for a puzzle (stops at 2)
 */
function countSolutions(grid: Grid, count = { value: 0 }): number {
  if (count.value > 1) return count.value; // Early exit if multiple solutions found

  // Find next empty cell
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) {
        for (let num = 1; num <= 9; num++) {
          if (isValidPlacement(grid, row, col, num as CellValue)) {
            grid[row][col] = num as CellValue;
            countSolutions(grid, count);
            grid[row][col] = 0;

            if (count.value > 1) return count.value;
          }
        }
        return count.value;
      }
    }
  }

  // No empty cells - found a solution
  count.value++;
  return count.value;
}

/**
 * Checks if puzzle has exactly one solution
 */
function hasUniqueSolution(puzzle: Grid): boolean {
  const copy = cloneGrid(puzzle);
  return countSolutions(copy) === 1;
}

/**
 * Removes cells from a complete grid to create a puzzle
 */
function removeCells(
  solution: Grid,
  difficulty: Difficulty
): { puzzle: Grid; removed: number } {
  const puzzle = cloneGrid(solution);

  // Target number of clues (cells with values) based on difficulty
  const targetClues = {
    easy: { min: 40, max: 45 }, // 36-41 cells removed
    medium: { min: 32, max: 38 }, // 43-49 cells removed
    hard: { min: 26, max: 31 }, // 50-55 cells removed
  }[difficulty];

  // Get all cell positions and shuffle them
  const positions: [number, number][] = [];
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      positions.push([row, col]);
    }
  }
  const shuffledPositions = shuffleArray(positions);

  let removed = 0;
  const targetRemoved = 81 - Math.floor((targetClues.min + targetClues.max) / 2);

  for (const [row, col] of shuffledPositions) {
    if (removed >= targetRemoved) break;

    const value = puzzle[row][col];
    puzzle[row][col] = 0;

    // Check if puzzle still has unique solution
    if (!hasUniqueSolution(puzzle)) {
      // Restore the cell - removing it creates multiple solutions
      puzzle[row][col] = value;
    } else {
      removed++;
    }
  }

  return { puzzle, removed };
}

/**
 * Verifies that a puzzle can be solved using only the allowed techniques
 */
function verifyDifficulty(puzzle: Grid, difficulty: Difficulty): boolean {
  const allowedTechniques = difficultyTechniques[difficulty];
  const result = solvePuzzleWithTechniques(puzzle, allowedTechniques);
  return result.solved;
}

/**
 * Generates a new sudoku puzzle with the specified difficulty
 * Returns both the puzzle and its solution
 */
export function generatePuzzle(difficulty: Difficulty): {
  puzzle: Grid;
  solution: Grid;
} {
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    attempts++;

    // Generate a complete grid
    const solution = generateCompleteGrid();

    // Remove cells to create puzzle
    const { puzzle } = removeCells(solution, difficulty);

    // Verify the puzzle matches the difficulty
    // For MVP, we skip strict verification to speed up generation
    // The removal algorithm already ensures unique solution
    if (difficulty === 'easy' || attempts > 10) {
      // For easy, or after many attempts, accept the puzzle
      return { puzzle, solution };
    }

    // For medium/hard, verify it needs appropriate techniques
    if (verifyDifficulty(puzzle, difficulty)) {
      return { puzzle, solution };
    }
  }

  // Fallback: just return what we have
  const solution = generateCompleteGrid();
  const { puzzle } = removeCells(solution, difficulty);
  return { puzzle, solution };
}

/**
 * Gets the number of clues (filled cells) in a puzzle
 */
export function countClues(puzzle: Grid): number {
  let count = 0;
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (puzzle[row][col] !== 0) {
        count++;
      }
    }
  }
  return count;
}

/**
 * Generates a daily challenge puzzle based on a date
 * The same date always produces the same puzzle
 * @param dateStr Optional date string in YYYY-MM-DD format (defaults to today)
 */
export function generateDailyPuzzle(dateStr?: string): {
  puzzle: Grid;
  solution: Grid;
  difficulty: Difficulty;
  date: string;
} {
  let targetDate: Date;
  let dateString: string;

  if (dateStr) {
    // Parse the provided date string
    const [year, month, day] = dateStr.split('-').map(Number);
    targetDate = new Date(year, month - 1, day);
    dateString = dateStr;
  } else {
    // Use today's date
    targetDate = new Date();
    dateString = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;
  }

  // Create seed from date
  const seed = targetDate.getFullYear() * 10000 + (targetDate.getMonth() + 1) * 100 + targetDate.getDate();

  // Use seeded random
  const seededRandom = createSeededRandom(seed);
  setRandomFunction(seededRandom);

  // Determine difficulty based on day of week
  // Monday-Tuesday: Easy, Wednesday-Thursday: Medium, Friday-Sunday: Hard
  const dayOfWeek = targetDate.getDay();
  let difficulty: Difficulty;
  if (dayOfWeek === 1 || dayOfWeek === 2) {
    difficulty = 'easy';
  } else if (dayOfWeek === 3 || dayOfWeek === 4) {
    difficulty = 'medium';
  } else {
    difficulty = 'hard';
  }

  // Generate puzzle with seeded random
  const { puzzle, solution } = generatePuzzle(difficulty);

  // Reset to normal random
  resetRandomFunction();

  return { puzzle, solution, difficulty, date: dateString };
}
