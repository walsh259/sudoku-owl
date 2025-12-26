// Sudoku Engine - Core puzzle logic

export {
  generatePuzzle,
  generateCompleteGrid,
  countClues,
  generateDailyPuzzle,
} from './generator';

export {
  findNextHint,
  solvePuzzleWithTechniques,
  getCandidatesForBoard,
} from './solver';

export {
  createEmptyGrid,
  cloneGrid,
  isValidPlacement,
  getBoxStart,
  getBoxCells,
  getRowCells,
  getColCells,
  getRelatedCells,
  isBoardComplete,
  validateBoard,
  checkAgainstSolution,
} from './validator';

export {
  getHint,
  autoFillCandidates,
  clearAllCandidates,
  applyHintHighlights,
  clearHighlights,
  getRelatedCellsForHighlight,
  getSameNumberCells,
} from './hints';
