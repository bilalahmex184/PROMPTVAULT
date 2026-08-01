import React from 'react';
import { motion } from 'motion/react';
import {
  Search,
  Plus,
  Sparkles,
  Settings,
  HelpCircle,
  Sun,
  Moon,
  LayoutGrid,
  List,
  Terminal,
} from 'lucide-react';
import { ViewMode, SortOption } from '../types';

interface NavbarProps {
  onOpenCommandPalette: () => void;
  onNewPrompt: () => void;
  isAssistantOpen: boolean;
  onToggleAssistant: () => void;
  onOpenSettings: () => void;
  onOpenShortcuts: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  viewMode: ViewMode;
  onToggleViewMode: (mode: ViewMode) => void;
  sortBy: SortOption;
  onChangeSortBy: (sort: SortOption) => void;
  totalPromptsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCommandPalette,
  onNewPrompt,
  isAssistantOpen,
  onToggleAssistant,
  onOpenSettings,
  onOpenShortcuts,
  theme,
  onToggleTheme,
  viewMode,
  onToggleViewMode,
  sortBy,
  onChangeSortBy,
  totalPromptsCount,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#0B0F17]/80 backdrop-blur-xl transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 font-heading text-lg font-bold">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-heading text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                PromptVault
              </h1>
            </div>
          </div>

          {/* Quick Search Cmd+K Trigger */}
          <div className="flex-1 max-w-md mx-2">
            <button
              id="cmd-k-trigger-button"
              onClick={onOpenCommandPalette}
              className="w-full flex items-center justify-between px-3.5 py-1.5 text-xs bg-slate-100/90 dark:bg-slate-900/90 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-indigo-400/60 dark:hover:border-indigo-500/60 transition-all group"
            >
              <span className="flex items-center gap-2 text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300">
                <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                <span className="truncate">Search library or jump to prompt...</span>
              </span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono px-2 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-500 dark:text-slate-400 shadow-xs">
                <span>⌘</span>K
              </kbd>
            </button>
          </div>

          {/* Controls & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* View Mode Toggle (Grid / List) */}
            <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200/80 dark:border-slate-800">
              <button
                id="view-mode-grid-btn"
                onClick={() => onToggleViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                id="view-mode-list-btn"
                onClick={() => onToggleViewMode('list')}
                className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Sort Selector */}
            <select
              id="sort-by-select"
              value={sortBy}
              onChange={(e) => onChangeSortBy(e.target.value as SortOption)}
              className="hidden lg:block text-xs font-medium bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="recent">Sort: Recent</option>
              <option value="most_used">Sort: Most Used</option>
              <option value="favorites">Sort: Favorites First</option>
              <option value="alphabetical">Sort: A-Z Title</option>
            </select>

            {/* Assistant Panel Toggle Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              id="toggle-assistant-btn"
              onClick={onToggleAssistant}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                isAssistantOpen
                  ? 'bg-indigo-600 text-white border-indigo-500 dark:bg-indigo-500 dark:text-white shadow-md shadow-indigo-500/20'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-indigo-400/50 dark:hover:border-indigo-500/50'
              }`}
              title="Toggle AI Assistant Side Panel"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isAssistantOpen ? 'animate-pulse' : 'text-indigo-600 dark:text-indigo-400'}`} />
              <span className="hidden sm:inline">Assistant</span>
            </motion.button>

            {/* New Prompt Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              id="new-prompt-btn"
              onClick={onNewPrompt}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 text-white shadow-md shadow-indigo-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Prompt</span>
              <kbd className="hidden sm:inline-block ml-1 text-[10px] font-mono px-1.5 py-0.2 bg-white/20 text-white rounded-md">
                N
              </kbd>
            </motion.button>

            {/* Theme Toggle Button */}
            <button
              id="toggle-theme-btn"
              onClick={onToggleTheme}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>

            {/* Shortcuts Help Button */}
            <button
              id="shortcuts-help-btn"
              onClick={onOpenShortcuts}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hidden sm:block"
              title="Keyboard Shortcuts (?)"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Settings Modal Button */}
            <button
              id="settings-modal-btn"
              onClick={onOpenSettings}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Settings & Role Management"
            >
              <Settings className="w-4 h-4" />
            </button>

          </div>
        </div>
      </div>
    </header>
  );
};
