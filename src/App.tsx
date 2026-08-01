import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from './components/Navbar';
import { LeftRail } from './components/LeftRail';
import { PromptCard } from './components/PromptCard';
import { PromptDetailModal } from './components/PromptDetailModal';
import { CommandPalette } from './components/CommandPalette';
import { AssistantPanel } from './components/AssistantPanel';
import { SettingsModal } from './components/SettingsModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { Toast } from './components/Toast';
import {
  PromptItem,
  RoleItem,
  ViewMode,
  SortOption,
} from './types';
import {
  loadStoredPrompts,
  saveStoredPrompts,
  loadStoredRoles,
  saveStoredRoles,
  loadStoredTheme,
  saveStoredTheme,
  exportLibraryAsJSON,
  importLibraryFromJSON,
  resetLibraryToDefaults,
} from './utils/storage';
import {
  subscribeToPrompts,
  subscribeToRoles,
  savePromptToFirestore,
  deletePromptFromFirestore,
  saveRoleToFirestore,
  deleteRoleFromFirestore,
  replaceAllPromptsAndRolesInFirestore,
} from './lib/firebase';
import {
  Search,
  Plus,
  FilterX,
  Sparkles,
  BookOpen,
  Tag as TagIcon,
  Layers,
  FolderOpen,
} from 'lucide-react';

export default function App() {
  // Main Data States
  const [prompts, setPrompts] = useState<PromptItem[]>(() => loadStoredPrompts());
  const [roles, setRoles] = useState<RoleItem[]>(() => loadStoredRoles());
  const [theme, setTheme] = useState<'light' | 'dark'>(() => loadStoredTheme());

  // UI & Filter States
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [mainSearchQuery, setMainSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [isLeftRailCollapsed, setIsLeftRailCollapsed] = useState(false);

  // Modals & Side Panels
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<PromptItem | null>(null);
  const [refactorPromptTarget, setRefactorPromptTarget] = useState<PromptItem | null>(null);

  // Feedback State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  // Theme Synchronizer
  useEffect(() => {
    saveStoredTheme(theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Real-time Firebase Firestore Sync
  useEffect(() => {
    const unsubPrompts = subscribeToPrompts((remotePrompts) => {
      setPrompts(remotePrompts);
      saveStoredPrompts(remotePrompts);
    });
    const unsubRoles = subscribeToRoles((remoteRoles) => {
      setRoles(remoteRoles);
      saveStoredRoles(remoteRoles);
    });

    return () => {
      unsubPrompts();
      unsubRoles();
    };
  }, []);

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isInputFocused =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement?.getAttribute('contenteditable') === 'true';

      // Cmd/Ctrl + K or '/' for search
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      } else if (e.key === '/' && !isInputFocused) {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
      // 'N' for new prompt
      else if (e.key.toLowerCase() === 'n' && !isInputFocused && !isCommandPaletteOpen && !editingPrompt) {
        e.preventDefault();
        handleCreateNewPrompt();
      }
      // 'E' for editing first prompt
      else if (e.key.toLowerCase() === 'e' && !isInputFocused && !editingPrompt && filteredPrompts.length > 0) {
        e.preventDefault();
        setEditingPrompt(filteredPrompts[0]);
      }
      // '?' for shortcuts
      else if (e.key === '?' && !isInputFocused) {
        e.preventDefault();
        setIsShortcutsOpen(true);
      }
      // Esc to close all overlays
      else if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
        setIsAssistantOpen(false);
        setIsSettingsOpen(false);
        setIsShortcutsOpen(false);
        setEditingPrompt(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, editingPrompt, prompts]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // 1-Click Copy Handler
  const handleCopyPrompt = (prompt: PromptItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(prompt.body);
    setCopiedPromptId(prompt.id);
    showToast(`Copied "${prompt.title}" to clipboard`);

    // Increment usage count
    const updatedPrompt: PromptItem = {
      ...prompt,
      usage_count: (prompt.usage_count || 0) + 1,
      updated_at: new Date().toISOString(),
    };
    setPrompts((prev) => prev.map((p) => (p.id === prompt.id ? updatedPrompt : p)));
    savePromptToFirestore(updatedPrompt);

    setTimeout(() => {
      setCopiedPromptId(null);
    }, 2000);
  };

  // Create New Prompt
  const handleCreateNewPrompt = (initialTitle = '', initialBody = '') => {
    const defaultRole = roles[0]?.id || 'role-developer';
    const newPrompt: PromptItem = {
      id: `p-${Date.now()}`,
      title: initialTitle || 'Untitled New Prompt',
      body: initialBody || '',
      role_id: selectedRoleId || defaultRole,
      tags: selectedTag ? [selectedTag] : ['new'],
      is_favorite: false,
      usage_count: 0,
      version_history: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setPrompts([newPrompt, ...prompts]);
    setEditingPrompt(newPrompt);
    savePromptToFirestore(newPrompt);
  };

  // Duplicate as New Version
  const handleDuplicatePrompt = (prompt: PromptItem) => {
    const duplicated: PromptItem = {
      ...prompt,
      id: `p-${Date.now()}`,
      title: `${prompt.title} (Iterated)`,
      usage_count: 0,
      version_history: [
        {
          id: `v-orig-${Date.now()}`,
          title: prompt.title,
          body: prompt.body,
          timestamp: prompt.updated_at,
          note: 'Branched from original version',
        },
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setPrompts([duplicated, ...prompts]);
    setEditingPrompt(duplicated);
    savePromptToFirestore(duplicated);
    showToast('Duplicated prompt as new iterative version');
  };

  // Save/Update Prompt
  const handleSavePrompt = (updatedPrompt: PromptItem) => {
    setPrompts((prev) => prev.map((p) => (p.id === updatedPrompt.id ? updatedPrompt : p)));
    if (editingPrompt?.id === updatedPrompt.id) {
      setEditingPrompt(updatedPrompt);
    }
    savePromptToFirestore(updatedPrompt);
  };

  // Delete Prompt
  const handleDeletePrompt = (promptId: string) => {
    setPrompts((prev) => prev.filter((p) => p.id !== promptId));
    if (editingPrompt?.id === promptId) {
      setEditingPrompt(null);
    }
    deletePromptFromFirestore(promptId);
    showToast('Prompt removed from library');
  };

  // Toggle Favorite Star
  const handleToggleFavorite = (promptId: string) => {
    const target = prompts.find((p) => p.id === promptId);
    if (!target) return;
    const updatedTarget = { ...target, is_favorite: !target.is_favorite, updated_at: new Date().toISOString() };
    setPrompts((prev) =>
      prev.map((p) => (p.id === promptId ? updatedTarget : p))
    );
    savePromptToFirestore(updatedTarget);
  };

  // Move Prompt to Role (Drag & Drop)
  const handlePromptDropToRole = (promptId: string, roleId: string) => {
    const roleObj = roles.find((r) => r.id === roleId);
    const target = prompts.find((p) => p.id === promptId);
    if (target) {
      const updatedTarget = { ...target, role_id: roleId, updated_at: new Date().toISOString() };
      setPrompts((prev) =>
        prev.map((p) => (p.id === promptId ? updatedTarget : p))
      );
      savePromptToFirestore(updatedTarget);
    }
    showToast(`Moved prompt to "${roleObj?.name || 'Role'}"`);
  };

  // All Tags computation
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    prompts.forEach((p) => {
      if (p.tags) {
        p.tags.forEach((t) => tagSet.add(t));
      }
    });
    return Array.from(tagSet).sort();
  }, [prompts]);

  // Counts by Role
  const promptsCountByRole = useMemo(() => {
    const counts: Record<string, number> = {};
    roles.forEach((r) => {
      counts[r.id] = 0;
    });
    prompts.forEach((p) => {
      if (p.role_id) {
        counts[p.role_id] = (counts[p.role_id] || 0) + 1;
      }
    });
    return counts;
  }, [prompts, roles]);

  const favoritesCount = useMemo(() => {
    return prompts.filter((p) => p.is_favorite).length;
  }, [prompts]);

  // Role Map
  const roleMap = useMemo(() => {
    return new Map(roles.map((r) => [r.id, r]));
  }, [roles]);

  // Filtered and Sorted Prompts
  const filteredPrompts = useMemo(() => {
    let result = [...prompts];

    // Filter by role
    if (selectedRoleId) {
      result = result.filter((p) => p.role_id === selectedRoleId);
    }

    // Filter by tag
    if (selectedTag) {
      result = result.filter((p) => p.tags && p.tags.includes(selectedTag));
    }

    // Filter by favorites
    if (onlyFavorites) {
      result = result.filter((p) => p.is_favorite);
    }

    // Filter by search query
    if (mainSearchQuery.trim()) {
      const q = mainSearchQuery.toLowerCase();
      result = result.filter((p) => {
        const rName = roleMap.get(p.role_id)?.name?.toLowerCase() || '';
        const tagMatch = p.tags ? p.tags.some((t) => t.toLowerCase().includes(q)) : false;
        return (
          p.title.toLowerCase().includes(q) ||
          p.body.toLowerCase().includes(q) ||
          rName.includes(q) ||
          tagMatch
        );
      });
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      } else if (sortBy === 'most_used') {
        return (b.usage_count || 0) - (a.usage_count || 0);
      } else if (sortBy === 'alphabetical') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'favorites') {
        if (a.is_favorite && !b.is_favorite) return -1;
        if (!a.is_favorite && b.is_favorite) return 1;
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
      return 0;
    });

    return result;
  }, [prompts, selectedRoleId, selectedTag, onlyFavorites, mainSearchQuery, sortBy, roleMap]);

  // Active role details
  const currentRoleObj = selectedRoleId ? roleMap.get(selectedRoleId) : null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0B0F17] text-slate-800 dark:text-slate-200 studio-grid">
      
      {/* Top Navbar */}
      <Navbar
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onNewPrompt={() => handleCreateNewPrompt()}
        isAssistantOpen={isAssistantOpen}
        onToggleAssistant={() => setIsAssistantOpen(!isAssistantOpen)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
        sortBy={sortBy}
        onChangeSortBy={setSortBy}
        totalPromptsCount={prompts.length}
      />

      {/* Main Container Layout */}
      <div className="flex-1 flex overflow-hidden max-w-7xl w-full mx-auto">
        
        {/* Left Rail (Roles & Catalog Index Drawers) */}
        <LeftRail
          roles={roles}
          selectedRoleId={selectedRoleId}
          onSelectRole={setSelectedRoleId}
          selectedTag={selectedTag}
          onSelectTag={setSelectedTag}
          onlyFavorites={onlyFavorites}
          onToggleFavoritesOnly={setOnlyFavorites}
          allTags={allTags}
          promptsCountByRole={promptsCountByRole}
          totalPromptsCount={prompts.length}
          favoritesCount={favoritesCount}
          onOpenManageRoles={() => setIsSettingsOpen(true)}
          isCollapsed={isLeftRailCollapsed}
          onToggleCollapse={() => setIsLeftRailCollapsed(!isLeftRailCollapsed)}
          onPromptDropToRole={handlePromptDropToRole}
        />

        {/* Center Main Content Area */}
        <main className="flex-1 flex flex-col overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          
          {/* Active Drawer / Filter Bar Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-bold text-2xl tracking-tight text-slate-900 dark:text-slate-100">
                  {onlyFavorites
                    ? 'Starred Favorites'
                    : selectedTag
                    ? `Tagged #${selectedTag}`
                    : currentRoleObj
                    ? currentRoleObj.name
                    : 'Master Prompt Library'}
                </h2>
                {currentRoleObj && (
                  <span
                    className="w-3 h-3 rounded-full shadow-xs"
                    style={{ backgroundColor: currentRoleObj.color_accent || '#6366F1' }}
                  />
                )}
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-sans">
                {currentRoleObj?.description ||
                  `Showing ${filteredPrompts.length} of ${prompts.length} saved prompts`}
              </p>
            </div>

            {/* Quick Filter Active Badges & Clear */}
            <div className="flex flex-wrap items-center gap-2">
              {(selectedRoleId || selectedTag || onlyFavorites || mainSearchQuery) && (
                <button
                  onClick={() => {
                    setSelectedRoleId(null);
                    setSelectedTag(null);
                    setOnlyFavorites(false);
                    setMainSearchQuery('');
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors flex items-center gap-1.5"
                >
                  <FilterX className="w-3.5 h-3.5" /> Clear Filters
                </button>
              )}

              {/* In-page filter search bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={mainSearchQuery}
                  onChange={(e) => setMainSearchQuery(e.target.value)}
                  placeholder="Filter active drawer..."
                  className="pl-8 pr-3.5 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-44 sm:w-60 shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* Cards Display Grid or List with Framer Motion AnimatePresence */}
          {filteredPrompts.length > 0 ? (
            <motion.div
              layout
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'
                  : 'space-y-3'
              }
            >
              <AnimatePresence mode="popLayout">
                {filteredPrompts.map((prompt) => (
                  <PromptCard
                    key={prompt.id}
                    prompt={prompt}
                    role={roleMap.get(prompt.role_id)}
                    onCopy={handleCopyPrompt}
                    onEdit={setEditingPrompt}
                    onToggleFavorite={handleToggleFavorite}
                    onDuplicate={handleDuplicatePrompt}
                    onDelete={handleDeletePrompt}
                    viewMode={viewMode}
                    isCopied={copiedPromptId === prompt.id}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            /* Empty State */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-16 text-center space-y-4 max-w-md mx-auto bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-8 shadow-xs"
            >
              <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/60">
                <FolderOpen className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-slate-100">
                  No Prompts Found
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto">
                  No prompt matches your active filter. Try clearing filters or create a new prompt template.
                </p>
              </div>
              <button
                onClick={() => handleCreateNewPrompt()}
                className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 text-white rounded-xl shadow-md shadow-indigo-500/20 transition-all inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Create New Prompt
              </button>
            </motion.div>
          )}

        </main>
      </div>

      {/* Slide-over Right Assistant Panel */}
      <AssistantPanel
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        prompts={prompts}
        onCopyPrompt={handleCopyPrompt}
        onUpdatePromptBody={(id, newBody) => {
          const target = prompts.find((p) => p.id === id);
          if (target) {
            handleSavePrompt({ ...target, body: newBody, updated_at: new Date().toISOString() });
            showToast(`Updated body for "${target.title}"`);
          }
        }}
        onCreateNewPromptWithBody={(body, title) => {
          handleCreateNewPrompt(title || 'Refactored Prompt', body);
          setIsAssistantOpen(false);
        }}
        initialRefactorPrompt={refactorPromptTarget}
      />

      {/* Detail & Full Editor Modal */}
      <PromptDetailModal
        prompt={editingPrompt}
        roles={roles}
        isOpen={!!editingPrompt}
        onClose={() => setEditingPrompt(null)}
        onSave={handleSavePrompt}
        onDelete={handleDeletePrompt}
        onDuplicate={handleDuplicatePrompt}
        onSendToRefactor={(p) => {
          setRefactorPromptTarget(p);
          setIsAssistantOpen(true);
        }}
        onCopy={(p) => handleCopyPrompt(p)}
        isCopied={editingPrompt ? copiedPromptId === editingPrompt.id : false}
      />

      {/* Command Palette Instant Search (Cmd+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        prompts={prompts}
        roles={roles}
        onCopyAndClose={(p) => {
          handleCopyPrompt(p);
          setIsCommandPaletteOpen(false);
        }}
        onCreateNewWithTitle={(title) => {
          handleCreateNewPrompt(title);
        }}
        onOpenPromptDetail={(p) => {
          setEditingPrompt(p);
        }}
      />

      {/* Settings Modal (Roles & Backup JSON) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        roles={roles}
        onSaveRoles={(updatedRoles) => {
          setRoles(updatedRoles);
          saveStoredRoles(updatedRoles);
          updatedRoles.forEach((r) => saveRoleToFirestore(r));
        }}
        prompts={prompts}
        onExportJSON={() => exportLibraryAsJSON(prompts, roles)}
        onImportJSON={async (jsonStr) => {
          const { prompts: impPrompts, roles: impRoles } = importLibraryFromJSON(jsonStr);
          setPrompts(impPrompts);
          setRoles(impRoles);
          await replaceAllPromptsAndRolesInFirestore(impPrompts, impRoles);
          showToast('Library imported to database successfully!');
        }}
        onResetDefaults={async () => {
          const { prompts: defP, roles: defR } = resetLibraryToDefaults();
          setPrompts(defP);
          setRoles(defR);
          await replaceAllPromptsAndRolesInFirestore(defP, defR);
          showToast('Reset database to default templates');
        }}
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      />

      {/* Shortcuts Legend Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Toast Notification */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />

    </div>
  );
}
