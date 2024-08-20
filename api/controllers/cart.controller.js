import Cart from "../models/cart.model.js";
import Listing from "../models/listing.model.js";
import Catering from "../models/catering.model.js"
import { errorHandler } from "../utils/error.js";

// Add an item to the cart
export const addToCart = async (req, res, next) => {
    try {
        const { listingId, quantity, selectedAmenities } = req.body;
        const userId = req.user.id;

        // Check if listing exists
        const listing = await Listing.findById(listingId);
        if (!listing) {
            return next(errorHandler(404, 'Listing not found'));
        }

        // Validate quantity
        if (quantity !== 1) {
            return next(errorHandler(400, 'Quantity should be 1 for this listing'));
        }

        // Find the cart for the user or create a new one
        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = new Cart({ user: userId, items: [] });
        }

        // Check if the listing item already exists in the cart
        const existingListing = cart.items.find(item => item.type === 'listing' && item.listing.equals(listingId));
        if (existingListing) {
            return res.status(200).json({ isInCart: true });
        }

        // Add new listing item to the cart
        cart.items.push({ type: 'listing', listing: listingId, quantity, selectedAmenities });
        await cart.save();
        res.status(200).json(cart);
    } catch (error) {
        next(error);
    }
};
  
export const addCateringToCart = async (req, res, next) => {
    try {
        const { CateringId, quantity, selectedItems } = req.body;
        const userId = req.user.id;

        // Check if catering item exists
        const cateringItem = await Catering.findById(CateringId);
        if (!cateringItem) {
            return next(errorHandler(404, 'Catering item not found'));
        }

        // Find the cart for the user or create a new one
        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = new Cart({ user: userId, items: [] });
        }

        // Check if the catering item already exists in the cart
        const existingItem = cart.items.find(item => item.type === 'catering' && item.catering.equals(CateringId));
        if (existingItem) {
            return next(errorHandler(400, 'This catering item is already in the cart'));
        }

        // Add new catering item to the cart
        cart.items.push({ type: 'catering', catering: CateringId, quantity, selectedItems });
        await cart.save();
        res.status(200).json(cart);
    } catch (error) {
        next(error);
    }
};
// Check if a catering item is in the cart
export const checkCateringItem = async (req, res, next) => {
    try {
        const { CateringId } = req.body;
        const userId = req.user.id;

        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(200).json({ isInCart: false });
        }

        const existingItem = cart.items.find(item => item.type === 'catering' && item.catering.equals(CateringId));
        if (existingItem) {
            return res.status(200).json({ isInCart: true });
        }

        res.status(200).json({ isInCart: false });
    } catch (error) {
        next(error);
    }
};


// Check if an item is in the cart
export const checkCartItem = async (req, res, next) => {
    try {
        const { listingId, CateringId } = req.body;
        const userId = req.user.id;

        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(200).json({ isInCart: false });
        }

        if (listingId) {
            const existingListing = cart.items.find(item => item.type === 'listing' && item.listing.equals(listingId));
            if (existingListing) {
                return res.status(200).json({ isInCart: true });
            }
        }

        if (CateringId) {
            const existingCatering = cart.items.find(item => item.type === 'catering' && item.catering.equals(CateringId));
            if (existingCatering) {
                return res.status(200).json({ isInCart: true });
            }
        }

        res.status(200).json({ isInCart: false });
    } catch (error) {
        next(error);
    }
};



// Remove an item from the cart
export const removeFromCart = async (req, res, next) => {
    try {
        const { listingId, CateringId } = req.body;
        const userId = req.user.id;

        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return next(errorHandler(404, 'Cart not found'));
        }

        if (listingId) {
            const itemIndex = cart.items.findIndex(item => item.type === 'listing' && item.listing.equals(listingId));
            if (itemIndex > -1) {
                cart.items.splice(itemIndex, 1);
            }
        }

        if (CateringId) {
            const itemIndex = cart.items.findIndex(item => item.type === 'catering' && item.catering.equals(CateringId));
            if (itemIndex > -1) {
                cart.items.splice(itemIndex, 1);
            }
        }

        await cart.save();
        res.status(200).json(cart);
    } catch (error) {
        next(error);
    }
};


// Get user's cart
export const getCart = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const cart = await Cart.findOne({ user: userId }).populate('items.listing').populate('items.catering');
        if (!cart) {
            return next(errorHandler(404, 'Cart not found'));
        }
        res.status(200).json(cart);
    } catch (error) {
        next(error);
    }
};
// Clear user's cart
export const clearCart = async (req, res, next) => {
    try {
        const userId = req.user.id;
        await Cart.findOneAndUpdate({ user: userId }, { $set: { items: [] } });
        res.status(200).json({ message: 'Cart cleared successfully' });
    } catch (error) {
        next(error);
    }
};