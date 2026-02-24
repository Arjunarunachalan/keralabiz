import connectDB from '@/lib/mongodb';
import Shop from '@/models/Shop';
import Subscription from '@/models/Subscription';
import { getRazorpay, PLANS } from '@/lib/razorpay';
import { requireShop } from '@/lib/auth';

// POST /api/subscriptions/create
export async function POST(request) {
    try {
        const shopToken = requireShop(request);
        if (!shopToken) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        await connectDB();
        const shop = await Shop.findById(shopToken.id);
        if (!shop) return Response.json({ error: 'Shop not found' }, { status: 404 });

        if (shop.status !== 'ACTIVE') {
            return Response.json({ error: 'Shop must be approved before subscribing' }, { status: 403 });
        }

        const { plan } = await request.json();
        const planConfig = PLANS[plan];
        if (!planConfig) {
            return Response.json({ error: 'Invalid plan. Choose basic or featured.' }, { status: 400 });
        }

        if (!planConfig.planId) {
            return Response.json(
                { error: 'Payment plan not configured yet. Contact admin.' },
                { status: 503 }
            );
        }

        const razorpay = getRazorpay();

        const subscription = await razorpay.subscriptions.create({
            plan_id: planConfig.planId,
            customer_notify: 1,
            total_count: 12, // 12 months
            notes: {
                shopId: shop._id.toString(),
                shopName: shop.name,
                ownerPhone: shop.phone,
            },
        });

        // Save subscription record
        await Subscription.create({
            shopId: shop._id,
            plan,
            amount: planConfig.amount,
            razorpaySubscriptionId: subscription.id,
            status: 'created',
        });

        // Update shop with subscription ID
        await Shop.findByIdAndUpdate(shop._id, {
            razorpaySubscriptionId: subscription.id,
            subscriptionPlan: plan,
        });

        return Response.json({
            success: true,
            subscriptionId: subscription.id,
            razorpayKeyId: process.env.RAZORPAY_KEY_ID,
            shortUrl: subscription.short_url,
        });
    } catch (error) {
        console.error('Subscription create error:', error);
        return Response.json({ error: 'Failed to create subscription. Please try again.' }, { status: 500 });
    }
}
