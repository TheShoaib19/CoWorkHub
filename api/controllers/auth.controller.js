import User from '../models/user.model.js' 
import { errorHandler } from '../utils/error.js'
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer';
import dotenv from "dotenv";
import mongoose from 'mongoose';
import { GridFsStorage } from 'multer-gridfs-storage';
import multer from 'multer';
import validator from 'validator';
import fs from 'fs';
import path from 'path';

dotenv.config();
// Multer configuration
// MongoDB URI
const mongoURI = process.env.MONGO;

// Create a connection to MongoDB
const conn = mongoose.createConnection(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Initialize GridFS storage engine
let gfs;
conn.once('open', () => {
    gfs = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'uploads'
    });
});

// Set up storage engine
const storage = new GridFsStorage({
    url: mongoURI,
    file: (req, file) => {
        return {
            bucketName: 'uploads',
            filename: Date.now() + '-' + file.originalname
        };
    }
});

const upload = multer({ storage }).single('document');
export const signup = async (req, res) => {
  try {
    upload(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        return res.status(500).json({ success: false, message: err.message });
      } else if (err) {
        return res.status(500).json({ success: false, message: err.message });
      }

      let { username, email, password, role } = req.body;
      email = email.toLowerCase();
      const verified = role === 'vendor' ? 0 : 1;

      const usernameRegex = /^[a-zA-Z0-9_]+$/;
      if (!usernameRegex.test(username)) {
        return res.status(400).json({ success: false, message: 'Username can only contain letters, numbers, and underscores.' });
      }

      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return res.status(400).json({ success: false, message: 'Username already exists.' });
      }

      if (role === 'vendor' && !req.file) {
        return res.status(400).json({ success: false, message: 'Document upload is mandatory for vendors.' });
      }

      const hashedPassword = bcryptjs.hashSync(password, 10);
      if (!validator.isEmail(email)) {
        return res.status(400).json({ success: false, message: 'Invalid email format.' });
      }

      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ success: false, message: 'Email already exists.' });
      }

      const newUser = new User({
        username,
        email,
        password: hashedPassword,
        role,
        document: req.file ? req.file.id : null, // Store the file id in the document field
        verified
      });

      await newUser.save();

      if (role === 'vendor' && req.file) {
        EmailSendVendor(email, username);
      }

      res.status(201).json({ success: true, message: 'User Created Successfully' });
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ success: false, message: 'Username or email already exists.' });
    } else {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

export const signin = async (req, res, next) => {
    let { email, password } = req.body; // Convert email to lowercase
    if (!email || !validator.isEmail(email)) {
        return res.status(400).json({ success: false, message: 'Invalid email format.' });
    }

    // Validate password
    if (!password) {
        return res.status(400).json({ success: false, message: 'Password is required.' });
    }
    email = email.toLowerCase(); // Convert email to lowercase
    try {
        const validUser = await User.findOne({ email });

        if (!validUser) {
            return res.status(404).json({ success: false, message: 'User not found!' });
        }

        const validPassword = bcryptjs.compareSync(password, validUser.password);
        if (!validPassword) {
            return res.status(401).json({ success: false, message: 'Wrong Credentials!' });
        }

        if (validUser.role === 'vendor' && validUser.verified === 0 ) {
            return res.status(401).json({ success: false, message: 'Vendor account not verified!' });
        }
        if (validUser.role === 'vendor' && validUser.verified === 2 ) {
            return res.status(401).json({ success: false, message: 'Vendor account not verification fail' });
        }
        const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET);
        const { password: pass, ...rest } = validUser._doc;
        res.cookie('access_token', token, { httpOnly: true }).status(200).json(rest);
    } catch (error) {
        next(error);
    }
};

export const google = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email })
        if(user){
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
            const { password: pass, ...rest } = user._doc;
            res.cookie('access_token', token, { httpOnly: true }).status(200).json(rest);
        }else{
            const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8); 
            const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
            const newUser = new User({ username: req.body.name.split(" ").join("").toLowerCase() + Math.random().toString(36).slice(-4), email: req.body.email, password: hashedPassword, avatar: req.body.photo });
            await newUser.save();
            const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
            const { password: pass, ...rest } = newUser._doc;
            res.cookie('access_token', token, { httpOnly: true }).status(200).json(rest);
        }
    } catch (error) {
        next(error)
    }
}
export const signout = async (req, res, next) => {
    try {
        res.clearCookie('access_token');
        res.status(200).json('User has been logged out.');
    } catch (error) {
        next(error)
    }
}

export const forgotPassword = async (req, res, next) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        // Generate a unique token for password reset
        const token = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-16)
        // Store the token in the database
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 300000; // Token expires in 5 minutes
        await user.save();
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
            subject: 'Password Reset Link',
            html: `
                <h1>Password Reset</h1>
                <p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
                <p>Please click on the following link, or paste this into your browser to complete the process:</p>
                <p><a href="http://localhost:5173/reset-password/${token}" style="color:blue;">http://localhost:5173/reset-password/${token}</a></p>
                <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
                <p>The link will expire in 5 minutes</p>
                <p>Sincerely, <br/> Co-WorkHub Support Team</p>
            `
        };
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: "Password reset link sent to your email" });
    } catch (error) {
        next(error);
    }
};
export const EmailSendVendor = async (email ,username) => {
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
            <h1 style="font-family: Arial, sans-serif; color: #333333;">Account Verification</h1>
            <p style="font-family: Arial, sans-serif; color: #333333;">Dear ${username},</p>
            <p style="font-family: Arial, sans-serif; color: #333333;">Thank you for registering with Co-WorkHub.</p>
            <p style="font-family: Arial, sans-serif; color: #333333;">Your account is currently under review by our team. Our verification process typically takes up to 24 hours.</p>
            <p style="font-family: Arial, sans-serif; color: #333333;">We appreciate your patience during this process.</p>
            <p style="font-family: Arial, sans-serif; color: #333333;">If you have any questions or need further assistance, please feel free to contact our support team at [Support Email] or [Support Phone Number].</p>
            <p style="font-family: Arial, sans-serif; color: #333333;">Best regards,</p>
            <p style="font-family: Arial, sans-serif; color: #333333;">Co-WorkHub Support Team</p>
            `
        };
        await transporter.sendMail(mailOptions);
        return { success: true, message: "Email sent" };
    } catch (error) {
        return { success: false, message: "Failed to send email" };
    }
};
export const resetPassword = async (req, res, next) => {
    const { token, newPassword } = req.body;
    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or expired token" });
        }
        // Update user's password
        const hashedPassword = bcryptjs.hashSync(newPassword, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        res.status(200).json({ success: true, message: "Password reset successful" });
    } catch (error) {
        next(error);
    }
};