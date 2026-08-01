import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-[#1A212D] dark:bg-amber-600 text-amber-50 dark:text-stone-950 rounded-xl shadow-xl border border-amber-800/30 dark:border-amber-400/40 text-xs font-serif font-bold animate-in fade-in slide-in-from-bottom-3 duration-200">
      <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-stone-950" />
      <span>{message}</span>
    </div>
  );
};
