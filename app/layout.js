import { Home, Store, UserPlus, LogIn, LayoutDashboard } from "lucide-react";
import './globals.css';

export const metadata = {
  title: 'KeraBiz - Kerala\'s Local Marketplace',
  description: 'Find amazing local shops in Kerala. Order directly via WhatsApp.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ml">
      <body className="bg-[#fafafa] text-gray-900 font-sans antialiased min-h-screen flex flex-col pt-24">
        {/* Floating Glass Navbar */}
        <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl z-50 glass rounded-2xl shadow-sm border border-white/40 transition-all duration-300 hover:shadow-md">
          <div className="px-6 h-16 flex items-center justify-between">
            {/* Brand */}
            <a href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-green-600 to-green-400 flex items-center justify-center shadow-lg shadow-green-500/20 group-hover:scale-105 transition-transform">
                <Store className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-green-950">
                Kera<span className="text-gold-500">Biz</span>
              </span>
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

            {/* Mobile Menu Button (Placeholder for simplicity, standard usage) */}
            <button className="md:hidden text-green-950 p-2 rounded-lg hover:bg-green-50 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
            </button>
          </div>
        </nav>

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
              <span className="text-sm font-bold text-gray-900">KeraBiz</span>
            </div>
            <p className="text-sm text-gray-500 font-medium">
              &copy; {new Date().getFullYear()} KeraBiz. All rights reserved.
            </p>
          </div>
        </footer>
      </body>
    </html>
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
