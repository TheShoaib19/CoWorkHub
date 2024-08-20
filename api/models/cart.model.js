import mongoose from 'mongoose';

const CartItemSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['listing', 'catering'],
        required: true
    },
    listing: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Listing'
    },
    catering: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Catering'
    },
    quantity: {
        type: Number,
        default: 1,
        min: 1
    },
    selectedAmenities: [
        {
            name: String,
            price: Number,
            selected: Boolean,
        }
    ],
    selectedItems: [
        {
            name: String,
            price: Number,
            unit:String,
            selected: Boolean,
        }
    ]
}, { _id: false });

const CartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    items: [CartItemSchema]
}, { timestamps: true });

const Cart = mongoose.model('Cart', CartSchema);
export default Cart;
