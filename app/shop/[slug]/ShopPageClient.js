'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Info, ShoppingBag, Plus, Minus, MessageCircle, ShoppingCart, AlertCircle, Map, Target, X } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';

function generateWhatsAppMessage(shop, selectedItems, user) {
    const subtotal = selectedItems.reduce((s, i) => s + (i.price * i.qty), 0);

    const itemLines = selectedItems.length > 0
        ? selectedItems.map(i => `  • ${i.name} x${i.qty} — ₹${i.price * i.qty}`).join('\n')
        : '  (Items not selected – please specify in chat)';

    return encodeURIComponent(
        `നമസ്കാരം! 🙏\n\n🛍️ *New Order for ${shop.name}*\n\n📋 *Order Summary:*\n${itemLines}\n\n====================\n💰 *Subtotal: ₹${subtotal}*\n_{Note: Final total may vary. Delivery & other charges may apply based on location and shop policies.}_\n====================\n\n👤 *Customer Details:*\n• Name: ${user.name}\n• Phone: ${user.phone}\n• Address: ${user.address || 'N/A'}\n• Preferred Time: ${user.date || 'As soon as possible'}\n\n_Please confirm the availability, final total including any extra charges, and delivery timing. Thank you!_`
    );
}

const staggerContainer = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function ShopPageClient({ shop, products }) {
    const [selected, setSelected] = useState({});
    const [orderModalOpen, setOrderModalOpen] = useState(false);
    const [userData, setUserData] = useState({ name: '', phone: '', address: '', date: '' });

    function toggleItem(p) {
        setSelected(prev => {
            if (prev[p._id]) { const { [p._id]: _, ...rest } = prev; return rest; }
            return { ...prev, [p._id]: { ...p, qty: 1 } };
        });
    }

    function changeQty(id, delta) {
        setSelected(prev => {
            const item = prev[id]; if (!item) return prev;
            const qty = item.qty + delta;
            if (qty <= 0) { const { [id]: _, ...rest } = prev; return rest; }
            return { ...prev, [id]: { ...item, qty } };
        });
    }

    const selectedList = Object.values(selected);
    const waNumber = shop.whatsapp.replace(/\D/g, '');
    const total = selectedList.reduce((s, i) => s + i.price * i.qty, 0);

    function handleSendOrder(e) {
        e.preventDefault();
        if (!userData.name || !userData.phone) {
            toast.error('Please enter Name and Phone');
            return;
        }

        // Track order in background
        fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                shopId: shop._id, shopName: shop.name,
                customerName: userData.name, customerPhone: userData.phone,
                items: selectedList.map(i => ({ productName: i.name, quantity: i.qty, price: i.price })),
            }),
        }).catch(() => { });

        const message = generateWhatsAppMessage(shop, selectedList, userData);
        const url = `https://wa.me/91${waNumber}?text=${message}`;
        window.open(url, '_blank');
        setOrderModalOpen(false);
    }

    return (
        <div className="bg-[#fafafa] min-h-screen pb-24">
            <Toaster position="bottom-center" />
            {/* Shop Hero */}
            <div className="relative bg-green-950 text-white overflow-hidden rounded-b-[40px] shadow-sm mb-8 pt-12">
                {/* Ambient lights */}
                <div className="absolute top-[-100px] right-[-100px] w-96 h-96 bg-green-500/30 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-[-50px] left-[-50px] w-64 h-64 bg-gold-400/20 rounded-full blur-[80px] pointer-events-none" />

                <div className="max-w-6xl mx-auto px-6 py-12 md:py-16 relative z-10">
                    <motion.div initial="hidden" animate="show" variants={staggerContainer} className="max-w-4xl flex flex-col md:flex-row gap-8 items-center md:items-start">
                        {shop.imageUrl && (
                            <motion.div variants={fadeUp} className="w-32 h-32 md:w-40 md:h-40 shrink-0 rounded-3xl overflow-hidden border-4 border-green-800 shadow-2xl relative">
                                <img src={shop.imageUrl} alt={shop.name} className="w-full h-full object-cover" />
                            </motion.div>
                        )}
                        <div className="flex-1 text-center md:text-left">
                            <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">{shop.name}</h1>
                                {shop.isFeatured && (
                                    <span className="bg-gradient-to-r from-gold-500 to-gold-400 text-white text-[10px] uppercase font-black tracking-widest px-3 py-1.5 rounded-full shadow-lg shadow-gold-500/30">
                                        Premium Partner
                                    </span>
                                )}
                            </motion.div>

                            <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm font-medium text-green-100/80 mb-6">
                                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                                    <MapPin className="w-4 h-4" /> {shop.area}
                                </span>
                                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                                    <Target className="w-4 h-4" /> {shop.category}
                                </span>
                                {shop.address && (
                                    <span className="flex items-center gap-1.5">
                                        <Map className="w-4 h-4 opacity-70" /> {shop.address}
                                    </span>
                                )}
                            </motion.div>

                            {shop.description && (
                                <motion.p variants={fadeUp} className="text-lg text-green-50/90 leading-relaxed font-medium mb-6">
                                    {shop.description}
                                </motion.p>
                            )}

                            <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
                                {shop.deliveryAvailable ? (
                                    <div className="inline-flex items-center gap-2 bg-green-800 text-green-50 border border-green-700 px-4 py-2 rounded-xl text-sm font-bold shadow-inner">
                                        <ShoppingCart className="w-4 h-4" />
                                        Delivery Available {shop.minDeliveryAmount > 0 && `(Min ₹${shop.minDeliveryAmount})`}
                                    </div>
                                ) : (
                                    <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 border border-white/20 px-4 py-2 rounded-xl text-sm font-bold shadow-inner">
                                        Pickup Only
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start relative z-20">
                {/* Products — left 2 cols */}
                <div className="lg:col-span-2">
                    {shop.deliveryInfo && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-blue-50/80 backdrop-blur-sm border border-blue-100 text-blue-800 rounded-2xl p-4 text-sm font-bold mb-8 flex items-start gap-3 shadow-sm"
                        >
                            <Info className="w-5 h-5 shrink-0 text-blue-500" />
                            <span>{shop.deliveryInfo}</span>
                        </motion.div>
                    )}

                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-green-100 rounded-xl text-green-700">
                            <ShoppingBag className="w-5 h-5" />
                        </div>
                        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Available Products</h2>
                    </div>

                    {products.length === 0 ? (
                        <div className="glass text-center rounded-3xl p-12 mt-4 border border-gray-200">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                <AlertCircle className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">No Products Listed</h3>
                            <p className="text-gray-500 font-medium">Please contact the shop directly on WhatsApp for availability.</p>
                        </div>
                    ) : (
                        <motion.div
                            variants={staggerContainer} initial="hidden" animate="show"
                            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                        >
                            {products.map(p => {
                                const isSelected = !!selected[p._id];
                                return (
                                    <motion.div key={p._id} variants={fadeUp}
                                        className={`group relative bg-white rounded-2xl p-5 transition-all duration-300 ${isSelected ? 'ring-2 ring-green-500 shadow-lg shadow-green-500/10 scale-[1.02]' : 'border border-gray-100 shadow-sm hover:border-green-300 hover:shadow-md'
                                            }`}>

                                        <div className="flex flex-col h-full">
                                            <div className="mb-2">
                                                <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-green-700 transition-colors">{p.name}</h3>
                                                {p.imageUrl && (
                                                    <div className="w-full h-32 mt-3 mb-3 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex items-center justify-center">
                                                        <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                                    </div>
                                                )}
                                                {p.description && <p className="text-xs font-medium text-gray-500 mt-1.5 leading-relaxed line-clamp-2">{p.description}</p>}
                                            </div>

                                            <div className="mt-auto pt-4 flex items-end justify-between">
                                                <div className="text-green-700 font-extrabold text-2xl tracking-tight">
                                                    ₹{p.price}
                                                    {p.unit && <span className="text-gray-400 text-xs font-semibold ml-1 uppercase tracking-wider">{p.unit}</span>}
                                                </div>

                                                <div className="shrink-0">
                                                    {!isSelected ? (
                                                        <button
                                                            onClick={() => toggleItem(p)}
                                                            className="w-10 h-10 rounded-xl bg-gray-50 hover:bg-green-500 text-gray-400 hover:text-white flex items-center justify-center transition-all shadow-sm shrink-0 outline-none"
                                                        >
                                                            <Plus className="w-5 h-5" />
                                                        </button>
                                                    ) : (
                                                        <div className="flex items-center gap-1.5 bg-green-50 p-1 rounded-xl ring-1 ring-green-200">
                                                            <button
                                                                onClick={() => changeQty(p._id, -1)}
                                                                className="w-8 h-8 rounded-lg bg-white text-green-700 hover:bg-green-100 font-bold flex items-center justify-center transition-colors shadow-sm"
                                                            >
                                                                <Minus className="w-4 h-4" />
                                                            </button>
                                                            <span className="font-extrabold text-green-900 w-6 text-center text-sm">{selected[p._id].qty}</span>
                                                            <button
                                                                onClick={() => changeQty(p._id, 1)}
                                                                className="w-8 h-8 rounded-lg bg-green-600 text-white hover:bg-green-700 font-bold flex items-center justify-center transition-colors shadow-sm"
                                                            >
                                                                <Plus className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}
                </div>

                {/* Order Panel — sticky right col */}
                <div className="lg:sticky lg:top-[6rem] space-y-6">
                    <div className="glass rounded-3xl p-6 shadow-xl border border-white/60">
                        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                            <div className="bg-green-100 p-2 rounded-xl text-green-700">
                                <ShoppingCart className="w-5 h-5" />
                            </div>
                            <h3 className="font-extrabold text-gray-900 text-lg">Your Order</h3>
                            {selectedList.length > 0 && (
                                <span className="ml-auto bg-green-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full">
                                    {selectedList.reduce((acc, curr) => acc + curr.qty, 0)}
                                </span>
                            )}
                        </div>

                        {selectedList.length === 0 ? (
                            <div className="text-center py-6">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <ShoppingCart className="w-6 h-6 text-gray-300" />
                                </div>
                                <p className="text-sm font-medium text-gray-400 leading-relaxed px-4">
                                    Your cart is empty. Select products or message the shop to order.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4 mb-6">
                                <AnimatePresence>
                                    {selectedList.map(item => (
                                        <motion.div
                                            key={item._id}
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="flex justify-between items-start text-sm group"
                                        >
                                            <div className="flex-1 pr-4">
                                                <span className="font-semibold text-gray-800 line-clamp-1">{item.name}</span>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-gray-500 text-xs font-medium">₹{item.price}</span>
                                                    <span className="text-gray-300 text-xs">×</span>
                                                    <span className="text-green-600 font-bold text-xs">{item.qty}</span>
                                                </div>
                                            </div>
                                            <span className="font-extrabold text-gray-900">₹{item.price * item.qty}</span>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                <div className="border-t-2 border-dashed border-gray-200 pt-4 mt-2 flex justify-between items-end">
                                    <span className="font-bold text-gray-500 text-sm uppercase tracking-wider">Total Est.</span>
                                    <span className="text-3xl font-black text-green-700 tracking-tight">₹{total}</span>
                                </div>
                            </div>
                        )}

                        <button
                            className="group relative w-full flex items-center justify-center gap-3 bg-[#25d366] hover:bg-[#20bd5a] text-white font-extrabold py-4 rounded-xl text-base transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 overflow-hidden"
                            onClick={() => {
                                if (selectedList.length === 0) {
                                    toast.error('Please select at least one item');
                                    return;
                                }
                                setOrderModalOpen(true);
                            }}
                        >
                            <div className="absolute inset-0 -translate-x-full group-hover:animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                            <MessageCircle className="w-5 h-5" />
                            <span>Order via WhatsApp</span>
                        </button>
                        <p className="text-center text-[11px] font-bold text-gray-400 mt-3 uppercase tracking-wider">Tap to open WhatsApp</p>
                    </div>

                    <a href={`https://wa.me/91${waNumber}`} target="_blank" rel="noopener noreferrer" className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-center gap-3 shadow-sm group hover:border-green-200 transition-colors outline-none focus:ring-4 focus:ring-green-500/50 block w-full">
                        <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-600 group-hover:bg-green-500 group-hover:text-white transition-colors shrink-0">
                            <MessageCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Direct Contact</p>
                            <p className="text-sm font-extrabold text-gray-900">+91 {shop.whatsapp}</p>
                        </div>
                    </a>
                </div>
            </div>

            {/* Mobile fixed bottom bar */}
            <div className="lg:hidden h-24" /> {/* spacer for fixed bar */}
            <AnimatePresence>
                <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-xl border-t border-gray-200 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-50">
                    <button
                        className="w-full flex items-center justify-center gap-2 bg-[#25d366] text-white font-extrabold py-4 rounded-xl text-base shadow-lg active:scale-[0.98] transition-transform"
                        onClick={() => {
                            if (selectedList.length === 0) {
                                toast.error('Please select at least one item');
                                return;
                            }
                            setOrderModalOpen(true);
                        }}
                    >
                        <MessageCircle className="w-5 h-5" />
                        WhatsApp Order {total > 0 && `(₹${total})`}
                    </button>
                </div>
            </AnimatePresence>

            {/* User Details Modal */}
            <AnimatePresence>
                {orderModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                            className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-black text-gray-900">Delivery Details</h3>
                                    <p className="text-sm text-gray-500 font-medium">Please provide details to complete your order</p>
                                </div>
                                <button onClick={() => setOrderModalOpen(false)} className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleSendOrder} className="p-6 space-y-4 text-left">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Full Name *</label>
                                    <input required type="text" value={userData.name} onChange={e => setUserData({ ...userData, name: e.target.value })} placeholder="Enter your full name" className="w-full bg-gray-50 border border-gray-200 focus:border-green-500 rounded-xl px-4 py-3 text-sm font-semibold outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Phone Number *</label>
                                    <input required type="tel" value={userData.phone} onChange={e => setUserData({ ...userData, phone: e.target.value })} placeholder="Your mobile number" className="w-full bg-gray-50 border border-gray-200 focus:border-green-500 rounded-xl px-4 py-3 text-sm font-semibold outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Delivery Address</label>
                                    <textarea value={userData.address} onChange={e => setUserData({ ...userData, address: e.target.value })} placeholder="House name, street, details..." rows={2} className="w-full bg-gray-50 border border-gray-200 focus:border-green-500 rounded-xl px-4 py-3 text-sm font-semibold outline-none resize-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Preferred Delivery Date/Time</label>
                                    <input type="text" value={userData.date} onChange={e => setUserData({ ...userData, date: e.target.value })} placeholder="e.g. Today evening, Tomorrow 10am" className="w-full bg-gray-50 border border-gray-200 focus:border-green-500 rounded-xl px-4 py-3 text-sm font-semibold outline-none" />
                                </div>
                                <div className="mt-2 text-xs text-gray-500 font-medium text-center">
                                    You will be redirected to WhatsApp to send this order.
                                </div>
                                <button type="submit" className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-extrabold py-4 rounded-xl transition-all shadow-md active:scale-95">
                                    <MessageCircle className="w-5 h-5" /> Proceed to WhatsApp
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
