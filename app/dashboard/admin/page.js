'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Users, CreditCard, ShoppingBag, BarChart3,
    CheckCircle2, XCircle, AlertCircle, LogOut, Star, Package, Clock, Info
} from 'lucide-react';

const TABS = [
    { id: 0, label: 'Pending', icon: Clock },
    { id: 1, label: 'Active Shops', icon: Users },
    { id: 2, label: 'Subscriptions', icon: CreditCard },
    { id: 3, label: 'Orders', icon: ShoppingBag },
    { id: 4, label: 'Analytics', icon: BarChart3 },
];

const STATUS_BADGE = {
    PENDING: 'bg-amber-100/80 text-amber-700 border-amber-200',
    ACTIVE: 'bg-green-100/80 text-green-700 border-green-200',
    SUSPENDED: 'bg-red-100/80 text-red-700 border-red-200',
    active: 'bg-green-100/80 text-green-700 border-green-200',
    inactive: 'bg-gray-100/80 text-gray-500 border-gray-200',
    past_due: 'bg-red-100/80 text-red-600 border-red-200',
    basic: 'bg-blue-50/80 text-blue-600 border-blue-100',
    featured: 'bg-gradient-to-r from-gold-500/20 to-gold-400/20 text-gold-700 border-gold-300 shadow-sm',
};

function Badge({ label, type }) {
    return (
        <span className={`inline-flex items-center justify-center text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full border ${STATUS_BADGE[type] || 'bg-gray-100 text-gray-500 border-gray-200'}`}>
            {label}
        </span>
    );
}

export default function AdminDashboard() {
    const [tab, setTab] = useState(0);
    const [shops, setShops] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState('');
    const router = useRouter();

    function showToast(msg) {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    }

    const loadShops = useCallback(async (status) => {
        setLoading(true);
        try {
            const q = status ? `?status=${status}` : '';
            const res = await fetch(`/api/shops${q}`);
            if (res.status === 401) { router.push('/admin'); return; }
            const d = await res.json();
            setShops(d.shops || []);
        } finally { setLoading(false); }
    }, [router]);

    const loadOrders = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/orders?limit=100');
            const d = await res.json();
            setOrders(d.orders || []);
        } finally { setLoading(false); }
    }, []);

    useEffect(() => {
        if (tab === 0) loadShops('PENDING');
        else if (tab === 1) loadShops('ACTIVE');
        else if (tab === 2) loadShops('ACTIVE');
        else if (tab === 3) loadOrders();
        else { loadShops(); loadOrders(); }
    }, [tab, loadShops, loadOrders]);

    async function shopAction(shopId, action) {
        const res = await fetch('/api/shops/approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ shopId, action }),
        });
        if (res.ok) {
            showToast(`Shop ${action}d successfully`);
            loadShops(tab === 0 ? 'PENDING' : 'ACTIVE');
        } else {
            const d = await res.json();
            showToast(`${d.error}`);
        }
    }

    async function toggleFeatured(slug) {
        await fetch(`/api/shops/${slug}/featured`, { method: 'PATCH' });
        loadShops('ACTIVE');
    }

    async function logout() {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/admin');
    }

    // Analytics
    const payingShops = shops.filter(s => s.subscriptionStatus === 'active');
    const revenue = payingShops.reduce((s, sh) => s + (sh.subscriptionPlan === 'featured' ? 999 : 499), 0);
    const thisMonth = orders.filter(o => {
        const d = new Date(o.createdAt), n = new Date();
        return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
    });

    return (
        <div className="min-h-screen bg-[#fafafa] pb-20">
            {/* Header Area */}
            <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-950 rounded-xl text-white shadow-md">
                            <LayoutDashboard className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-gray-900 tracking-tight">Admin Control</h1>
                            <p className="text-gray-500 text-xs font-semibold">KeraBiz Platform Management</p>
                        </div>
                    </div>
                    <button onClick={logout}
                        className="flex items-center gap-2 text-sm font-bold border border-gray-200 bg-white hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-gray-600 px-4 py-2.5 rounded-xl transition-all shadow-sm">
                        <LogOut className="w-4 h-4" />
                        <span className="hidden sm:inline">Logout</span>
                    </button>
                </div>

                {/* Tabs Row */}
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide py-3">
                        {TABS.map((t) => {
                            const Icon = t.icon;
                            const isActive = tab === t.id;
                            return (
                                <button key={t.id} onClick={() => setTab(t.id)}
                                    className={`relative flex items-center gap-2 px-5 py-2.5 text-sm font-bold whitespace-nowrap rounded-full transition-all duration-300 outline-none
                                        ${isActive ? 'text-green-900 shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'}`}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="adminTabHighlight"
                                            className="absolute inset-0 bg-green-100/80 border border-green-200 rounded-full"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                    <span className="relative z-10 flex items-center gap-2">
                                        <Icon className={`w-4 h-4 ${isActive ? 'text-green-600' : 'text-gray-400'}`} />
                                        {t.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Toast */}
                <AnimatePresence>
                    {toast && (
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.9 }}
                            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-3 rounded-2xl font-bold text-sm shadow-2xl glass-dark text-white border border-white/10"
                        >
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                            {toast}
                        </motion.div>
                    )}
                </AnimatePresence>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 text-gray-400">
                        <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mb-4" />
                        <p className="font-semibold animate-pulse">Loading data...</p>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* TAB 0 – Pending */}
                        {tab === 0 && (
                            shops.length === 0
                                ? <Empty icon={Clock} title="No Pending Requests" text="All shop registrations have been processed." />
                                : <Table
                                    headers={['Shop Details', 'Owner info', 'Area & Category', 'Plan', 'Actions']}
                                    rows={shops.map(s => [
                                        <div key="n" className="flex flex-col">
                                            <strong className="text-gray-900 group-hover:text-green-700 transition-colors">{s.name}</strong>
                                            <span className="text-[10px] text-gray-400 uppercase">{s.slug}</span>
                                        </div>,
                                        <div key="o" className="flex flex-col">
                                            <span className="font-semibold text-gray-700">{s.ownerName}</span>
                                            <span className="text-xs text-gray-500">{s.phone}</span>
                                        </div>,
                                        <div key="a" className="flex flex-col">
                                            <span className="font-medium text-gray-700">{s.area}</span>
                                            <span className="text-xs text-gray-400">{s.category}</span>
                                        </div>,
                                        <Badge key="p" label={s.subscriptionPlan} type={s.subscriptionPlan} />,
                                        <div key="act" className="flex gap-2">
                                            <Btn green onClick={() => shopAction(s._id, 'approve')}>
                                                <CheckCircle2 className="w-4 h-4 mr-1" /> Approve
                                            </Btn>
                                            <Btn red onClick={() => shopAction(s._id, 'reject')}>
                                                <XCircle className="w-4 h-4 mr-1" /> Reject
                                            </Btn>
                                        </div>,
                                    ])}
                                />
                        )}

                        {/* TAB 1 – Active */}
                        {tab === 1 && (
                            shops.length === 0
                                ? <Empty icon={Users} title="No Active Shops" text="Approved shops will appear here." />
                                : <Table
                                    headers={['Shop', 'Location', 'Plan details', 'Featured Status', 'Actions']}
                                    rows={shops.map(s => [
                                        <a key="n" href={`/shop/${s.slug}`} target="_blank" rel="noreferrer" className="flex flex-col group">
                                            <strong className="text-green-700 group-hover:underline">{s.name}</strong>
                                            <span className="text-xs text-gray-400">View Shop ↗</span>
                                        </a>,
                                        <span key="a" className="font-medium text-gray-700">{s.area}</span>,
                                        <div key="p" className="flex flex-col gap-1 items-start">
                                            <Badge label={s.subscriptionPlan} type={s.subscriptionPlan} />
                                            <Badge label={s.subscriptionStatus} type={s.subscriptionStatus} />
                                        </div>,
                                        <button key="f" onClick={() => toggleFeatured(s.slug)}
                                            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border transition-all active:scale-95 ${s.isFeatured ? 'bg-gradient-to-r from-gold-500/10 to-gold-400/10 border-gold-300 text-gold-600 shadow-sm' : 'border-gray-200 text-gray-500 hover:border-gold-300 hover:text-gold-600 hover:bg-gold-50/50'}`}>
                                            <Star className={`w-3.5 h-3.5 ${s.isFeatured ? 'fill-gold-500' : ''}`} />
                                            {s.isFeatured ? 'Featured' : 'Set Featured'}
                                        </button>,
                                        <Btn key="sus" red onClick={() => shopAction(s._id, 'suspend')}>
                                            <AlertCircle className="w-4 h-4 mr-1" /> Suspend
                                        </Btn>,
                                    ])}
                                />
                        )}

                        {/* TAB 2 – Subscriptions */}
                        {tab === 2 && (
                            <Table
                                headers={['Shop Name', 'Location', 'Current Plan', 'Billing Status', 'Payment ID']}
                                rows={shops.map(s => [
                                    <strong key="n" className="text-gray-900">{s.name}</strong>,
                                    <span key="a" className="text-gray-600">{s.area}</span>,
                                    <Badge key="p" label={s.subscriptionPlan} type={s.subscriptionPlan} />,
                                    <Badge key="ss" label={s.subscriptionStatus} type={s.subscriptionStatus} />,
                                    <span key="r" className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500 font-mono select-all">
                                        {s.razorpaySubscriptionId || 'N/A'}
                                    </span>,
                                ])}
                            />
                        )}

                        {/* TAB 3 – Orders */}
                        {tab === 3 && (
                            orders.length === 0
                                ? <Empty icon={Package} title="No Orders Yet" text="Customer orders will be tracked here." />
                                : <Table
                                    headers={['Shop', 'Customer', 'Order Items', 'Date']}
                                    rows={orders.map(o => [
                                        <strong key="n" className="text-gray-900">{o.shopName}</strong>,
                                        <span key="c" className="font-medium text-gray-700">{o.customerName}</span>,
                                        <div key="i" className="flex flex-wrap gap-1 max-w-[200px]">
                                            {o.items?.map((i, idx) => (
                                                <span key={idx} className="bg-blue-50 text-blue-700 text-[10px] px-2 py-0.5 rounded border border-blue-100 font-bold whitespace-nowrap">
                                                    {i.productName} × {i.quantity}
                                                </span>
                                            )) || <span className="text-gray-400 text-sm">—</span>}
                                        </div>,
                                        <span key="d" className="text-xs font-semibold text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                                            {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </span>,
                                    ])}
                                />
                        )}

                        {/* TAB 4 – Analytics */}
                        {tab === 4 && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                                    {[
                                        { label: 'Total Shops', value: shops.length, color: 'text-gray-900', border: 'border-l-4 border-l-gray-900' },
                                        { label: 'Active', value: shops.filter(s => s.status === 'ACTIVE').length, color: 'text-green-600', border: 'border-l-4 border-l-green-500' },
                                        { label: 'Paying', value: payingShops.length, color: 'text-blue-600', border: 'border-l-4 border-l-blue-500' },
                                        { label: 'Featured', value: shops.filter(s => s.isFeatured).length, color: 'text-gold-600', border: 'border-l-4 border-l-gold-500' },
                                        { label: 'Orders (Mo)', value: thisMonth.length, color: 'text-indigo-600', border: 'border-l-4 border-l-indigo-500' },
                                        { label: 'Est. Revenue', value: `₹${revenue.toLocaleString()}`, color: 'text-emerald-600', border: 'border-l-4 border-l-emerald-500' },
                                    ].map((stat, i) => (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            key={stat.label}
                                            className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 ${stat.border}`}
                                        >
                                            <div className={`text-3xl font-black tracking-tight ${stat.color}`}>{stat.value}</div>
                                            <div className="text-xs text-gray-500 font-bold mt-2 uppercase tracking-wide">{stat.label}</div>
                                        </motion.div>
                                    ))}
                                </div>
                                <div className="glass rounded-xl p-4 flex items-start gap-3 border border-blue-100/50 bg-blue-50/50">
                                    <Info className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                                    <p className="text-sm font-medium text-blue-800 leading-relaxed">
                                        Estimated Revenue is calculated strictly from currently active subscriptions based on base pricing
                                        (<span className="font-bold">Basic ₹499</span> + <span className="font-bold">Featured ₹999</span>).
                                        Canceled or past due subscriptions are excluded.
                                    </p>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
}

function Table({ headers, rows }) {
    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead>
                        <tr className="bg-gray-50/80 border-b border-gray-100">
                            {headers.map(h => (
                                <th key={h} className="px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider whitespace-nowrap">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        <AnimatePresence>
                            {rows.map((row, i) => (
                                <motion.tr
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2, delay: i * 0.05 }}
                                    key={i}
                                    className="group hover:bg-green-50/30 transition-colors"
                                >
                                    {row.map((cell, j) => (
                                        <td key={j} className="px-6 py-4 whitespace-nowrap align-middle">
                                            {cell}
                                        </td>
                                    ))}
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function Empty({ icon: Icon, title, text }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center glass rounded-3xl border border-gray-100 shadow-sm"
        >
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <Icon className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-500 font-medium max-w-sm">{text}</p>
        </motion.div>
    );
}

function Btn({ children, onClick, red, green }) {
    return (
        <button onClick={onClick}
            className={`flex items-center justify-center text-xs font-bold px-3 py-2 rounded-xl border transition-all active:scale-95 outline-none
                ${green ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-600 hover:text-white hover:border-green-600 shadow-sm' :
                    red ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-600 hover:text-white hover:border-red-600 shadow-sm' :
                        'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}>
            {children}
        </button>
    );
}
