// Cell value (0 = empty, 1-9 = filled)
export type CellValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

// A sudoku grid is 9x9
export type Grid = CellValue[][];

// Cell state for the game board
export interface CellState {
  value: CellValue;
  isGiven: boolean; // Part of original puzzle (not editable)
  isError: boolean; // Conflicts with another cell
  candidates: Set<number>; // Pencil marks (possible values 1-9)
  isHighlighted: boolean; // For hint visualization
}

// Full board state
export type BoardState = CellState[][];

// Difficulty levels
export type Difficulty = 'easy' | 'medium' | 'hard';

// Position on the board
export type Position = [number, number]; // [row, col]

// A move for undo history
export interface Move {
  row: number;
  col: number;
  previousValue: CellValue;
  previousCandidates: number[];
  newValue: CellValue;
  newCandidates: number[];
}

// Solving technique names
export type TechniqueName =
  | 'naked_single' // Only one number can go here
  | 'hidden_single' // Number can only go in one place in row/col/box
  | 'naked_pair' // Two cells with same two candidates
  | 'pointing_pair'; // Candidates in box point to elimination

// Hint from the teaching system
export interface Hint {
  technique: TechniqueName;
  description: string;
  targetCell: Position;
  targetValue: number;
  highlightCells: Position[];
  highlightRegion?: 'row' | 'col' | 'box';
}

// Game state
export interface GameState {
  puzzle: Grid | null; // Original puzzle (for reset)
  board: BoardState | null; // Current state with user input
  solution: Grid | null; // Complete solution
  difficulty: Difficulty;
  selectedCell: Position | null;
  isPencilMode: boolean;
  timer: number; // Seconds elapsed
  isComplete: boolean;
  isPaused: boolean;
  moveHistory: Move[];
}

// Statistics
export interface Stats {
  gamesPlayed: number;
  gamesWon: number;
  bestTime: {
    easy: number | null;
    medium: number | null;
    hard: number | null;
  };
  currentStreak: number;
  bestStreak: number;
  lastPlayed: string | null; // ISO date
}

// Technique information for teaching
export interface TechniqueInfo {
  name: string;
  description: string;
  template: (hint: Hint) => string;
}
