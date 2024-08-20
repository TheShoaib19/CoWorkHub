import Review from '../models/reviewCatering.model' 
import Catering from '../models/reviewCatering.model.js'

export const leaveCategoryReview = async (req, res, next) => {
    try {
      const { user, catering, stars, comment } = req.body;
  
      // Check if the category exists
      const categoryData = await Catering.findById(catering);
      if (!categoryData) {
        return res.status(404).json({ message: 'Catering not found' });
      }
  
      // Check if the user has already reviewed this category
      const existingReview = await Review.findOne({ user, catering });
      if (existingReview) {
        return res.status(400).json({ message: 'You have already left a review for this category.' });
      }
  
      // Create and save the new review
      const review = new Review({ user, catering, stars, comment });
      await review.save();
  
      res.json({ message: 'Review created successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

export const getReviewCatering = async (req, res, next) => {
    try {
        const CateringId = req.params.CateringId;
        const reviews = await Review.find({ Catering: CateringId }).populate('user');
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'An error occurred while trying to get reviews.' });
    }
};