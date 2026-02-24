import crypto from 'crypto';
import connectDB from '@/lib/mongodb';
import Shop from '@/models/Shop';
import Subscription from '@/models/Subscription';

async function getRawBody(request) {
    const reader = request.body.getReader();
    const chunks = [];
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
    }
    return Buffer.concat(chunks);
}

function verifySignature(rawBody, signature) {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) return true; // Skip verification in dev if not set
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(rawBody)
        .digest('hex');
    return expectedSignature === signature;
}

export async function POST(request) {
    try {
        const rawBody = await getRawBody(request);
        const signature = request.headers.get('x-razorpay-signature');

        if (!verifySignature(rawBody, signature)) {
            return Response.json({ error: 'Invalid signature' }, { status: 400 });
        }

        const event = JSON.parse(rawBody.toString());
        const eventType = event.event;
        const payload = event.payload?.subscription?.entity;

        if (!payload) {
            return Response.json({ received: true });
        }

        await connectDB();

        const subscriptionId = payload.id;
        const notes = payload.notes || {};
        const shopId = notes.shopId;

        switch (eventType) {
            case 'subscription.activated': {
                await Subscription.findOneAndUpdate(
                    { razorpaySubscriptionId: subscriptionId },
                    { status: 'active', startDate: new Date() }
                );
                if (shopId) {
                    await Shop.findByIdAndUpdate(shopId, {
                        subscriptionStatus: 'active',
                        status: 'ACTIVE',
                    });
                }
                break;
            }

            case 'subscription.charged': {
                const currentEnd = payload.current_end
                    ? new Date(payload.current_end * 1000)
                    : null;
                await Subscription.findOneAndUpdate(
                    { razorpaySubscriptionId: subscriptionId },
                    { status: 'active', currentPeriodEnd: currentEnd }
                );
                if (shopId) {
                    await Shop.findByIdAndUpdate(shopId, { subscriptionStatus: 'active' });
                }
                break;
            }

            case 'payment.failed':
            case 'subscription.halted': {
                await Subscription.findOneAndUpdate(
                    { razorpaySubscriptionId: subscriptionId },
                    { status: 'halted' }
                );
                if (shopId) {
                    await Shop.findByIdAndUpdate(shopId, { subscriptionStatus: 'past_due' });
                }
                break;
            }

            case 'subscription.cancelled':
            case 'subscription.completed':
            case 'subscription.expired': {
                const status = eventType.split('.')[1]; // cancelled | completed | expired
                await Subscription.findOneAndUpdate(
                    { razorpaySubscriptionId: subscriptionId },
                    { status, endDate: new Date() }
                );
                if (shopId) {
                    await Shop.findByIdAndUpdate(shopId, {
                        subscriptionStatus: 'inactive',
                    });
                }
                break;
            }

            default:
                break;
        }

        return Response.json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        return Response.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}
