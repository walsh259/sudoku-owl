import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Grid,
  BoardState,
  CellState,
  CellValue,
  Difficulty,
  Position,
  Move,
  Hint,
} from '../types';
import {
  generatePuzzle,
  generateDailyPuzzle,
  validateBoard,
  isBoardComplete,
  getHint,
  applyHintHighlights,
  clearHighlights,
} from '../engine';

/**
 * Initializes a BoardState from a puzzle Grid
 */
function initializeBoard(puzzle: Grid): BoardState {
  return puzzle.map((row, rowIdx) =>
    row.map((value, colIdx) => ({
      value,
      isGiven: value !== 0,
      isError: false,
      candidates: new Set<number>(),
      isHighlighted: false,
    }))
  );
}

/**
 * Convert BoardState to serializable format (Sets -> Arrays)
 */
function serializeBoard(board: BoardState): any[][] {
  return board.map(row =>
    row.map(cell => ({
      ...cell,
      candidates: Array.from(cell.candidates),
    }))
  );
}

/**
 * Convert serialized board back to BoardState (Arrays -> Sets)
 */
function deserializeBoard(board: any[][]): BoardState {
  return board.map(row =>
    row.map(cell => ({
      ...cell,
      candidates: new Set<number>(cell.candidates || []),
    }))
  );
}

interface GameState {
  // State
  puzzle: Grid | null;
  board: BoardState | null;
  solution: Grid | null;
  difficulty: Difficulty;
  selectedCell: Position | null;
  isPencilMode: boolean;
  timer: number;
  isComplete: boolean;
  isPaused: boolean;
  moveHistory: Move[];
  currentHint: Hint | null;
  isDailyChallenge: boolean;
  dailyDate: string | null;
  lastSaved: number | null; // Timestamp of last save
}

interface GameActions {
  // Actions
  newGame: (difficulty: Difficulty) => void;
  startDailyChallenge: (dateStr?: string) => void;
  selectCell: (row: number, col: number) => void;
  clearSelection: () => void;
  enterNumber: (num: number) => void;
  clearCell: () => void;
  togglePencilMode: () => void;
  toggleCandidate: (num: number) => void;
  undo: () => void;
  requestHint: () => void;
  dismissHint: () => void;
  tick: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  clearSavedGame: () => void;
  hasSavedGame: () => boolean;
}

type GameStore = GameState & GameActions;

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // Initial state
      puzzle: null,
      board: null,
      solution: null,
      difficulty: 'easy',
      selectedCell: null,
      isPencilMode: false,
      timer: 0,
      isComplete: false,
      isPaused: false,
      moveHistory: [],
      currentHint: null,
      isDailyChallenge: false,
      dailyDate: null,
      lastSaved: null,

      // Actions
      newGame: (difficulty) => {
        const { puzzle, solution } = generatePuzzle(difficulty);
        const board = initializeBoard(puzzle);

        set({
          puzzle,
          solution,
          board,
          difficulty,
          selectedCell: null,
          isPencilMode: false,
          timer: 0,
          isComplete: false,
          isPaused: false,
          moveHistory: [],
          currentHint: null,
          isDailyChallenge: false,
          dailyDate: null,
          lastSaved: Date.now(),
        });
      },

      startDailyChallenge: (dateStr?: string) => {
        const { puzzle, solution, difficulty, date } = generateDailyPuzzle(dateStr);
        const board = initializeBoard(puzzle);

        set({
          puzzle,
          solution,
          board,
          difficulty,
          selectedCell: null,
          isPencilMode: false,
          timer: 0,
          isComplete: false,
          isPaused: false,
          moveHistory: [],
          currentHint: null,
          isDailyChallenge: true,
          dailyDate: date,
          lastSaved: Date.now(),
        });
      },

      selectCell: (row, col) => {
        const { board, currentHint } = get();
        if (!board) return;

        // Clear hint highlights when selecting a new cell
        if (currentHint) {
          set({
            selectedCell: [row, col],
            currentHint: null,
            board: clearHighlights(board),
          });
        } else {
          set({ selectedCell: [row, col] });
        }
      },

      clearSelection: () => {
        set({ selectedCell: null });
      },

      enterNumber: (num) => {
        const { board, selectedCell, solution, isPencilMode, moveHistory } = get();
        if (!board || !selectedCell || !solution) return;

        const [row, col] = selectedCell;
        const cell = board[row][col];

        // Can't edit given cells
        if (cell.isGiven) return;

        if (isPencilMode) {
          // Toggle candidate
          const newCandidates = new Set(cell.candidates);
          if (newCandidates.has(num)) {
            newCandidates.delete(num);
          } else {
            newCandidates.add(num);
          }

          const newBoard = board.map((r, ri) =>
            r.map((c, ci) => {
              if (ri === row && ci === col) {
                return { ...c, candidates: newCandidates };
              }
              return { ...c, candidates: new Set(c.candidates) };
            })
          );

          set({ board: newBoard, lastSaved: Date.now() });
        } else {
          // Check if pressing the same number - toggle (clear) the cell
          const isSameNumber = cell.value === num;
          const newValue = isSameNumber ? 0 : num;

          // Enter value (or clear if same number)
          const move: Move = {
            row,
            col,
            previousValue: cell.value,
            previousCandidates: Array.from(cell.candidates),
            newValue: newValue as CellValue,
            newCandidates: [],
          };

          // Update the cell
          let newBoard: BoardState = board.map((r, ri) =>
            r.map((c, ci) => {
              if (ri === row && ci === col) {
                return {
                  ...c,
                  value: newValue as CellValue,
                  candidates: new Set<number>(),
                };
              }
              return { ...c, candidates: new Set(c.candidates) };
            })
          );

          // Validate the board
          newBoard = validateBoard(newBoard);

          // Check if complete (only if we placed a number, not cleared)
          const complete = newValue !== 0 && isBoardComplete(newBoard);

          set({
            board: newBoard,
            moveHistory: [...moveHistory, move],
            isComplete: complete,
            lastSaved: Date.now(),
          });
        }
      },

      clearCell: () => {
        const { board, selectedCell, moveHistory } = get();
        if (!board || !selectedCell) return;

        const [row, col] = selectedCell;
        const cell = board[row][col];

        // Can't clear given cells
        if (cell.isGiven) return;

        const move: Move = {
          row,
          col,
          previousValue: cell.value,
          previousCandidates: Array.from(cell.candidates),
          newValue: 0,
          newCandidates: [],
        };

        let newBoard: BoardState = board.map((r, ri) =>
          r.map((c, ci) => {
            if (ri === row && ci === col) {
              return {
                ...c,
                value: 0,
                candidates: new Set<number>(),
              };
            }
            return { ...c, candidates: new Set(c.candidates) };
          })
        );

        // Re-validate to clear errors
        newBoard = validateBoard(newBoard);

        set({
          board: newBoard,
          moveHistory: [...moveHistory, move],
          isComplete: false,
          lastSaved: Date.now(),
        });
      },

      togglePencilMode: () => {
        set((state) => ({ isPencilMode: !state.isPencilMode }));
      },

      toggleCandidate: (num) => {
        const { board, selectedCell } = get();
        if (!board || !selectedCell) return;

        const [row, col] = selectedCell;
        const cell = board[row][col];

        // Can't add candidates to given cells or cells with values
        if (cell.isGiven || cell.value !== 0) return;

        const newCandidates = new Set(cell.candidates);
        if (newCandidates.has(num)) {
          newCandidates.delete(num);
        } else {
          newCandidates.add(num);
        }

        const newBoard = board.map((r, ri) =>
          r.map((c, ci) => {
            if (ri === row && ci === col) {
              return { ...c, candidates: newCandidates };
            }
            return { ...c, candidates: new Set(c.candidates) };
          })
        );

        set({ board: newBoard, lastSaved: Date.now() });
      },

      undo: () => {
        const { board, moveHistory } = get();
        if (!board || moveHistory.length === 0) return;

        const lastMove = moveHistory[moveHistory.length - 1];
        const { row, col, previousValue, previousCandidates } = lastMove;

        let newBoard: BoardState = board.map((r, ri) =>
          r.map((c, ci) => {
            if (ri === row && ci === col) {
              return {
                ...c,
                value: previousValue,
                candidates: new Set(previousCandidates),
              };
            }
            return { ...c, candidates: new Set(c.candidates) };
          })
        );

        // Re-validate
        newBoard = validateBoard(newBoard);

        set({
          board: newBoard,
          moveHistory: moveHistory.slice(0, -1),
          isComplete: false,
          lastSaved: Date.now(),
        });
      },

      requestHint: () => {
        const { board } = get();
        if (!board) return;

        const hint = getHint(board);
        if (hint) {
          const highlightedBoard = applyHintHighlights(board, hint);
          set({
            currentHint: hint,
            board: highlightedBoard,
          });
        }
      },

      dismissHint: () => {
        const { board } = get();
        if (!board) return;

        set({
          currentHint: null,
          board: clearHighlights(board),
        });
      },

      tick: () => {
        const { isPaused, isComplete } = get();
        if (!isPaused && !isComplete) {
          set((state) => ({ timer: state.timer + 1 }));
        }
      },

      pause: () => {
        set({ isPaused: true });
      },

      resume: () => {
        set({ isPaused: false });
      },

      reset: () => {
        const { puzzle } = get();
        if (!puzzle) return;

        const board = initializeBoard(puzzle);
        set({
          board,
          selectedCell: null,
          isPencilMode: false,
          timer: 0,
          isComplete: false,
          isPaused: false,
          moveHistory: [],
          currentHint: null,
          lastSaved: Date.now(),
        });
      },

      clearSavedGame: () => {
        set({
          puzzle: null,
          board: null,
          solution: null,
          selectedCell: null,
          isPencilMode: false,
          timer: 0,
          isComplete: false,
          isPaused: false,
          moveHistory: [],
          currentHint: null,
          isDailyChallenge: false,
          dailyDate: null,
          lastSaved: null,
        });
      },

      hasSavedGame: () => {
        const { board, isComplete } = get();
        return board !== null && !isComplete;
      },
    }),
    {
      name: 'sudoku-owl-game',
      storage: createJSONStorage(() => AsyncStorage),
      // Custom serialization to handle Sets
      partialize: (state) => ({
        puzzle: state.puzzle,
        board: state.board ? serializeBoard(state.board) : null,
        solution: state.solution,
        difficulty: state.difficulty,
        timer: state.timer,
        isComplete: state.isComplete,
        moveHistory: state.moveHistory,
        isDailyChallenge: state.isDailyChallenge,
        dailyDate: state.dailyDate,
        lastSaved: state.lastSaved,
      }),
      // Custom deserialization
      onRehydrateStorage: () => (state) => {
        if (state && state.board) {
          // Convert arrays back to Sets
          state.board = deserializeBoard(state.board as any);
        }
      },
    }
  )
);
