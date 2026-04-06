"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Receipt, 
  Map as MapIcon, 
  PieChart, 
  Settings,
  LogOut,
  Plus
} from 'lucide-react';
import ExpenseForm from './ExpenseForm';

export default function AppShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Basic auth check
    const token = localStorage.getItem('token');
    const userDataStr = localStorage.getItem('user');
    
    if (!token) {
      router.push('/login');
      return;
    }

    if (userDataStr) {
      try {
        setUser(JSON.parse(userDataStr));
      } catch (e) {
        console.error('Failed to parse user data');
      }
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Expenses', path: '/expenses', icon: <Receipt className="w-5 h-5" /> },
    { name: 'Trips', path: '/trips', icon: <MapIcon className="w-5 h-5" /> },
    { name: 'Analytics', path: '/analytics', icon: <PieChart className="w-5 h-5" /> },
  ];

  if (!user) return null; // Or a full-screen loader

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
      
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700">
        <div className="p-6 flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
            <span className="text-white font-black text-xl">BV</span>
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500 dark:from-white dark:to-slate-400">
            BillVault
          </span>
        </div>

        <div className="px-4 pb-6">
          <button 
            onClick={() => setShowAddExpense(true)}
            className="w-full flex items-center justify-center space-x-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3 rounded-xl font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span>New Expense</span>
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.path);
            return (
              <Link 
                key={link.path} 
                href={link.path}
                className={`flex items-center space-x-3 px-3 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-medium' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <Link 
            href="/settings"
            className={`flex items-center space-x-3 px-3 py-2 rounded-xl transition-all mb-1 ${
              pathname === '/settings'
                ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-medium' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </Link>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all font-medium"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 flex justify-between items-center z-20">
          <div className="flex items-center space-x-2 border">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm">BV</span>
            </div>
            <span className="font-bold">BillVault</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 -mr-2 text-slate-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </header>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-[73px] inset-x-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-xl z-30 px-4 py-6 flex flex-col space-y-2">
             {navLinks.map((link) => (
              <Link 
                key={link.path} 
                href={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-3 p-3 rounded-xl ${
                  pathname.startsWith(link.path) ? 'bg-primary-50 text-primary-600' : 'text-slate-600'
                }`}
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            ))}
            <div className="h-px bg-slate-200 my-2"></div>
            <button onClick={() => { setIsMobileMenuOpen(false); setShowAddExpense(true); }} className="flex items-center justify-center space-x-2 p-3 bg-slate-900 text-white rounded-xl">
              <Plus className="w-5 h-5"/> <span>New Expense</span>
            </button>
            <button onClick={handleLogout} className="flex items-center justify-center p-3 text-red-600 font-medium">Log out</button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto pb-24 md:pb-0">
            {children}
          </div>
        </div>

        {/* Floating Add Menu (Mobile Only) */}
        {!isMobileMenuOpen && (
          <div className="md:hidden absolute bottom-6 right-6 z-20">
            <button 
              onClick={() => setShowAddExpense(true)}
              className="w-14 h-14 bg-primary-600 rounded-full flex items-center justify-center shadow-lg shadow-primary-500/40 text-white hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        )}
      </main>

      {/* Global Add Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl">
            <ExpenseForm 
              onCancel={() => setShowAddExpense(false)}
              onSubmit={(newExpense) => {
                setShowAddExpense(false);
                // In a real app we'd dispatch this to a global state/context to trigger re-renders
                // or use SWR/React Query to invalidate caches.
                // For now, if we're on the dashboard we can optionally do a hard reload, but skipping for smoother UX.
                if (pathname === '/dashboard' || pathname === '/expenses') {
                    window.location.reload();
                } else {
                    router.push('/expenses');
                }
              }} 
            />
          </div>
        </div>
      )}
    </div>
  );
}
