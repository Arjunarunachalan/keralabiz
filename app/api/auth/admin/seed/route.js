import connectDB from '@/lib/mongodb';
import Admin from '@/models/Admin';
import bcrypt from 'bcryptjs';

// One-time admin seeding endpoint — protected by ADMIN_SEED_SECRET env var
// DELETE or disable this route after first use
export async function POST(request) {
    try {
        const { seedSecret, username, password } = await request.json();

        if (!process.env.ADMIN_SEED_SECRET || seedSecret !== process.env.ADMIN_SEED_SECRET) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const existing = await Admin.findOne({ username: username.toLowerCase() });
        if (existing) {
            return Response.json({ error: 'Admin already exists' }, { status: 409 });
        }

        const passwordHash = await bcrypt.hash(password, 12);
        await Admin.create({ username: username.toLowerCase(), passwordHash });

        return Response.json({ success: true, message: 'Admin account created' }, { status: 201 });
    } catch (error) {
        console.error('Admin seed error:', error);
        return Response.json({ error: 'Server error' }, { status: 500 });
    }
}
