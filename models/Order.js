import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
    productName: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    price: { type: Number },
});

const OrderSchema = new mongoose.Schema(
    {
        shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
        shopName: { type: String },
        customerName: { type: String, default: 'Unknown' },
        customerPhone: { type: String, default: '' },
        items: [OrderItemSchema],
        whatsappMessage: { type: String }, // the pre-filled message that was sent
        status: {
            type: String,
            enum: ['new', 'confirmed', 'completed', 'cancelled'],
            default: 'new',
        },
    },
    { timestamps: true }
);

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
