import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

export const dynamic = 'force-dynamic';

// POST /api/orders – save order analytics (no auth required)
export async function POST(request) {
    try {
        await connectDB();
        const { shopId, shopName, customerName, items, whatsappMessage } = await request.json();

        if (!shopId) {
            return Response.json({ error: 'shopId required' }, { status: 400 });
        }

        const order = await Order.create({
            shopId,
            shopName: shopName || '',
            customerName: customerName || 'Customer',
            items: items || [],
            whatsappMessage: whatsappMessage || '',
        });

        return Response.json({ success: true, orderId: order._id }, { status: 201 });
    } catch (error) {
        console.error('Order save error:', error);
        return Response.json({ error: 'Server error' }, { status: 500 });
    }
}

// GET /api/orders – admin gets all orders (with optional shopId filter)
export async function GET(request) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const shopId = searchParams.get('shopId');
        const limit = parseInt(searchParams.get('limit') || '50');

        const query = shopId ? { shopId } : {};
        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        return Response.json({ orders });
    } catch (error) {
        return Response.json({ error: 'Server error' }, { status: 500 });
    }
}
