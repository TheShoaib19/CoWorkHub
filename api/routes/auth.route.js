import express from 'express'
import { signup, signin, google, signout, forgotPassword, resetPassword ,EmailSendVendor } from '../controllers/auth.controller.js';

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/google", google);
router.get("/signout", signout);

router.post("/forgot-password", forgotPassword);
router.post("/vendorEmail", EmailSendVendor);
router.post("/reset-password", resetPassword);

export default router;