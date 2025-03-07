import { createClient } from 'redis';

let redisClient = null;
let redisConnecting = false;
let connectionAttempts = 0;
const MAX_ATTEMPTS = parseInt(process.env.REDIS_MAX_ATTEMPTS) || 3;

const initRedis = async () => {
    // Only attempt connection if Redis is enabled
    if (!process.env.REDIS_ENABLED || process.env.REDIS_ENABLED !== 'true') {
        console.log('Redis is disabled by configuration');
        return null;
    }

    // If already connecting or max attempts reached, return
    if (redisConnecting || connectionAttempts >= MAX_ATTEMPTS) {
        return redisClient;
    }

    redisConnecting = true;
    connectionAttempts++;

    try {
        redisClient = createClient({
            url: process.env.REDIS_URL,
            socket: {
                reconnectStrategy: (retries) => {
                    if (retries > 2) {
                        console.warn('Redis connection failed after 3 attempts');
                        return false; // stop retrying
                    }
                    return Math.min(retries * 1000, 3000);
                }
            }
        });

        redisClient.on('error', (err) => {
            console.error('Redis Client Error:', err.message);
            if (connectionAttempts === 1) {
                console.warn('Redis unavailable, falling back to memory store');
            }
        });

        redisClient.on('connect', () => {
            console.log('Redis Client Connected');
        });

        await redisClient.connect();
        redisConnecting = false;
        return redisClient;

    } catch (error) {
        console.error('Redis Connection Error:', error.message);
        redisClient = null;
        redisConnecting = false;
        return null;
    }
};

export const getRedisClient = () => redisClient;

// Initialize Redis when the module is imported
initRedis().catch(console.error);

export default redisClient; 