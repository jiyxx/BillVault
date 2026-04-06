import { useState } from 'react';
import { Camera, FileUp, X, Loader2 } from 'lucide-react';
import api from '../lib/api';

export default function ExpenseForm({ onSubmit, initialData = null, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: initialData?.amount || '',
    merchant: initialData?.merchant || '',
    date: initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    category: initialData?.category || '',
    description: initialData?.description || ''
  });
  
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    const data = new FormData();
    data.append('image', file);

    try {
      const res = await api.post('/upload/image', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      if (res.data.status === 'success') {
        // Auto-fill form from OCR processing
        const extracted = res.data.data.extractedData;
        
        setFormData(prev => ({
          ...prev,
          amount: extracted.amount || prev.amount,
          merchant: extracted.merchant || prev.merchant,
          date: extracted.date ? new Date(extracted.date).toISOString().split('T')[0] : prev.date
        }));
      }
    } catch (error) {
      console.error('OCR Upload Error:', error);
      alert('Failed to process image receipt.');
    } finally {
      setUploadingImage(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (initialData?.expenseId) {
        // Update
        const res = await api.put(`/expenses/${initialData.expenseId}`, formData);
        if (onSubmit) onSubmit(res.data.data);
      } else {
        // Create
        const payload = {
          ...formData,
          amount: parseFloat(formData.amount),
          source: 'manual'
        };
        const res = await api.post('/expenses', payload);
        if (onSubmit) onSubmit(res.data.data);
      }
    } catch (error) {
      console.error('Error saving expense:', error);
      alert('Failed to save expense.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">{initialData ? 'Edit Expense' : 'Add Expense'}</h2>
        {onCancel && (
          <button type="button" onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {!initialData && (
        <div className="mb-6 p-4 border-2 border-dashed border-primary-200 dark:border-primary-800 rounded-xl bg-primary-50/50 dark:bg-primary-900/10 text-center relative overflow-hidden">
          {uploadingImage ? (
            <div className="flex flex-col items-center justify-center py-4">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-2" />
              <p className="text-sm font-medium text-primary-700 dark:text-primary-300">Processing receipt... {uploadProgress}%</p>
            </div>
          ) : (
            <>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                capture="environment"
              />
              <div className="flex flex-col items-center justify-center py-2 pointer-events-none">
                <Camera className="w-8 h-8 text-primary-500 mb-2" />
                <p className="text-sm font-medium text-primary-700 dark:text-primary-300">Scan Receipt</p>
                <p className="text-xs text-slate-500 mt-1">We'll extract the details for you</p>
              </div>
            </>
          )}
        </div>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
              <input 
                type="number" 
                name="amount" 
                step="0.01" 
                min="0"
                required
                value={formData.amount} 
                onChange={handleChange}
                className="w-full pl-7 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                placeholder="0.00"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
            <input 
              type="date" 
              name="date" 
              value={formData.date} 
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Merchant</label>
          <input 
            type="text" 
            name="merchant" 
            value={formData.merchant} 
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
            placeholder="E.g., Starbucks"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category (Optional)</label>
          <select 
            name="category" 
            value={formData.category} 
            onChange={handleChange}
            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
          >
            <option value="">Auto-categorize</option>
            <option value="food">Food & Dining</option>
            <option value="transport">Transportation</option>
            <option value="shopping">Shopping</option>
            <option value="bills">Bills & Utilities</option>
            <option value="entertainment">Entertainment</option>
            <option value="health">Health & Fitness</option>
            <option value="travel">Travel</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
           <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description (Optional)</label>
           <textarea 
             name="description" 
             value={formData.description} 
             onChange={handleChange}
             rows="2"
             className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none"
             placeholder="Add notes..."
           />
        </div>
      </div>

      <div className="mt-6">
        <button 
          type="submit" 
          disabled={loading || uploadingImage}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center disabled:opacity-70"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Expense'}
        </button>
      </div>
    </form>
  );
}
