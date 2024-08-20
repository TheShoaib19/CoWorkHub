import express from 'express';
import { addToCart, removeFromCart, getCart ,checkCartItem ,clearCart ,addCateringToCart,checkCateringItem} from '../controllers/cart.controller.js';
import { verifyToken } from '../utils/verifyUser.js';
const router = express.Router();

router.post('/add', verifyToken, addToCart);

router.post('/catering/add', verifyToken, addCateringToCart);

router.post('/remove', verifyToken, removeFromCart);
router.get('/', verifyToken, getCart);
router.post('/check', verifyToken, checkCartItem); 
router.post('/catering/check', verifyToken, checkCateringItem); 
router.post('/clear', verifyToken, clearCart); 

export default router;
