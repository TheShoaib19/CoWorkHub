import Catering from  '../models/catering.model.js';
import { errorHandler } from "../utils/error.js";

const addCatering = async (req, res, next) => {
  try {
    const { name, description, address, area, serviceType, menu, capacity, imageUrls, items, userRef } = req.body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return next(errorHandler(400, 'Name is required'));
    }
    if (!description || typeof description !== 'string' || description.trim() === '') {
      return next(errorHandler(400, 'Description is required'));
    }
    if (!address || typeof address !== 'string' || address.trim() === '') {
      return next(errorHandler(400, 'Address is required'));
    }
    if (!area || typeof area !== 'string' || area.trim() === '') {
      return next(errorHandler(400, 'Area is required'));
    }
    if (!serviceType || typeof serviceType !== 'string' || serviceType.trim() === '') {
      return next(errorHandler(400, 'Service type is required'));
    }
    if (!menu || typeof menu !== 'string' || menu.trim() === '') {
      return next(errorHandler(400, 'Menu is required'));
    }
    if (!capacity || typeof capacity !== 'string' || capacity.trim() === '') {
      return next(errorHandler(400, 'Capacity is required'));
    }
    if (!userRef || typeof userRef !== 'string' || userRef.trim() === '') {
      return next(errorHandler(400, 'User reference is required'));
    }

    // Validate imageUrls
    if (imageUrls && !Array.isArray(imageUrls)) {
      return next(errorHandler(400, 'Image URLs must be an array.'));
    }
    if (imageUrls && !imageUrls.every(url => typeof url === 'string' && url.trim() !== '')) {
      return next(errorHandler(400, 'Image is Required'));
    }

    // Validate items
    if (!Array.isArray(items) || items.length === 0) {
      return next(errorHandler(400, 'Items cannot be empty.'));
    }
    for (const item of items) {
      if (!item.name || typeof item.name !== 'string' || item.name.trim() === '') {
        return next(errorHandler(400, 'item Name field is required'));
      }
      // if (!Array.isArray(item.prices) || item.prices.length === 0) {
      //   return next(errorHandler(400, 'item Price field is required'));
      // }
      // for (const price of item.prices) {
      //   if (!price.unit || typeof price.unit !== 'string' || price.unit.trim() === '') {
      //     return next(errorHandler(400, 'Item unit field is required'));
      //   }
      //   const priceValue = parseFloat(price.price);
      //   if (isNaN(priceValue) || priceValue <= 0) {
      //     return next(errorHandler(400, 'Each price must be a positive number.'));
      //   }
      // }
      if (!item.imageUrl && (typeof item.imageUrl !== 'string' || item.imageUrl.trim() === '')) {
        return next(errorHandler(400, 'Item image is required'));
      }
    }

    // Create and save the Catering document
    const catering = new Catering({
      name,
      description,
      address,
      area,
      serviceType,
      menu,
      capacity,
      imageUrls,
      items,
      userRef
    });

    const savedCatering = await catering.save();

    res.status(201).json({ success: true, _id: savedCatering._id });
  } catch (error) {
    next(error); // Handle errors using your errorHandler utility
  }
};

const updateCatering = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, address, area, serviceType, menu, capacity, imageUrls, items, userRef } = req.body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return next(errorHandler(400, 'Name is required'));
    }
    if (!description || typeof description !== 'string' || description.trim() === '') {
      return next(errorHandler(400, 'Description is required'));
    }
    if (!address || typeof address !== 'string' || address.trim() === '') {
      return next(errorHandler(400, 'Address is required'));
    }
    if (!area || typeof area !== 'string' || area.trim() === '') {
      return next(errorHandler(400, 'Area is required'));
    }
    if (!serviceType || typeof serviceType !== 'string' || serviceType.trim() === '') {
      return next(errorHandler(400, 'Service type is required'));
    }
    if (!menu || typeof menu !== 'string' || menu.trim() === '') {
      return next(errorHandler(400, 'Menu is required'));
    }
    if (!capacity) {
      return next(errorHandler(400, 'Capacity is required'));
    }
    if (!userRef || typeof userRef !== 'string' || userRef.trim() === '') {
      return next(errorHandler(400, 'User reference is required'));
    }

    // Validate imageUrls
    if (imageUrls && !Array.isArray(imageUrls)) {
      return next(errorHandler(400, 'Image URLs must be an array.'));
    }
    if (imageUrls && !imageUrls.every(url => typeof url === 'string' && url.trim() !== '')) {
      return next(errorHandler(400, 'Image is Required'));
    }

    // Validate items
    if (!Array.isArray(items) || items.length === 0) {
      return next(errorHandler(400, 'Items cannot be empty.'));
    }
    for (const item of items) {
      if (!item.name || typeof item.name !== 'string' || item.name.trim() === '') {
        return next(errorHandler(400, 'item Name field is required'));
      }

      if (!item.imageUrl && (typeof item.imageUrl !== 'string' || item.imageUrl.trim() === '')) {
        return next(errorHandler(400, 'Item image is required'));
      }
    }


    // Find the catering item by ID and update its fields
    const updatedCatering = await Catering.findByIdAndUpdate(
      id,
      { name, description, address, area, serviceType, menu, capacity, imageUrls, items, userRef },
      { new: true, runValidators: true }
    );

    if (!updatedCatering) {
      return res.status(404).json({ success: false, message: 'Catering not found' });
    }

    res.status(200).json({ success: true, catering: updatedCatering });
  } catch (error) {
    next(error); // Handle errors using your errorHandler utility
  }
};
const getCaterings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 15; // Default to 15 items per page
    const skip = (page - 1) * limit; // Calculate the number of items to skip

    const cateringData = await Catering.find()
      .sort({ createdAt: -1 }) // Sort by creation date
      .skip(skip)
      .limit(limit);

    const totalItems = await Catering.countDocuments(); // Get the total count of items
    const hasMore = totalItems > skip + limit; // Determine if there are more items

    res.json({
      success: true,
      items: cateringData,
      hasMore, // Indicates if more items are available
    });
  } catch (error) {
    errorHandler(error, res); // Handle errors using your errorHandler utility
  }
};

const getCatering = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 15;
    const name = req.query.name || '';
    const area = req.query.area || 'all';
    const serviceType = req.query.serviceType || 'all';
    const capacity = parseInt(req.query.capacity) || 0;
    const sort = req.query.sort || 'createdAt';
    const order = req.query.order || 'desc';

    // Build the filter object
    const filter = {};

    if (name) {
      filter.name = { $regex: name, $options: 'i' }; // Case-insensitive search
    }
    if (area && area !== 'all') {
      filter.area = area;
    }
    if (serviceType && serviceType !== 'all') {
      filter.serviceType = serviceType;
    }
    if (capacity > 0) {
      filter.capacity = { $gte: capacity }; // Greater than or equal to capacity
    }

    // Fetch catering data with filters and sort
    const cateringData = await Catering.find(filter)
      .sort({ [sort]: order === 'asc' ? 1 : -1 })
      .limit(limit);

    res.json(cateringData);
  } catch (error) {
    errorHandler(error, res); 
  }
};

  const getCateringById = async (req, res) => {
    try {
      const { id } = req.params;
      const catering = await Catering.findById(id);
  
      if (!catering) {
        return res.status(404).json({ success: false, message: 'Catering not found' });
      }
  
      res.status(200).json(catering);
    } catch (error) {
      errorHandler(error, res); // Handle errors using your errorHandler utility
    }
  };
  const deleteCatering = async (req, res, next) => {
    try {
      const { id } = req.params;
      const deletedCatering = await Catering.findByIdAndDelete(id);
  
      if (!deletedCatering) {
        return res.status(404).json({ success: false, message: 'Catering not found' });
      }
  
      res.status(200).json({ success: true, message: 'Catering deleted successfully' });
    } catch (error) {
      next(error); // Handle errors using your errorHandler utility
    }
  };
  
  export { addCatering, getCatering, getCateringById ,updateCatering ,deleteCatering};
