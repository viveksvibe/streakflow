import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { prisma, cleanupTestData, daysAgo, setHabitProgress } from '../fixtures/test-data.ts';

const uniqueEmail = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;

interface RegisteredUser {
  token: string;
  userId: string;
}

const registerUser = async (email: string): Promise<RegisteredUser> => {
  const response = await request(app)
    .post('/api/v1/auth/register')
    .set('User-Agent', 'test-agent')
    .send({
      fullName: 'Test User',
      email,
      password: 'password123',
      timezone: 'UTC',
    });

  return {
    token: response.body.data.tokens.accessToken,
    userId: response.body.data.user.id,
  };
};

const createHabit = (token: string, body: Record<string, unknown>) =>
  request(app)
    .post('/api/v1/habits')
    .set('Cookie', `accessToken=${token}`)
    .set('User-Agent', 'test-agent')
    .send(body);

describe('Habits Integration Tests', () => {
  let user: RegisteredUser;

  beforeEach(async () => {
    await cleanupTestData();
    user = await registerUser(uniqueEmail('habits'));
  });

  describe('POST /api/v1/habits', () => {
    it('should create a new habit', async () => {
      const response = await createHabit(user.token, {
        name: 'Exercise',
        icon: '💪',
        reminderEnabled: false,
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Exercise');
      expect(response.body.data.icon).toBe('💪');
      expect(response.body.data.currentStreak).toBe(0);
      expect(response.body.data.bestStreak).toBe(0);
      expect(response.body.data.status).toBe('ACTIVE');
    });

    it('should create habit with reminder', async () => {
      const response = await createHabit(user.token, {
        name: 'Meditation',
        icon: '🧘',
        reminderEnabled: true,
        reminderTime: '09:00',
      });

      expect(response.status).toBe(201);
      expect(response.body.data.reminderEnabled).toBe(true);
      expect(response.body.data.reminderTime).toBe('09:00');
    });

    it('should apply the default icon when none is provided', async () => {
      const response = await createHabit(user.token, { name: 'Read' });

      expect(response.status).toBe(201);
      expect(response.body.data.icon).toBe('✅');
    });

    it('should reject reminderEnabled without reminderTime', async () => {
      const response = await createHabit(user.token, {
        name: 'Journal',
        reminderEnabled: true,
      });

      expect(response.status).toBe(400);
    });

    it('should reject an empty name', async () => {
      const response = await createHabit(user.token, { name: '   ' });

      expect(response.status).toBe(400);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/habits')
        .set('User-Agent', 'test-agent')
        .send({ name: 'Exercise', icon: '💪' });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/v1/habits', () => {
    it('should list user habits with today summary', async () => {
      await createHabit(user.token, { name: 'Exercise', icon: '💪' });
      await createHabit(user.token, { name: 'Read', icon: '📚' });

      const response = await request(app)
        .get('/api/v1/habits')
        .set('Cookie', `accessToken=${user.token}`)
        .set('User-Agent', 'test-agent');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.habits).toHaveLength(2);
      expect(response.body.data.summary.totalHabits).toBe(2);
      expect(response.body.data.summary.completedToday).toBe(0);
      expect(typeof response.body.data.summary.localDate).toBe('string');
      expect(response.body.data.habits[0].completedToday).toBe(false);
      expect(response.body.data.habits[0].frozenToday).toBe(false);
    });

    it('should return empty list for new user', async () => {
      const response = await request(app)
        .get('/api/v1/habits')
        .set('Cookie', `accessToken=${user.token}`)
        .set('User-Agent', 'test-agent');

      expect(response.status).toBe(200);
      expect(response.body.data.habits).toHaveLength(0);
      expect(response.body.data.summary.totalHabits).toBe(0);
    });

    it('should hide archived habits', async () => {
      const created = await createHabit(user.token, { name: 'Temporary' });
      await request(app)
        .delete(`/api/v1/habits/${created.body.data.id}`)
        .set('Cookie', `accessToken=${user.token}`)
        .set('User-Agent', 'test-agent');

      const response = await request(app)
        .get('/api/v1/habits')
        .set('Cookie', `accessToken=${user.token}`)
        .set('User-Agent', 'test-agent');

      expect(response.body.data.habits).toHaveLength(0);
    });
  });

  describe('PATCH /api/v1/habits/:habitId', () => {
    it('should update a habit', async () => {
      const created = await createHabit(user.token, { name: 'Exercise', icon: '💪' });
      const habitId = created.body.data.id;

      const response = await request(app)
        .patch(`/api/v1/habits/${habitId}`)
        .set('Cookie', `accessToken=${user.token}`)
        .set('User-Agent', 'test-agent')
        .send({ name: 'Morning Exercise', icon: '🏃' });

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe('Morning Exercise');
      expect(response.body.data.icon).toBe('🏃');
    });

    it('should clear reminderTime when reminders are disabled', async () => {
      const created = await createHabit(user.token, {
        name: 'Meditation',
        reminderEnabled: true,
        reminderTime: '09:00',
      });
      const habitId = created.body.data.id;

      const response = await request(app)
        .patch(`/api/v1/habits/${habitId}`)
        .set('Cookie', `accessToken=${user.token}`)
        .set('User-Agent', 'test-agent')
        .send({ reminderEnabled: false });

      expect(response.status).toBe(200);
      expect(response.body.data.reminderEnabled).toBe(false);
      expect(response.body.data.reminderTime).toBeNull();
    });

    it('should return 404 for a habit owned by another user', async () => {
      const other = await registerUser(uniqueEmail('other'));
      const otherHabit = await createHabit(other.token, { name: 'Secret habit' });

      const response = await request(app)
        .patch(`/api/v1/habits/${otherHabit.body.data.id}`)
        .set('Cookie', `accessToken=${user.token}`)
        .set('User-Agent', 'test-agent')
        .send({ name: 'Hijacked' });

      expect(response.status).toBe(404);
    });

    it('should return 400 for a malformed habit id', async () => {
      const response = await request(app)
        .patch('/api/v1/habits/not-a-cuid')
        .set('Cookie', `accessToken=${user.token}`)
        .set('User-Agent', 'test-agent')
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/v1/habits/:habitId/complete-today', () => {
    it('should complete a habit for today', async () => {
      const created = await createHabit(user.token, { name: 'Exercise' });
      const habitId = created.body.data.id;

      const response = await request(app)
        .post(`/api/v1/habits/${habitId}/complete-today`)
        .set('Cookie', `accessToken=${user.token}`)
        .set('User-Agent', 'test-agent');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.alreadyCompleted).toBe(false);
      expect(response.body.data.currentStreak).toBe(1);
      expect(response.body.data.bestStreak).toBe(1);
      expect(response.body.data.consumedFreeze).toBe(false);
    });

    it('should not complete already completed habit', async () => {
      const created = await createHabit(user.token, { name: 'Exercise' });
      const habitId = created.body.data.id;

      await request(app)
        .post(`/api/v1/habits/${habitId}/complete-today`)
        .set('Cookie', `accessToken=${user.token}`)
        .set('User-Agent', 'test-agent');

      const response = await request(app)
        .post(`/api/v1/habits/${habitId}/complete-today`)
        .set('Cookie', `accessToken=${user.token}`)
        .set('User-Agent', 'test-agent');

      expect(response.status).toBe(200);
      expect(response.body.data.alreadyCompleted).toBe(true);
      expect(response.body.data.currentStreak).toBe(1);
    });

    it('should grow the streak when completed on consecutive days', async () => {
      const created = await createHabit(user.token, { name: 'Exercise' });
      const habitId = created.body.data.id;

      await setHabitProgress(habitId, {
        currentStreak: 4,
        bestStreak: 4,
        lastCompletedDate: daysAgo(1),
      });

      const response = await request(app)
        .post(`/api/v1/habits/${habitId}/complete-today`)
        .set('Cookie', `accessToken=${user.token}`)
        .set('User-Agent', 'test-agent');

      expect(response.status).toBe(200);
      expect(response.body.data.currentStreak).toBe(5);
      expect(response.body.data.bestStreak).toBe(5);
      expect(response.body.data.consumedFreeze).toBe(false);
    });

    it('should auto-consume a freeze when exactly one day was missed', async () => {
      const created = await createHabit(user.token, { name: 'Exercise' });
      const habitId = created.body.data.id;

      await setHabitProgress(habitId, {
        currentStreak: 3,
        bestStreak: 3,
        lastCompletedDate: daysAgo(2),
      });

      const response = await request(app)
        .post(`/api/v1/habits/${habitId}/complete-today`)
        .set('Cookie', `accessToken=${user.token}`)
        .set('User-Agent', 'test-agent');

      expect(response.status).toBe(200);
      expect(response.body.data.consumedFreeze).toBe(true);
      expect(response.body.data.remainingFreezes).toBe(1);
      expect(response.body.data.currentStreak).toBe(4);

      const usage = await prisma.streakFreezeUsage.findFirst({
        where: { habitId },
      });
      expect(usage).not.toBeNull();
      expect(usage?.missedLocalDate).toBe(daysAgo(1));
    });

    it('should reset the streak when too many days were missed', async () => {
      const created = await createHabit(user.token, { name: 'Exercise' });
      const habitId = created.body.data.id;

      await setHabitProgress(habitId, {
        currentStreak: 7,
        bestStreak: 7,
        lastCompletedDate: daysAgo(4),
      });
      await prisma.user.update({
        where: { id: user.userId },
        data: { streakFreezeCredits: 0 },
      });

      const response = await request(app)
        .post(`/api/v1/habits/${habitId}/complete-today`)
        .set('Cookie', `accessToken=${user.token}`)
        .set('User-Agent', 'test-agent');

      expect(response.status).toBe(200);
      expect(response.body.data.currentStreak).toBe(1);
      expect(response.body.data.bestStreak).toBe(7); // best streak is preserved
      expect(response.body.data.consumedFreeze).toBe(false);
    });

    it('should return 404 when completing an archived habit', async () => {
      const created = await createHabit(user.token, { name: 'Exercise' });
      const habitId = created.body.data.id;

      await request(app)
        .delete(`/api/v1/habits/${habitId}`)
        .set('Cookie', `accessToken=${user.token}`)
        .set('User-Agent', 'test-agent');

      const response = await request(app)
        .post(`/api/v1/habits/${habitId}/complete-today`)
        .set('Cookie', `accessToken=${user.token}`)
        .set('User-Agent', 'test-agent');

      expect(response.status).toBe(404);
    });

    it('should return 404 when completing another user habit', async () => {
      const other = await registerUser(uniqueEmail('other'));
      const otherHabit = await createHabit(other.token, { name: 'Secret habit' });

      const response = await request(app)
        .post(`/api/v1/habits/${otherHabit.body.data.id}/complete-today`)
        .set('Cookie', `accessToken=${user.token}`)
        .set('User-Agent', 'test-agent');

      expect(response.status).toBe(404);
    });

    it('should record completions against the user local date', async () => {
      const timezone = 'America/New_York';
      const tzEmail = uniqueEmail('tz');

      const registerResponse = await request(app)
        .post('/api/v1/auth/register')
        .set('User-Agent', 'test-agent')
        .send({
          fullName: 'TZ User',
          email: tzEmail,
          password: 'password123',
          timezone,
        });

      const tzToken = registerResponse.body.data.tokens.accessToken;
      const created = await createHabit(tzToken, { name: 'Exercise' });

      const response = await request(app)
        .post(`/api/v1/habits/${created.body.data.id}/complete-today`)
        .set('Cookie', `accessToken=${tzToken}`)
        .set('User-Agent', 'test-agent');

      expect(response.status).toBe(200);
      expect(response.body.data.localDate).toBe(daysAgo(0, timezone));
    });
  });

  describe('POST /api/v1/habits/:habitId/freeze-today', () => {
    it('should freeze a habit completed yesterday', async () => {
      const created = await createHabit(user.token, { name: 'Exercise' });
      const habitId = created.body.data.id;

      await setHabitProgress(habitId, {
        currentStreak: 2,
        bestStreak: 2,
        lastCompletedDate: daysAgo(1),
      });

      const response = await request(app)
        .post(`/api/v1/habits/${habitId}/freeze-today`)
        .set('Cookie', `accessToken=${user.token}`)
        .set('User-Agent', 'test-agent');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.remainingFreezes).toBe(1);
      expect(response.body.data.localDate).toBe(daysAgo(0));

      const usage = await prisma.streakFreezeUsage.findFirst({
        where: { habitId },
      });
      expect(usage?.missedLocalDate).toBe(daysAgo(0));
    });

    it('should reject freezing a habit with no active streak', async () => {
      const created = await createHabit(user.token, { name: 'Exercise' });

      const response = await request(app)
        .post(`/api/v1/habits/${created.body.data.id}/freeze-today`)
        .set('Cookie', `accessToken=${user.token}`)
        .set('User-Agent', 'test-agent');

      expect(response.status).toBe(400);
    });

    it('should reject freezing after completing the habit today', async () => {
      const created = await createHabit(user.token, { name: 'Exercise' });
      const habitId = created.body.data.id;

      await setHabitProgress(habitId, {
        currentStreak: 1,
        bestStreak: 1,
        lastCompletedDate: daysAgo(1),
      });

      // Complete today as well — freeze must now be rejected.
      await request(app)
        .post(`/api/v1/habits/${habitId}/complete-today`)
        .set('Cookie', `accessToken=${user.token}`)
        .set('User-Agent', 'test-agent');

      const response = await request(app)
        .post(`/api/v1/habits/${habitId}/freeze-today`)
        .set('Cookie', `accessToken=${user.token}`)
        .set('User-Agent', 'test-agent');

      expect(response.status).toBe(400);
    });

    it('should reject a second freeze on the same day', async () => {
      const created = await createHabit(user.token, { name: 'Exercise' });
      const habitId = created.body.data.id;

      await setHabitProgress(habitId, {
        currentStreak: 2,
        bestStreak: 2,
        lastCompletedDate: daysAgo(1),
      });

      await request(app)
        .post(`/api/v1/habits/${habitId}/freeze-today`)
        .set('Cookie', `accessToken=${user.token}`)
        .set('User-Agent', 'test-agent');

      const response = await request(app)
        .post(`/api/v1/habits/${habitId}/freeze-today`)
        .set('Cookie', `accessToken=${user.token}`)
        .set('User-Agent', 'test-agent');

      expect(response.status).toBe(400);
    });

    it('should reject freezing without credits', async () => {
      await prisma.user.update({
        where: { id: user.userId },
        data: { streakFreezeCredits: 0 },
      });

      const created = await createHabit(user.token, { name: 'Exercise' });
      const habitId = created.body.data.id;

      await setHabitProgress(habitId, {
        currentStreak: 1,
        bestStreak: 1,
        lastCompletedDate: daysAgo(1),
      });

      const response = await request(app)
        .post(`/api/v1/habits/${habitId}/freeze-today`)
        .set('Cookie', `accessToken=${user.token}`)
        .set('User-Agent', 'test-agent');

      expect(response.status).toBe(400);
    });

    it('should return 404 for another user habit', async () => {
      const other = await registerUser(uniqueEmail('other'));
      const otherHabit = await createHabit(other.token, { name: 'Secret habit' });

      const response = await request(app)
        .post(`/api/v1/habits/${otherHabit.body.data.id}/freeze-today`)
        .set('Cookie', `accessToken=${user.token}`)
        .set('User-Agent', 'test-agent');

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/v1/habits/:habitId', () => {
    it('should archive a habit', async () => {
      const created = await createHabit(user.token, { name: 'Exercise' });
      const habitId = created.body.data.id;

      const response = await request(app)
        .delete(`/api/v1/habits/${habitId}`)
        .set('Cookie', `accessToken=${user.token}`)
        .set('User-Agent', 'test-agent');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const stored = await prisma.habit.findUnique({ where: { id: habitId } });
      expect(stored?.status).toBe('ARCHIVED');
    });

    it('should return 404 when archiving an already archived habit', async () => {
      const created = await createHabit(user.token, { name: 'Exercise' });
      const habitId = created.body.data.id;

      await request(app)
        .delete(`/api/v1/habits/${habitId}`)
        .set('Cookie', `accessToken=${user.token}`)
        .set('User-Agent', 'test-agent');

      const response = await request(app)
        .delete(`/api/v1/habits/${habitId}`)
        .set('Cookie', `accessToken=${user.token}`)
        .set('User-Agent', 'test-agent');

      expect(response.status).toBe(404);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .delete('/api/v1/habits/some-id')
        .set('User-Agent', 'test-agent');

      expect(response.status).toBe(401);
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
});
