import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Shop from '@/models/Shop';
import { requireShop } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const PRODUCT_LIMITS = { basic: 10, featured: 50 };

// GET – shop owner's products
export async function GET(request) {
    try {
        const shopToken = requireShop(request);
        if (!shopToken) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        await connectDB();
        const products = await Product.find({ shopId: shopToken.id }).lean();
        return Response.json({ products });
    } catch (error) {
        return Response.json({ error: 'Server error' }, { status: 500 });
    }
}

// POST – add product
export async function POST(request) {
    try {
        const shopToken = requireShop(request);
        if (!shopToken) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        await connectDB();

        const shop = await Shop.findById(shopToken.id);
        if (!shop || shop.subscriptionStatus !== 'active') {
            return Response.json({ error: 'Active subscription required to add products' }, { status: 403 });
        }

        const limit = PRODUCT_LIMITS[shop.subscriptionPlan] || 10;
        const count = await Product.countDocuments({ shopId: shop._id });
        if (count >= limit) {
            return Response.json(
                { error: `Product limit reached (${limit} for ${shop.subscriptionPlan} plan)` },
                { status: 403 }
            );
        }

        const { name, description, price, unit, available, imageUrl } = await request.json();
        if (!name || price === undefined) {
            return Response.json({ error: 'Name and price are required' }, { status: 400 });
        }

        const product = await Product.create({
            shopId: shop._id,
            name: name.trim(),
            description: description || '',
            price: Number(price),
            unit: unit || '',
            available: available !== false,
            imageUrl: imageUrl || '',
        });

        return Response.json({ success: true, product }, { status: 201 });
    } catch (error) {
        console.error('Product create error:', error);
        return Response.json({ error: 'Server error' }, { status: 500 });
    }
}
