const Court = require('../models/court.model');
const redisClient = require('../config/redis');

// ADD a new court (admin only)
const addCourt = async (req, res) => {
  try {
    const { name, address, latitude, longitude, pricePerSlot, slots } = req.body;

    const court = await Court.create({
      name,
      address,
      location: {
        type: 'Point',
        // GeoJSON needs [longitude, latitude] — ORDER MATTERS!
        coordinates: [longitude, latitude],
      },
      pricePerSlot,
      slots,
      addedBy: req.admin.email, // from our adminAuth middleware
    });

    // Clear cached courts in Redis since we added a new one
    // (We'll use Redis caching when users search for courts)
    await redisClient.del('courts:all');

    res.status(201).json({
      message: 'Court added successfully',
      court,
    });

  } catch (error) {
    res.status(500).json({ message: 'Failed to add court', error: error.message });
  }
};

// GET all courts (admin sees all)
const getAllCourts = async (req, res) => {
  try {
    const courts = await Court.find().sort({ createdAt: -1 });
    res.json({ courts });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch courts' });
  }
};

// GET nearby courts (for users — based on their location)
const getNearbyCourts = async (req, res) => {
  try {
    const { latitude, longitude, maxDistance = 5000 } = req.query;
    // maxDistance is in meters — default 5000m = 5km

    // Check Redis cache first
    const cacheKey = `courts:${latitude}:${longitude}`;
    const cached = await redisClient.get(cacheKey);

    if (cached) {
      // Found in cache — return immediately without hitting MongoDB
      console.log('✅ Returning courts from Redis cache');
      return res.json(JSON.parse(cached));
    }

    // Not in cache — query MongoDB
    const courts = await Court.find({
      isActive: true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: parseInt(maxDistance),
        },
      },
    });

    const result = { courts };

    // Save to Redis cache for 5 minutes (300 seconds)
    await redisClient.setex(cacheKey, 300, JSON.stringify(result));

    res.json(result);

  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch nearby courts', error: error.message });
  }
};

// DELETE a court (admin only)
const deleteCourt = async (req, res) => {
  try {
    const { courtId } = req.params;
    await Court.findByIdAndDelete(courtId);
    await redisClient.del('courts:all');
    res.json({ message: 'Court deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete court' });
  }
};

module.exports = { addCourt, getAllCourts, getNearbyCourts, deleteCourt };