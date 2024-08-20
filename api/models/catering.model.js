import mongoose from 'mongoose';
const { Schema } = mongoose;

const itemSchema = new Schema({
  name: { type: String, required: true },
  price:{ type: String, required: false },
  prices: [{
    unit: { type: String, required: false },
    price: { type: Number, required: false }
  }],
  isMultiplePrices:{ type: Boolean },
  imageUrl: { type: String } // Assuming storing image URLs for items
});
// Define Catering Schema
const cateringSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  address: { type: String, required: true },
  area: { type: String, required: true },
  serviceType: { type: String, required: true },
  menu: { type: String, required: true },
  capacity: { type: Number, required: true },
  imageUrls: [{ type: String }], // Array of image URLs
  items: [itemSchema],
  userRef: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
  reviews: [{ 
    type: mongoose.Types.ObjectId, 
    ref: "Review" 
  }],
  averageRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
}, { timestamps: true });


// Create and export Catering model
const Catering = mongoose.model('Catering', cateringSchema);
export default Catering;
