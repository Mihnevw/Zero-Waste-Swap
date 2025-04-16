// Get recent listings
exports.getRecentListings = async (req, res) => {
  try {
    const listings = await Listing.find({ status: 'active' })
      .sort({ createdAt: -1 })
      .limit(8)
      .populate('user', 'username email photoURL displayName');

    console.log('Fetched recent listings:', {
      count: listings.length,
      listings: listings.map(listing => ({
        id: listing._id,
        title: listing.title,
        userId: listing.userId
      }))
    });

    res.json(listings);
  } catch (error) {
    console.error('Error fetching recent listings:', error);
    res.status(500).json({ message: 'Failed to fetch recent listings', error: error.message });
  }
}; 