import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Copy,
  Check,
  Star,
  CopyPlus,
  Trash2,
  History,
  Sparkles,
  Tag as TagIcon,
  RotateCcw,
  Clock,
  Save,
  ChevronDown,
} from 'lucide-react';
import { PromptItem, RoleItem, PromptVersion } from '../types';

interface PromptDetailModalProps {
  prompt: PromptItem | null;
  roles: RoleItem[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedPrompt: PromptItem) => void;
  onDelete: (promptId: string) => void;
  onDuplicate: (prompt: PromptItem) => void;
  onSendToRefactor: (prompt: PromptItem) => void;
  onCopy: (prompt: PromptItem) => void;
  isCopied: boolean;
}

export const PromptDetailModal: React.FC<PromptDetailModalProps> = ({
  prompt,
  roles,
  isOpen,
  onClose,
  onSave,
  onDelete,
  onDuplicate,
  onSendToRefactor,
  onCopy,
  isCopied,
}) => {
  if (!isOpen || !prompt) return null;

  const [title, setTitle] = useState(prompt.title);
  const [body, setBody] = useState(prompt.body);
  const [roleId, setRoleId] = useState(prompt.role_id);
  const [tagsInput, setTagsInput] = useState(prompt.tags ? prompt.tags.join(', ') : '');
  const [isFavorite, setIsFavorite] = useState(prompt.is_favorite);
  const [selectedVersion, setSelectedVersion] = useState<PromptVersion | null>(null);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving'>('saved');

  const debouncedTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state when prompt changes
  useEffect(() => {
    setTitle(prompt.title);
    setBody(prompt.body);
    setRoleId(prompt.role_id);
    setTagsInput(prompt.tags ? prompt.tags.join(', ') : '');
    setIsFavorite(prompt.is_favorite);
    setSelectedVersion(null);
  }, [prompt]);

  // Debounced Autosave on every keystroke
  const handleBodyOrTitleChange = (newTitle: string, newBody: string, newRoleId: string, newTagsStr: string) => {
    setTitle(newTitle);
    setBody(newBody);
    setRoleId(newRoleId);
    setTagsInput(newTagsStr);
    setAutoSaveStatus('saving');

    if (debouncedTimerRef.current) {
      clearTimeout(debouncedTimerRef.current);
    }

    debouncedTimerRef.current = setTimeout(() => {
      const parsedTags = newTagsStr
        .split(',')
        .map((t) => t.trim().replace(/^#/, ''))
        .filter((t) => t.length > 0);

      const updated: PromptItem = {
        ...prompt,
        title: newTitle || 'Untitled Prompt',
        body: newBody,
        role_id: newRoleId,
        tags: parsedTags,
        is_favorite: isFavorite,
        updated_at: new Date().toISOString(),
      };
      onSave(updated);
      setAutoSaveStatus('saved');
    }, 500);
  };

  const handleToggleFavorite = () => {
    const nextFav = !isFavorite;
    setIsFavorite(nextFav);
    onSave({
      ...prompt,
      is_favorite: nextFav,
      updated_at: new Date().toISOString(),
    });
  };

  const handleSaveExplicitVersion = () => {
    const newVersion: PromptVersion = {
      id: `v-${Date.now()}`,
      title: title,
      body: body,
      timestamp: new Date().toISOString(),
      note: 'Saved version snapshot',
    };

    const updatedHistory = [newVersion, ...(prompt.version_history || [])].slice(0, 5);

    const updated: PromptItem = {
      ...prompt,
      title,
      body,
      role_id: roleId,
      version_history: updatedHistory,
      updated_at: new Date().toISOString(),
    };

    onSave(updated);
    setAutoSaveStatus('saved');
  };

  const handleRestoreVersion = (ver: PromptVersion) => {
    // Save current before restoring
    handleSaveExplicitVersion();
    setBody(ver.body);
    if (ver.title) setTitle(ver.title);
    handleBodyOrTitleChange(ver.title || title, ver.body, roleId, tagsInput);
    setSelectedVersion(null);
  };

  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0;
  const charCount = body.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#FAF7F2] dark:bg-[#16181C] border border-[#E5DFD3] dark:border-stone-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#E5DFD3] dark:border-stone-800 bg-[#F5F0E6] dark:bg-[#1D2026] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <button
              onClick={handleToggleFavorite}
              className="p-1.5 text-stone-400 hover:text-amber-500 transition-colors"
              title={isFavorite ? 'Remove Favorite' : 'Star Favorite'}
            >
              <Star className={`w-5 h-5 ${isFavorite ? 'text-amber-500 fill-amber-500' : ''}`} />
            </button>
            <input
              type="text"
              value={title}
              onChange={(e) => handleBodyOrTitleChange(e.target.value, body, roleId, tagsInput)}
              placeholder="Prompt Title..."
              className="w-full font-serif text-lg font-bold text-[#1A212D] dark:text-stone-100 bg-transparent border-b border-transparent hover:border-[#D5CCBC] focus:border-amber-700 dark:hover:border-stone-700 focus:outline-none px-1 py-0.5 transition-colors"
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-stone-400 dark:text-stone-500 flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${autoSaveStatus === 'saving' ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`} />
              {autoSaveStatus === 'saving' ? 'Saving...' : 'Autosaved'}
            </span>

            <button
              onClick={onClose}
              className="p-2 text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100 rounded-lg hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Editor Settings Sub-Bar */}
        <div className="px-6 py-2.5 border-b border-[#E5DFD3]/70 dark:border-stone-800/80 bg-[#FAF7F2] dark:bg-[#141619] flex flex-wrap items-center justify-between gap-3 text-xs">
          
          <div className="flex flex-wrap items-center gap-4">
            {/* Role Picker */}
            <div className="flex items-center gap-1.5">
              <span className="font-serif font-medium text-stone-500 dark:text-stone-400">Role:</span>
              <select
                value={roleId}
                onChange={(e) => handleBodyOrTitleChange(title, body, e.target.value, tagsInput)}
                className="bg-[#F2EDE4] dark:bg-[#1F232B] text-stone-800 dark:text-stone-200 border border-[#E0D7C8] dark:border-stone-700 rounded-md px-2.5 py-1 text-xs font-serif font-semibold focus:outline-none focus:ring-1 focus:ring-amber-700"
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags Input */}
            <div className="flex items-center gap-1.5 flex-1 min-w-[200px]">
              <TagIcon className="w-3.5 h-3.5 text-stone-400" />
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => handleBodyOrTitleChange(title, body, roleId, e.target.value)}
                placeholder="tags (comma separated, e.g. sql, react, copy)"
                className="w-full bg-[#F2EDE4]/80 dark:bg-[#1F232B]/80 text-stone-800 dark:text-stone-200 border border-[#E0D7C8] dark:border-stone-700 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-amber-700"
              />
            </div>
          </div>

          {/* Quick Metrics & Version Trigger */}
          <div className="flex items-center gap-3 text-stone-500 font-mono">
            <span>{wordCount} words</span>
            <span>•</span>
            <span>{charCount} chars</span>
            <button
              onClick={() => setShowVersionHistory(!showVersionHistory)}
              className="flex items-center gap-1 text-amber-900 dark:text-amber-400 hover:underline font-serif font-semibold"
            >
              <History className="w-3.5 h-3.5" />
              History ({prompt.version_history ? prompt.version_history.length + 1 : 1})
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Main Prompt Editor Canvas */}
          <div className="flex-1 flex flex-col p-6 overflow-y-auto">
            <label className="text-xs font-serif uppercase tracking-wider font-bold text-stone-500 dark:text-stone-400 mb-2">
              Prompt Instructions & Body
            </label>
            <textarea
              value={body}
              onChange={(e) => handleBodyOrTitleChange(title, e.target.value, roleId, tagsInput)}
              placeholder="Paste or write your master prompt template here..."
              className="w-full flex-1 min-h-[300px] p-4 font-mono text-sm leading-relaxed text-[#1A212D] dark:text-stone-100 bg-[#FFFDF9] dark:bg-[#121417] border border-[#E5DFD3] dark:border-stone-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-800/30 dark:focus:ring-amber-500/30 resize-none shadow-inner"
            />
          </div>

          {/* Version History Side Panel */}
          {showVersionHistory && (
            <div className="w-80 border-l border-[#E5DFD3] dark:border-stone-800 bg-[#F5F0E6]/80 dark:bg-[#191C22] p-4 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-serif font-bold text-sm text-[#1A212D] dark:text-stone-100 flex items-center gap-1.5">
                  <History className="w-4 h-4 text-amber-800 dark:text-amber-400" />
                  Version History
                </h4>
                <button
                  onClick={handleSaveExplicitVersion}
                  className="px-2 py-1 text-[11px] font-semibold bg-amber-900 text-amber-50 dark:bg-amber-600 dark:text-stone-950 rounded hover:bg-amber-950 transition-colors flex items-center gap-1"
                  title="Save snapshot of current state"
                >
                  <Save className="w-3 h-3" /> Save Version
                </button>
              </div>

              <p className="text-xs text-stone-500 dark:text-stone-400">
                Last 5 versions kept automatically. Click any past version to inspect or restore.
              </p>

              {/* Current Version Item */}
              <div className="p-3 bg-amber-900/10 dark:bg-amber-400/10 border border-amber-900/30 dark:border-amber-400/30 rounded-lg">
                <div className="flex items-center justify-between text-xs font-bold text-amber-900 dark:text-amber-300 mb-1">
                  <span>Current Live Version</span>
                  <span className="text-[10px] font-mono">Active</span>
                </div>
                <p className="text-xs font-mono text-stone-700 dark:text-stone-300 line-clamp-2">
                  {body}
                </p>
              </div>

              {/* Past Saved Versions */}
              {prompt.version_history && prompt.version_history.length > 0 ? (
                <div className="space-y-2">
                  {prompt.version_history.map((ver, idx) => {
                    const isSelected = selectedVersion?.id === ver.id;
                    const dateStr = new Date(ver.timestamp).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      month: 'short',
                      day: 'numeric',
                    });

                    return (
                      <div
                        key={ver.id || idx}
                        className={`p-3 rounded-lg border text-xs transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#FAF7F2] dark:bg-stone-800 border-amber-700 dark:border-amber-400 shadow-sm'
                            : 'bg-[#FAF7F2]/60 dark:bg-[#1D2026] border-[#E0D7C8] dark:border-stone-800 hover:border-stone-400'
                        }`}
                        onClick={() => setSelectedVersion(ver)}
                      >
                        <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 font-mono text-[11px] mb-1">
                          <span className="font-bold text-stone-700 dark:text-stone-200">
                            Version #{prompt.version_history.length - idx}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {dateStr}
                          </span>
                        </div>
                        <p className="font-mono text-stone-600 dark:text-stone-300 line-clamp-3 mb-2">
                          {ver.body}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRestoreVersion(ver);
                          }}
                          className="w-full py-1 text-[11px] font-semibold text-amber-900 dark:text-amber-400 border border-amber-900/30 dark:border-amber-400/30 rounded hover:bg-amber-900/10 transition-colors flex items-center justify-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" /> Revert to this Version
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-stone-400">
                  No previous snapshot versions saved yet. Click "Save Version" or duplicate to create snapshots.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Bar */}
        <div className="px-6 py-4 border-t border-[#E5DFD3] dark:border-stone-800 bg-[#F5F0E6] dark:bg-[#1D2026] flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDelete(prompt.id)}
              className="px-3 py-1.5 text-xs font-semibold text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/40 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>

            <button
              onClick={() => onDuplicate(prompt)}
              className="px-3 py-1.5 text-xs font-serif font-medium text-stone-700 dark:text-stone-300 hover:bg-[#EAE4D8] dark:hover:bg-stone-800 rounded-lg border border-[#E0D7C8] dark:border-stone-700 transition-colors flex items-center gap-1.5"
              title="Duplicate as new version so original is never overwritten"
            >
              <CopyPlus className="w-4 h-4 text-amber-800 dark:text-amber-400" />
              Duplicate as New Version
            </button>

            <button
              onClick={() => {
                onClose();
                onSendToRefactor(prompt);
              }}
              className="px-3 py-1.5 text-xs font-serif font-medium text-stone-800 dark:text-stone-200 hover:bg-[#EAE4D8] dark:hover:bg-stone-800 rounded-lg border border-[#E0D7C8] dark:border-stone-700 transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-amber-600" /> Refactor with AI
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-[#EAE4D8] dark:hover:bg-stone-800 rounded-lg transition-colors"
            >
              Close
            </button>

            {/* ALWAYS VISIBLE COPY BUTTON */}
            <button
              id={`modal-copy-btn-${prompt.id}`}
              onClick={() => onCopy(prompt)}
              className={`flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-lg shadow-sm transition-all ${
                isCopied
                  ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-stone-950'
                  : 'bg-[#8B263E] hover:bg-[#721F32] dark:bg-amber-600 dark:hover:bg-amber-500 text-white dark:text-stone-950'
              }`}
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied to Clipboard</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Prompt</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
