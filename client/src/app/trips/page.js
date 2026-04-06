"use client";

import { useEffect, useState } from 'react';
import AppShell from '../../components/AppShell';
import TripCard from '../../components/TripCard';
import api from '../../lib/api';
import { Plus, X, MapPin, Loader2 } from 'lucide-react';

export default function Trips() {
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTripData, setNewTripData] = useState({
    name: '',
    startDate: new Date().toISOString().split('T')[0],
  });

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const res = await api.get('/trips');
      if (res.data.status === 'success') {
        const sortedTrips = res.data.data.sort((a, b) => {
          // Active first, then by date desc
          if (a.isActive && !b.isActive) return -1;
          if (!a.isActive && b.isActive) return 1;
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        setTrips(sortedTrips);
      }
    } catch (error) {
      console.error('Failed to load trips', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleStatusChange = async (tripId, activate) => {
    try {
      const endpoint = activate ? `/trips/${tripId}/activate` : `/trips/${tripId}/deactivate`;
      await api.put(endpoint);
      fetchTrips(); // Refresh to update active statuses
    } catch (error) {
      console.error('Failed to change trip status', error);
      alert('Failed to update trip status.');
    }
  };

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    if (!newTripData.name) return;
    
    setCreating(true);
    try {
      await api.post('/trips', newTripData);
      setIsAdding(false);
      setNewTripData({ name: '', startDate: new Date().toISOString().split('T')[0] });
      fetchTrips();
    } catch (error) {
      console.error('Failed to create trip', error);
      alert('Failed to create trip.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <AppShell>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Trips</h1>
          <p className="text-slate-500 dark:text-slate-400">Bundle expenses by travel or occasion.</p>
        </div>

        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg font-medium shadow-sm transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>New Trip Mode</span>
        </button>
      </div>

      {isAdding && (
        <div className="mb-8 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-primary-500" />
              Start New Trip
            </h2>
            <button 
                type="button" 
                onClick={() => setIsAdding(false)} 
                className="text-slate-400 hover:text-slate-600 transition-colors"
            >
                <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleCreateTrip} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Destination or Event Name</label>
              <input 
                type="text" 
                required
                value={newTripData.name}
                onChange={(e) => setNewTripData({...newTripData, name: e.target.value})}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all font-medium"
                placeholder="e.g. Kyoto 2026, React Conf..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
              <input 
                type="date" 
                required
                value={newTripData.startDate}
                onChange={(e) => setNewTripData({...newTripData, startDate: e.target.value})}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-primary-500"
              />
            </div>
            
            <div className="pt-2">
              <button 
                type="submit" 
                disabled={creating}
                className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2.5 rounded-lg font-medium shadow transition-colors flex items-center justify-center min-w-[120px]"
              >
                {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
             [1, 2, 3].map(i => (
                 <div key={i} className="animate-pulse h-56 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl"></div>
             ))
        ) : trips.length === 0 ? (
            <div className="col-span-full text-center py-16 text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-xl font-medium text-slate-700 dark:text-slate-300">No trips yet</p>
                <p className="text-sm mt-2 max-w-sm mx-auto">Activate Trip Mode when traveling so all auto-captured bills are bundled together automatically.</p>
            </div>
        ) : (
            trips.map(trip => (
                <TripCard 
                    key={trip.tripId} 
                    trip={trip} 
                    onStatusChange={handleStatusChange} 
                />
            ))
        )}
      </div>
    </AppShell>
  );
}
