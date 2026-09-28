import mongoose from 'mongoose';

/**
 * @desc    Get API health status & Hello World message
 * @route   GET /api/health
 * @access  Public
 */
export const getHealthStatus = (req, res) => {
  const dbStateMap = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting',
  };

  res.status(200).json({
    success: true,
    message: 'Hello World! Express API is connected and operating smoothly.',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      server: 'Online',
      database: dbStateMap[mongoose.connection.readyState] || 'Unknown',
    },
  });
};
