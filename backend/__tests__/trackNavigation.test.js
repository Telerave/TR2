const request = require('supertest');
const app = require('../server');
let server;

beforeAll((done) => {
  server = app.listen(3001, () => {
    console.log('Test server is running on port 3001');
    done();
  });
});

afterAll((done) => {
  server.close(done);
});

describe('Track Navigation Tests', () => {
  let sessionId;

  beforeEach(async () => {
    const response = await request(app)
      .post('/api/session')
      .expect(200);
    sessionId = response.body.sessionId;
  });

  test('Should navigate forward correctly', async () => {
    const tracks = [];
    for (let i = 0; i < 3; i++) {
      const response = await request(app)
        .get(`/api/track/${sessionId}/next`)
        .expect(200);
      tracks.push(response.body);
    }
    expect(tracks.length).toBe(3);
    expect(tracks[1].id).not.toBe(tracks[0].id);
    expect(tracks[2].id).not.toBe(tracks[1].id);
  });

  test('Should navigate back to previous track', async () => {
    const next1 = await request(app)
      .get(`/api/track/${sessionId}/next`)
      .expect(200);
    const next2 = await request(app)
      .get(`/api/track/${sessionId}/next`)
      .expect(200);
    
    const prev = await request(app)
      .get(`/api/track/${sessionId}/prev`)
      .expect(200);
    
    expect(prev.body.id).toBe(next1.body.id);
  });

  test('Should start new history after going back and forward', async () => {
    await request(app)
      .get(`/api/track/${sessionId}/next`)
      .expect(200);
    const track2 = await request(app)
      .get(`/api/track/${sessionId}/next`)
      .expect(200);
    
    await request(app)
      .get(`/api/track/${sessionId}/prev`)
      .expect(200);
    
    const newTrack = await request(app)
      .get(`/api/track/${sessionId}/next`)
      .expect(200);
    
    expect(newTrack.body.id).not.toBe(track2.body.id);
  });

  test('Should maintain history limit of 10 tracks', async () => {
    const tracks = [];
    for (let i = 0; i < 11; i++) {
      const response = await request(app)
        .get(`/api/track/${sessionId}/next`)
        .expect(200);
      tracks.push(response.body);
    }
    
    let prevCount = 0;
    while (true) {
      const response = await request(app)
        .get(`/api/track/${sessionId}/prev`);
      
      if (response.status === 404) break;
      prevCount++;
    }
    
    expect(prevCount).toBeLessThanOrEqual(10);
  });
});