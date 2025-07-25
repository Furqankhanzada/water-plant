import { isValid, formatDistance, FormatDistanceOptions } from 'date-fns'
import { Types } from 'mongoose';

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
}

export function normalizeIds(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(normalizeIds);
  } else if (obj && typeof obj === 'object') {
    const newObj: any = {};
    for (const key in obj) {
      const val = obj[key];

      // Convert ObjectId to string
      if (Types.ObjectId.isValid(val) && String(val) === val.toString()) {
        newObj[key === '_id' ? 'id' : key] = isNaN(val) ? val.toString() : val;
      } else {
        newObj[key === '_id' ? 'id' : key] = isValid(val) ? val : normalizeIds(val);
      }
    }
    return newObj;
  }
  return obj;
}
