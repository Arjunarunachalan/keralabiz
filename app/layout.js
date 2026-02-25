'use client';
import { useState } from 'react';
import { Home, Store, UserPlus, LogIn, LayoutDashboard, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import { BRAND } from '@/lib/brand';
import './globals.css';

// We cannot export metadata from a 'use client' layout. 
// Standard Next.js practice is to have a server-side layout or put it in a separate SEO component/page.
// Since the layout is currently 'use client' due to the mobile nav, Next.js handles title automatically if we don't block it, 
// but we'll leave it as is to keep the client interactive nav working flawlessly.

export default function RootLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <html lang="ml">
      <body className="bg-[#fafafa] text-gray-900 font-sans antialiased min-h-screen flex flex-col pt-24">
        {/* Floating Glass Navbar */}
        <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl z-50 glass rounded-2xl shadow-sm border border-white/40 transition-all duration-300 hover:shadow-md bg-white/80 backdrop-blur-xl">
          <div className="px-6 h-16 flex items-center justify-between">
            {/* Brand */}
            <a href="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-green-600 to-green-400 flex items-center justify-center shadow-lg shadow-green-500/20 group-hover:scale-105 transition-transform shrink-0">
                <Store className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight text-green-950 leading-none">
                  {BRAND.name_ml}
                </span>
                <span className="text-[10px] font-bold text-gray-500 tracking-widest uppercase mt-0.5">
                  {BRAND.name_en}
                </span>
              </div>
            </a>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-8">
              <NavLink href="/" icon={Home} label="Home" />
              <NavLink href="/register" icon={UserPlus} label="Register Shop" />
              <NavLink href="/dashboard/shop" icon={LogIn} label="Shop Login" />
            </div>

            {/* Admin CTA */}
            <a
              href="/admin"
              className="hidden md:flex items-center gap-2 bg-green-950 hover:bg-green-900 text-gold-100 text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              <LayoutDashboard className="w-4 h-4" />
              Admin
            </a>

            {/* Mobile Menu Button  */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden text-green-950 p-2 rounded-lg hover:bg-green-50 transition-colors focus:outline-none"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </nav>

        {/* Mobile Navigation Menu Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Overlay Background */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] md:hidden"
              />
              {/* Menu Panel */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 bottom-0 w-64 bg-white z-[70] shadow-2xl flex flex-col md:hidden"
              >
                <div className="p-6 flex justify-end border-b border-gray-100">
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 bg-gray-50 rounded-full text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-col p-6 gap-6">
                  <MobileNavLink href="/" icon={Home} label="Home" onClick={() => setMobileMenuOpen(false)} />
                  <MobileNavLink href="/register" icon={UserPlus} label="Register Shop" onClick={() => setMobileMenuOpen(false)} />
                  <MobileNavLink href="/dashboard/shop" icon={LogIn} label="Shop Login" onClick={() => setMobileMenuOpen(false)} />

                  <div className="mt-8 pt-8 border-t border-gray-100">
                    <a
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 w-full bg-green-950 hover:bg-green-900 text-gold-100 text-base font-bold px-4 py-3 rounded-xl transition-colors shadow-md"
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      Admin Dashboard
                    </a>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 w-full relative z-10">
          {children}
        </main>

        {/* Modern Minimal Footer */}
        <footer className="mt-auto border-t border-gray-200 bg-white">
          <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-green-600 flex items-center justify-center">
                <Store className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-bold text-gray-900">{BRAND.name_ml}</span>
            </div>
            <p className="text-sm text-gray-500 font-medium">
              &copy; {new Date().getFullYear()} {BRAND.name_en}. All rights reserved.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}

function MobileNavLink({ href, icon: Icon, label, onClick }) {
  return (
    <a href={href} onClick={onClick} className="flex items-center gap-4 text-gray-700 hover:text-green-600 font-semibold text-lg transition-colors p-2 rounded-xl hover:bg-green-50">
      <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
        <Icon className="w-5 h-5 opacity-70" />
      </div>
      {label}
    </a>
  );
}

function NavLink({ href, icon: Icon, label }) {
  return (
    <a
      href={href}
      className="group flex items-center gap-2 text-gray-600 hover:text-green-600 font-medium text-sm transition-colors py-2 relative"
    >
      <Icon className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
      {label}
      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-500 transition-all duration-300 group-hover:w-full opacity-0 group-hover:opacity-100 rounded-full" />
    </a>
  );
}
