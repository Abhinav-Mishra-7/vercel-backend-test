const redisClient = require('../config/redis');

const submitCodeRateLimiter = async (req, res, next) => {
  const userId = req.result._id; 
  const redisKey = `submit_cooldown:${userId}`;

  try {
    
    // Atomically set key only if it doesn't exist with expiration
    const result = await redisClient.set(redisKey, 'cooldown_active', {
      EX: 5,          // Expire after 10 seconds
      NX: true         // Only set if not exists
    });

    // Key already exists - reject request
    if (result === null) {
      return res.status(429).json({
        error: 'Please wait 5 seconds before submitting again'
      });
    }

    next();
  } catch (error) {
    console.error('Rate limiter error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


module.exports = submitCodeRateLimiter ;