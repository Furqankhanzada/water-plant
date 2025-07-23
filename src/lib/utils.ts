import { differenceInMinutes, differenceInHours, differenceInDays, parseISO, isValid } from 'date-fns'
import { Types } from 'mongoose';

export function getTimeAgo(dateInput: Date | string | undefined): string {
  const date = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;

  if (!isValid(date) || !date) return 'No delivery yet';

  const now = new Date();
  const minutes = differenceInMinutes(now, date);
  const hours = differenceInHours(now, date);
  const days = differenceInDays(now, date);

  if (minutes < 1) {
    return 'Just now';
  } else if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  } else if (hours < 24) {
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else {
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  }
}

export function isValidDate(val: unknown): boolean {
  if (typeof val === 'string' || val instanceof Date) {
    const date = new Date(val);
    return !isNaN(date.getTime());
  }
  return false;
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
        newObj[key === '_id' ? 'id' : key] = isValidDate(val) ? val : normalizeIds(val);
      }
    }
    return newObj;
  }
  return obj;
}
