import { notFound } from 'next/navigation';
import { cache } from 'react';
import ShopPageClient from './ShopPageClient';
import connectDB from '@/lib/mongodb';
import Shop from '@/models/Shop';
import Product from '@/models/Product';

const getShopData = cache(async (slug) => {
    try {
        await connectDB();

        const shop = await Shop.findOne({ slug, status: 'ACTIVE' })
            .select('-passwordHash')
            .lean();

        if (!shop) {
            return null;
        }

        const products = await Product.find({ shopId: shop._id, available: true })
            .select('name description price unit imageUrl')
            .limit(15)
            .lean();

        return JSON.parse(JSON.stringify({ shop, products }));
    } catch (error) {
        console.error('Shop detail error:', error);
        return null;
    }
});

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const data = await getShopData(slug);
    if (!data) return { title: 'Shop Not Found' };
    return {
        title: `${data.shop.name} – KeraBiz`,
        description: data.shop.description || `${data.shop.category} in ${data.shop.area}`,
    };
}

export default async function ShopPage({ params }) {
    const { slug } = await params;
    const data = await getShopData(slug);
    if (!data) notFound();
    return <ShopPageClient shop={data.shop} products={data.products} />;
}
