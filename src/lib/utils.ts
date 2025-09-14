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

/**
 * Extracts property number from customer address string
 * Finds the first number in the address string
 * @param address - The customer address string
 * @returns The property number as a number, or 0 if not found
 */
export function extractPropertyNumber(address: string | null | undefined): number {
  if (!address || typeof address !== 'string') {
    return 0;
  }

  // Extract the first number found in the address
  const numberMatch = address.match(/\d+/);
  if (numberMatch) {
    return parseInt(numberMatch[0], 10);
  }

  return 0;
}