import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    // Add other fields as necessary
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);

export default Category;