import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Copy,
  Check,
  Plus,
  CornerDownLeft,
  ArrowUp,
  ArrowDown,
  X,
  Sparkles,
  Tag as TagIcon,
} from 'lucide-react';
import { PromptItem, RoleItem } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  prompts: PromptItem[];
  roles: RoleItem[];
  onCopyAndClose: (prompt: PromptItem) => void;
  onCreateNewWithTitle: (title: string) => void;
  onOpenPromptDetail: (prompt: PromptItem) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  prompts,
  roles,
  onCopyAndClose,
  onCreateNewWithTitle,
  onOpenPromptDetail,
}) => {
  if (!isOpen) return null;

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const roleMap = new Map<string, RoleItem>(roles.map((r) => [r.id, r]));

  // Focus input automatically
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Filter prompts based on fuzzy query match (title, body, tags, role name)
  const filteredPrompts = prompts.filter((p) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    const rName = roleMap.get(p.role_id)?.name?.toLowerCase() || '';
    const tagMatch = p.tags ? p.tags.some((t) => t.toLowerCase().includes(q)) : false;
    return (
      p.title.toLowerCase().includes(q) ||
      p.body.toLowerCase().includes(q) ||
      rName.includes(q) ||
      tagMatch
    );
  });

  // Reset index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (filteredPrompts.length > 0) {
        setSelectedIndex((prev) => (prev + 1) % filteredPrompts.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (filteredPrompts.length > 0) {
        setSelectedIndex((prev) => (prev - 1 + filteredPrompts.length) % filteredPrompts.length);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredPrompts.length > 0 && selectedIndex < filteredPrompts.length) {
        const item = filteredPrompts[selectedIndex];
        setCopiedId(item.id);
        onCopyAndClose(item);
      } else if (query.trim()) {
        onCreateNewWithTitle(query.trim());
        onClose();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-[#FAF7F2] dark:bg-[#16181C] border border-[#E5DFD3] dark:border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-[#E5DFD3] dark:border-stone-800 bg-[#F5F0E6] dark:bg-[#1D2026] flex items-center gap-3">
          <Search className="w-5 h-5 text-amber-800 dark:text-amber-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type prompt title, tag (#react), or role..."
            className="w-full font-serif text-base font-medium text-[#1A212D] dark:text-stone-100 bg-transparent focus:outline-none placeholder:text-stone-400 dark:placeholder:text-stone-500"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 bg-[#FAF7F2] dark:bg-[#121417] border border-[#D5CCBC] dark:border-stone-700 rounded text-stone-500 dark:text-stone-400">
            ESC to close
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 space-y-1">
          {filteredPrompts.length > 0 ? (
            filteredPrompts.map((prompt, idx) => {
              const isSelected = idx === selectedIndex;
              const role = roleMap.get(prompt.role_id);
              const isJustCopied = copiedId === prompt.id;

              return (
                <div
                  key={prompt.id}
                  onClick={() => {
                    setCopiedId(prompt.id);
                    onCopyAndClose(prompt);
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-[#EFE8DC] dark:bg-[#222630] border-amber-800/40 dark:border-amber-500/40 shadow-xs'
                      : 'bg-transparent border-transparent hover:bg-[#F2EDE4]/60 dark:hover:bg-[#1D2026]'
                  }`}
                >
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-sm text-[#1A212D] dark:text-stone-100 truncate">
                        {prompt.title}
                      </span>
                      {role && (
                        <span
                          className="px-2 py-0.5 text-[10px] font-sans font-medium rounded-full shrink-0 border border-stone-200 dark:border-stone-700"
                          style={{
                            backgroundColor: `${role.color_accent || '#3B82F6'}15`,
                            color: role.color_accent || '#3B82F6',
                          }}
                        >
                          {role.name}
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-xs text-stone-500 dark:text-stone-400 line-clamp-1">
                      {prompt.body}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenPromptDetail(prompt);
                        onClose();
                      }}
                      className="px-2 py-1 text-[11px] text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 hover:underline"
                    >
                      Edit
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCopiedId(prompt.id);
                        onCopyAndClose(prompt);
                      }}
                      className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                        isJustCopied
                          ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-stone-950'
                          : isSelected
                          ? 'bg-[#8B263E] text-white dark:bg-amber-600 dark:text-stone-950 shadow-2xs'
                          : 'bg-[#F2EDE4] dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-amber-900 hover:text-white'
                      }`}
                    >
                      {isJustCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                          <CornerDownLeft className="w-3 h-3 ml-0.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-6 text-center space-y-3">
              <p className="text-sm font-serif text-stone-600 dark:text-stone-400">
                No matching prompts found for "{query}"
              </p>
              <button
                onClick={() => {
                  onCreateNewWithTitle(query.trim());
                  onClose();
                }}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-[#8B263E] hover:bg-[#721F32] dark:bg-amber-600 dark:hover:bg-amber-500 text-white dark:text-stone-950 rounded-lg shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Create "{query}" as a new prompt</span>
              </button>
            </div>
          )}
        </div>

        {/* Command Palette Keyboard Guide Footer */}
        <div className="px-4 py-2.5 border-t border-[#E5DFD3] dark:border-stone-800 bg-[#F5F0E6] dark:bg-[#1D2026] flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 font-mono">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <ArrowUp className="w-3 h-3" />
              <ArrowDown className="w-3 h-3" /> Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 bg-stone-200 dark:bg-stone-800 rounded">↵</kbd> Copy & Close
            </span>
          </div>
          <span>Instant Fuzzy Search</span>
        </div>
      </div>
    </div>
  );
};
