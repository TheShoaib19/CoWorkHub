import mongoose from "mongoose";
import Listing from "./listing.model.js";

const ReviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    listing: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Listing',
        required: true
    },
    stars: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true
    }
});

ReviewSchema.statics.getAverageRatingAndReviewCount = async function(listingId) {
    const agg = await this.aggregate([
        { $match: { listing: listingId } },
        { $group: {
            _id: '$listing',
            averageRating: { $avg: '$stars' },
            reviewCount: { $sum: 1 }
        }}
    ]);

    try {
        await Listing.findByIdAndUpdate(listingId, {
            averageRating: agg[0].averageRating,
            reviewCount: agg[0].reviewCount
        });
    } catch (err) {
        console.error(err);
    }
};

ReviewSchema.post('save', function() {
    this.constructor.getAverageRatingAndReviewCount(this.listing);
});

const Review = mongoose.model('Review', ReviewSchema);
export default Review;