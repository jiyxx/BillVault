"use client";

import { useEffect, useState } from 'react';
import AppShell from '../../components/AppShell';
import ExpenseCard from '../../components/ExpenseCard';
import TripCard from '../../components/TripCard';
import api from '../../lib/api';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Activity, Receipt, CreditCard } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [activeTrip, setActiveTrip] = useState(null);
  const [trends, setTrends] = useState([]);
  const [totalSpent, setTotalSpent] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch recent expenses
        const expensesRes = await api.get('/expenses?limit=5');
        if (expensesRes.data.status === 'success') {
          setRecentExpenses(expensesRes.data.data.expenses);
        }

        // Fetch active trip
        const tripRes = await api.get('/trips/active');
        if (tripRes.data.status === 'success' && tripRes.data.data) {
          setActiveTrip(tripRes.data.data);
        }

        // Fetch basic trends (last 30 days)
        const dateStr = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString();
        const trendsRes = await api.get(`/analytics/spending?startDate=${dateStr}`);
        if (trendsRes.data.status === 'success') {
            const data = trendsRes.data.data;
            const total = data.reduce((acc, curr) => acc + curr.amount, 0);
            setTotalSpent(total);
        }

        // Mock chart Data since we don't have daily aggregation endpoint yet
        const mockChartData = [
          { name: 'Mon', amount: 40 },
          { name: 'Tue', amount: 30 },
          { name: 'Wed', amount: 120 },
          { name: 'Thu', amount: 50 },
          { name: 'Fri', amount: 80 },
          { name: 'Sat', amount: 200 },
          { name: 'Sun', amount: 45 },
        ];
        setTrends(mockChartData);

      } catch (error) {
        console.error('Failed to load dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <AppShell>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400">Here's a summary of your recent spending.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Spent Stat Card */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 col-span-1 md:col-span-2 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-64 h-64 bg-primary-50 dark:bg-primary-900/20 rounded-full -translate-y-1/2 translate-x-1/4 group-hover:scale-110 transition-transform duration-700"></div>
          
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center">
                <Activity className="w-4 h-4 mr-2" /> 
                Last 30 Days
              </p>
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
                  <span className="text-2xl md:text-3xl text-slate-400 font-normal mr-1">$</span>
                  {loading ? '---' : totalSpent.toFixed(2)}
                </span>
              </div>
              
              <div className="mt-6 inline-flex items-center px-3 py-1 rounded-full bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-sm font-medium">
                <ArrowDownRight className="w-4 h-4 mr-1" />
                <span>12% less than last month</span>
              </div>
            </div>

            <div className="hidden sm:block w-1/2 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorAmount)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex-1 flex items-center">
            <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center mr-4">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Scans</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">124</p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex-1 flex items-center">
             <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mr-4">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Top Category</p>
              <p className="text-xl font-bold text-slate-800 dark:text-white">Food & Dining</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent Expenses List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Recent Expenses</h2>
            {recentExpenses.length > 0 && (
              <a href="/expenses" className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400">View All</a>
            )}
          </div>
          
          <div className="space-y-3">
            {loading ? (
              <div className="animate-pulse space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                ))}
            </div>
            ) : recentExpenses.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 p-8 rounded-xl border border-slate-100 dark:border-slate-700 text-center text-slate-500">
                <Receipt className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p>No expenses found</p>
              </div>
            ) : (
              recentExpenses.map(expense => (
                <ExpenseCard key={expense.expenseId || expense.id} expense={expense} />
              ))
            )}
          </div>
        </div>

        {/* Active Trip Context */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Active Trip</h2>
            <a href="/trips" className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400">Manage Trips</a>
          </div>

          {loading ? (
             <div className="animate-pulse h-48 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
          ) : activeTrip ? (
             <TripCard trip={activeTrip} />
          ) : (
            <div className="bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-800/80 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 border-dashed text-center">
              <div className="w-16 h-16 bg-white dark:bg-slate-700 rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 transform -rotate-3">
                <span className="text-2xl">🌍</span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">No Active Trip</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 max-w-[250px] mx-auto">
                Any expenses captured by SMS, WhatsApp, or receipts will be unassigned.
              </p>
              <a 
                href="/trips" 
                className="inline-block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-6 py-2.5 rounded-lg font-medium shadow-sm hover:shadow transition-all"
              >
                Create a Trip
              </a>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
