
const request = require('supertest');
const app = require('../src/app');

describe('API Endpoints', () => {
  it('GET /health should return 200 OK', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'OK');
  });

  // Example of how we would test auth if we mocked supabase
  // it('GET /api/v1/patients should fail without token', async () => {
  //   const res = await request(app).get('/api/v1/patients');
  //   expect(res.statusCode).toEqual(401);
  // });
});
