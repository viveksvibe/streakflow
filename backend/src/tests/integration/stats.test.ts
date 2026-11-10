import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { prisma, cleanupTestData, setHabitProgress } from '../fixtures/test-data.js';

const uniqueEmail = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;

describe('Stats Integration Tests', () => {
  let authToken: string;
  let userId: string;

  const createHabit = (body: Record<string, unknown>) =>
    request(app)
      .post('/api/v1/habits')
      .set('Cookie', `accessToken=${authToken}`)
      .set('User-Agent', 'test-agent')
      .send(body);

  const completeHabit = (habitId: string) =>
    request(app)
      .post(`/api/v1/habits/${habitId}/complete-today`)
      .set('Cookie', `accessToken=${authToken}`)
      .set('User-Agent', 'test-agent');

  beforeEach(async () => {
    await cleanupTestData();

    const registerResponse = await request(app)
      .post('/api/v1/auth/register')
      .set('User-Agent', 'test-agent')
      .send({
        fullName: 'Test User',
        email: uniqueEmail('stats'),
        password: 'password123',
        timezone: 'UTC',
      });

    authToken = registerResponse.body.data.tokens.accessToken;
    userId = registerResponse.body.data.user.id;
  });

  describe('GET /api/v1/stats/dashboard', () => {
    it('should get dashboard data', async () => {
      const response = await request(app)
        .get('/api/v1/stats/dashboard')
        .set('Cookie', `accessToken=${authToken}`)
        .set('User-Agent', 'test-agent');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.today).toBeDefined();
      expect(response.body.data.habits).toBeDefined();
      expect(response.body.data.streakFreeze).toBeDefined();
      expect(response.body.data.stats).toBeDefined();
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/stats/dashboard')
        .set('User-Agent', 'test-agent');

      expect(response.status).toBe(401);
    });

    it('should include habit statistics', async () => {
      await createHabit({ name: 'Exercise', icon: '💪' });

      const response = await request(app)
        .get('/api/v1/stats/dashboard')
        .set('Cookie', `accessToken=${authToken}`)
        .set('User-Agent', 'test-agent');

      expect(response.body.data.habits).toHaveLength(1);
      expect(response.body.data.today.totalHabits).toBe(1);
    });

    it('should compute today completion rate', async () => {
      const first = await createHabit({ name: 'Exercise' });
      await createHabit({ name: 'Read' });

      await completeHabit(first.body.data.id);

      const response = await request(app)
        .get('/api/v1/stats/dashboard')
        .set('Cookie', `accessToken=${authToken}`)
        .set('User-Agent', 'test-agent');

      expect(response.body.data.today.completedHabits).toBe(1);
      expect(response.body.data.today.totalHabits).toBe(2);
      expect(response.body.data.today.completionRate).toBe(50);
    });

    it('should count total completions across habits', async () => {
      const first = await createHabit({ name: 'Exercise' });
      const second = await createHabit({ name: 'Read' });

      await completeHabit(first.body.data.id);
      await completeHabit(second.body.data.id);

      const response = await request(app)
        .get('/api/v1/stats/dashboard')
        .set('Cookie', `accessToken=${authToken}`)
        .set('User-Agent', 'test-agent');

      expect(response.body.data.stats.totalCompletions).toBe(2);
    });
  });

  describe('GET /api/v1/stats/weekly-progress', () => {
    it('should get weekly progress', async () => {
      const response = await request(app)
        .get('/api/v1/stats/weekly-progress')
        .set('Cookie', `accessToken=${authToken}`)
        .set('User-Agent', 'test-agent');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.series).toBeDefined();
      expect(response.body.data.series).toHaveLength(7);
      expect(response.body.data.startDate).toBeDefined();
      expect(response.body.data.endDate).toBeDefined();
    });

    it('should include today completions in the series', async () => {
      const first = await createHabit({ name: 'Exercise' });
      const second = await createHabit({ name: 'Read' });

      await completeHabit(first.body.data.id);
      await completeHabit(second.body.data.id);

      const response = await request(app)
        .get('/api/v1/stats/weekly-progress')
        .set('Cookie', `accessToken=${authToken}`)
        .set('User-Agent', 'test-agent');

      const series = response.body.data.series;
      expect(series[series.length - 1].completedHabits).toBe(2);
      expect(series[0].completedHabits).toBe(0);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/stats/weekly-progress')
        .set('User-Agent', 'test-agent');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/v1/stats/activity-heatmap', () => {
    it('should get activity heatmap', async () => {
      const response = await request(app)
        .get('/api/v1/stats/activity-heatmap')
        .set('Cookie', `accessToken=${authToken}`)
        .set('User-Agent', 'test-agent');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.activity).toBeDefined();
      expect(response.body.data.activity).toHaveLength(31);
      expect(response.body.data.startDate).toBeDefined();
      expect(response.body.data.endDate).toBeDefined();
    });

    it('should mark today as completed after a completion', async () => {
      const created = await createHabit({ name: 'Exercise' });
      await completeHabit(created.body.data.id);

      const response = await request(app)
        .get('/api/v1/stats/activity-heatmap')
        .set('Cookie', `accessToken=${authToken}`)
        .set('User-Agent', 'test-agent');

      const today = response.body.data.activity[response.body.data.activity.length - 1];
      expect(today.status).toBe('completed');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/stats/activity-heatmap')
        .set('User-Agent', 'test-agent');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/v1/stats/habit-leaderboard', () => {
    it('should get habit leaderboard', async () => {
      const response = await request(app)
        .get('/api/v1/stats/habit-leaderboard')
        .set('Cookie', `accessToken=${authToken}`)
        .set('User-Agent', 'test-agent');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/stats/habit-leaderboard')
        .set('User-Agent', 'test-agent');

      expect(response.status).toBe(401);
    });

    it('should sort habits by current streak', async () => {
      const lowStreak = await createHabit({ name: 'Low' });
      const highStreak = await createHabit({ name: 'High' });
      const midStreak = await createHabit({ name: 'Mid' });

      await setHabitProgress(lowStreak.body.data.id, { currentStreak: 1, bestStreak: 1 });
      await setHabitProgress(highStreak.body.data.id, { currentStreak: 9, bestStreak: 9 });
      await setHabitProgress(midStreak.body.data.id, { currentStreak: 5, bestStreak: 5 });

      const response = await request(app)
        .get('/api/v1/stats/habit-leaderboard')
        .set('Cookie', `accessToken=${authToken}`)
        .set('User-Agent', 'test-agent');

      const names = response.body.data.map((habit: { name: string }) => habit.name);
      expect(names[0]).toBe('High');
      expect(names[1]).toBe('Mid');
      expect(names[2]).toBe('Low');
    });

    it('should hide archived habits from the leaderboard', async () => {
      const created = await createHabit({ name: 'Archived habit' });
      await request(app)
        .delete(`/api/v1/habits/${created.body.data.id}`)
        .set('Cookie', `accessToken=${authToken}`)
        .set('User-Agent', 'test-agent');

      const response = await request(app)
        .get('/api/v1/stats/habit-leaderboard')
        .set('Cookie', `accessToken=${authToken}`)
        .set('User-Agent', 'test-agent');

      expect(response.body.data).toHaveLength(0);
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
});
