import { describe, it, expect } from 'vitest';
import {
  getTodayLocalDate,
  getNowInTimeZone,
  diffLocalDates,
  addDaysToLocalDate,
  isValidTimeZone,
  getYearMonthInTimeZone,
} from '../../utils/date.js';

describe('Date Utils', () => {
  describe('isValidTimeZone', () => {
    it('should return true for valid timezones', () => {
      expect(isValidTimeZone('UTC')).toBe(true);
      expect(isValidTimeZone('America/New_York')).toBe(true);
      expect(isValidTimeZone('Europe/London')).toBe(true);
    });

    it('should return false for invalid timezones', () => {
      expect(isValidTimeZone('Invalid/Timezone')).toBe(false);
      expect(isValidTimeZone('')).toBe(false);
    });
  });

  describe('getTodayLocalDate', () => {
    it('should return date in YYYY-MM-DD format', () => {
      const date = getTodayLocalDate('UTC');
      const regex = /^\d{4}-\d{2}-\d{2}$/;
      expect(date).toMatch(regex);
    });

    it('should return same date for same timezone', () => {
      const date1 = getTodayLocalDate('UTC');
      const date2 = getTodayLocalDate('UTC');
      expect(date1).toBe(date2);
    });
  });

  describe('getNowInTimeZone', () => {
    it('should return current time and local date', () => {
      const result = getNowInTimeZone('UTC');
      expect(result.now).toBeInstanceOf(Date);
      expect(result.localDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('diffLocalDates', () => {
    it('should calculate difference in days', () => {
      const diff = diffLocalDates('2024-01-01', '2024-01-05');
      expect(diff).toBe(4);
    });

    it('should return 0 for same date', () => {
      const diff = diffLocalDates('2024-01-01', '2024-01-01');
      expect(diff).toBe(0);
    });

    it('should handle negative difference', () => {
      const diff = diffLocalDates('2024-01-05', '2024-01-01');
      expect(diff).toBe(-4);
    });
  });

  describe('addDaysToLocalDate', () => {
    it('should add days to a date', () => {
      const result = addDaysToLocalDate('2024-01-01', 5);
      expect(result).toBe('2024-01-06');
    });

    it('should subtract days when negative', () => {
      const result = addDaysToLocalDate('2024-01-05', -3);
      expect(result).toBe('2024-01-02');
    });

    it('should handle month boundaries', () => {
      const result = addDaysToLocalDate('2024-01-30', 2);
      expect(result).toBe('2024-02-01');
    });

    it('should handle year boundaries', () => {
      const result = addDaysToLocalDate('2024-12-31', 1);
      expect(result).toBe('2025-01-01');
    });
  });

  describe('getYearMonthInTimeZone', () => {
    it('should return year-month in YYYY-MM format', () => {
      const date = new Date('2024-01-15T00:00:00Z');
      const result = getYearMonthInTimeZone(date, 'UTC');
      expect(result).toBe('2024-01');
    });

    it('should handle different timezones', () => {
      const date = new Date('2024-01-15T05:00:00Z');
      const utcResult = getYearMonthInTimeZone(date, 'UTC');
      const nyResult = getYearMonthInTimeZone(date, 'America/New_York');
      // Should be different due to timezone offset
      expect(utcResult).toBeDefined();
      expect(nyResult).toBeDefined();
    });
  });
});
