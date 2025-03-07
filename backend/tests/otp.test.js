import request from 'supertest';
import app from '../server.js';
import { otpStore } from '../controller/otpController.js';
import User from '../models/user.js';
import { generateToken } from '../config/jwtUtils.js';

describe('OTP Functionality', () => {
    beforeEach(() => {
        otpStore.clear();
    });

    describe('POST /auth/send-otp', () => {
        it('should send OTP to valid email', async () => {
            const res = await request(app)
                .post('/auth/send-otp')
                .send({ email: 'test@example.com' });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.expiresIn).toBe(120);
        });

        it('should limit OTP requests', async () => {
            const email = 'test@example.com';
            
            // Make 6 requests (1 over limit)
            for (let i = 0; i < 6; i++) {
                const res = await request(app)
                    .post('/auth/send-otp')
                    .send({ email });

                if (i < 5) {
                    expect(res.status).toBe(200);
                } else {
                    expect(res.status).toBe(429); // Too Many Requests
                }
            }
        });
    });

    describe('POST /auth/verify-otp', () => {
        it('should verify valid OTP', async () => {
            const email = 'test@example.com';
            const otp = '123456';

            // Store OTP
            otpStore.set(email, {
                otp,
                expiry: Date.now() + 120000,
                attempts: 0
            });

            const res = await request(app)
                .post('/auth/verify-otp')
                .send({ email, otp });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('should reject invalid OTP', async () => {
            const email = 'test@example.com';
            
            // Store OTP
            otpStore.set(email, {
                otp: '123456',
                expiry: Date.now() + 120000,
                attempts: 0
            });

            const res = await request(app)
                .post('/auth/verify-otp')
                .send({ email, otp: '654321' });

            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Invalid OTP');
        });
    });
}); 