import connectDB from '@/lib/mongodb';
import Shop from '@/models/Shop';
import { requireAdmin } from '@/lib/auth';

// GET /api/shops/list  – Admin: all shops with optional status filter
// GET /api/shops       – Public: active shops filtered by area/category
export async function GET(request) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);

        // Check if admin
        const admin = requireAdmin(request);

        if (admin) {
            // Admin view – all shops
            const status = searchParams.get('status'); // optional filter
            const query = status ? { status } : {};
            const shops = await Shop.find(query)
                .select('-passwordHash')
                .sort({ createdAt: -1 })
                .lean();
            return Response.json({ shops });
        }

        // Public view – only ACTIVE shops
        const area = searchParams.get('area');
        const category = searchParams.get('category');

        const query = { status: 'ACTIVE', subscriptionStatus: 'active' };
        if (area) query.area = area;
        if (category) query.category = category;

        const shops = await Shop.find(query)
            .select('name ownerName area category slug whatsapp isFeatured subscriptionPlan description deliveryInfo address imageUrl')
            .sort({ isFeatured: -1, createdAt: -1 })
            .lean();

        return Response.json({ shops });
    } catch (error) {
        console.error('Shop list error:', error);
        return Response.json({ error: 'Server error' }, { status: 500 });
    }
}
