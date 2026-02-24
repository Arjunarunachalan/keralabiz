import connectDB from '@/lib/mongodb';
import Shop from '@/models/Shop';
import { signToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request) {
    try {
        await connectDB();
        const { phone, password } = await request.json();

        if (!phone || !password) {
            return Response.json({ error: 'Phone and password required' }, { status: 400 });
        }

        const shop = await Shop.findOne({ phone });
        if (!shop) {
            return Response.json({ error: 'Shop not found' }, { status: 401 });
        }

        if (shop.status === 'PENDING') {
            return Response.json({ error: 'Shop registration is pending admin approval' }, { status: 403 });
        }

        if (shop.status === 'SUSPENDED') {
            return Response.json({ error: 'Shop has been suspended. Contact admin.' }, { status: 403 });
        }

        const valid = await bcrypt.compare(password, shop.passwordHash);
        if (!valid) {
            return Response.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const token = signToken({ id: shop._id, slug: shop.slug, name: shop.name, role: 'shop' });

        const response = Response.json({
            success: true,
            shop: { name: shop.name, slug: shop.slug, subscriptionStatus: shop.subscriptionStatus },
        });
        response.headers.set(
            'Set-Cookie',
            `auth-token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax`
        );
        return response;
    } catch (error) {
        console.error('Shop login error:', error);
        return Response.json({ error: 'Server error' }, { status: 500 });
    }
}
