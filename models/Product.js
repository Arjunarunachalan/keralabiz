import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
    {
        shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
        name: { type: String, required: true, trim: true },
        description: { type: String, default: '' },
        price: { type: Number, required: true, min: 0 },
        available: { type: Boolean, default: true },
        unit: { type: String, default: '' }, // e.g. "per kg", "per piece"
        imageUrl: { type: String, default: '' },
    },
    { timestamps: true }
);

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
