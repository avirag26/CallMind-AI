import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('CallsController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/calls/mock (POST) should create a ringing call', async () => {
    const response = await request(app.getHttpServer())
      .post('/calls/mock')
      .send({ phoneNumber: '+1234567890', patientName: 'Rahul' })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.status).toBe('RINGING');
    expect(response.body.phoneNumber).toBe('+1234567890');
    expect(response.body.patientName).toBe('Rahul');
  });
});
