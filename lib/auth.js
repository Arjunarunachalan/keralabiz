import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-in-production';
const JWT_EXPIRES = '7d';

export function signToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch {
        return null;
    }
}

export function getTokenFromCookies(request) {
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = Object.fromEntries(
        cookieHeader.split(';').map((c) => {
            const [k, ...v] = c.trim().split('=');
            return [k, v.join('=')];
        })
    );
    return cookies['auth-token'] || null;
}

export function requireAdmin(request) {
    const token = getTokenFromCookies(request);
    if (!token) return null;
    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') return null;
    return payload;
}

export function requireShop(request) {
    const token = getTokenFromCookies(request);
    if (!token) return null;
    const payload = verifyToken(token);
    if (!payload || payload.role !== 'shop') return null;
    return payload;
}
