'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Search, Store, Star, ChevronRight, MessageCircle } from 'lucide-react';

const AREAS = [
  'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha',
  'Kottayam', 'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad',
  'Malappuram', 'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod',
];

const CATEGORIES = [
  'എല്ലാം', 'Grocery', 'Vegetables & Fruits', 'Meat & Fish',
  'Bakery', 'Pharmacy', 'Electronics', 'Clothing',
  'Hardware', 'Stationery', 'Restaurant', 'Other',
];

// Motion Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function HomePage() {
  const [shops, setShops] = useState([]);
  const [area, setArea] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function fetchShops() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (area) params.set('area', area);
      if (category && category !== 'എല്ലാം') params.set('category', category);
      const res = await fetch(`/api/shops?${params}`);
      const data = await res.json();
      setShops(data.shops || []);
      setSearched(true);
    } catch {
      setShops([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchShops(); }, [area, category]); // eslint-disable-line

  return (
    <div className="relative overflow-hidden min-h-screen pb-20">
      {/* Dynamic Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-300/30 rounded-full blur-[100px] animate-blob mix-blend-multiply pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-gold-300/20 rounded-full blur-[100px] animate-blob animation-delay-2000 mix-blend-multiply pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] bg-green-400/20 rounded-full blur-[120px] animate-blob animation-delay-4000 mix-blend-multiply pointer-events-none" />

      {/* Hero */}
      <section className="relative pt-24 pb-16 px-4 z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-green-500/20 text-green-800 text-sm font-semibold mx-auto"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            Kerala's Premier Local Network
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight text-green-950"
          >
            Find Local <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-400 pb-2 inline-block">Shops</span><br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-600 to-gold-400">Order via WhatsApp</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto font-medium"
          >
            Discover the best stores near you. Connect directly, order instantly, support local commerce.
          </motion.p>

          {/* Search/Area Selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="max-w-xl mx-auto"
          >
            <div className="glass p-2 rounded-2xl shadow-xl shadow-green-900/5 flex items-center gap-2 group focus-within:ring-2 focus-within:ring-green-400 transition-all border border-green-900/10">
              <div className="pl-4 text-green-600">
                <MapPin className="w-6 h-6" />
              </div>
              <select
                className="flex-1 bg-transparent text-gray-900 font-semibold px-2 py-4 focus:outline-none appearance-none cursor-pointer"
                value={area}
                onChange={e => setArea(e.target.value)}
              >
                <option value="">എല്ലാ ജില്ലകളും (Select District)</option>
                {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-green-500/30 group-hover:bg-green-600 transition-colors cursor-pointer mr-1">
                <Search className="w-5 h-5" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="sticky top-[5rem] z-40 bg-white/80 backdrop-blur-xl border-y border-gray-200 shadow-sm py-4 mt-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 snap-x">
            {CATEGORIES.map(cat => {
              const val = cat === 'എല്ലാം' ? '' : cat;
              const isActive = category === val;
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(val)}
                  className={`relative snap-start shrink-0 px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${isActive
                    ? 'text-white shadow-lg shadow-green-500/25'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-green-300 hover:bg-green-50/50'
                    }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeCategory"
                      className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-500 rounded-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 tracking-wide">{cat}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <main className="max-w-6xl mx-auto px-4 py-12 z-10 relative">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32 gap-6"
            >
              <div className="relative flex justify-center items-center w-24 h-24">
                <div className="absolute inset-0 border-4 border-green-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-green-500 rounded-full border-t-transparent animate-spin"></div>
                <Store className="w-6 h-6 text-green-600 animate-pulse" />
              </div>
              <p className="text-gray-500 font-medium text-lg tracking-wide">Searching Shops...</p>
            </motion.div>
          ) : shops.length === 0 && searched ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-32 max-w-md mx-auto"
            >
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Shops Found</h3>
              <p className="text-gray-500 font-medium mb-8">We couldn't find any shops matching your criteria in this area.</p>
              <a href="/register" className="inline-flex items-center justify-center bg-gray-900 hover:bg-gray-800 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg w-full">
                Register Your Shop Here
              </a>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-12"
            >
              {shops.some(s => s.isFeatured) && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-gold-100 p-2 rounded-lg text-gold-600">
                      <Star className="w-5 h-5 fill-current" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Featured Selections</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {shops.filter(s => s.isFeatured).map(shop => (
                      <motion.div key={shop._id} variants={itemVariants}>
                        <ShopCard shop={shop} />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {shops.some(s => !s.isFeatured) && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-green-100 p-2 rounded-lg text-green-600">
                      <Store className="w-5 h-5" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Available Shops</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {shops.filter(s => !s.isFeatured).map(shop => (
                      <motion.div key={shop._id} variants={itemVariants}>
                        <ShopCard shop={shop} />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function ShopCard({ shop }) {
  return (
    <a href={`/shop/${shop.slug}`} className="block h-full outline-none focus:ring-4 focus:ring-green-500/50 rounded-2xl">
      <div className={`
        group relative h-full flex flex-col bg-white rounded-2xl p-6 transition-all duration-300
        hover:-translate-y-2 hover:shadow-2xl hover:shadow-green-900/10 border border-gray-100
        ${shop.isFeatured ? 'ring-2 ring-gold-400 ring-offset-2' : ''}
      `}>
        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-400/0 via-green-400/0 to-green-400/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 border border-green-500/0 group-hover:border-green-500/20" />

        <div className="relative z-10 flex flex-col h-full">
          {/* Shop Image Header */}
          <div className="mb-4 h-32 rounded-xl overflow-hidden bg-gradient-to-tr from-green-50 to-green-100/50 flex items-center justify-center border border-green-100 shrink-0">
            {shop.imageUrl ? (
              <img src={shop.imageUrl} alt={shop.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <Store className="w-12 h-12 text-green-200" />
            )}
          </div>

          <div className="flex justify-between items-start gap-4 mb-4">
            <h3 className="font-extrabold text-gray-900 text-xl leading-snug group-hover:text-green-700 transition-colors line-clamp-2">
              {shop.name}
            </h3>
            {shop.isFeatured && (
              <span className="shrink-0 bg-gradient-to-r from-gold-500 to-gold-400 text-white text-[10px] uppercase font-black tracking-widest px-3 py-1.5 rounded-full shadow-md shadow-gold-500/30">
                Premium
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-4 text-xs font-semibold">
            <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg">
              <MapPin className="w-3 h-3 text-gray-400" />
              {shop.area}
            </span>
            <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-100 px-3 py-1.5 rounded-lg">
              {shop.category}
            </span>
          </div>

          {shop.description && (
            <p className="text-gray-500 font-medium text-sm leading-relaxed line-clamp-2 mb-6">
              {shop.description}
            </p>
          )}

          <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between group-hover:border-green-100 transition-colors">
            <div className="flex items-center gap-2 text-green-600 font-bold text-sm">
              <MessageCircle className="w-4 h-4 fill-current opacity-20 group-hover:opacity-100 transition-opacity" />
              Order on WhatsApp
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-50 group-hover:bg-green-500 flex items-center justify-center transition-colors">
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
            </div>
          </div>
        </div>
      </div>
    </a>
  );
}
