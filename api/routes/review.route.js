import express from 'express'
import { leaveReview, getReview , leaveCategoryReview,getReviewCatering} from '../controllers/review.controller.js';

const router = express.Router();

router.post("/catering/create", leaveCategoryReview);
router.get("/catering/:cateringId", getReviewCatering);
router.post("/create", leaveReview);
router.get("/listing/:listingId", getReview);

export default router;