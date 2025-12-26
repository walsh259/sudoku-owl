# Sudoku Owl - Technical Design Document

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                      App Layer                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │  GameScreen │  │ StatsScreen │  │ SettingsScr │     │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘     │
│         │                │                │             │
│  ┌──────┴────────────────┴────────────────┴──────┐     │
│  │              State Management                  │     │
│  │                 (Zustand)                      │     │
│  └──────┬────────────────┬────────────────┬──────┘     │
│         │                │                │             │
│  ┌──────┴──────┐  ┌──────┴──────┐  ┌──────┴──────┐     │
│  │   Sudoku    │  │    Hint     │  │   Storage   │     │
│  │   Engine    │  │   Engine    │  │  (AsyncStor)│     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Tech Stack

| Layer | Technology | Reason |
|-------|------------|--------|
| Framework | React Native + Expo | Cross-platform, familiar from Gift Owl |
| Language | TypeScript | Type safety, better DX |
| State | Zustand | Lightweight, simple, persistent |
| Storage | AsyncStorage | Local stats persistence |
| Ads | react-native-google-mobile-ads | Industry standard, good eCPM |
| Navigation | Expo Router | File-based routing, simple |
| UI | Custom components | Sudoku grid needs precise control |

---

## 3. Project Structure

```
sudoku-owl/
├── app/                      # Expo Router screens
│   ├── _layout.tsx           # Root layout
│   ├── index.tsx             # Home/Menu screen
│   ├── game.tsx              # Main game screen
│   ├── stats.tsx             # Statistics screen
│   └── settings.tsx          # Settings screen
├── components/
│   ├── SudokuGrid.tsx        # 9x9 grid component
│   ├── Cell.tsx              # Individual cell
│   ├── NumberPad.tsx         # Input numbers 1-9
│   ├── ControlBar.tsx        # Undo, pencil mode, hint, etc.
│   ├── Timer.tsx             # Game timer
│   ├── HintModal.tsx         # Teaching hint overlay
│   └── DifficultyPicker.tsx  # Easy/Medium/Hard selector
├── engine/
│   ├── generator.ts          # Puzzle generation
│   ├── solver.ts             # Solving logic + technique detection
│   ├── validator.ts          # Check valid moves
│   └── hints.ts              # Find next logical move + explain
├── store/
│   ├── gameStore.ts          # Current game state
│   └── statsStore.ts         # Persistent statistics
├── types/
│   └── index.ts              # TypeScript types
├── constants/
│   ├── techniques.ts         # Hint technique definitions
│   └── theme.ts              # Colors, sizing
├── assets/
│   ├── icon.png              # App icon (owl)
│   └── splash.png            # Splash screen
└── app.json                  # Expo config
```

---

## 4. Core Data Types

```typescript
// Cell value (0 = empty, 1-9 = filled)
type CellValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

// A sudoku grid is 9x9
type Grid = CellValue[][];  // [row][col]

// Pencil marks for a cell
type Candidates = Set<number>;  // Set of possible values 1-9

// Cell state
interface CellState {
  value: CellValue;
  isGiven: boolean;          // Part of original puzzle (not editable)
  isError: boolean;          // Conflicts with another cell
  candidates: Candidates;    // Pencil marks
  isHighlighted: boolean;    // For hint visualization
}

// Full board state
type BoardState = CellState[][];

// Difficulty levels
type Difficulty = 'easy' | 'medium' | 'hard';

// Game state
interface GameState {
  puzzle: Grid;              // Original puzzle (for reset)
  board: BoardState;         // Current state with user input
  solution: Grid;            // Complete solution
  difficulty: Difficulty;
  selectedCell: [number, number] | null;  // [row, col]
  isPencilMode: boolean;
  timer: number;             // Seconds elapsed
  isComplete: boolean;
  moveHistory: Move[];       // For undo
}

// A move for undo history
interface Move {
  row: number;
  col: number;
  previousValue: CellValue;
  previousCandidates: number[];
  newValue: CellValue;
  newCandidates: number[];
}

// Hint/Teaching
type TechniqueName =
  | 'naked_single'      // Only one number can go here
  | 'hidden_single'     // Number can only go in one place in row/col/box
  | 'naked_pair'        // Two cells with same two candidates
  | 'pointing_pair';    // Candidates in box point to elimination

interface Hint {
  technique: TechniqueName;
  description: string;       // Human-readable explanation
  targetCell: [number, number];
  targetValue: number;
  highlightCells: [number, number][];  // Cells to highlight for explanation
  highlightRegion?: 'row' | 'col' | 'box';
}

// Statistics
interface Stats {
  gamesPlayed: number;
  gamesWon: number;
  bestTime: {
    easy: number | null;
    medium: number | null;
    hard: number | null;
  };
  currentStreak: number;
  bestStreak: number;
  lastPlayed: string | null;  // ISO date
}
```

---

## 5. Sudoku Engine

### 5.1 Puzzle Generation Algorithm

```typescript
// Step 1: Generate complete valid grid using backtracking
function generateCompleteGrid(): Grid {
  const grid = createEmptyGrid();
  fillGrid(grid, 0, 0);  // Recursive backtracking
  return grid;
}

// Step 2: Remove cells based on difficulty
function createPuzzle(solution: Grid, difficulty: Difficulty): Grid {
  const puzzle = cloneGrid(solution);
  const cellsToRemove = {
    easy: 35-40,    // ~45-46 clues remain
    medium: 45-50,  // ~31-36 clues remain
    hard: 50-55,    // ~26-31 clues remain
  }[difficulty];

  // Remove cells symmetrically for aesthetic
  // Verify puzzle still has unique solution after each removal
  // Verify puzzle is solvable with techniques appropriate for difficulty

  return puzzle;
}

// Step 3: Verify difficulty matches
function verifyDifficulty(puzzle: Grid, difficulty: Difficulty): boolean {
  const techniques = solvePuzzle(puzzle);

  if (difficulty === 'easy') {
    // Should only need naked singles
    return techniques.every(t => t === 'naked_single');
  }
  if (difficulty === 'medium') {
    // Naked + hidden singles
    return techniques.every(t =>
      ['naked_single', 'hidden_single'].includes(t)
    );
  }
  // Hard can use any technique
  return true;
}
```

### 5.2 Solving & Technique Detection

```typescript
// Returns the techniques needed to solve, in order
function solvePuzzle(puzzle: Grid): TechniqueName[] {
  const board = initializeBoard(puzzle);
  const techniques: TechniqueName[] = [];

  while (!isSolved(board)) {
    // Try techniques in order of complexity
    const hint = findNextHint(board);
    if (!hint) {
      throw new Error('Puzzle requires advanced techniques');
    }
    techniques.push(hint.technique);
    applyHint(board, hint);
  }

  return techniques;
}

// Find the simplest applicable technique
function findNextHint(board: BoardState): Hint | null {
  // 1. Look for naked singles
  const nakedSingle = findNakedSingle(board);
  if (nakedSingle) return nakedSingle;

  // 2. Look for hidden singles
  const hiddenSingle = findHiddenSingle(board);
  if (hiddenSingle) return hiddenSingle;

  // 3. Look for naked pairs (for eliminations)
  const nakedPair = findNakedPair(board);
  if (nakedPair) return nakedPair;

  return null;
}
```

---

## 6. State Management (Zustand)

### 6.1 Game Store

```typescript
// store/gameStore.ts
import { create } from 'zustand';

interface GameStore {
  // State
  puzzle: Grid | null;
  board: BoardState | null;
  solution: Grid | null;
  difficulty: Difficulty;
  selectedCell: [number, number] | null;
  isPencilMode: boolean;
  timer: number;
  isComplete: boolean;
  moveHistory: Move[];

  // Actions
  newGame: (difficulty: Difficulty) => void;
  selectCell: (row: number, col: number) => void;
  enterNumber: (num: number) => void;
  togglePencilMode: () => void;
  undo: () => void;
  getHint: () => Hint | null;
  tick: () => void;  // Increment timer
  reset: () => void; // Reset to original puzzle
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  puzzle: null,
  board: null,
  solution: null,
  difficulty: 'easy',
  selectedCell: null,
  isPencilMode: false,
  timer: 0,
  isComplete: false,
  moveHistory: [],

  // Actions
  newGame: (difficulty) => {
    const { puzzle, solution } = generatePuzzle(difficulty);
    set({
      puzzle,
      solution,
      board: initializeBoard(puzzle),
      difficulty,
      selectedCell: null,
      isPencilMode: false,
      timer: 0,
      isComplete: false,
      moveHistory: [],
    });
  },

  enterNumber: (num) => {
    const { board, selectedCell, isPencilMode, solution } = get();
    if (!board || !selectedCell) return;

    const [row, col] = selectedCell;
    if (board[row][col].isGiven) return;  // Can't edit given cells

    // Save for undo
    const move: Move = { /* ... */ };

    if (isPencilMode) {
      // Toggle candidate
      const newCandidates = new Set(board[row][col].candidates);
      if (newCandidates.has(num)) {
        newCandidates.delete(num);
      } else {
        newCandidates.add(num);
      }
      // Update board...
    } else {
      // Enter value
      // Check for errors
      // Check for completion
    }
  },

  // ... other actions
}));
```

### 6.2 Stats Store (Persistent)

```typescript
// store/statsStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface StatsStore {
  gamesPlayed: number;
  gamesWon: number;
  bestTime: {
    easy: number | null;
    medium: number | null;
    hard: number | null;
  };
  currentStreak: number;
  bestStreak: number;

  recordWin: (difficulty: Difficulty, time: number) => void;
  recordLoss: () => void;
}

export const useStatsStore = create<StatsStore>()(
  persist(
    (set, get) => ({
      gamesPlayed: 0,
      gamesWon: 0,
      bestTime: { easy: null, medium: null, hard: null },
      currentStreak: 0,
      bestStreak: 0,

      recordWin: (difficulty, time) => {
        const { bestTime, currentStreak, bestStreak } = get();
        const newStreak = currentStreak + 1;

        set({
          gamesPlayed: get().gamesPlayed + 1,
          gamesWon: get().gamesWon + 1,
          bestTime: {
            ...bestTime,
            [difficulty]: bestTime[difficulty]
              ? Math.min(bestTime[difficulty], time)
              : time,
          },
          currentStreak: newStreak,
          bestStreak: Math.max(bestStreak, newStreak),
        });
      },

      recordLoss: () => {
        set({
          gamesPlayed: get().gamesPlayed + 1,
          currentStreak: 0,
        });
      },
    }),
    {
      name: 'sudoku-stats',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

---

## 7. Component Design

### 7.1 SudokuGrid

```typescript
// components/SudokuGrid.tsx
interface Props {
  board: BoardState;
  selectedCell: [number, number] | null;
  onCellPress: (row: number, col: number) => void;
}

export function SudokuGrid({ board, selectedCell, onCellPress }: Props) {
  return (
    <View style={styles.grid}>
      {board.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((cell, colIndex) => (
            <Cell
              key={`${rowIndex}-${colIndex}`}
              cell={cell}
              isSelected={
                selectedCell?.[0] === rowIndex &&
                selectedCell?.[1] === colIndex
              }
              isInSelectedRegion={/* same row/col/box as selected */}
              onPress={() => onCellPress(rowIndex, colIndex)}
              // Add thicker borders for 3x3 box boundaries
              style={getCellBorderStyle(rowIndex, colIndex)}
            />
          ))}
        </View>
      ))}
    </View>
  );
}
```

### 7.2 Cell

```typescript
// components/Cell.tsx
interface Props {
  cell: CellState;
  isSelected: boolean;
  isInSelectedRegion: boolean;
  onPress: () => void;
}

export function Cell({ cell, isSelected, isInSelectedRegion, onPress }: Props) {
  const backgroundColor =
    isSelected ? colors.selected :
    cell.isHighlighted ? colors.highlighted :
    cell.isError ? colors.error :
    isInSelectedRegion ? colors.sameRegion :
    colors.cell;

  return (
    <TouchableOpacity
      style={[styles.cell, { backgroundColor }]}
      onPress={onPress}
    >
      {cell.value !== 0 ? (
        <Text style={[
          styles.value,
          cell.isGiven && styles.givenValue,
        ]}>
          {cell.value}
        </Text>
      ) : (
        <CandidatesView candidates={cell.candidates} />
      )}
    </TouchableOpacity>
  );
}

// 3x3 mini-grid showing pencil marks
function CandidatesView({ candidates }: { candidates: Candidates }) {
  return (
    <View style={styles.candidatesGrid}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
        <Text
          key={num}
          style={[
            styles.candidate,
            !candidates.has(num) && styles.hiddenCandidate,
          ]}
        >
          {num}
        </Text>
      ))}
    </View>
  );
}
```

---

## 8. Hint System

### 8.1 Technique Definitions

```typescript
// constants/techniques.ts
export const techniqueInfo: Record<TechniqueName, {
  name: string;
  description: string;
  template: (hint: Hint) => string;
}> = {
  naked_single: {
    name: 'Naked Single',
    description: 'Only one number can possibly go in this cell.',
    template: (hint) =>
      `Look at row ${hint.targetCell[0] + 1}, column ${hint.targetCell[1] + 1}. ` +
      `The only number that can go here is ${hint.targetValue}. ` +
      `All other numbers are already in this row, column, or box.`,
  },
  hidden_single: {
    name: 'Hidden Single',
    description: 'This number can only go in one place in the row/column/box.',
    template: (hint) =>
      `In this ${hint.highlightRegion}, the number ${hint.targetValue} ` +
      `can only go in one cell. Look at where it's already placed nearby.`,
  },
  naked_pair: {
    name: 'Naked Pair',
    description: 'Two cells with the same two candidates - those numbers can be eliminated elsewhere.',
    template: (hint) =>
      `These two highlighted cells can only contain the same two numbers. ` +
      `This means those numbers can be removed from other cells in the same region.`,
  },
};
```

### 8.2 Hint Modal

```typescript
// components/HintModal.tsx
interface Props {
  hint: Hint;
  onClose: () => void;
}

export function HintModal({ hint, onClose }: Props) {
  const info = techniqueInfo[hint.technique];

  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Owl icon */}
          <Image source={require('../assets/owl-hint.png')} />

          <Text style={styles.techniqueName}>{info.name}</Text>
          <Text style={styles.explanation}>
            {info.template(hint)}
          </Text>

          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text>Got it!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
```

---

## 9. Ad Integration

```typescript
// Using react-native-google-mobile-ads
import {
  InterstitialAd,
  AdEventType,
  BannerAd,
  BannerAdSize,
  TestIds,
} from 'react-native-google-mobile-ads';

// Show interstitial every 3 completed games
const GAMES_BETWEEN_ADS = 3;

// Interstitial (between games)
const interstitial = InterstitialAd.createForAdRequest(
  __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-xxxxx/xxxxx'
);

export function useInterstitialAd() {
  const [loaded, setLoaded] = useState(false);
  const gamesCompleted = useRef(0);

  useEffect(() => {
    const unsubscribe = interstitial.addAdEventListener(
      AdEventType.LOADED,
      () => setLoaded(true)
    );
    interstitial.load();
    return unsubscribe;
  }, []);

  const showIfReady = () => {
    gamesCompleted.current++;
    if (gamesCompleted.current >= GAMES_BETWEEN_ADS && loaded) {
      interstitial.show();
      gamesCompleted.current = 0;
      interstitial.load(); // Preload next
    }
  };

  return { showIfReady };
}

// Banner (during game - optional, can be intrusive)
export function AdBanner() {
  return (
    <BannerAd
      unitId={__DEV__ ? TestIds.BANNER : 'ca-app-pub-xxxxx/xxxxx'}
      size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
    />
  );
}
```

---

## 10. Screen Flow

```
┌─────────────┐
│   Launch    │
│   Splash    │
└──────┬──────┘
       │
┌──────▼──────┐
│    Home     │
│   - New Game│──────────┐
│   - Stats   │          │
│   - Settings│          │
└──────┬──────┘          │
       │                 │
       │ Select          │
       │ Difficulty      │
       │                 │
┌──────▼──────┐          │
│    Game     │          │
│   - Grid    │          │
│   - NumPad  │          │
│   - Timer   │          │
│   - Hint    │          │
└──────┬──────┘          │
       │                 │
       │ Complete        │
       │                 │
┌──────▼──────┐          │
│  Win Modal  │          │
│  - Stats    │──────────┘
│  - New Game │  (may show interstitial ad)
│  - Home     │
└─────────────┘
```

---

## 11. App Store Requirements

### Required Assets
- [ ] App Icon: 1024x1024 (will auto-generate smaller sizes)
- [ ] Screenshots: 6.7" (1290x2796), 6.5" (1284x2778), 5.5" (1242x2208)
- [ ] App description (4000 chars max)
- [ ] Keywords (100 chars max)
- [ ] Privacy Policy URL
- [ ] Support URL

### Info.plist Additions
```xml
<key>NSUserTrackingUsageDescription</key>
<string>This allows us to show you relevant ads</string>

<key>SKAdNetworkItems</key>
<!-- AdMob SKAdNetwork IDs -->
```

---

## 12. Testing Strategy

### Unit Tests
- Puzzle generator produces valid puzzles
- Solver correctly solves puzzles
- Technique detection is accurate
- Move validation works

### Integration Tests
- Game flow (new game → play → win)
- Stats persistence
- Hint system

### Manual Testing
- All difficulty levels
- Edge cases (undo at start, etc.)
- Ad display
- Various device sizes

---

*Document created: December 2024*
