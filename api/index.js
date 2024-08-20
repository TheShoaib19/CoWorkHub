import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { GridFSBucket } from 'mongodb';
import { ObjectId } from 'mongodb';
import userRouter from './routes/user.route.js';
import authRouter from './routes/auth.route.js';
import listingRouter from './routes/listing.route.js';
import contactRouter from './routes/contact.route.js';
import reviewRouter from './routes/review.route.js';
import cartRoutes from './routes/cart.routes.js';
import adminRoutes from './routes/admin.route.js';
import cateringRoutes from './routes/catering.route.js';
import orderRoutes from './routes/order.routes.js';
import cookieParser from 'cookie-parser';
import { GridFsStorage } from 'multer-gridfs-storage';
import multer from 'multer';
import Stripe from 'stripe';

dotenv.config();
const app = express();

mongoose.connect(process.env.MONGO, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('MongoDB connection error:', err.message);
});

const conn = mongoose.connection;
let gfsBucket;

// Initialize GridFS stream
conn.once('open', () => {
  gfsBucket = new GridFSBucket(conn.db, {
    bucketName: 'uploads'
  });
  console.log('GridFS stream initialized');
});

// Multer storage engine for GridFS
const storage = new GridFsStorage({
  url: process.env.MONGO,
  file: (req, file) => {
    return {
      bucketName: 'uploads', // Collection name in MongoDB
      filename: file.originalname,
      metadata: { contentType: file.mimetype }
    };
  }
});

const upload = multer({ storage });

app.use(express.json());
app.use(cookieParser());

app.use('/api/user', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/listing', listingRouter);
app.use('/api/contact', contactRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/cart', cartRoutes);
app.use('/api/', adminRoutes);
app.use('/api/', orderRoutes);
app.use('/api/', cateringRoutes);

// Endpoint to handle file upload
// Endpoint to handle file uploads
app.post('/api/upload', upload.array('files', 6), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'No files uploaded' });
  }

  // Generate file URLs
  const fileUrls = req.files.map(file => `/api/image/${file.filename}`);

  res.status(200).json({
    success: true,
    message: 'Files uploaded successfully',
    fileUrls: fileUrls
  });
});
// Upload single image file
app.post('/api/uploadImageFile', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  const fileUrl =  `/api/image/${req.file.filename}`;

  res.status(200).json({
    success: true,
    message: 'File uploaded successfully',
    fileUrl: fileUrl
  });
});

// Serve image files
app.get('/api/image/:filename', async (req, res) => {
  try {
    const file = await conn.db.collection('uploads.files').findOne({ filename: req.params.filename });
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    const readstream = gfsBucket.openDownloadStreamByName(req.params.filename);
    res.set('Content-Type', file.contentType);
    res.set('Cache-Control', 'no-store'); // Disable caching
    readstream.pipe(res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/uplaod/:filename', async (req, res) => {
  try {
    const file = await conn.db.collection('uploads.files').findOne({ filename: req.params.filename });
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    const readstream = gfsBucket.openDownloadStreamByName(req.params.filename);
    res.set('Content-Type', file.contentType);
    res.set('Cache-Control', 'no-store'); // Disable caching
    readstream.pipe(res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Endpoint to download documents
app.get('/api/users/:userId/documents/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;

    // Validate documentId
    if (!mongoose.Types.ObjectId.isValid(documentId)) {
      return res.status(400).json({ message: 'Invalid document ID' });
    }

    // Find the file by its _id in GridFS
    const file = await conn.db.collection('uploads.files').findOne({ _id: new ObjectId(documentId) });
    
    // If file not found, return 404
    if (!file) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Open download stream from GridFS
    const readstream = gfsBucket.openDownloadStream(new ObjectId(documentId));

    // Set headers
    res.set('Content-Type', file.contentType);
    res.set('Cache-Control', 'no-store'); // Disable caching

    // Pipe the GridFS stream to response
    readstream.pipe(res);
  } catch (err) {
    // Handle errors
    res.status(500).json({ success: false, message: err.message });
  }
});
// Stripe configuration
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Route to handle payment
app.post('/api/stripe/payment', async (req, res) => {
  try {
    const { totalPrice, paymentMethod } = req.body;

    // Validate required fields
    if (!totalPrice) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Convert totalPrice to an integer in the smallest unit of the currency
    const amount = Math.round(totalPrice*100);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount , // Assuming the amount is already in the smallest unit
      currency:'pkr',
      //  payment_method: paymentMethod,
      // confirm: true
    });

    res.status(200).send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});
// Global error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
