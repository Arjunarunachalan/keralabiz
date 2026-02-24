import connectDB from '@/lib/mongodb';
import Shop from '@/models/Shop';
import { requireAdmin } from '@/lib/auth';

// GET /api/shops/list – Admin-only: all shops with optional status filter
export async function GET(request) {
    try {
        const admin = requireAdmin(request);
        if (!admin) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        await connectDB();
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        const query = status ? { status } : {};
        const shops = await Shop.find(query)
            .select('-passwordHash')
            .sort({ createdAt: -1 })
            .lean();

        return Response.json({ shops });
    } catch (error) {
        console.error('Shop list error:', error);
        return Response.json({ error: 'Server error' }, { status: 500 });
    }
}
