// constants/ReviewSettings.ts

export interface ReviewIntervals {
  again: number;    // minutes
  hard: number;     // minutes  
  good: number;     // days
  easy: number;     // days
}

export const DEFAULT_REVIEW_INTERVALS: ReviewIntervals = {
  again: 1,     // 1 minute for immediate retry
  hard: 21,     // 21 minutes
  good: 1,      // 1 day
  easy: 30      // 30 days
};

// Future: These could be loaded from AsyncStorage or user preferences
export const getReviewIntervals = (): ReviewIntervals => {
  // For now, return defaults
  // Later: load from user settings/preferences
  return DEFAULT_REVIEW_INTERVALS;
};
