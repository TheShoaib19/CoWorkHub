
import express from 'express';
import { createCheckout } from '../controllers/checkoutController.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.post('/orders/checkout', verifyToken, createCheckout)

export default router;
