import connectDB from '@/lib/mongodb';
import Admin from '@/models/Admin';
import { signToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request) {
    try {
        await connectDB();
        const { username, password } = await request.json();

        if (!username || !password) {
            return Response.json({ error: 'Username and password required' }, { status: 400 });
        }

        const admin = await Admin.findOne({ username: username.toLowerCase() });
        if (!admin) {
            return Response.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const valid = await bcrypt.compare(password, admin.passwordHash);
        if (!valid) {
            return Response.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const token = signToken({ id: admin._id, username: admin.username, role: 'admin' });

        const response = Response.json({ success: true, message: 'Login successful' });
        response.headers.set(
            'Set-Cookie',
            `auth-token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax`
        );
        return response;
    } catch (error) {
        console.error('Admin login error:', error);
        return Response.json({ error: 'Server error' }, { status: 500 });
    }
}
