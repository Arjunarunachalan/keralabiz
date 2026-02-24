import mongoose from 'mongoose';
import slugify from 'slugify';

const ShopSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        ownerName: { type: String, required: true, trim: true },
        phone: { type: String, required: true },
        whatsapp: { type: String, required: true },
        area: { type: String, required: true },
        category: { type: String, required: true },
        slug: { type: String, unique: true },
        description: { type: String, default: '' },
        address: { type: String, default: '' },
        deliveryInfo: { type: String, default: '' },
        imageUrl: { type: String, default: '' },
        deliveryAvailable: { type: Boolean, default: false },
        minDeliveryAmount: { type: Number, default: 0 },
        status: {
            type: String,
            enum: ['PENDING', 'ACTIVE', 'SUSPENDED'],
            default: 'PENDING',
        },
        subscriptionPlan: {
            type: String,
            enum: ['basic', 'featured'],
            default: 'basic',
        },
        subscriptionStatus: {
            type: String,
            enum: ['inactive', 'active', 'past_due', 'cancelled'],
            default: 'inactive',
        },
        razorpaySubscriptionId: { type: String, default: null },
        isFeatured: { type: Boolean, default: false },
        passwordHash: { type: String, required: true },
    },
    { timestamps: true }
);

ShopSchema.pre('save', function () {
    if (this.isModified('name') || !this.slug) {
        this.slug = slugify(this.name, { lower: true, strict: true }) + '-' + Date.now();
    }
});

export default mongoose.models.Shop || mongoose.model('Shop', ShopSchema);
