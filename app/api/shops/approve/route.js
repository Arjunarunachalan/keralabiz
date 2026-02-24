import connectDB from '@/lib/mongodb';
import Shop from '@/models/Shop';
import { requireAdmin } from '@/lib/auth';

// POST /api/shops/approve  – Admin approves or rejects a shop
export async function POST(request) {
    try {
        const admin = requireAdmin(request);
        if (!admin) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const { shopId, action } = await request.json(); // action: 'approve' | 'reject' | 'suspend'

        if (!shopId || !['approve', 'reject', 'suspend'].includes(action)) {
            return Response.json({ error: 'Invalid request' }, { status: 400 });
        }

        const statusMap = { approve: 'ACTIVE', reject: 'SUSPENDED', suspend: 'SUSPENDED' };
        const shop = await Shop.findByIdAndUpdate(
            shopId,
            { status: statusMap[action] },
            { new: true }
        ).select('-passwordHash');

        if (!shop) {
            return Response.json({ error: 'Shop not found' }, { status: 404 });
        }

        return Response.json({ success: true, shop });
    } catch (error) {
        console.error('Shop approval error:', error);
        return Response.json({ error: 'Server error' }, { status: 500 });
    }
}
