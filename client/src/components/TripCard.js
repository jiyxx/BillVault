import { Map, Calendar, PlayCircle, StopCircle, Receipt } from 'lucide-react';
import { format } from 'date-fns';

export default function TripCard({ trip, onStatusChange }) {
  const startDate = trip.startDate ? new Date(trip.startDate) : null;
  const endDate = trip.endDate ? new Date(trip.endDate) : null;
  
  return (
    <div className={`rounded-xl p-5 shadow-sm border transition-all ${
      trip.isActive 
        ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white border-primary-400 shadow-primary-500/20' 
        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-md'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className={`font-bold text-lg ${trip.isActive ? 'text-white' : 'text-slate-800 dark:text-slate-100'}`}>
            {trip.name}
          </h3>
          <div className={`flex items-center text-sm mt-1 ${trip.isActive ? 'text-primary-100' : 'text-slate-500 dark:text-slate-400'}`}>
            <Calendar className="w-3.5 h-3.5 mr-1.5" />
            <span>
              {startDate ? format(startDate, 'MMM d, yyyy') : 'Unknown Date'}
              {endDate && ` - ${format(endDate, 'MMM d, yyyy')}`}
            </span>
          </div>
        </div>
        
        {trip.isActive ? (
          <span className="bg-white/20 text-white border border-white/30 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5 animate-pulse"></span>
            Active Now
          </span>
        ) : (
          <div className="p-2 bg-slate-100 dark:bg-slate-700/50 rounded-lg text-slate-500 dark:text-slate-400">
            <Map className="w-5 h-5" />
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between mt-6">
        <div>
          <p className={`text-xs uppercase tracking-wider font-semibold mb-1 ${trip.isActive ? 'text-primary-200' : 'text-slate-400'}`}>
            Total Spent
          </p>
          <p className={`font-bold text-2xl ${trip.isActive ? 'text-white' : 'text-slate-800 dark:text-slate-100'}`}>
            <span className={`text-lg mr-1 ${trip.isActive ? 'text-primary-200' : 'text-slate-400 font-normal'}`}>$</span>
            {(trip.totalAmount || 0).toFixed(2)}
          </p>
        </div>
        
        <div className="text-right">
          <p className={`text-xs uppercase tracking-wider font-semibold mb-1 ${trip.isActive ? 'text-primary-200' : 'text-slate-400'}`}>
            Expenses
          </p>
          <div className={`flex items-center justify-end font-semibold text-lg ${trip.isActive ? 'text-white' : 'text-slate-700 dark:text-slate-300'}`}>
            <Receipt className="w-4 h-4 mr-1.5" />
            {trip.expenseCount || 0}
          </div>
        </div>
      </div>
      
      {onStatusChange && (
        <div className="mt-6 pt-4 border-t border-dashed border-black/10 dark:border-white/10">
          <button
            onClick={() => onStatusChange(trip.tripId, !trip.isActive)}
            className={`w-full py-2 rounded-lg font-medium flex items-center justify-center transition-colors ${
              trip.isActive
                ? 'bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm'
                : 'bg-primary-50 hover:bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:hover:bg-primary-900/50 dark:text-primary-400'
            }`}
          >
            {trip.isActive ? (
              <>
                <StopCircle className="w-4 h-4 mr-2" />
                End Trip
              </>
            ) : (
              <>
                <PlayCircle className="w-4 h-4 mr-2" />
                Activate Trip
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
