"use client";

import { useEffect, useState } from 'react';
import AppShell from '../../components/AppShell';
import ExpenseCard from '../../components/ExpenseCard';
import ExpenseForm from '../../components/ExpenseForm';
import api from '../../lib/api';
import { Filter, FileDown, Plus, Receipt } from 'lucide-react';
import { format } from 'date-fns';

export default function Expenses() {
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [filters, setFilters] = useState({ category: '', tripId: '' });
  const [isAdding, setIsAdding] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  
  const categories = ['food', 'transport', 'shopping', 'bills', 'entertainment', 'health', 'travel', 'other'];

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      let query = '/expenses?limit=50';
      if (filters.category) query += `&category=${filters.category}`;
      if (filters.tripId) query += `&tripId=${filters.tripId}`;
      
      const res = await api.get(query);
      if (res.data.status === 'success') {
        setExpenses(res.data.data.expenses);
      }
    } catch (error) {
      console.error('Failed to load expenses', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [filters]);

  const handleExport = async (format) => {
    try {
      const response = await api.get(`/export/${format}`, {
        responseType: 'blob', // Important for downloading files
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `billvault-export.${format === 'excel' ? 'xlsx' : 'pdf'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error(`Export failed: ${error}`);
      alert('Failed to export data.');
    }
  };

  const handleExpenseSaved = () => {
    setIsAdding(false);
    setEditingExpense(null);
    fetchExpenses(); // Refresh list
  };

  return (
    <AppShell>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">All Expenses</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage and filter your spending history.</p>
        </div>

        <div className="flex items-center gap-3">
            <div className="relative group">
                <button className="flex items-center space-x-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-slate-50 transition-colors">
                  <FileDown className="w-4 h-4" />
                  <span>Export</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    <button onClick={() => handleExport('pdf')} className="block w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-sm font-medium rounded-t-xl text-slate-700 dark:text-slate-200">Export as PDF</button>
                    <button onClick={() => handleExport('excel')} className="block w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-sm font-medium rounded-b-xl text-slate-700 dark:text-slate-200">Export as Excel</button>
                </div>
            </div>

          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Expense</span>
          </button>
        </div>
      </div>

      {isAdding || editingExpense ? (
        <div className="mb-8 max-w-2xl">
          <ExpenseForm 
            initialData={editingExpense} 
            onCancel={() => { setIsAdding(false); setEditingExpense(null); }}
            onSubmit={handleExpenseSaved}
          />
        </div>
      ) : (
        <>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Category</label>
                    <div className="relative">
                        <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <select 
                            value={filters.category}
                            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-primary-500 appearance-none"
                        >
                            <option value="">All Categories</option>
                            {categories.map(c => (
                                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
            {loading ? (
                 <div className="animate-pulse space-y-4">
                 {[1, 2, 3, 4, 5].map(i => (
                     <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                 ))}
             </div>
            ) : expenses.length === 0 ? (
                <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-200 rounded-2xl">
                    <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No expenses found</p>
                    <p className="text-sm mt-1">Try adjusting your filters or add a new expense.</p>
                </div>
            ) : (
                expenses.map(expense => (
                <ExpenseCard 
                    key={expense.expenseId || expense.id} 
                    expense={expense} 
                    onClick={(e) => setEditingExpense(e)}
                />
                ))
            )}
            </div>
        </>
      )}
    </AppShell>
  );
}
