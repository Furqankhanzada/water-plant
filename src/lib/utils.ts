import { isValid, formatDistance, FormatDistanceOptions } from 'date-fns'

type FormatDistanceWithFallbackOptions = FormatDistanceOptions & {
  fallback: string;
};

export function formatDistanceWithFallback(
  date: Date | string | undefined,
  options: FormatDistanceWithFallbackOptions
): string {
  const { fallback, ...otherOptions } = options;
  const now = new Date();

  if (!date || !isValid(new Date(date))) {
    return fallback;
  }

  return formatDistance(new Date(date), now, { addSuffix: true, ...otherOptions });
};
