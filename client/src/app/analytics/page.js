"use client";

import { useEffect, useState } from 'react';
import AppShell from '../../components/AppShell';
import api from '../../lib/api';
import { PieChart as PieChartIcon, BarChart3, TrendingUp, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [spendingData, setSpendingData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [timeRange, setTimeRange] = useState('30'); // days

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        
        // Calculate start date based on range
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(timeRange));
        
        // Fetch spending by category
        const spendRes = await api.get(`/analytics/spending?startDate=${startDate.toISOString()}`);
        if (spendRes.data.status === 'success') {
            setSpendingData(spendRes.data.data);
        }

        // Fetch monthly trends (last 6 months)
        const trendsRes = await api.get('/analytics/trends?months=6');
        if (trendsRes.data.status === 'success') {
            // Format month strings for better display
            const formattedTrends = trendsRes.data.data.map(item => {
                const [year, month] = item.month.split('-');
                const date = new Date(year, parseInt(month) - 1, 1);
                return {
                    ...item,
                    displayMonth: date.toLocaleString('default', { month: 'short' })
                };
            });
            setTrendData(formattedTrends);
        }
      } catch (error) {
        console.error('Failed to load analytics', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-slate-100 dark:border-slate-700">
          <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">{label || payload[0].name}</p>
          <p className="text-primary-600 dark:text-primary-400 font-medium">
            ${payload[0].value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <AppShell>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center">
            <PieChartIcon className="w-6 h-6 mr-2 text-primary-500" />
            Analytics
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Discover insights about your spending habits.</p>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 rounded-lg inline-flex shadow-sm">
          {[
            { label: '7 Days', val: '7' },
            { label: '30 Days', val: '30' },
            { label: '90 Days', val: '90' },
          ].map(opt => (
            <button
              key={opt.val}
              onClick={() => setTimeRange(opt.val)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                timeRange === opt.val 
                  ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-24">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Spending Breakdown */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col h-[400px]">
                <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-6 flex items-center">
                    <PieChartIcon className="w-5 h-5 mr-2 text-primary-500" />
                    Spending by Category
                </h3>
                
                {spendingData.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-slate-500">
                        No spending data for this period
                    </div>
                ) : (
                    <div className="flex-1 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={spendingData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={110}
                                    paddingAngle={3}
                                    dataKey="amount"
                                    nameKey="category"
                                    stroke="none"
                                >
                                    {spendingData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend 
                                    layout="vertical" 
                                    verticalAlign="middle" 
                                    align="right"
                                    formatter={(value) => <span className="text-slate-700 dark:text-slate-300 capitalize">{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        
                        {/* Center Total */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-2 pr-[20%] lg:pr-[30%]">
                            <span className="text-sm font-medium text-slate-500">Total</span>
                            <span className="text-xl font-bold text-slate-800 dark:text-white">
                                ${spendingData.reduce((acc, curr) => acc + curr.amount, 0).toFixed(0)}
                            </span>
                        </div>
                    </div>
                )}
            </div>

             {/* Monthly Trends */}
             <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col h-[400px]">
                <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-6 flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-primary-500" />
                    6-Month Trend
                </h3>
                
                {trendData.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-slate-500">
                        No trend data available
                    </div>
                ) : (
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                                <XAxis 
                                    dataKey="displayMonth" 
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis 
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                    tickFormatter={(val) => `$${val}`}
                                />
                                <Tooltip 
                                    cursor={{ fill: '#f1f5f9', opacity: 0.5 }}
                                    content={<CustomTooltip />} 
                                />
                                <Bar 
                                    dataKey="total" 
                                    fill="#3b82f6" 
                                    radius={[4, 4, 0, 0]} 
                                    maxBarSize={50}
                                >
                                    {trendData.map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={index === trendData.length - 1 ? '#3b82f6' : '#94a3b8'} 
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
            
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Category List view matching the pie chart to show precise numbers */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <h3 className="font-bold text-lg mb-4 text-slate-800 dark:text-white">Top Spending Areas</h3>
                    <div className="space-y-4">
                        {spendingData.slice(0, 5).map((cat, index) => (
                            <div key={cat.category} className="flex items-center">
                                <span className={`w-3 h-3 rounded-full mr-3`} style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                <span className="flex-1 capitalize font-medium text-slate-700 dark:text-slate-300">{cat.category}</span>
                                <span className="font-semibold text-slate-900 dark:text-white">${cat.amount.toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

          </div>
      )}
    </AppShell>
  );
}
