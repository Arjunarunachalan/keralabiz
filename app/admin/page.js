'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
    const [form, setForm] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            const res = await fetch('/api/auth/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (res.ok) router.push('/dashboard/admin');
            else setError(data.error || 'Login failed');
        } catch { setError('Network error. Please try again.'); }
        finally { setLoading(false); }
    }

    return (
        <div className="min-h-screen bg-green-950 flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                {/* Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex w-16 h-16 bg-white/10 rounded-2xl items-center justify-center mb-4">
                        <span className="text-3xl">🔐</span>
                    </div>
                    <h1 className="text-2xl font-extrabold text-white">Admin Login</h1>
                    <p className="text-white/50 text-sm mt-1">KeraBiz Platform Admin</p>
                </div>

                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm font-medium">
                            ❌ {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Username</label>
                            <input
                                className="w-full border-2 border-gray-200 focus:border-green-500 rounded-xl px-4 py-3 text-sm outline-none transition-colors"
                                value={form.username}
                                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                                required autoComplete="username" autoFocus
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                            <input
                                type="password"
                                className="w-full border-2 border-gray-200 focus:border-green-500 rounded-xl px-4 py-3 text-sm outline-none transition-colors"
                                value={form.password}
                                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                required autoComplete="current-password"
                            />
                        </div>
                        <button
                            type="submit" disabled={loading}
                            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2"
                        >
                            {loading ? <><span className="spinner" /> Logging in...</> : 'Login →'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
