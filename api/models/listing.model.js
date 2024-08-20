import mongoose from "mongoose";

const listingSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    description:{
        type: String,
        required: true,
    },
    address:{
        type: String,
        required: true,
    },
    area:{
        type: String,
        required: true,
    },
    regularPrice:{
        type: Number,
        required: true,
    },
    discountPrice:{
        type: Number,
        required: true,
    },
    numberOfChairs:{
        type: Number,
        required: false,
    },
    amenitiesType:{
        type: String,
        required: true,
    },
    amenities:{
        type: Array,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    offer:{
        type: Boolean,
        required: true,
    },
    imageUrls:{
        type: Array,
        required: true,
    },
    timeIntervalType:{
        type: String,
        required: true,
    },
    userRef:{
        type: String,
        required: true,
    },
    // reviews should be here but it's not working at the moment
    reviews: [{ 
        type: mongoose.Types.ObjectId, 
        ref: "Review" }],
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
}, {timestamps: true});

const Listing = mongoose.model('Listing', listingSchema);

export default Listing;