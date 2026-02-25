'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Store, LogIn, LayoutDashboard, Package, Clock, CreditCard, Settings,
    Plus, Trash2, Edit2, AlertCircle, ShoppingCart, Star, ExternalLink,
    ShieldCheck, Phone, Lock, Save, X, CheckCircle2, ChevronRight
} from 'lucide-react';
import { Toaster, toast as hotToast } from 'react-hot-toast';

const TABS = [
    { id: 0, label: 'Products', icon: Package },
    { id: 1, label: 'Orders', icon: ShoppingCart },
    { id: 2, label: 'Subscription', icon: Star },
    { id: 3, label: 'Settings', icon: Settings }
];

const staggerContainer = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function ShopDashboard() {
    const [tab, setTab] = useState(0);
    const [shop, setShop] = useState(null);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loggedIn, setLoggedIn] = useState(false);
    const [loginForm, setLoginForm] = useState({ phone: '', password: '' });
    const [loginError, setLoginError] = useState('');
    const [productForm, setProductForm] = useState({ name: '', description: '', price: '', unit: '', available: true });
    const [editingId, setEditingId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditingSettings, setIsEditingSettings] = useState(false);
    const [settingsForm, setSettingsForm] = useState(null);
    const [shopImageFile, setShopImageFile] = useState(null);
    const [productImageFile, setProductImageFile] = useState(null);

    function showToast(msg) {
        if (msg.includes('❌')) hotToast.error(msg.replace('❌ ', ''));
        else if (msg.includes('✅')) hotToast.success(msg.replace('✅ ', ''));
        else hotToast(msg.replace('🗑️ ', ''));
    }

    const fetchDashboard = useCallback(async () => {
        try {
            const t = Date.now();
            const [pRes, oRes, mRes] = await Promise.all([
                fetch(`/api/products?t=${t}`),
                fetch(`/api/orders?limit=50&t=${t}`),
                fetch(`/api/shops/me?t=${t}`),
            ]);
            if (pRes.status === 401) { setLoggedIn(false); return; }
            setProducts((await pRes.json()).products || []);
            setOrders((await oRes.json()).orders || []);
            if (mRes.ok) setShop((await mRes.json()).shop);
        } catch { /* ignore */ }
    }, []);

    useEffect(() => {
        fetch('/api/products').then(r => {
            if (r.ok) { setLoggedIn(true); fetchDashboard(); }
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [fetchDashboard]);

    async function handleLogin(e) {
        e.preventDefault(); setLoginError(''); setIsSubmitting(true);
        const res = await fetch('/api/auth/shop/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginForm),
        });
        const data = await res.json();
        setIsSubmitting(false);
        if (res.ok) { setLoggedIn(true); setShop(data.shop); fetchDashboard(); }
        else setLoginError(data.error || 'Login failed');
    }

    async function handleLogout() {
        await fetch('/api/auth/logout', { method: 'POST' });
        setLoggedIn(false); setShop(null);
    }

    async function saveProduct(e) {
        e.preventDefault();
        setIsSubmitting(true);
        const url = editingId ? `/api/products/${editingId}` : '/api/products';
        const method = editingId ? 'PUT' : 'POST';

        let imageUrl = productForm.imageUrl || '';
        try {
            if (productImageFile) {
                const formData = new FormData();
                formData.append('file', productImageFile);
                const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
                const uploadData = await uploadRes.json();
                if (uploadRes.ok) imageUrl = uploadData.url;
                else { showToast(`❌ ${uploadData.error || 'Image upload failed'}`); setIsSubmitting(false); return; }
            }

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...productForm, price: Number(productForm.price), imageUrl }),
            });
            const data = await res.json();
            setIsSubmitting(false);
            if (res.ok) {
                showToast('✅ Product saved successfully');

                // Instantly update the UI
                if (editingId) {
                    setProducts(prev => prev.map(p => p._id === editingId ? data.product : p));
                } else {
                    setProducts(prev => [data.product, ...prev]);
                }

                setProductForm({ name: '', description: '', price: '', unit: '', available: true, imageUrl: '' });
                setProductImageFile(null);
                setEditingId(null);

                // Fetch in background to sync just in case
                fetchDashboard();
            } else { showToast(`❌ ${data.error}`); }
        } catch {
            setIsSubmitting(false);
            showToast('❌ Network error saving product');
        }
    }

    async function deleteProduct(id) {
        hotToast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
                <div className="flex-1 w-0 p-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0 pt-0.5">
                            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                                <Trash2 className="h-5 w-5 text-red-600" />
                            </div>
                        </div>
                        <div className="ml-3 flex-1">
                            <p className="text-sm font-bold text-gray-900">
                                Delete Product
                            </p>
                            <p className="mt-1 text-sm text-gray-500 font-medium">
                                Are you sure you want to delete this product? This action cannot be undone.
                            </p>
                            <div className="mt-4 flex gap-3">
                                <button
                                    onClick={async () => {
                                        hotToast.dismiss(t.id);
                                        await fetch(`/api/products/${id}`, { method: 'DELETE' });
                                        showToast('🗑️ Product deleted');

                                        // Instantly update the UI
                                        setProducts(prev => prev.filter(p => p._id !== id));

                                        fetchDashboard();
                                    }}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-bold rounded-xl shadow-sm text-white bg-red-600 hover:bg-red-700 transition-colors"
                                >
                                    Delete
                                </button>
                                <button
                                    onClick={() => hotToast.dismiss(t.id)}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-bold rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ), { duration: Infinity });
    }

    function startEdit(p) {
        setEditingId(p._id);
        setProductForm({ name: p.name, description: p.description || '', price: String(p.price), unit: p.unit || '', available: p.available, imageUrl: p.imageUrl || '' });
        setProductImageFile(null);
        setTab(0); window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    async function createSubscription(plan) {
        const res = await fetch('/api/subscriptions/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ plan }),
        });
        const data = await res.json();
        if (res.ok && data.shortUrl) window.open(data.shortUrl, '_blank');
        else showToast(`❌ ${data.error}`);
    }

    function startEditSettings() {
        setSettingsForm({
            whatsapp: shop.whatsapp || '',
            description: shop.description || '',
            address: shop.address || '',
            deliveryInfo: shop.deliveryInfo || '',
            deliveryAvailable: !!shop.deliveryAvailable,
            minDeliveryAmount: shop.minDeliveryAmount || 0,
        });
        setShopImageFile(null);
        setIsEditingSettings(true);
    }

    async function saveSettings(e) {
        e.preventDefault();
        setIsSubmitting(true);
        let imageUrl = shop.imageUrl;

        try {
            if (shopImageFile) {
                const formData = new FormData();
                formData.append('file', shopImageFile);
                const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
                const uploadData = await uploadRes.json();
                if (uploadRes.ok) imageUrl = uploadData.url;
                else { showToast(`❌ ${uploadData.error || 'Image upload failed'}`); setIsSubmitting(false); return; }
            }

            const res = await fetch('/api/shops/me', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...settingsForm, imageUrl }),
            });
            const data = await res.json();
            if (res.ok) {
                showToast('✅ Settings updated');
                setShop(data.shop);
                setIsEditingSettings(false);
            } else {
                showToast(`❌ ${data.error}`);
            }
        } catch {
            showToast('❌ Network error saving settings');
        } finally {
            setIsSubmitting(false);
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#fafafa]">
                <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mb-4" />
                <p className="text-gray-400 font-semibold animate-pulse">Loading Dashboard...</p>
            </div>
        );
    }

    /* ─── Login Screen ─── */
    if (!loggedIn) {
        return (
            <div className="relative min-h-screen bg-[#fafafa] flex items-center justify-center p-4 overflow-hidden">
                {/* Background Blobs */}
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-300/30 rounded-full blur-[100px] animate-blob mix-blend-multiply pointer-events-none" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-gold-200/40 rounded-full blur-[100px] animate-blob animation-delay-2000 mix-blend-multiply pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-sm relative z-10"
                >
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}
                            className="inline-flex w-16 h-16 bg-gradient-to-tr from-green-600 to-green-400 rounded-2xl items-center justify-center mb-4 shadow-xl shadow-green-500/20 text-white"
                        >
                            <Store className="w-8 h-8" />
                        </motion.div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Shop Login</h1>
                        <p className="text-gray-500 font-medium mt-2">Manage your KeraBiz store</p>
                    </div>

                    <div className="glass rounded-[2rem] p-8 shadow-2xl border border-white/60">
                        <AnimatePresence>
                            {loginError && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                    className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm font-bold flex items-center gap-2"
                                >
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span>{loginError}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form onSubmit={handleLogin} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Mobile Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input type="tel" required value={loginForm.phone} placeholder="9876543210"
                                        onChange={e => setLoginForm(f => ({ ...f, phone: e.target.value }))}
                                        className="w-full bg-white/50 border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 rounded-xl pl-12 pr-4 py-3.5 text-sm font-semibold text-gray-900 outline-none transition-all placeholder:text-gray-400" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input type="password" required value={loginForm.password} placeholder="••••••••"
                                        onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                                        className="w-full bg-white/50 border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 rounded-xl pl-12 pr-4 py-3.5 text-sm font-semibold text-gray-900 outline-none transition-all placeholder:text-gray-400" />
                                </div>
                            </div>
                            <button type="submit" disabled={isSubmitting} className="group relative w-full bg-green-600 hover:bg-green-700 text-white font-extrabold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 disabled:opacity-70 disabled:pointer-events-none overflow-hidden mt-2">
                                <div className="absolute inset-0 -translate-x-full group-hover:animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                                <span className="flex items-center justify-center gap-2">
                                    {isSubmitting ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><LogIn className="w-5 h-5" /> Login</>}
                                </span>
                            </button>
                        </form>
                        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                            <p className="text-sm text-gray-500 font-medium">
                                Don&apos;t have a shop account? <br />
                                <a href="/register" className="inline-flex items-center gap-1 text-green-600 font-bold hover:text-green-700 mt-1 transition-colors group">
                                    Register your business <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </a>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    /* ─── Dashboard ─── */
    return (
        <div className="min-h-screen bg-[#fafafa] pb-24">
            <Toaster position="bottom-center" />
            {/* Header Area */}
            <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-tr from-green-600 to-green-400 rounded-xl text-white shadow-md shadow-green-500/20">
                            <Store className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-gray-900 tracking-tight">Shop Dashboard</h1>
                            {shop && <p className="text-green-700 text-xs font-bold uppercase tracking-wider">{shop.name}</p>}
                        </div>
                    </div>
                    <button onClick={handleLogout}
                        className="flex items-center gap-2 text-sm font-bold border border-gray-200 bg-white hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-gray-600 px-4 py-2.5 rounded-xl transition-all shadow-sm">
                        <LogIn className="w-4 h-4 rotate-180" />
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
                                            layoutId="shopTabHighlight"
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
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {/* ── Products ── */}
                    {tab === 0 && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                            {/* Product list */}
                            <div className="lg:col-span-7 xl:col-span-8 space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                                        Active Inventory <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">{products.length}</span>
                                    </h2>
                                </div>

                                {products.length === 0
                                    ? <motion.div variants={fadeUp} initial="hidden" animate="show" className="flex flex-col items-center justify-center py-20 text-center glass rounded-3xl border border-gray-100 shadow-sm">
                                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                            <Package className="w-10 h-10 text-gray-300" />
                                        </div>
                                        <h3 className="text-xl font-black text-gray-900 mb-2">Your inventory is empty</h3>
                                        <p className="text-gray-500 font-medium max-w-sm">Add your first product using the form to start receiving orders.</p>
                                    </motion.div>
                                    : <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <AnimatePresence>
                                            {products.map((p, i) => (
                                                <motion.div
                                                    layout
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                    transition={{ duration: 0.2, delay: i * 0.05 }}
                                                    key={p._id}
                                                    className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-green-200 transition-all group flex flex-col h-full relative overflow-hidden"
                                                >
                                                    {!p.available && <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
                                                        <span className="bg-red-100 text-red-700 font-extrabold px-3 py-1 rounded-full text-xs shadow-sm shadow-red-500/10 border border-red-200">OUT OF STOCK</span>
                                                    </div>}
                                                    <div className="flex-1">
                                                        <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">{p.name}</h3>
                                                        {p.imageUrl && (
                                                            <div className="w-full h-32 mb-3 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex items-center justify-center">
                                                                <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                                                            </div>
                                                        )}
                                                        {p.description && <p className="text-xs text-gray-500 font-medium line-clamp-2 leading-relaxed mb-3">{p.description}</p>}
                                                        <div className="text-green-700 font-black text-2xl tracking-tight">
                                                            ₹{p.price}
                                                            {p.unit && <span className="text-gray-400 text-xs font-bold ml-1 uppercase tracking-wider">{p.unit}</span>}
                                                        </div>
                                                    </div>
                                                    <div className="mt-4 pt-4 border-t border-gray-50 flex gap-2 relative z-20">
                                                        <button onClick={() => startEdit(p)}
                                                            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-xl bg-gray-50 hover:bg-green-50 hover:text-green-700 text-gray-600 transition-colors">
                                                            <Edit2 className="w-3.5 h-3.5" /> Edit
                                                        </button>
                                                        <button onClick={() => deleteProduct(p._id)}
                                                            className="w-10 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                }
                            </div>

                            {/* Form */}
                            <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-[6rem]">
                                <div className="glass rounded-[2rem] border border-white/60 p-6 sm:p-8 shadow-xl">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                                            {editingId ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                                        </div>
                                        <h3 className="font-black text-gray-900 text-lg">
                                            {editingId ? 'Edit Product' : 'Add New Product'}
                                        </h3>
                                    </div>

                                    <form onSubmit={saveProduct} className="space-y-4">
                                        <Field label="Product Name" value={productForm.name} onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Fresh Tomatoes" required />

                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Product Image</label>
                                            <input type="file" accept="image/*" onChange={e => {
                                                if (e.target.files && e.target.files[0]) setProductImageFile(e.target.files[0]);
                                            }} className="w-full bg-white/60 border border-gray-200 focus:border-green-500 rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all text-gray-700" />
                                            {productForm.imageUrl && !productImageFile && (
                                                <div className="mt-2 text-xs font-medium text-green-600 flex items-center gap-1">
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> Current image saved
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Description</label>
                                            <textarea
                                                value={productForm.description} onChange={e => setProductForm(f => ({ ...f, description: e.target.value }))}
                                                placeholder="Provide details..." rows={2}
                                                className="w-full bg-white/60 border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 outline-none transition-all placeholder:text-gray-400 resize-none"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Field label="Price (₹)" type="number" value={productForm.price} onChange={e => setProductForm(f => ({ ...f, price: e.target.value }))} placeholder="0" required />
                                            <Field label="Unit (e.g. per kg)" value={productForm.unit} onChange={e => setProductForm(f => ({ ...f, unit: e.target.value }))} placeholder="Optional" />
                                        </div>

                                        <label className="flex items-center gap-3 cursor-pointer group mt-2 bg-white/60 p-3 rounded-xl border border-transparent hover:border-gray-200 transition-colors">
                                            <div className="relative flex items-center">
                                                <input type="checkbox" checked={productForm.available}
                                                    onChange={e => setProductForm(f => ({ ...f, available: e.target.checked }))}
                                                    className="peer sr-only" />
                                                <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500 shadow-inner"></div>
                                            </div>
                                            <span className="text-sm font-bold text-gray-700">In Stock & Available</span>
                                        </label>

                                        <div className="flex gap-3 pt-4 border-t border-gray-100">
                                            <button type="submit" disabled={isSubmitting} className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-extrabold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 disabled:opacity-70 disabled:pointer-events-none">
                                                {isSubmitting ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-4 h-4" /> {editingId ? 'Save Changes' : 'Add to Shop'}</>}
                                            </button>
                                            {editingId && (
                                                <button type="button"
                                                    onClick={() => { setEditingId(null); setProductForm({ name: '', description: '', price: '', unit: '', available: true, imageUrl: '' }); setProductImageFile(null); }}
                                                    className="w-12 flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 rounded-xl transition-colors shrink-0">
                                                    <X className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Orders ── */}
                    {tab === 1 && (
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                                    Recent Orders
                                </h2>
                            </div>
                            {orders.length === 0
                                ? <motion.div variants={fadeUp} initial="hidden" animate="show" className="flex flex-col items-center justify-center py-24 text-center glass rounded-3xl border border-gray-100 shadow-sm">
                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                        <ShoppingCart className="w-10 h-10 text-gray-300" />
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900 mb-2">No Orders Yet</h3>
                                    <p className="text-gray-500 font-medium max-w-sm mb-6">Orders placed by customers will appear here. Share your unique shop link to get started!</p>
                                    <a href={`/shop/${shop?.slug}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-white border-2 border-green-500 text-green-700 font-bold px-6 py-3 rounded-xl hover:bg-green-50 transition-colors shadow-sm">
                                        <ExternalLink className="w-4 h-4" /> Visit My Shop
                                    </a>
                                </motion.div>
                                : (
                                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden pb-4">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm text-left">
                                                <thead>
                                                    <tr className="bg-gray-50/80 border-b border-gray-100">
                                                        {['Transaction details', 'Order items', 'Date'].map(h => (
                                                            <th key={h} className="px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">{h}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50">
                                                    <AnimatePresence>
                                                        {orders.map((o, i) => (
                                                            <motion.tr
                                                                key={o._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                                                className="group hover:bg-green-50/30 transition-colors"
                                                            >
                                                                <td className="px-6 py-4 align-top">
                                                                    <div className="font-bold text-gray-900 text-base">{o.customerName}</div>
                                                                    <div className="text-[10px] text-gray-400 font-mono mt-1 uppercase">ID: {o._id.slice(-6)}</div>
                                                                </td>
                                                                <td className="px-6 py-4 align-top">
                                                                    <div className="flex flex-wrap gap-1.5 max-w-md">
                                                                        {o.items?.map((item, idx) => (
                                                                            <span key={idx} className="bg-blue-50/80 text-blue-700 text-[11px] px-2.5 py-1 rounded-md border border-blue-100 font-bold whitespace-nowrap shadow-sm">
                                                                                {item.productName} <span className="text-blue-400 mx-0.5">×</span> {item.quantity}
                                                                            </span>
                                                                        )) || <span className="text-gray-400 font-medium">—</span>}
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 align-top">
                                                                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                                                        <Clock className="w-3.5 h-3.5" />
                                                                        {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                                    </div>
                                                                </td>
                                                            </motion.tr>
                                                        ))}
                                                    </AnimatePresence>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )
                            }
                        </div>
                    )}

                    {/* ── Subscription ── */}
                    {tab === 2 && (
                        <div className="max-w-4xl space-y-8">
                            {/* Current status */}
                            {shop && (
                                <motion.div variants={fadeUp} initial="hidden" animate="show" className="glass rounded-[2rem] border border-white/60 shadow-xl p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-gold-400/20 rounded-full blur-[50px] pointer-events-none" />

                                    <div className="relative z-10 flex-1">
                                        <h3 className="font-black text-gray-900 text-xl flex items-center gap-2 mb-4">
                                            <ShieldCheck className="w-6 h-6 text-green-600" /> Account Status
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-4">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Current Plan</span>
                                                <span className={`inline-flex items-center justify-center text-xs font-extrabold px-3 py-1.5 rounded-full border ${shop.subscriptionPlan === 'featured' ? 'bg-gradient-to-r from-gold-500/10 to-gold-400/10 text-gold-700 border-gold-300' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                                    {shop.subscriptionPlan === 'featured' ? <><Star className="w-3.5 h-3.5 mr-1 fill-gold-500" /> Premium Featured</> : 'Standard Basic'}
                                                </span>
                                            </div>
                                            <div className="w-px h-10 bg-gray-200 hidden sm:block" />
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Billing Status</span>
                                                <span className={`inline-flex items-center justify-center text-xs font-extrabold px-3 py-1.5 rounded-full border ${shop.subscriptionStatus === 'active' ? 'bg-green-100/80 text-green-700 border-green-200' : 'bg-red-100/80 text-red-700 border-red-200'}`}>
                                                    {shop.subscriptionStatus === 'active' ? <><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Active</> : <><AlertCircle className="w-3.5 h-3.5 mr-1" /> Requires Attention</>}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {shop.subscriptionStatus !== 'active' && (
                                        <div className="relative z-10 bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-800 text-sm font-semibold rounded-2xl px-5 py-4 flex items-start gap-3 w-full md:w-auto md:max-w-xs shadow-sm">
                                            <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
                                            <p className="leading-relaxed">Your shop is currently hidden from public listings. Please choose a plan below to activate.</p>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            <div>
                                <h3 className="text-xl font-extrabold text-gray-900 mb-6">Available Plans</h3>
                                <div className="grid md:grid-cols-2 gap-6">
                                    {[
                                        {
                                            plan: 'basic',
                                            label: 'Basic Partner',
                                            price: '499',
                                            features: ['List up to 10 products', 'Public shop listing & searchable profile', 'Receive direct WhatsApp orders', 'Basic analytics tracking'],
                                            color: 'text-gray-900',
                                            bg: 'bg-white',
                                            border: 'border-gray-200 hover:border-gray-300',
                                            btn: 'bg-gray-900 hover:bg-gray-800 text-white'
                                        },
                                        {
                                            plan: 'featured',
                                            label: 'Premium Featured',
                                            price: '999',
                                            features: ['Unlimited product listings', 'Featured badge on all listings', 'Priority high-ranking placement', 'Enhanced shop profile aesthetics', 'Premium customer support'],
                                            color: 'text-gold-600',
                                            bg: 'bg-gradient-to-br from-gold-50/50 to-white',
                                            border: 'border-gold-300 shadow-md hover:shadow-xl hover:-translate-y-1',
                                            btn: 'bg-gradient-to-r from-gold-500 to-gold-400 hover:to-gold-500 text-white shadow-lg shadow-gold-500/25',
                                            isPopular: true
                                        },
                                    ].map((p, i) => (
                                        <motion.div
                                            key={p.plan}
                                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + (i * 0.1) }}
                                            className={`relative rounded-[2rem] border-2 ${p.border} ${p.bg} p-8 transition-all duration-300 flex flex-col`}
                                        >
                                            {p.isPopular && (
                                                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-gold-600 to-gold-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-sm">
                                                    Most Recommended
                                                </div>
                                            )}
                                            <div className={`font-black tracking-tight text-xl mb-2 ${p.color} flex items-center gap-2`}>
                                                {p.isPopular && <Star className="w-5 h-5 fill-gold-500" />} {p.label}
                                            </div>
                                            <div className="flex items-baseline gap-1 mb-6">
                                                <span className="text-4xl font-black text-gray-900">₹{p.price}</span>
                                                <span className="text-sm font-bold text-gray-400">/mo</span>
                                            </div>
                                            <div className="space-y-3 mb-8 flex-1">
                                                {p.features.map((f, idx) => (
                                                    <div key={idx} className="flex items-start gap-3">
                                                        <CheckCircle2 className={`w-5 h-5 shrink-0 ${p.isPopular ? 'text-gold-500' : 'text-green-500'}`} />
                                                        <span className="text-sm font-semibold text-gray-700 leading-snug">{f}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <button onClick={() => createSubscription(p.plan)}
                                                className={`w-full font-extrabold py-4 rounded-xl text-sm transition-all active:scale-95 ${p.btn}`}>
                                                {shop?.subscriptionPlan === p.plan && shop?.subscriptionStatus === 'active' ? 'Current Active Plan' : `Subscribe to ${p.label}`}
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Settings ── */}
                    {tab === 3 && (
                        <div className="max-w-2xl">
                            <div className="glass rounded-[2rem] border border-white/60 shadow-xl p-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-green-200/20 rounded-full blur-[80px] pointer-events-none" />

                                <div className="flex items-center gap-4 mb-8 relative z-10 border-b border-gray-100 pb-6">
                                    {shop?.imageUrl ? (
                                        <img src={shop.imageUrl} alt={shop.name} className="w-16 h-16 rounded-2xl object-cover shadow-lg border border-gray-200" />
                                    ) : (
                                        <div className="w-16 h-16 bg-gradient-to-tr from-green-600 to-green-400 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-500/20 text-2xl font-black">
                                            {shop?.name?.charAt(0) || 'S'}
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <h3 className="font-black text-gray-900 text-2xl tracking-tight">{shop?.name}</h3>
                                        <p className="text-sm font-bold text-gray-500">{shop?.category} · {shop?.area}</p>
                                    </div>
                                    {!isEditingSettings && (
                                        <button onClick={startEditSettings} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-bold transition-all">
                                            <Edit2 className="w-4 h-4" /> Edit
                                        </button>
                                    )}
                                </div>

                                {shop ? (
                                    isEditingSettings ? (
                                        <form onSubmit={saveSettings} className="space-y-5 relative z-10 bg-white/50 p-6 rounded-2xl border border-gray-100">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Shop Image</label>
                                                <input type="file" accept="image/*" onChange={e => e.target.files && setShopImageFile(e.target.files[0])}
                                                    className="w-full bg-white/60 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <Field label="WhatsApp Number" type="tel" value={settingsForm.whatsapp} onChange={e => setSettingsForm(f => ({ ...f, whatsapp: e.target.value }))} required />
                                                <Field label="Exact Address" value={settingsForm.address} onChange={e => setSettingsForm(f => ({ ...f, address: e.target.value }))} />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Store Description</label>
                                                <textarea value={settingsForm.description} onChange={e => setSettingsForm(f => ({ ...f, description: e.target.value }))} rows={2}
                                                    className="w-full bg-white/60 border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 outline-none transition-all placeholder:text-gray-400 resize-none" />
                                            </div>
                                            <Field label="Delivery Policy Info" value={settingsForm.deliveryInfo} onChange={e => setSettingsForm(f => ({ ...f, deliveryInfo: e.target.value }))} placeholder="e.g. Free delivery under 5km" />

                                            <div className="bg-white/80 border border-gray-200 p-4 rounded-xl">
                                                <label className="flex items-center gap-3 cursor-pointer mb-2">
                                                    <input type="checkbox" checked={settingsForm.deliveryAvailable} onChange={e => setSettingsForm(f => ({ ...f, deliveryAvailable: e.target.checked }))} className="w-5 h-5 text-green-600 rounded bg-gray-100 border-gray-300" />
                                                    <span className="text-sm font-bold text-gray-900">We offer delivery services</span>
                                                </label>
                                                {settingsForm.deliveryAvailable && (
                                                    <div className="pl-8">
                                                        <Field label="Minimum Order Amount for Delivery (₹)" type="number" value={settingsForm.minDeliveryAmount} onChange={e => setSettingsForm(f => ({ ...f, minDeliveryAmount: e.target.value }))} />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex gap-3 pt-4 border-t border-gray-200">
                                                <button type="submit" disabled={isSubmitting} className="flex-1 flex justify-center items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-all">
                                                    {isSubmitting ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-4 h-4" /> Save Settings</>}
                                                </button>
                                                <button type="button" onClick={() => setIsEditingSettings(false)} className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 rounded-xl transition-all">Cancel</button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="space-y-6 relative z-10">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="bg-white/60 rounded-xl p-4 border border-gray-100">
                                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Owner Name</div>
                                                    <div className="font-semibold text-gray-900">{shop.ownerName}</div>
                                                </div>
                                                <div className="bg-white/60 rounded-xl p-4 border border-gray-100">
                                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Phone className="w-3 h-3" /> Registered Details</div>
                                                    <div className="flex-1 overflow-x-auto scrollbar-hide">
                                                        <span className="text-sm font-medium text-gray-500 mr-1">phonepeedika.com/shop/</span>
                                                        <strong className="text-gray-900">{shop.slug}</strong>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-white/60 rounded-xl p-4 border border-gray-100">
                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1"><Store className="w-3 h-3 inline mr-1" /> Store Description & Rules</div>
                                                <div className="font-medium text-gray-700 leading-relaxed text-sm mb-2">{shop.description || 'No description provided.'}</div>
                                                {shop.deliveryAvailable ? (
                                                    <div className="text-sm font-semibold text-green-700 bg-green-50 p-2 rounded-lg inline-block border border-green-200">
                                                        <Truck className="w-4 h-4 inline mr-1" /> Delivery Available (Min Order: ₹{shop.minDeliveryAmount || 0})
                                                    </div>
                                                ) : (
                                                    <div className="text-sm font-semibold text-gray-500 bg-gray-100 p-2 rounded-lg inline-block">
                                                        Pickup / Walk-in Only
                                                    </div>
                                                )}
                                                {shop.deliveryInfo && <div className="text-sm mt-2 font-medium text-gray-600">Info: {shop.deliveryInfo}</div>}
                                            </div>

                                            <div className="bg-green-50/50 rounded-xl p-5 border border-green-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                                <div>
                                                    <div className="text-[10px] font-bold text-green-600 uppercase tracking-wider mb-1">Public Shop URL</div>
                                                    <div className="font-mono font-semibold text-gray-800 text-sm break-all">
                                                        keralabiz.com/shop/{shop.slug}
                                                    </div>
                                                </div>
                                                <a href={`/shop/${shop.slug}`} target="_blank" rel="noreferrer"
                                                    className="shrink-0 flex items-center gap-2 bg-green-600 text-white hover:bg-green-700 font-bold px-5 py-2.5 rounded-xl transition-colors shadow-sm active:scale-95">
                                                    <ExternalLink className="w-4 h-4" /> View Public Page
                                                </a>
                                            </div>
                                        </div>
                                    )
                                ) : <div className="h-40 flex items-center justify-center animate-pulse text-gray-400 font-semibold">Loading settings...</div>}
                            </div>
                            <div className="mt-6 flex justify-center">
                                <p className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
                                    <Lock className="w-3.5 h-3.5" /> Core identity details cannot be edited here.
                                </p>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}

function Field({ label, value, onChange, type = 'text', placeholder = '', required = false }) {
    return (
        <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">{label}</label>
            <input type={type} value={value} onChange={onChange} placeholder={placeholder} required={required}
                className="w-full bg-white/60 border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 rounded-xl px-4 py-3 text-sm font-semibold text-gray-900 outline-none transition-all placeholder:text-gray-400" />
        </div>
    );
}
