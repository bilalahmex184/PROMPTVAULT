import React from 'react';
import { X, Command, HelpCircle } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const SHORTCUTS = [
    { key: '⌘ + K or /', label: 'Open Command Palette instant fuzzy search' },
    { key: 'N', label: 'Create a new prompt directly' },
    { key: 'E', label: 'Edit the selected/focused prompt' },
    { key: 'Esc', label: 'Close active modal or assistant side panel' },
    { key: 'Enter (in search)', label: 'Copy top search result directly to clipboard' },
    { key: '?', label: 'Open this keyboard shortcuts legend' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-[#FAF7F2] dark:bg-[#16181C] border border-[#E5DFD3] dark:border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5DFD3] dark:border-stone-800 bg-[#F5F0E6] dark:bg-[#1D2026] flex items-center justify-between">
          <h3 className="font-serif font-bold text-base text-[#1A212D] dark:text-stone-100 flex items-center gap-2">
            <Command className="w-4 h-4 text-amber-800 dark:text-amber-400" />
            Keyboard Shortcuts
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="p-6 space-y-3">
          {SHORTCUTS.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-[#FFFDF9] dark:bg-[#1D2026] border border-[#E5DFD3]/60 dark:border-stone-800"
            >
              <span className="text-xs text-stone-700 dark:text-stone-300 font-sans">
                {item.label}
              </span>
              <kbd className="px-2 py-0.5 text-xs font-mono font-bold bg-[#F2EDE4] dark:bg-[#121417] text-amber-950 dark:text-amber-300 border border-[#D5CCBC] dark:border-stone-700 rounded shadow-xs shrink-0">
                {item.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="px-6 py-3 border-t border-[#E5DFD3] dark:border-stone-800 bg-[#F5F0E6] dark:bg-[#1D2026] text-center">
          <p className="text-xs text-stone-500 font-serif italic">
            Speed-optimized for daily prompt lookup & power workflows
          </p>
        </div>

      </div>
    </div>
  );
};
