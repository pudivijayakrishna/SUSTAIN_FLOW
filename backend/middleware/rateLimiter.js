import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { getRedisClient } from '../config/redis.js';

const createLimiter = (options) => {
    const baseConfig = {
        ...options,
        standardHeaders: true,
        legacyHeaders: false
    };

    const redisClient = getRedisClient();
    
    // Only use Redis if available
    if (redisClient?.isReady) {
        try {
            return rateLimit({
                ...baseConfig,
                store: new RedisStore({
                    client: redisClient,
                    prefix: options.prefix || 'rate_limit:'
                })
            });
        } catch (error) {
            // Silently fall back to memory store
        }
    }

    // Use memory store
    return rateLimit(baseConfig);
};

export const otpLimiter = createLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour window
    max: 5, // limit each IP to 5 requests per windowMs
    message: {
        error: 'Too many OTP requests. Please try again in an hour.'
    },
    prefix: 'otp_limit:',
    keyGenerator: (req) => `${req.ip}_${req.body.email}`
});

export const documentSubmissionLimiter = createLimiter({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 3, // limit each IP to 3 submissions per day
    message: {
        error: 'Maximum document submissions reached for today. Please try again tomorrow.'
    },
    prefix: 'doc_submit_limit:'
});

export const loginAttemptLimiter = createLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per IP
    message: {
        error: 'Too many login attempts. Please try again in 15 minutes.'
    },
    prefix: 'login_limit:'
}); 