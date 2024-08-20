import mongoose from 'mongoose';

const { Schema } = mongoose;

const checkoutSchema = new Schema({
  User: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [
    {
      type: {
        type: String,
        enum: ['listing', 'catering'],
        required: false,
      },
      listing: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Listing',
      },
      catering: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Catering',
      },
      quantity: {
        type: Number,
        required: true,
      },
      selectedAmenities: [
        {
          name: String,
          price: Number,
          selected: Boolean,
        },
      ],
      selectedItems: [
        {
          name: String,
          price: Number,
          unit: String,
          selected: Boolean,
        },
      ],
    },
  ],
  totalPrice: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Checkout = mongoose.model('Checkout', checkoutSchema);

export default Checkout;
