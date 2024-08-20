import Review from '../models/review.model.js' 
import reviewCatering from '../models/reviewCatering.model.js' 
import Listing from '../models/listing.model.js' 
import Catering from '../models/catering.model.js'

export const leaveReview = async (req, res, next) => {
    try {
        const { user, listing, stars, comment } = req.body;
    
        // Check if the user is the owner of the listing
        const listingData = await Listing.findById(listing);
    
        // Check if the user has already reviewed this listing
        const existingReview = await Review.findOne({ user, listing });
        if (existingReview) {
            return res.status(400).json({ message: 'You have already left a review for this listing.' });
        }
    
        const review = new Review({ user, listing, stars, comment });
        await review.save();
    
        res.json({ message: 'Review created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'An error occurred while trying to leave a review.' });
    }
};



export const getReview = async (req, res, next) => {
    try {
        const listingId = req.params.listingId;
        const reviews = await Review.find({ listing: listingId }).populate('user');
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'An error occurred while trying to get reviews.' });
    }
};

export const leaveCategoryReview = async (req, res, next) => {
    try {
      const { user, catering, stars, comment } = req.body;
  
      // Check if the category exists
      const categoryData = await Catering.findById(catering);
      if (!categoryData) {
        return res.status(404).json({ message: 'Catering not found' });
      }
  
      // Check if the user has already reviewed this category
      const existingReview = await reviewCatering.findOne({ user, catering });
      if (existingReview) {
        return res.status(400).json({ message: 'You have already left a review for this category.' });
      }
  
      // Create and save the new review
      const newReview  = new reviewCatering({ user, catering, stars, comment });
      await newReview.save();
  
      res.json({ message: 'Review created successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  export const getReviewCatering = async (req, res, next) => {
    try {
        const cateringId = req.params.cateringId;
        const reviews = await reviewCatering.find({ catering: cateringId }).populate('user');
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'An error occurred while trying to get reviews.' });
    }
};