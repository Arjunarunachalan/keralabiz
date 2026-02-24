import connectDB from '@/lib/mongodb';
import Shop from '@/models/Shop';
import { requireShop } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// PUT /api/shops/me – shop owner updates their own info
export async function PUT(request) {
    try {
        const shopToken = requireShop(request);
        if (!shopToken) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        await connectDB();
        const { whatsapp, description, address, deliveryInfo, imageUrl, deliveryAvailable, minDeliveryAmount } = await request.json();

        const updates = {};
        if (whatsapp) updates.whatsapp = whatsapp;
        if (description !== undefined) updates.description = description;
        if (address !== undefined) updates.address = address;
        if (deliveryInfo !== undefined) updates.deliveryInfo = deliveryInfo;
        if (imageUrl !== undefined) updates.imageUrl = imageUrl;
        if (deliveryAvailable !== undefined) updates.deliveryAvailable = !!deliveryAvailable;
        if (minDeliveryAmount !== undefined) updates.minDeliveryAmount = Number(minDeliveryAmount) || 0;

        const shop = await Shop.findByIdAndUpdate(shopToken.id, updates, { new: true }).select('-passwordHash');
        if (!shop) return Response.json({ error: 'Shop not found' }, { status: 404 });

        return Response.json({ success: true, shop });
    } catch (error) {
        return Response.json({ error: 'Server error' }, { status: 500 });
    }
}

// GET /api/shops/me – get own shop info
export async function GET(request) {
    try {
        const shopToken = requireShop(request);
        if (!shopToken) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        await connectDB();
        const shop = await Shop.findById(shopToken.id).select('-passwordHash').lean();
        if (!shop) return Response.json({ error: 'Shop not found' }, { status: 404 });

        return Response.json({ shop });
    } catch (error) {
        return Response.json({ error: 'Server error' }, { status: 500 });
    }
}
