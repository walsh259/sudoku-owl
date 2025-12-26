import { TechniqueName, TechniqueInfo, Hint } from '../types';

export const techniqueInfo: Record<TechniqueName, TechniqueInfo> = {
  naked_single: {
    name: 'Naked Single',
    description: 'Only one number can possibly go in this cell.',
    template: (hint: Hint) =>
      `Look at row ${hint.targetCell[0] + 1}, column ${hint.targetCell[1] + 1}. ` +
      `The only number that can go here is ${hint.targetValue}. ` +
      `All other numbers (1-9) are already in this row, column, or 3x3 box.`,
  },

  hidden_single: {
    name: 'Hidden Single',
    description:
      'This number can only go in one place within the row, column, or box.',
    template: (hint: Hint) => {
      const regionName =
        hint.highlightRegion === 'row'
          ? `row ${hint.targetCell[0] + 1}`
          : hint.highlightRegion === 'col'
            ? `column ${hint.targetCell[1] + 1}`
            : 'this 3x3 box';

      return (
        `In ${regionName}, the number ${hint.targetValue} can only go in one cell. ` +
        `Even though this cell might have other candidates, ${hint.targetValue} ` +
        `has nowhere else to go in ${regionName}.`
      );
    },
  },

  naked_pair: {
    name: 'Naked Pair',
    description:
      'Two cells in the same region contain only the same two candidates.',
    template: (hint: Hint) =>
      `These two highlighted cells can only contain the same two numbers. ` +
      `Since these two numbers must go in these two cells, you can eliminate ` +
      `them as candidates from other cells in the same row, column, or box.`,
  },

  pointing_pair: {
    name: 'Pointing Pair',
    description:
      'When a candidate in a box is limited to one row or column, it can be eliminated from that row/column outside the box.',
    template: (hint: Hint) =>
      `Within this 3x3 box, the number ${hint.targetValue} can only appear in ` +
      `one ${hint.highlightRegion}. This means ${hint.targetValue} must be in one of ` +
      `these cells, so you can eliminate it from other cells in that ${hint.highlightRegion}.`,
  },
};

// Technique difficulty ordering (used for puzzle difficulty classification)
export const techniqueDifficulty: Record<TechniqueName, number> = {
  naked_single: 1,
  hidden_single: 2,
  naked_pair: 3,
  pointing_pair: 4,
};

// Which techniques are allowed for each difficulty level
export const difficultyTechniques: Record<
  'easy' | 'medium' | 'hard',
  TechniqueName[]
> = {
  easy: ['naked_single'],
  medium: ['naked_single', 'hidden_single'],
  hard: ['naked_single', 'hidden_single', 'naked_pair', 'pointing_pair'],
};
