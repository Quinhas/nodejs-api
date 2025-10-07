import request from 'supertest';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { closeDatabase } from '../../../../db/client.ts';
import { app } from '../../../app.ts';

describe('Health Check Route', () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
    await closeDatabase();
  });

  test('should return 200 and ok status when all services are healthy', async () => {
    const response = await request(app.server).get('/v1/health');

    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      status: 'ok',
      name: 'nodejs-api',
      version: '1.0.0',
      environment: 'test',
      timezone: expect.any(String),
      timestamp: expect.any(String),
      uptime: expect.any(Number),
      services: {
        db: 'ok',
      },
    });
  });

  test('should return uptime greater than 0', async () => {
    const response = await request(app.server).get('/v1/health');

    expect(response.status).toEqual(200);
    expect(response.body.uptime).toBeGreaterThan(0);
  });

  test('should include db service status', async () => {
    const response = await request(app.server).get('/v1/health');

    expect(response.status).toEqual(200);
    expect(response.body.services).toHaveProperty('db');
    expect(['ok', 'error']).toContain(response.body.services.db);
  });
});
