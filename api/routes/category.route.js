import express from 'express';
import { Getcategories } from '../controllers/category.controller.js';
import { verifyToken } from '../utils/verifyUser.js';
const router = express.Router();

router.get('/', verifyToken, Getcategories);


export default router;

