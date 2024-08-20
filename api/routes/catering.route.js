import express from 'express';
import { addCatering ,getCatering ,getCateringById,deleteCatering,updateCatering} from '../controllers/catering.controller.js';
import { verifyToken } from '../utils/verifyUser.js';
const router = express.Router();

router.post('/catering/add',verifyToken, addCatering);
router.get('/catering/get', getCatering);
router.get('/catering/get/:id', getCateringById);
router.delete('/catering/delete/:id', verifyToken, deleteCatering);
router.post('/catering/update/:id', verifyToken, updateCatering);




export default router;
