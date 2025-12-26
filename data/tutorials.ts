import { Difficulty } from '../types';

/**
 * Tutorial Step - represents one step in a technique demonstration
 */
export interface TutorialStep {
  title: string;
  explanation: string;

  // Cells to highlight with primary color (main focus)
  focusCells?: [number, number][];

  // Cells to highlight with secondary color (related/supporting)
  relatedCells?: [number, number][];

  // Cells to highlight with elimination color (being eliminated from)
  eliminationCells?: [number, number][];

  // Show specific candidates in cells
  showCandidates?: { row: number; col: number; candidates: number[] }[];

  // Cross out specific candidates (shown with strikethrough)
  crossOutCandidates?: { row: number; col: number; candidates: number[] }[];

  // Place a value in a cell (the solution being demonstrated)
  placeValue?: { row: number; col: number; value: number };
}

/**
 * Complete tutorial for a technique
 */
export interface TechniqueTutorial {
  id: string;
  name: string;
  difficulty: Difficulty;
  description: string;

  // Base puzzle state (0 = empty cell)
  board: number[][];

  // Initial candidates to show (computed from board if not specified)
  initialCandidates?: { row: number; col: number; candidates: number[] }[];

  // Tutorial steps
  steps: TutorialStep[];
}

/**
 * All technique tutorials
 */
export const tutorials: TechniqueTutorial[] = [
  // ==================== EASY TECHNIQUES ====================

  {
    id: 'naked-single',
    name: 'Naked Single',
    difficulty: 'easy',
    description: 'When a cell has only one possible candidate remaining, that must be the answer.',
    board: [
      [5, 3, 0, 0, 7, 0, 0, 0, 0],
      [6, 0, 0, 1, 9, 5, 0, 0, 0],
      [0, 9, 8, 0, 0, 0, 0, 6, 0],
      [8, 0, 0, 0, 6, 0, 0, 0, 3],
      [4, 0, 0, 8, 0, 3, 0, 0, 1],
      [7, 0, 0, 0, 2, 0, 0, 0, 6],
      [0, 6, 0, 0, 0, 0, 2, 8, 0],
      [0, 0, 0, 4, 1, 9, 0, 0, 5],
      [0, 0, 0, 0, 8, 0, 0, 7, 9],
    ],
    steps: [
      {
        title: 'Find the Cell',
        explanation: 'Look at the highlighted cell in row 1, column 3. We need to figure out what number goes here.',
        focusCells: [[0, 2]],
        showCandidates: [{ row: 0, col: 2, candidates: [1, 2, 4] }],
      },
      {
        title: 'Check the Row',
        explanation: 'Row 1 already has: 5, 3, 7. These numbers cannot appear in our cell.',
        focusCells: [[0, 2]],
        relatedCells: [[0, 0], [0, 1], [0, 4]],
        showCandidates: [{ row: 0, col: 2, candidates: [1, 2, 4] }],
      },
      {
        title: 'Check the Column',
        explanation: 'Column 3 already has: 1, 8, 4. Removing these from our candidates leaves us with fewer options.',
        focusCells: [[0, 2]],
        relatedCells: [[1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2], [8, 2]],
        showCandidates: [{ row: 0, col: 2, candidates: [2] }],
        crossOutCandidates: [{ row: 0, col: 2, candidates: [1, 4] }],
      },
      {
        title: 'Check the Box',
        explanation: 'The 3x3 box already has: 5, 3, 6, 9, 8. Combined with row and column, only 2 remains!',
        focusCells: [[0, 2]],
        relatedCells: [[0, 0], [0, 1], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]],
        showCandidates: [{ row: 0, col: 2, candidates: [2] }],
      },
      {
        title: 'Place the Number',
        explanation: 'Since 2 is the only candidate left, we can confidently place it in this cell. This is a Naked Single!',
        focusCells: [[0, 2]],
        placeValue: { row: 0, col: 2, value: 2 },
      },
    ],
  },

  {
    id: 'hidden-single-box',
    name: 'Hidden Single (Box)',
    difficulty: 'easy',
    description: 'When a number can only go in one cell within a 3x3 box, that cell must contain that number.',
    board: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 1, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 1, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [1, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    steps: [
      {
        title: 'Focus on a Box',
        explanation: 'Let\'s find where the number 1 goes in the center box (highlighted). Currently, the 1 is not placed here.',
        focusCells: [[3, 3], [3, 4], [3, 5], [4, 3], [4, 4], [4, 5], [5, 3], [5, 4], [5, 5]],
      },
      {
        title: 'Check Row Constraints',
        explanation: 'Row 4 already has a 1 (in column 3). So cells in row 4 of our box cannot have 1.',
        focusCells: [[3, 3], [3, 4], [3, 5], [4, 3], [4, 4], [4, 5], [5, 3], [5, 4], [5, 5]],
        relatedCells: [[3, 2]],
        eliminationCells: [[3, 3], [3, 4], [3, 5]],
      },
      {
        title: 'Check More Row Constraints',
        explanation: 'Row 5 also has a 1 (in column 7). So cells in row 5 of our box cannot have 1 either.',
        focusCells: [[4, 3], [4, 4], [4, 5], [5, 3], [5, 4], [5, 5]],
        relatedCells: [[4, 6]],
        eliminationCells: [[4, 3], [4, 4], [4, 5]],
      },
      {
        title: 'Only One Place Left',
        explanation: 'The 1 can only go somewhere in row 6 of this box. But wait - let\'s check column constraints too.',
        focusCells: [[5, 3], [5, 4], [5, 5]],
        showCandidates: [
          { row: 5, col: 3, candidates: [1] },
          { row: 5, col: 4, candidates: [1] },
          { row: 5, col: 5, candidates: [1] },
        ],
      },
      {
        title: 'Column Constraint',
        explanation: 'Column 1 has a 1 in row 7. This eliminates the first cell in row 6 of our box.',
        focusCells: [[5, 4], [5, 5]],
        relatedCells: [[6, 0]],
        eliminationCells: [[5, 3]],
        showCandidates: [
          { row: 5, col: 4, candidates: [1] },
          { row: 5, col: 5, candidates: [1] },
        ],
      },
      {
        title: 'Found It!',
        explanation: 'Only cells at row 6, columns 5 and 6 can have 1. If we had more constraints, we\'d narrow it to one. This is a Hidden Single - the 1 is "hidden" among other candidates but can only go in limited places.',
        focusCells: [[5, 4]],
        placeValue: { row: 5, col: 4, value: 1 },
      },
    ],
  },

  {
    id: 'hidden-single-row',
    name: 'Hidden Single (Row/Column)',
    difficulty: 'easy',
    description: 'When a number can only go in one cell within a row or column, that cell must contain that number.',
    board: [
      [0, 2, 3, 4, 5, 6, 7, 8, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 1],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    steps: [
      {
        title: 'Scan the Row',
        explanation: 'Look at row 1. It already has numbers 2-8 placed. What numbers are missing?',
        focusCells: [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7]],
        relatedCells: [[0, 0], [0, 8]],
      },
      {
        title: 'Find Missing Numbers',
        explanation: 'Row 1 is missing only 1 and 9. These must go in the two empty cells (columns 1 and 9).',
        focusCells: [[0, 0], [0, 8]],
        showCandidates: [
          { row: 0, col: 0, candidates: [1, 9] },
          { row: 0, col: 8, candidates: [1, 9] },
        ],
      },
      {
        title: 'Check Column Constraint',
        explanation: 'Column 9 already has a 1 in row 3. This means the cell at row 1, column 9 cannot be 1.',
        focusCells: [[0, 0], [0, 8]],
        relatedCells: [[2, 8]],
        eliminationCells: [[0, 8]],
        showCandidates: [
          { row: 0, col: 0, candidates: [1, 9] },
          { row: 0, col: 8, candidates: [9] },
        ],
        crossOutCandidates: [{ row: 0, col: 8, candidates: [1] }],
      },
      {
        title: 'Place the Numbers',
        explanation: 'Since column 9 can\'t have 1, the 1 must go in column 1! And 9 goes in column 9. This is a Hidden Single in a row.',
        focusCells: [[0, 0]],
        placeValue: { row: 0, col: 0, value: 1 },
      },
    ],
  },

  // ==================== MEDIUM TECHNIQUES ====================

  {
    id: 'naked-pairs',
    name: 'Naked Pairs',
    difficulty: 'medium',
    description: 'When two cells in a unit contain only the same two candidates, those candidates can be eliminated from other cells in that unit.',
    board: [
      [1, 0, 0, 0, 5, 0, 0, 8, 9],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    steps: [
      {
        title: 'Identify the Row',
        explanation: 'Look at row 1. Some cells are filled (1, 5, 8, 9) and others need candidates.',
        focusCells: [[0, 0], [0, 4], [0, 7], [0, 8]],
        relatedCells: [[0, 1], [0, 2], [0, 3], [0, 5], [0, 6]],
      },
      {
        title: 'Find the Candidates',
        explanation: 'The empty cells can have candidates from {2,3,4,6,7}. Let\'s say after other constraints, two cells both have only {3,7}.',
        focusCells: [[0, 1], [0, 2]],
        showCandidates: [
          { row: 0, col: 1, candidates: [3, 7] },
          { row: 0, col: 2, candidates: [3, 7] },
          { row: 0, col: 3, candidates: [2, 3, 4, 6, 7] },
          { row: 0, col: 5, candidates: [2, 3, 4, 6] },
          { row: 0, col: 6, candidates: [2, 3, 4, 6, 7] },
        ],
      },
      {
        title: 'Spot the Naked Pair',
        explanation: 'Cells in columns 2 and 3 both have ONLY {3,7}. This is a Naked Pair! One cell will be 3, the other will be 7.',
        focusCells: [[0, 1], [0, 2]],
        showCandidates: [
          { row: 0, col: 1, candidates: [3, 7] },
          { row: 0, col: 2, candidates: [3, 7] },
        ],
      },
      {
        title: 'Eliminate from Other Cells',
        explanation: 'Since 3 and 7 are "claimed" by the pair, we can remove them from all other cells in this row!',
        focusCells: [[0, 1], [0, 2]],
        eliminationCells: [[0, 3], [0, 5], [0, 6]],
        showCandidates: [
          { row: 0, col: 1, candidates: [3, 7] },
          { row: 0, col: 2, candidates: [3, 7] },
          { row: 0, col: 3, candidates: [2, 4, 6] },
          { row: 0, col: 5, candidates: [2, 4, 6] },
          { row: 0, col: 6, candidates: [2, 4, 6] },
        ],
        crossOutCandidates: [
          { row: 0, col: 3, candidates: [3, 7] },
          { row: 0, col: 6, candidates: [3, 7] },
        ],
      },
      {
        title: 'Result',
        explanation: 'By eliminating 3 and 7 from other cells, we\'ve simplified the puzzle. This often reveals Naked Singles!',
        focusCells: [[0, 1], [0, 2]],
        showCandidates: [
          { row: 0, col: 1, candidates: [3, 7] },
          { row: 0, col: 2, candidates: [3, 7] },
          { row: 0, col: 3, candidates: [2, 4, 6] },
          { row: 0, col: 5, candidates: [2, 4, 6] },
          { row: 0, col: 6, candidates: [2, 4, 6] },
        ],
      },
    ],
  },

  {
    id: 'pointing-pairs',
    name: 'Pointing Pairs',
    difficulty: 'medium',
    description: 'When a candidate in a box is limited to a single row or column, it can be eliminated from that row/column outside the box.',
    board: [
      [0, 0, 0, 1, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [1, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    steps: [
      {
        title: 'Focus on a Box',
        explanation: 'Look at the top-left box (rows 1-3, columns 1-3). We want to find where 1 can go.',
        focusCells: [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]],
      },
      {
        title: 'Check Constraints',
        explanation: 'Column 1 has a 1 in row 7, and column 2 has a 1 in row 8. This eliminates columns 1 and 2 in our box.',
        focusCells: [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]],
        relatedCells: [[6, 0], [7, 1]],
        eliminationCells: [[0, 0], [0, 1], [1, 0], [1, 1], [2, 0], [2, 1]],
      },
      {
        title: 'Find the Pointing Pair',
        explanation: 'The 1 in this box can only go in column 3 (cells at rows 1, 2, or 3). This is a Pointing Pair!',
        focusCells: [[0, 2], [1, 2], [2, 2]],
        showCandidates: [
          { row: 0, col: 2, candidates: [1] },
          { row: 1, col: 2, candidates: [1] },
          { row: 2, col: 2, candidates: [1] },
        ],
      },
      {
        title: 'Eliminate Along the Column',
        explanation: 'Since the 1 for this box MUST be in column 3, we can eliminate 1 from column 3 in other boxes!',
        focusCells: [[0, 2], [1, 2], [2, 2]],
        eliminationCells: [[3, 2], [4, 2], [5, 2], [6, 2], [7, 2], [8, 2]],
        crossOutCandidates: [
          { row: 3, col: 2, candidates: [1] },
          { row: 4, col: 2, candidates: [1] },
          { row: 5, col: 2, candidates: [1] },
          { row: 6, col: 2, candidates: [1] },
          { row: 7, col: 2, candidates: [1] },
          { row: 8, col: 2, candidates: [1] },
        ],
      },
      {
        title: 'Result',
        explanation: 'The 1s are "pointing" down column 3. Any 1 in that column outside this box is now eliminated. This can unlock new singles!',
        focusCells: [[0, 2], [1, 2], [2, 2]],
      },
    ],
  },

  {
    id: 'box-line-reduction',
    name: 'Box/Line Reduction',
    difficulty: 'medium',
    description: 'When a candidate in a row/column is limited to a single box, it can be eliminated from other cells in that box.',
    board: [
      [0, 0, 0, 0, 0, 0, 1, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [1, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    steps: [
      {
        title: 'Focus on a Row',
        explanation: 'Look at row 1. We want to find where the number 1 can go in this row.',
        focusCells: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7], [0, 8]],
      },
      {
        title: 'Eliminate Known Positions',
        explanation: 'Row 1, column 7 already has 1. Row 9 has 1 in column 1, eliminating column 1 for row 1.',
        relatedCells: [[0, 6], [8, 0]],
        eliminationCells: [[0, 0]],
        focusCells: [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 7], [0, 8]],
      },
      {
        title: 'Narrow Down to a Box',
        explanation: 'After checking all constraints, suppose 1 can only go in cells within the middle box of row 1 (columns 4-6).',
        focusCells: [[0, 3], [0, 4], [0, 5]],
        showCandidates: [
          { row: 0, col: 3, candidates: [1] },
          { row: 0, col: 4, candidates: [1] },
          { row: 0, col: 5, candidates: [1] },
        ],
      },
      {
        title: 'Apply Box/Line Reduction',
        explanation: 'Since 1 in row 1 must be in the top-middle box, we can eliminate 1 from other cells in that box!',
        focusCells: [[0, 3], [0, 4], [0, 5]],
        eliminationCells: [[1, 3], [1, 4], [1, 5], [2, 3], [2, 4], [2, 5]],
        crossOutCandidates: [
          { row: 1, col: 3, candidates: [1] },
          { row: 1, col: 4, candidates: [1] },
          { row: 1, col: 5, candidates: [1] },
          { row: 2, col: 3, candidates: [1] },
          { row: 2, col: 4, candidates: [1] },
          { row: 2, col: 5, candidates: [1] },
        ],
      },
      {
        title: 'Result',
        explanation: 'The row "claims" the 1 for this box. No other row in the box can have 1 in those columns. This is the reverse of Pointing Pairs!',
        focusCells: [[0, 3], [0, 4], [0, 5]],
      },
    ],
  },

  // ==================== HARD TECHNIQUES ====================

  {
    id: 'naked-triple',
    name: 'Naked Triple',
    difficulty: 'hard',
    description: 'When three cells in a unit contain only candidates from the same three numbers, those numbers can be eliminated from other cells.',
    board: [
      [1, 0, 0, 0, 5, 6, 7, 8, 9],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    steps: [
      {
        title: 'Examine the Row',
        explanation: 'Row 1 has four empty cells. Let\'s look at what candidates each can have.',
        focusCells: [[0, 1], [0, 2], [0, 3]],
        relatedCells: [[0, 0], [0, 4], [0, 5], [0, 6], [0, 7], [0, 8]],
      },
      {
        title: 'List the Candidates',
        explanation: 'After applying constraints, these three cells have limited candidates. Notice they all use only {2, 3, 4}.',
        focusCells: [[0, 1], [0, 2], [0, 3]],
        showCandidates: [
          { row: 0, col: 1, candidates: [2, 3] },
          { row: 0, col: 2, candidates: [3, 4] },
          { row: 0, col: 3, candidates: [2, 4] },
        ],
      },
      {
        title: 'Identify the Naked Triple',
        explanation: 'Three cells, three candidates: {2,3}, {3,4}, {2,4}. Together they cover exactly {2,3,4}. This is a Naked Triple!',
        focusCells: [[0, 1], [0, 2], [0, 3]],
        showCandidates: [
          { row: 0, col: 1, candidates: [2, 3] },
          { row: 0, col: 2, candidates: [3, 4] },
          { row: 0, col: 3, candidates: [2, 4] },
        ],
      },
      {
        title: 'The Logic',
        explanation: 'Each of 2, 3, and 4 must go in one of these three cells. They "claim" these numbers for themselves.',
        focusCells: [[0, 1], [0, 2], [0, 3]],
        showCandidates: [
          { row: 0, col: 1, candidates: [2, 3] },
          { row: 0, col: 2, candidates: [3, 4] },
          { row: 0, col: 3, candidates: [2, 4] },
        ],
      },
      {
        title: 'Note',
        explanation: 'If there were other empty cells in this row with 2, 3, or 4 as candidates, we could eliminate them! The triple "locks" these numbers.',
        focusCells: [[0, 1], [0, 2], [0, 3]],
      },
    ],
  },

  {
    id: 'x-wing',
    name: 'X-Wing',
    difficulty: 'hard',
    description: 'When a candidate appears in exactly two cells in each of two rows, and those cells are in the same two columns, the candidate can be eliminated from other cells in those columns.',
    board: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    steps: [
      {
        title: 'Find the Pattern',
        explanation: 'Look for a number that appears as a candidate in exactly 2 cells in multiple rows. Let\'s say 5 appears only in columns 2 and 7 in both rows 2 and 8.',
        focusCells: [[1, 1], [1, 6], [7, 1], [7, 6]],
        showCandidates: [
          { row: 1, col: 1, candidates: [5] },
          { row: 1, col: 6, candidates: [5] },
          { row: 7, col: 1, candidates: [5] },
          { row: 7, col: 6, candidates: [5] },
        ],
      },
      {
        title: 'Visualize the X',
        explanation: 'These four cells form a rectangle. Draw an X connecting opposite corners - this is why it\'s called X-Wing!',
        focusCells: [[1, 1], [1, 6], [7, 1], [7, 6]],
        showCandidates: [
          { row: 1, col: 1, candidates: [5] },
          { row: 1, col: 6, candidates: [5] },
          { row: 7, col: 1, candidates: [5] },
          { row: 7, col: 6, candidates: [5] },
        ],
      },
      {
        title: 'Understand the Logic',
        explanation: 'In row 2, 5 must be in column 2 OR column 7. In row 8, 5 must also be in column 2 OR column 7. This creates a linked pair.',
        focusCells: [[1, 1], [1, 6], [7, 1], [7, 6]],
        relatedCells: [[1, 0], [1, 2], [1, 3], [1, 4], [1, 5], [1, 7], [1, 8], [7, 0], [7, 2], [7, 3], [7, 4], [7, 5], [7, 7], [7, 8]],
      },
      {
        title: 'The Key Insight',
        explanation: 'If 5 is in column 2 of row 2, then 5 must be in column 7 of row 8 (and vice versa). Either way, columns 2 and 7 each have a 5 in these rows.',
        focusCells: [[1, 1], [7, 6]],
        relatedCells: [[1, 6], [7, 1]],
      },
      {
        title: 'Eliminate!',
        explanation: 'Since columns 2 and 7 will definitely have 5s in rows 2 or 8, we can eliminate 5 from ALL other cells in columns 2 and 7!',
        focusCells: [[1, 1], [1, 6], [7, 1], [7, 6]],
        eliminationCells: [[0, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [8, 1], [0, 6], [2, 6], [3, 6], [4, 6], [5, 6], [6, 6], [8, 6]],
        crossOutCandidates: [
          { row: 0, col: 1, candidates: [5] },
          { row: 2, col: 1, candidates: [5] },
          { row: 3, col: 1, candidates: [5] },
          { row: 4, col: 1, candidates: [5] },
          { row: 5, col: 1, candidates: [5] },
          { row: 6, col: 1, candidates: [5] },
          { row: 8, col: 1, candidates: [5] },
          { row: 0, col: 6, candidates: [5] },
          { row: 2, col: 6, candidates: [5] },
          { row: 3, col: 6, candidates: [5] },
          { row: 4, col: 6, candidates: [5] },
          { row: 5, col: 6, candidates: [5] },
          { row: 6, col: 6, candidates: [5] },
          { row: 8, col: 6, candidates: [5] },
        ],
      },
    ],
  },

  {
    id: 'xy-wing',
    name: 'XY-Wing',
    difficulty: 'hard',
    description: 'A pattern with three cells forming a chain, where eliminations can be made based on the logical connection between candidates.',
    board: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    steps: [
      {
        title: 'Find the Pivot',
        explanation: 'An XY-Wing starts with a "pivot" cell that has exactly two candidates. Let\'s say cell (5,5) has candidates {3,7}.',
        focusCells: [[4, 4]],
        showCandidates: [{ row: 4, col: 4, candidates: [3, 7] }],
      },
      {
        title: 'Find the Wings',
        explanation: 'Now find two "wing" cells that each: (1) see the pivot, (2) have exactly two candidates, (3) share one candidate with the pivot.',
        focusCells: [[4, 4]],
        relatedCells: [[4, 0], [0, 4]],
        showCandidates: [
          { row: 4, col: 4, candidates: [3, 7] },
          { row: 4, col: 0, candidates: [3, 9] },
          { row: 0, col: 4, candidates: [7, 9] },
        ],
      },
      {
        title: 'Identify the Pattern',
        explanation: 'Pivot has {3,7}. Wing 1 has {3,9}. Wing 2 has {7,9}. Notice: each wing shares one number with pivot, and both wings share 9.',
        focusCells: [[4, 4]],
        relatedCells: [[4, 0], [0, 4]],
        showCandidates: [
          { row: 4, col: 4, candidates: [3, 7] },
          { row: 4, col: 0, candidates: [3, 9] },
          { row: 0, col: 4, candidates: [7, 9] },
        ],
      },
      {
        title: 'The Logic',
        explanation: 'The pivot is either 3 or 7. If it\'s 3, Wing 1 becomes 9. If it\'s 7, Wing 2 becomes 9. Either way, one wing is 9!',
        focusCells: [[4, 4]],
        relatedCells: [[4, 0], [0, 4]],
        showCandidates: [
          { row: 4, col: 4, candidates: [3, 7] },
          { row: 4, col: 0, candidates: [3, 9] },
          { row: 0, col: 4, candidates: [7, 9] },
        ],
      },
      {
        title: 'Make Eliminations',
        explanation: 'Any cell that sees BOTH wings cannot be 9! In this case, cell (1,1) sees both wings, so we eliminate 9 from it.',
        focusCells: [[4, 0], [0, 4]],
        eliminationCells: [[0, 0]],
        crossOutCandidates: [{ row: 0, col: 0, candidates: [9] }],
        showCandidates: [
          { row: 4, col: 4, candidates: [3, 7] },
          { row: 4, col: 0, candidates: [3, 9] },
          { row: 0, col: 4, candidates: [7, 9] },
          { row: 0, col: 0, candidates: [9] },
        ],
      },
    ],
  },
];

/**
 * Get tutorials by difficulty
 */
export function getTutorialsByDifficulty(difficulty: Difficulty): TechniqueTutorial[] {
  return tutorials.filter(t => t.difficulty === difficulty);
}

/**
 * Get a tutorial by ID
 */
export function getTutorialById(id: string): TechniqueTutorial | undefined {
  return tutorials.find(t => t.id === id);
}

/**
 * Get all technique names grouped by difficulty
 */
export function getTechniquesByDifficulty(): Record<Difficulty, { id: string; name: string }[]> {
  return {
    easy: tutorials.filter(t => t.difficulty === 'easy').map(t => ({ id: t.id, name: t.name })),
    medium: tutorials.filter(t => t.difficulty === 'medium').map(t => ({ id: t.id, name: t.name })),
    hard: tutorials.filter(t => t.difficulty === 'hard').map(t => ({ id: t.id, name: t.name })),
  };
}
