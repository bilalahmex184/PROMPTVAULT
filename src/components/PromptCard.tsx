import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Copy,
  Check,
  Star,
  Edit3,
  CopyPlus,
  Trash2,
  History,
  Tag as TagIcon,
  GripVertical,
  Zap,
} from 'lucide-react';
import { PromptItem, RoleItem, ViewMode } from '../types';

interface PromptCardProps {
  prompt: PromptItem;
  role?: RoleItem;
  onCopy: (prompt: PromptItem, e: React.MouseEvent) => void;
  onEdit: (prompt: PromptItem) => void;
  onToggleFavorite: (promptId: string) => void;
  onDuplicate: (prompt: PromptItem) => void;
  onDelete: (promptId: string) => void;
  viewMode: ViewMode;
  isCopied: boolean;
}

export const PromptCard: React.FC<PromptCardProps> = ({
  prompt,
  role,
  onCopy,
  onEdit,
  onToggleFavorite,
  onDuplicate,
  onDelete,
  viewMode,
  isCopied,
}) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', prompt.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const formattedDate = new Date(prompt.updated_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  if (viewMode === 'list') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        draggable
        onDragStart={handleDragStart}
        className="group relative bg-white dark:bg-[#131B2A] border border-slate-200/90 dark:border-slate-800 rounded-xl p-3.5 hover:border-indigo-500/50 dark:hover:border-indigo-400/50 card-glow transition-all flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span
            className="cursor-grab active:cursor-grabbing text-slate-300 dark:text-slate-600 hover:text-indigo-500 transition-colors"
            title="Drag to assign role"
          >
            <GripVertical className="w-4 h-4" />
          </span>

          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={() => onToggleFavorite(prompt.id)}
            className="p-1 text-slate-300 dark:text-slate-600 hover:text-amber-500 transition-colors shrink-0"
            title={prompt.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star
              className={`w-4 h-4 transition-colors ${
                prompt.is_favorite
                  ? 'text-amber-500 fill-amber-500'
                  : 'hover:text-amber-400'
              }`}
            />
          </motion.button>

          <div className="flex-1 min-w-0" onClick={() => onEdit(prompt)}>
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="font-heading font-semibold text-sm text-slate-900 dark:text-slate-100 truncate cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                {prompt.title}
              </h3>
              {role && (
                <span
                  className="px-2 py-0.5 text-[10px] font-sans font-semibold uppercase tracking-wider rounded-md shrink-0 border"
                  style={{
                    backgroundColor: `${role.color_accent || '#6366F1'}12`,
                    color: role.color_accent || '#6366F1',
                    borderColor: `${role.color_accent || '#6366F1'}30`,
                  }}
                >
                  {role.name}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono line-clamp-1">
              {prompt.body}
            </p>
          </div>
        </div>

        {/* List Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {prompt.usage_count > 0 && (
            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 hidden md:inline-block" title="Copy count">
              {prompt.usage_count}x used
            </span>
          )}

          {prompt.version_history && prompt.version_history.length > 0 && (
            <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/50 dark:border-indigo-800/50">
              v{prompt.version_history.length + 1}
            </span>
          )}

          {/* Copy Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            id={`copy-btn-${prompt.id}`}
            onClick={(e) => onCopy(prompt, e)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              isCopied
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                : 'bg-indigo-600 text-white border-indigo-500 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 shadow-sm'
            }`}
            title="Copy prompt to clipboard"
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </motion.button>

          <button
            onClick={() => onDuplicate(prompt)}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Duplicate version"
          >
            <CopyPlus className="w-4 h-4" />
          </button>

          <button
            onClick={() => onEdit(prompt)}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Edit prompt (E)"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          {showConfirmDelete ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onDelete(prompt.id)}
                className="px-2.5 py-1 text-[10px] font-bold bg-rose-600 text-white rounded-lg hover:bg-rose-700 shadow-xs"
              >
                Confirm Delete
              </button>
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="px-2 py-1 text-[10px] bg-slate-200 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirmDelete(true)}
              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Delete prompt"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  // Grid View (Modern Studio Glass Card with Framer Motion entry & hover effects)
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      whileHover={{ y: -5, transition: { duration: 0.2, ease: 'easeOut' } }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      draggable
      onDragStart={handleDragStart}
      className={`group relative bg-white dark:bg-[#131B2A] p-5 rounded-2xl card-glow border transition-all duration-200 flex flex-col justify-between ${
        prompt.is_favorite
          ? 'border-amber-400/80 dark:border-amber-500/60 ring-1 ring-amber-400/20'
          : 'border-slate-200/90 dark:border-slate-800/90 hover:border-indigo-400/60 dark:hover:border-indigo-500/60 hover:shadow-xl'
      }`}
    >
      {/* Top Section */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-1 min-w-0 pr-1">
            {role ? (
              <span
                className="px-2.5 py-0.5 text-[10px] font-heading font-bold uppercase tracking-wider rounded-full border shrink-0"
                style={{
                  backgroundColor: `${role.color_accent || '#6366F1'}14`,
                  color: role.color_accent || '#6366F1',
                  borderColor: `${role.color_accent || '#6366F1'}35`,
                }}
              >
                {role.name}
              </span>
            ) : (
              <span className="px-2 py-0.5 text-[10px] font-heading font-bold uppercase tracking-wider rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shrink-0">
                General
              </span>
            )}
            
            {prompt.version_history && prompt.version_history.length > 0 && (
              <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/50 dark:border-indigo-800/50" title="Version count">
                v{prompt.version_history.length + 1}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <span
              className="cursor-grab active:cursor-grabbing text-slate-300 opacity-0 group-hover:opacity-100 dark:text-slate-600 hover:text-slate-500 transition-opacity p-1"
              title="Drag card onto left sidebar role to reassign"
            >
              <GripVertical className="w-4 h-4" />
            </span>

            <motion.button
              whileTap={{ scale: 0.75 }}
              onClick={() => onToggleFavorite(prompt.id)}
              className="p-1 text-slate-300 dark:text-slate-600 hover:text-amber-500 transition-colors"
              title={prompt.is_favorite ? 'Starred Favorite' : 'Star Prompt'}
            >
              <Star
                className={`w-4 h-4 transition-colors ${
                  prompt.is_favorite
                    ? 'text-amber-500 fill-amber-500'
                    : 'hover:text-amber-400'
                }`}
              />
            </motion.button>
          </div>
        </div>

        {/* Title */}
        <h3
          onClick={() => onEdit(prompt)}
          className="font-heading font-bold text-base text-slate-900 dark:text-slate-100 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-1 mb-2.5"
        >
          {prompt.title}
        </h3>

        {/* Card Prompt Body Preview Container */}
        <div
          onClick={() => onEdit(prompt)}
          className="bg-slate-50/90 dark:bg-[#0B0F17] p-3 rounded-xl border border-slate-200/70 dark:border-slate-800 cursor-pointer group-hover:border-indigo-300/40 dark:group-hover:border-slate-700 transition-colors mb-3.5"
        >
          <p className="font-mono text-xs text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-3 whitespace-pre-wrap">
            {prompt.body}
          </p>
        </div>

        {/* Tag Chips & Metadata */}
        {prompt.tags && prompt.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {prompt.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-sans font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Card Footer Actions */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 font-mono">
          {prompt.usage_count > 0 ? (
            <span className="flex items-center gap-1" title="Times copied">
              <Zap className="w-3 h-3 text-indigo-500 fill-indigo-500/20" />
              {prompt.usage_count}x
            </span>
          ) : (
            <span className="text-[10px] text-slate-400 dark:text-slate-600">{formattedDate}</span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onDuplicate(prompt)}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Duplicate as new version"
          >
            <CopyPlus className="w-4 h-4" />
          </button>

          <button
            onClick={() => onEdit(prompt)}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Edit prompt"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          {showConfirmDelete ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onDelete(prompt.id)}
                className="px-2 py-0.5 text-[10px] font-bold bg-rose-600 text-white rounded-md hover:bg-rose-700"
              >
                Delete
              </button>
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="px-1.5 py-0.5 text-[10px] bg-slate-200 dark:bg-slate-800 rounded-md text-slate-700 dark:text-slate-300"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirmDelete(true)}
              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Delete prompt"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {/* Copy Button */}
          <motion.button
            whileTap={{ scale: 0.94 }}
            id={`copy-grid-btn-${prompt.id}`}
            onClick={(e) => onCopy(prompt, e)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border shadow-xs transition-all ${
              isCopied
                ? 'bg-emerald-600 text-white border-emerald-500 dark:bg-emerald-500 dark:text-slate-950'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-500 dark:text-white'
            }`}
            title="Copy prompt to clipboard"
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
