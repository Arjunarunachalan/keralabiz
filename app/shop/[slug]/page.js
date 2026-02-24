import { notFound } from 'next/navigation';
import ShopPageClient from './ShopPageClient';

async function getShopData(slug) {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const res = await fetch(`${baseUrl}/api/shops/${slug}`, { cache: 'no-store' });
        if (!res.ok) return null;
        return res.json();
    } catch {
        return null;
    }
}

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
