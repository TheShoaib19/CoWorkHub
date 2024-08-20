import mongoose from "mongoose";
import Catering from "./catering.model.js";

const ReviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    catering: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Catering',
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

ReviewSchema.statics.getAverageRatingAndReviewCount = async function(CateringId) {
    const agg = await this.aggregate([
        { $match: { catering: CateringId } },
        { $group: {
            _id: '$catering',
            averageRating: { $avg: '$stars' },
            reviewCount: { $sum: 1 }
        }}
    ]);

        try {
            await Catering.findByIdAndUpdate(CateringId, {
                averageRating: agg[0].averageRating,
                reviewCount: agg[0].reviewCount
            });
        } catch (err) {
            console.error(err);
        }
};

ReviewSchema.post('save', function() {
    this.constructor.getAverageRatingAndReviewCount(this.catering);
});

const ReviewCatering = mongoose.model('ReviewCatering', ReviewSchema);
export default ReviewCatering;
