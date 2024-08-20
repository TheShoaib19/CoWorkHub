import express from 'express';
import { getAllUsers , deleteAdminUsers ,AdminupdateUser,getAllOrders ,getUser ,getListing} from '../controllers/admin.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.get('/users', verifyToken, getAllUsers)
router.delete('/users/delete/:id', verifyToken, deleteAdminUsers)
router.put('/users/update/:id', verifyToken, AdminupdateUser)
router.get('/orders', verifyToken, getAllOrders)
router.get('/users/:id', verifyToken, getUser)
router.get('/listings/:id', verifyToken, getListing)

export default router;