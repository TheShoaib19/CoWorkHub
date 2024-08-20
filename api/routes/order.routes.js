import express from 'express';
import { createOrder,checkReservationOverlap ,getOrderById} from '../controllers/order.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.post('/checkout', verifyToken, createOrder);
router.post('/check-reservation-overlap', verifyToken,checkReservationOverlap);
router.get('/getOrderById/:id', verifyToken,getOrderById);

export default router;