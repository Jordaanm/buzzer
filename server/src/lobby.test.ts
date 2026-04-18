import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import { app, httpServer, rooms } from './app';

afterAll(() => { httpServer.close(); });

describe('GET /api/lobby', () => {
  it('returns exactly 10 slots', async () => {
    const res = await request(app).get('/api/lobby');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(10);
  });

  it('each slot has the correct shape', async () => {
    const res = await request(app).get('/api/lobby');
    for (const slot of res.body) {
      expect(typeof slot.id).toBe('number');
      expect(typeof slot.name).toBe('string');
      expect(typeof slot.icon).toBe('string');
      expect(typeof slot.playerCount).toBe('number');
      expect(typeof slot.hasPassword).toBe('boolean');
    }
  });

  it('vacant slots show playerCount 0 and hasPassword false', async () => {
    const res = await request(app).get('/api/lobby');
    for (const slot of res.body) {
      expect(slot.playerCount).toBe(0);
      expect(slot.hasPassword).toBe(false);
    }
  });

  it('reflects live playerCount and hasPassword', async () => {
    rooms.joinRoom(2, 'fake-socket', 'Tester', 'cat', '#fff');
    const room2 = rooms.getRoom(2)!;
    room2.password = 'pw';

    const res = await request(app).get('/api/lobby');
    const slot = res.body.find((s: { id: number }) => s.id === 2);
    expect(slot.playerCount).toBe(1);
    expect(slot.hasPassword).toBe(true);

    // cleanup
    rooms.handleDisconnect('fake-socket', 2);
  });
});
