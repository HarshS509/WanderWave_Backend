export const cacheHandler = (key) => async (req, res, next) => {
  try {
    const cachedData = await retrieveDataFromCache(key);
    if (cachedData) {
      console.log(`Getting cached data for key: ${key}`);
      return res.status(200).json(cachedData);
    }
    next(); // Proceed to the route handler if data is not cached
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
