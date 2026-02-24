import connectDB from '@/lib/mongodb';
import Shop from '@/models/Shop';
import { requireAdmin } from '@/lib/auth';

// PATCH /api/shops/[slug]/featured – Admin toggle isFeatured
export async function PATCH(request, { params }) {
    try {
        const admin = requireAdmin(request);
        if (!admin) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        await connectDB();
        const { slug } = await params;

        const shop = await Shop.findOne({ slug });
        if (!shop) return Response.json({ error: 'Shop not found' }, { status: 404 });

        shop.isFeatured = !shop.isFeatured;
        await shop.save();

        return Response.json({ success: true, isFeatured: shop.isFeatured });
    } catch (error) {
        console.error('Featured toggle error:', error);
        return Response.json({ error: 'Server error' }, { status: 500 });
    }
}
