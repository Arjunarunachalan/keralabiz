import connectDB from '@/lib/mongodb';
import Shop from '@/models/Shop';
import Product from '@/models/Product';

// GET /api/shops/[slug] – public shop page data
export async function GET(request, { params }) {
    try {
        await connectDB();
        const { slug } = await params;

        const shop = await Shop.findOne({ slug, status: 'ACTIVE' })
            .select('-passwordHash')
            .lean();

        if (!shop) {
            return Response.json({ error: 'Shop not found' }, { status: 404 });
        }

        const products = await Product.find({ shopId: shop._id, available: true })
            .select('name description price unit imageUrl')
            .limit(15)
            .lean();

        return Response.json({ shop, products });
    } catch (error) {
        console.error('Shop detail error:', error);
        return Response.json({ error: 'Server error' }, { status: 500 });
    }
}
