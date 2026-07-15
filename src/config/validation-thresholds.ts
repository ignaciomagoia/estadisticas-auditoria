export const VALIDATION_THRESHOLDS = {
  high: 95,
  medium: 90,
};

export const getValidationTone = (value: number) => {
  if (value >= VALIDATION_THRESHOLDS.high) return 'high';
  if (value >= VALIDATION_THRESHOLDS.medium) return 'medium';
  return 'low';
};
