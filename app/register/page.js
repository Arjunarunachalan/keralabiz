'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, User, Phone, MapPin, Tag, FileText, Map, Truck, ShieldCheck, ArrowRight, CheckCircle2, Image as ImageIcon } from 'lucide-react';

const AREAS = [
    'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha',
    'Kottayam', 'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad',
    'Malappuram', 'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod',
];

const CATEGORIES = [
    'Grocery', 'Vegetables & Fruits', 'Meat & Fish', 'Bakery',
    'Pharmacy', 'Electronics', 'Clothing', 'Hardware',
    'Stationery', 'Restaurant', 'Other',
];

const PLANS = [
    {
        value: 'basic',
        label: 'Basic Partner',
        price: '₹499',
        period: '/month',
        features: ['Standard Listing', 'Up to 10 products', 'Direct WhatsApp Access'],
        badge: null,
    },
    {
        value: 'featured',
        label: 'Premium Partner',
        price: '₹999',
        period: '/month',
        features: ['Priority Search Placement', 'Featured Gold Badge ⭐', 'Up to 50 products'],
        badge: 'Recommended',
    },
];

const staggerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function RegisterPage() {
    const [form, setForm] = useState({
        name: '', ownerName: '', phone: '', whatsapp: '',
        area: '', category: '', description: '', address: '',
        deliveryInfo: '', deliveryAvailable: false, minDeliveryAmount: 0,
        subscriptionPlan: 'basic', password: '', confirmPassword: '',
    });
    const [imageFile, setImageFile] = useState(null);
    const [status, setStatus] = useState('');
    const [message, setMessage] = useState('');

    function handleChange(e) {
        if (e.target.type === 'checkbox') {
            setForm(f => ({ ...f, [e.target.name]: e.target.checked }));
        } else {
            setForm(f => ({ ...f, [e.target.name]: e.target.value }));
        }
    }

    function handleFileChange(e) {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (form.password !== form.confirmPassword) {
            setStatus('error'); setMessage('Passwords do not match'); return;
        }
        setStatus('loading'); setMessage('');
        try {
            let imageUrl = '';
            // Upload image if selected
            if (imageFile) {
                const formData = new FormData();
                formData.append('file', imageFile);
                const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
                const uploadData = await uploadRes.json();
                if (uploadRes.ok) {
                    imageUrl = uploadData.url;
                } else {
                    setStatus('error'); setMessage(uploadData.error || 'Image upload failed'); return;
                }
            }

            const submitData = { ...form, imageUrl };

            const res = await fetch('/api/shops/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submitData),
            });
            const data = await res.json();
            if (res.ok) { setStatus('success'); setMessage(data.message); }
            else { setStatus('error'); setMessage(data.error || 'Registration failed'); }
        } catch { setStatus('error'); setMessage('Network error. Please try again.'); }
    }

    if (status === 'success') {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-green-50" />
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-300/40 rounded-full blur-[100px] animate-blob" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-gold-300/30 rounded-full blur-[100px] animate-blob animation-delay-4000" />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative z-10 glass rounded-3xl shadow-2xl p-10 max-w-md w-full text-center border border-white/40"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                        className="w-24 h-24 bg-gradient-to-tr from-green-500 to-green-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/30 text-white"
                    >
                        <CheckCircle2 className="w-12 h-12" />
                    </motion.div>
                    <h2 className="text-3xl font-extrabold text-green-950 mb-3 tracking-tight">Application Received!</h2>
                    <p className="text-gray-600 font-medium mb-6 text-lg">{message}</p>
                    <div className="bg-green-50 border border-green-100 rounded-2xl p-4 mb-8">
                        <p className="text-sm text-green-800 font-medium">Our team will verify your details within 24-48 hours. You can login using your registered mobile number once approved.</p>
                    </div>
                    <a href="/" className="inline-flex items-center justify-center w-full gap-2 bg-green-950 hover:bg-green-900 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
                        Return Home <ArrowRight className="w-5 h-5" />
                    </a>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen py-12 px-4 overflow-hidden">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-200/40 rounded-full blur-[120px] mix-blend-multiply" />
                <div className="absolute bottom-[-100px] left-[-100px] w-[600px] h-[600px] bg-gold-200/30 rounded-full blur-[120px] mix-blend-multiply" />
            </div>

            <div className="max-w-4xl mx-auto relative z-10 pt-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-600 to-green-500 text-white shadow-xl shadow-green-500/20 mb-6">
                        <Store className="w-8 h-8" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">Partner with <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-400">KeraBiz</span></h1>
                    <p className="text-lg text-gray-600 font-medium max-w-2xl mx-auto">Join Kerala's fastest growing local marketplace. Reach thousands of customers directly on WhatsApp.</p>
                </motion.div>

                <AnimatePresence>
                    {status === 'error' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-red-50/80 backdrop-blur-md border border-red-200 text-red-800 rounded-2xl p-4 mb-8 flex items-center gap-3 font-semibold shadow-sm"
                        >
                            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center shrink-0">❌</div>
                            {message}
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.form
                    variants={staggerVariants}
                    initial="hidden"
                    animate="show"
                    onSubmit={handleSubmit}
                    className="space-y-8"
                >
                    {/* Section 1: Identity */}
                    <motion.div variants={itemVariants} className="glass rounded-3xl p-6 md:p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200/50">
                            <div className="p-2 bg-green-100 rounded-lg text-green-700">
                                <User className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">1. Basic Details</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Field icon={Store} label="Shop Name" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Muraleedharan Stores" required />
                            <Field icon={User} label="Owner Name" name="ownerName" value={form.ownerName} onChange={handleChange} placeholder="Your full name" required />
                            <Field icon={Phone} label="Mobile Number" name="phone" value={form.phone} onChange={handleChange} placeholder="10-digit login number" type="tel" required />
                            <div>
                                <Field icon={MessageCircle} label="WhatsApp Number" name="whatsapp" value={form.whatsapp} onChange={handleChange} placeholder="For customer orders" type="tel" required />
                                <p className="text-[11px] font-bold text-green-600 mt-1 ml-1 uppercase tracking-wider">Crucial for receiving orders</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Section 2: Location & Category */}
                    <motion.div variants={itemVariants} className="glass rounded-3xl p-6 md:p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200/50">
                            <div className="p-2 bg-green-100 rounded-lg text-green-700">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">2. Location & Business Type</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <SelectField icon={Map} label="District" name="area" value={form.area} onChange={handleChange} options={AREAS} required />
                            <SelectField icon={Tag} label="Category" name="category" value={form.category} onChange={handleChange} options={CATEGORIES} required />

                            {/* Shop Image Upload */}
                            <div className="md:col-span-2 relative group">
                                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2 ml-1">
                                    <ImageIcon className="w-4 h-4 text-gray-400 group-focus-within:text-green-500 transition-colors" /> Shop Image
                                </label>
                                <input
                                    type="file" name="image" accept="image/*" onChange={handleFileChange}
                                    className="w-full bg-white/50 border-2 border-transparent focus:border-green-400 rounded-2xl px-5 py-3 text-sm font-medium text-gray-900 outline-none transition-all"
                                />
                                {imageFile && <p className="text-sm text-green-600 mt-2 ml-1 font-medium text-ellipsis overflow-hidden">Selected: {imageFile.name}</p>}
                            </div>

                            <div className="md:col-span-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2 ml-1">
                                    <FileText className="w-4 h-4 text-gray-400" /> Shop Description
                                </label>
                                <textarea name="description" value={form.description} onChange={handleChange} rows={2}
                                    placeholder="Briefly describe what you sell..."
                                    className="w-full bg-white/50 border-2 border-transparent focus:border-green-400 focus:bg-white rounded-2xl px-5 py-3 text-sm font-medium text-gray-900 outline-none transition-all shadow-inner resize-none" />
                            </div>
                            <Field icon={MapPin} label="Exact Address" name="address" value={form.address} onChange={handleChange} placeholder="Street, landmark, PIN" />
                            <Field icon={Truck} label="Delivery Information" name="deliveryInfo" value={form.deliveryInfo} onChange={handleChange} placeholder="e.g. Free delivery within 5km" />

                            {/* New Delivery Configuration */}
                            <div className="md:col-span-2 p-4 border-2 border-gray-100 rounded-2xl bg-white/30">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" name="deliveryAvailable" checked={form.deliveryAvailable} onChange={handleChange} className="w-5 h-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500" />
                                    <span className="text-sm font-bold text-gray-900">We offer delivery services</span>
                                </label>
                                {form.deliveryAvailable && (
                                    <div className="mt-4 pl-8 border-l-2 border-green-200">
                                        <Field icon={Truck} label="Minimum Order Amount for Delivery (₹)" name="minDeliveryAmount" value={form.minDeliveryAmount} onChange={handleChange} type="number" placeholder="Enter amount (e.g. 500)" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Section 3: Plans */}
                    <motion.div variants={itemVariants} className="glass rounded-3xl p-6 md:p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200/50">
                            <div className="p-2 bg-gold-100 rounded-lg text-gold-700">
                                <Store className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">3. Select Partnership Plan</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {PLANS.map(plan => {
                                const isSelected = form.subscriptionPlan === plan.value;
                                return (
                                    <label key={plan.value} className="relative block cursor-pointer group">
                                        <input type="radio" name="subscriptionPlan" value={plan.value} checked={isSelected} onChange={handleChange} className="sr-only" />
                                        <div className={`
                                            relative h-full px-6 py-8 rounded-3xl border-2 transition-all duration-300
                                            ${isSelected
                                                ? plan.value === 'featured' ? 'bg-gold-50/50 border-gold-400 shadow-lg shadow-gold-500/20' : 'bg-green-50/50 border-green-500 shadow-lg shadow-green-500/20'
                                                : 'bg-white/50 border-transparent hover:border-gray-200 hover:bg-white shadow-sm'
                                            }
                                        `}>
                                            {plan.badge && (
                                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                                    <span className="bg-gradient-to-r from-gold-600 to-gold-400 text-white text-[10px] uppercase font-black tracking-widest px-4 py-1.5 rounded-full shadow-md">
                                                        {plan.badge}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="text-center mb-6">
                                                <h3 className={`text-lg font-bold mb-2 ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>{plan.label}</h3>
                                                <div className="flex items-baseline justify-center gap-1">
                                                    <span className={`text-4xl font-black tracking-tight ${isSelected ? (plan.value === 'featured' ? 'text-gold-600' : 'text-green-600') : 'text-gray-900'}`}>
                                                        {plan.price}
                                                    </span>
                                                    <span className="text-sm font-semibold text-gray-500">{plan.period}</span>
                                                </div>
                                            </div>
                                            <ul className="space-y-3">
                                                {plan.features.map(f => (
                                                    <li key={f} className="flex items-start gap-3 text-sm font-medium text-gray-600">
                                                        <CheckCircle2 className={`w-5 h-5 shrink-0 ${isSelected ? (plan.value === 'featured' ? 'text-gold-500' : 'text-green-500') : 'text-gray-300'}`} />
                                                        <span>{f}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                            {/* Selection indicator */}
                                            <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? (plan.value === 'featured' ? 'border-gold-500' : 'border-green-500') : 'border-gray-300'}`}>
                                                {isSelected && <div className={`w-3 h-3 rounded-full ${plan.value === 'featured' ? 'bg-gold-500' : 'bg-green-500'}`} />}
                                            </div>
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Section 4: Security */}
                    <motion.div variants={itemVariants} className="glass rounded-3xl p-6 md:p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200/50">
                            <div className="p-2 bg-gray-100 rounded-lg text-gray-700">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">4. Security</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Field icon={ShieldCheck} label="Account Password" name="password" value={form.password} onChange={handleChange} type="password" placeholder="Create a strong password" required />
                            <Field icon={ShieldCheck} label="Confirm Password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} type="password" placeholder="Repeat password" required />
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="pt-4 pb-12">
                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="group relative w-full flex items-center justify-center gap-3 bg-green-950 hover:bg-green-900 disabled:opacity-70 text-white font-extrabold py-5 rounded-2xl text-lg transition-all shadow-xl hover:shadow-2xl hover:shadow-green-900/20 active:scale-[0.98] overflow-hidden"
                        >
                            {/* Button shine effect */}
                            <div className="absolute inset-0 -translate-x-full group-hover:animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                            {status === 'loading' ? (
                                <><span className="spinner border-white/30 border-t-white" /> Processing Application...</>
                            ) : (
                                <>Submit Application <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" /></>
                            )}
                        </button>
                        <p className="text-center text-sm font-medium text-gray-500 mt-6">
                            Already a partner?{' '}
                            <a href="/dashboard/shop" className="text-green-700 font-bold hover:text-green-800 hover:underline transition-colors">Login to Dashboard</a>
                        </p>
                    </motion.div>
                </motion.form>
            </div>
        </div>
    );
}

// Custom Input Field with Icon 
function Field({ icon: Icon, label, name, value, onChange, type = 'text', placeholder = '', required = false }) {
    return (
        <div className="relative group">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2 ml-1">
                {Icon && <Icon className="w-4 h-4 text-gray-400 group-focus-within:text-green-500 transition-colors" />}
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                <input
                    type={type} name={name} value={value} onChange={onChange}
                    placeholder={placeholder} required={required}
                    className="w-full bg-white/50 border-2 border-transparent focus:border-green-400 focus:bg-white rounded-2xl px-5 py-3.5 text-sm font-medium text-gray-900 outline-none transition-all shadow-inner placeholder:text-gray-400"
                />
            </div>
        </div>
    );
}

// Custom Select Field with Icon
function SelectField({ icon: Icon, label, name, value, onChange, options, required = false }) {
    return (
        <div className="relative group">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2 ml-1">
                {Icon && <Icon className="w-4 h-4 text-gray-400 group-focus-within:text-green-500 transition-colors" />}
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                <select
                    name={name} value={value} onChange={onChange} required={required}
                    className="w-full bg-white/50 border-2 border-transparent focus:border-green-400 focus:bg-white rounded-2xl px-5 py-3.5 text-sm font-medium text-gray-900 outline-none transition-all shadow-inner appearance-none cursor-pointer"
                >
                    <option value="" disabled>Select {label}</option>
                    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                {/* Custom chevron */}
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-green-500 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
            </div>
        </div>
    );
}
// Placeholder for Lucide import
function MessageCircle(props) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg>
}
