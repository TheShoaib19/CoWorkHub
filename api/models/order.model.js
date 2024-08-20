import mongoose from 'mongoose';

const { Schema } = mongoose;

const orderSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        type: {
            type: String,
            enum: ['listing', 'catering'],
            required: true
        },
        listing: {
            type: Schema.Types.ObjectId,
            ref: 'Listing',
            required: function() { return this.type === 'listing'; } // Only required if type is 'listing'
        },
        catering: {
            type: Schema.Types.ObjectId,
            ref: 'Catering',
            required: function() { return this.type === 'catering'; } // Only required if type is 'catering'
        },
        quantity: {
            type: Number,
            required: true,
        },
        startDate: {
            type: Date,
            required: false,
        },
        endDate: {
            type: Date,
            required: false,
        },
        startTime: {
            type: String,
            required: false,
        },
        endTime: {
            type: String,
            required: false,
        },
        deliveryDateTime: {
            type: Date,
            required: false,
        },
        selectedAmenities: [{
            name: {
                type: String,
                required: false,
            },
            price: {
                type: Number,
                required: true,
            },
        }],
        selectedItems: [{
            name: String,
            price: Number,
            unit: String,
            selected: Boolean,
            quantity:Number,
        }],
    }],
    totalPrice: {
        type: Number,
        required: true,
    },

    address: {
        type: String,
        required: true,
    },
    paymentMethod: {
        type: String,
        enum: ['creditCard', 'debitCard', 'paypal','stripe'],
        required: true,
    },
    cardNumber: {
        type: String,
        required: false,
    },
    cvv: {
        type: String,
        required: false,
    },
    expiryDate: {
        type: String,
        required: false,
    },
    
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

export default Order;