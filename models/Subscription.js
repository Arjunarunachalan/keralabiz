import mongoose from 'mongoose';

const SubscriptionSchema = new mongoose.Schema(
    {
        shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
        plan: { type: String, enum: ['basic', 'featured'], required: true },
        amount: { type: Number, required: true }, // in paise
        razorpaySubscriptionId: { type: String, required: true, unique: true },
        status: {
            type: String,
            enum: ['created', 'authenticated', 'active', 'pending', 'halted', 'cancelled', 'completed', 'expired'],
            default: 'created',
        },
        startDate: { type: Date },
        endDate: { type: Date },
        currentPeriodStart: { type: Date },
        currentPeriodEnd: { type: Date },
    },
    { timestamps: true }
);

export default mongoose.models.Subscription || mongoose.model('Subscription', SubscriptionSchema);
