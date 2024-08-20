// controllers/checkoutController.js

import Checkout from '../models/checkout.model.js';

const createCheckout = async (req, res) => {
  try {
    const { userId, items, totalPrice } = req.body;

    const newCheckout = new Checkout({
      userId,
      items,
      totalPrice,
    });

    await newCheckout.save();

    res.status(201).json({
      success: true,
      data: newCheckout,
    });
  } catch (error) {
    console.error('Error creating checkout:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

export { createCheckout };
