/**
 * Date Utilities
 * @description Helper functions for date formatting and manipulation
 */

import {
  format,
  formatDistance,
  formatRelative,
  parseISO,
  isValid,
  differenceInDays,
  addDays,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  isAfter,
  isBefore,
  isToday,
  isTomorrow,
  isPast,
} from 'date-fns';

/**
 * Format date to display string
 */
export const formatDate = (
  date: string | Date,
  formatStr: string = 'MMM d, yyyy'
): string => {
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsed)) return 'Invalid date';
  return format(parsed, formatStr);
};

/**
 * Format date with time
 */
export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, 'MMM d, yyyy h:mm a');
};

/**
 * Format date as relative time (e.g., "2 days ago")
 */
export const formatRelativeTime = (date: string | Date): string => {
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsed)) return 'Invalid date';
  return formatDistance(parsed, new Date(), { addSuffix: true });
};

/**
 * Format date as relative day (e.g., "yesterday at 3:00 PM")
 */
export const formatRelativeDay = (date: string | Date): string => {
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsed)) return 'Invalid date';
  return formatRelative(parsed, new Date());
};

/**
 * Get days until a date
 */
export const getDaysUntil = (date: string | Date): number => {
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsed)) return 0;
  return differenceInDays(parsed, new Date());
};

/**
 * Check if date is overdue
 */
export const isOverdue = (date: string | Date): boolean => {
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsed)) return false;
  return isPast(parsed) && !isToday(parsed);
};

/**
 * Check if date is due soon (within N days)
 */
export const isDueSoon = (date: string | Date, days: number = 7): boolean => {
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsed)) return false;

  const daysUntil = differenceInDays(parsed, new Date());
  return daysUntil >= 0 && daysUntil <= days;
};

/**
 * Get urgency level based on due date
 */
export const getUrgencyLevel = (date: string | Date): 'overdue' | 'urgent' | 'soon' | 'normal' => {
  if (isOverdue(date)) return 'overdue';

  const daysUntil = getDaysUntil(date);
  if (daysUntil <= 3) return 'urgent';
  if (daysUntil <= 14) return 'soon';
  return 'normal';
};

/**
 * Get date range for a period
 */
export const getDateRange = (period: 'today' | 'week' | 'month' | 'quarter') => {
  const now = new Date();

  switch (period) {
    case 'today':
      return { start: startOfDay(now), end: endOfDay(now) };
    case 'week':
      return { start: startOfDay(now), end: endOfDay(addDays(now, 7)) };
    case 'month':
      return { start: startOfMonth(now), end: endOfMonth(now) };
    case 'quarter':
      return { start: startOfMonth(now), end: endOfMonth(addDays(now, 90)) };
    default:
      return { start: now, end: now };
  }
};

export default {
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatRelativeDay,
  getDaysUntil,
  isOverdue,
  isDueSoon,
  getUrgencyLevel,
  getDateRange,
};
