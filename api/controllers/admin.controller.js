import bcryptjs from 'bcryptjs';
import User from '../models/user.model.js';
import { errorHandler } from '../utils/error.js';
import Listing from '../models/listing.model.js';
import catering from '../models/catering.model.js';
import Order from '../models/order.model.js';
import nodemailer from 'nodemailer';

export const test = (req, res) => {
    res.json({
        message: 'API route is working.'
    });
};


export const AdminupdateUser = async (req, res, next) => {
    try {
         const requestingUser = await User.findById(req.user.id);
        
         if (!requestingUser || requestingUser.role !== 'admin') {
             return next(errorHandler(403, 'You do not have permission to update user records'));
         }

        if (!req.params.id || !req.body.username || !req.body.email) {
            return next(errorHandler(400, 'Invalid input data'));
        }

        // Sanitize input data to prevent XSS attacks
        const sanitizedUsername = req.body.username.trim();
        const sanitizedEmail = req.body.email.trim().toLowerCase();

        // Hash the password if provided
        if (req.body.password) {
            req.body.password = bcryptjs.hashSync(req.body.password, 10);
        }

        const updateFields = {
            username: sanitizedUsername,
            email: sanitizedEmail,
        };

        if (req.body.password) updateFields.password = req.body.password;
        if (req.body.avatar) updateFields.avatar = req.body.avatar;
        if (req.body.role) updateFields.role = req.body.role;
        if (req.body.verified !== undefined) updateFields.verified = req.body.verified;

        const updatedUser = await User.findByIdAndUpdate(req.params.id, {
            $set: updateFields
        }, { new: true });

        const { password, ...rest } = updatedUser._doc;

        if (req.body.verified === true || req.body.verified === 1) {
            await sendVerificationEmail(sanitizedEmail);
        }
        else if ( req.body.verified === 2) {
            await sendFailVerificationEmail(sanitizedEmail);
        }

        res.status(200).json(rest);
    } catch (error) {
        next(error);
    }
}
export const sendVerificationEmail = async (email) => {
    try {

        const transporter = nodemailer.createTransport({
            
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Vendor Email',
            html: `
            <h1>Account Verified</h1>
            <p>Your account has been successfully verified.</p>
            <p>Thank you for choosing our platform.</p>
            <p>Best regards,<br/>Co-WorkHub Support Team</p>
            `
        };
        await transporter.sendMail(mailOptions);
        return { success: true, message: "Email sent" };
    } catch (error) {
        return { success: false, message: "Failed to send email" };
    }
};
export const sendFailVerificationEmail = async (email) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Vendor Verification - Document Issue',
            html: `
            <h1>Verification Failed - Document Issue</h1>
            <p>We encountered a problem with the documents you submitted for verification.</p>
            <p>Please review your documents and resubmit them for verification.</p>
            <p>If you have any questions, feel free to contact our support team.</p>
            <p>Best regards,<br/>Co-WorkHub Support Team</p>
            `
        };
        await transporter.sendMail(mailOptions);
        return { success: true, message: "Resend email sent" };
    } catch (error) {
        return { success: false, message: "Failed to send resend email" };
    }
};

export const deleteAdminUsers = async (req, res, next) => {
    
    try {
        const requestingUser = await User.findById(req.user.id);
        
         if (!requestingUser || requestingUser.role !== 'admin') {
             return next(errorHandler(403, 'You do not have permission to update user records'));
         }
        await Listing.deleteMany({ userRef: req.params.id });
        await User.findByIdAndDelete(req.params.id)
        res.status(200).json('User has been deleted!');
    } catch (error) {
        next(error)
    }
}
export const getUserListings = async (req, res, next) => {
    if(req.user.id === req.params.id){
        try {
            const listings = await Listing.find({ userRef: req.params.id });
            res.status(200).json(listings);
        } catch (error) {
            next(error);
        }
    }
    else{
        return next(errorHandler(401, 'You can only view your own listings!'));
    }
} 

export const getAllOrders = async (req, res, next) => {
    try {

        const orders = await Order.find()
            .populate({
                path: 'user', // Populate user details
                select: 'username email' // Select relevant fields
            })
            .populate({
                path: 'items.listing', // Populate listing details
                select: 'name items' // Ensure 'items' is defined in the listing schema
            })
            .populate({
                path: 'items.selectedItems', // Populate selected items within listing
                select: 'name price unit'
            })
            .populate({
                path: 'items.catering', // Populate catering details
                select: 'name', // Select only necessary fields
            });

        res.status(200).json(orders);
    } catch (error) {
        next(error);
    }
};

export const getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if(!user) return null;
        const { password: pass, ...rest } = user._doc;
        res.status(200).json(rest);
    } catch (error) {
        next(error);
    }
} 


export const getAllUsers = async (req, res, next) => {
    try {
        const requestingUser = await User.findById(req.user.id);
        if (!requestingUser || requestingUser.role !== 'admin') {
            return next(errorHandler(403, 'You do not have permission to view user records'));
        }

        // Populate the 'document' field with its details from the referenced collection
        const users = await User.find({}, '-password');

        res.status(200).json(users);
    } catch (error) {
        next(error);
    }
};

export const getListing = async (req, res, next) => {
    try {
        const listing = await Listing.findById(req.params.id);
        if(!listing){
            return next(errorHandler(404, 'Listing not found'));
        }
        res.status(200).json(listing);
    } catch (error) {
        next(error);
    }
}