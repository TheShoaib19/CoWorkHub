import Listing from "../models/listing.model.js";
import { errorHandler } from "../utils/error.js";

export const createListing = async (req, res, next) => {
    try {
        const listing = await Listing.create(req.body);
        return res.status(201).json(listing);
    } catch (error) {
        next(error)
    }
};


export const deleteListing = async (req, res, next) => {
    const listing = await Listing.findById(req.params.id);
    if(!listing){
        return next(errorHandler(404, 'Listing not found'));
    }
    if(req.user.id !== listing.userRef){
        return next(errorHandler(401, 'You can only delete your own listings!'));
    }
    try {
        await Listing.findByIdAndDelete(req.params.id);
        res.status(200).json('Listing has been deleted');
    } catch (error) {
        next(error);
    }
};

export const updateListing = async (req, res, next) => {
    const listing = await Listing.findById(req.params.id);
    if(!listing){
        return next(errorHandler(404, 'Listing not found'));
    }
    if(req.user.id !== listing.userRef){
        return next(errorHandler(401, 'You can only update your own listings!'));
    }
    try {
        const updatedListing = await Listing.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedListing);
    } catch (error) {
        next(error);
    }
};

export const getListing = async (req, res, next) => {
    try {
        const listing = await Listing.findById(req.params.id);
        if(!listing){
            return next(errorHandler(404, 'Listing not found'));
        }
        res.status(200).json(listing);
    } catch (error) {
        next(error);
    }
}

export const getListings = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 9;
        const startIndex = parseInt(req.query.startIndex) || 0;
        let offer = req.query.offer;

        if (offer === undefined || offer === 'false') {
            offer = { $in: [false, true] };
        } else {
            offer = offer === 'true';
        }

        let amenities = req.query.amenities;
        if (amenities) {
            amenities = amenities.split(',').map(amenity => ({ 'amenities.name': amenity, 'amenities.value': true }));
        } else {
            amenities = [];
        }

        let type = req.query.type;
        if (type === undefined || type === 'all') {
            type = { $in: ['desk', 'floor', 'room', 'meetingRoom', 'eventSpace'] };
        }

        let area = req.query.area;
        if (area === undefined || area === 'all') {
            area = { $in: ['Tariq Road', 'Bahadurabad', 'Defence'] };
        }

        const searchTerm = req.query.searchTerm || '';
        const sort = req.query.sort || 'createdAt';
        const order = req.query.order || 'desc';
        const regularPrice = req.query.regularPrice ? { $lte: parseInt(req.query.regularPrice) } : { $lte: 9999999999999 }; // Default max price

        // Build the query
        const query = {
            name: { $regex: searchTerm, $options: 'i' },
            offer,
            area,
            type,
            regularPrice
        };

        // Add amenities filter if provided
        if (amenities.length > 0) {
            query.$and = amenities;
        }

        const listings = await Listing.find(query)
            .sort({ [sort]: order })
            .limit(limit)
            .skip(startIndex);

        return res.status(200).json(listings);

    } catch (error) {
        next(error);
    }
};
