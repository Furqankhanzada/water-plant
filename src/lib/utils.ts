import { isValid, formatDistance, FormatDistanceOptions } from 'date-fns'
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

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