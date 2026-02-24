import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { requireShop } from '@/lib/auth';

// PUT /api/products/[id] – update product
export async function PUT(request, { params }) {
    try {
        const shopToken = requireShop(request);
        if (!shopToken) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        await connectDB();
        const { id } = await params;

        const product = await Product.findOne({ _id: id, shopId: shopToken.id });
        if (!product) return Response.json({ error: 'Product not found' }, { status: 404 });

        const { name, description, price, unit, available, imageUrl } = await request.json();
        if (name) product.name = name.trim();
        if (description !== undefined) product.description = description;
        if (price !== undefined) product.price = Number(price);
        if (unit !== undefined) product.unit = unit;
        if (available !== undefined) product.available = available;
        if (imageUrl !== undefined) product.imageUrl = imageUrl;

        await product.save();
        return Response.json({ success: true, product });
    } catch (error) {
        console.error('Product update error:', error);
        return Response.json({ error: 'Server error' }, { status: 500 });
    }
}

// DELETE /api/products/[id]
export async function DELETE(request, { params }) {
    try {
        const shopToken = requireShop(request);
        if (!shopToken) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        await connectDB();
        const { id } = await params;

        const product = await Product.findOneAndDelete({ _id: id, shopId: shopToken.id });
        if (!product) return Response.json({ error: 'Product not found' }, { status: 404 });

        return Response.json({ success: true });
    } catch (error) {
        return Response.json({ error: 'Server error' }, { status: 500 });
    }
}
