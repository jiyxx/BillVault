import { format } from 'date-fns';
import { 
  ShoppingBag, 
  Utensils, 
  Car, 
  Film, 
  HeartPulse, 
  Plane, 
  Home, 
  MoreHorizontal
} from 'lucide-react';

const categoryIcons = {
  food: <Utensils className="w-5 h-5" />,
  transport: <Car className="w-5 h-5" />,
  shopping: <ShoppingBag className="w-5 h-5" />,
  bills: <Home className="w-5 h-5" />,
  entertainment: <Film className="w-5 h-5" />,
  health: <HeartPulse className="w-5 h-5" />,
  travel: <Plane className="w-5 h-5" />,
  default: <MoreHorizontal className="w-5 h-5" />
};

export default function ExpenseCard({ expense, onClick }) {
  const icon = categoryIcons[expense.category?.toLowerCase()] || categoryIcons.default;
  const dateObj = expense.date ? new Date(expense.date) : new Date();
  
  return (
    <div 
      onClick={() => onClick && onClick(expense)}
      className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow group"
    >
      <div className="flex items-center space-x-4">
        <div className="bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 p-3 rounded-full group-hover:bg-primary-100 dark:group-hover:bg-primary-900/50 transition-colors">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 truncate max-w-[150px] sm:max-w-[200px]">
            {expense.merchant || 'Unknown Merchant'}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {format(dateObj, 'MMM d, yyyy')} • {expense.category || 'Uncategorized'}
          </p>
        </div>
      </div>
      
      <div className="text-right">
        <span className="font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center justify-end">
          <span className="text-sm font-normal text-slate-500 mr-1 mt-1">{expense.currency || '$'}</span>
          {(expense.amount || 0).toFixed(2)}
        </span>
        {expense.source === 'ocr' || expense.source === 'whatsapp' || expense.source === 'sms' ? (
          <span className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full inline-block mt-1">
            Auto
          </span>
        ) : null}
      </div>
    </div>
  );
}
