import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Folder,
  Star,
  Tag as TagIcon,
  Plus,
  ChevronDown,
  ChevronRight,
  Code2,
  Briefcase,
  Megaphone,
  BookOpen,
  Compass,
  Layers,
  Sparkles,
  FilterX,
  FolderKanban,
} from 'lucide-react';
import { RoleItem } from '../types';

interface LeftRailProps {
  roles: RoleItem[];
  selectedRoleId: string | null; // null = all
  onSelectRole: (roleId: string | null) => void;
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  onlyFavorites: boolean;
  onToggleFavoritesOnly: (favoritesOnly: boolean) => void;
  allTags: string[];
  promptsCountByRole: Record<string, number>;
  totalPromptsCount: number;
  favoritesCount: number;
  onOpenManageRoles: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onPromptDropToRole?: (promptId: string, roleId: string) => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Code2: <Code2 className="w-4 h-4" />,
  Briefcase: <Briefcase className="w-4 h-4" />,
  Megaphone: <Megaphone className="w-4 h-4" />,
  BookOpen: <BookOpen className="w-4 h-4" />,
  Compass: <Compass className="w-4 h-4" />,
};

export const LeftRail: React.FC<LeftRailProps> = ({
  roles,
  selectedRoleId,
  onSelectRole,
  selectedTag,
  onSelectTag,
  onlyFavorites,
  onToggleFavoritesOnly,
  allTags,
  promptsCountByRole,
  totalPromptsCount,
  favoritesCount,
  onOpenManageRoles,
  isCollapsed,
  onToggleCollapse,
  onPromptDropToRole,
}) => {
  const [isRolesOpen, setIsRolesOpen] = useState(true);
  const [isTagsOpen, setIsTagsOpen] = useState(true);
  const [dragOverRoleId, setDragOverRoleId] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent, roleId: string) => {
    e.preventDefault();
    setDragOverRoleId(roleId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverRoleId(null);
  };

  const handleDrop = (e: React.DragEvent, roleId: string) => {
    e.preventDefault();
    setDragOverRoleId(null);
    const promptId = e.dataTransfer.getData('text/plain');
    if (promptId && onPromptDropToRole) {
      onPromptDropToRole(promptId, roleId);
    }
  };

  return (
    <aside
      className={`relative flex flex-col border-r border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-[#0B0F17]/60 backdrop-blur-md transition-all duration-200 select-none ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Header / Library Section Title */}
      <div className="p-3.5 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
        {!isCollapsed && (
          <span className="text-[10px] font-heading font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
            <FolderKanban className="w-4 h-4" />
            Category Catalog
          </span>
        )}
        <button
          id="collapse-left-rail-btn"
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors mx-auto"
          title={isCollapsed ? 'Expand Navigation' : 'Collapse Navigation'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4 rotate-90" />}
        </button>
      </div>

      {/* Main Navigation List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-4">
        
        {/* Core Filters (All, Favorites) */}
        <div className="space-y-1">
          <button
            id="filter-all-prompts-btn"
            onClick={() => {
              onSelectRole(null);
              onSelectTag(null);
              onToggleFavoritesOnly(false);
            }}
            className={`role-tab w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg text-left transition-all ${
              selectedRoleId === null && !onlyFavorites && selectedTag === null
                ? 'active text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50/70 dark:bg-indigo-950/40'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className={`w-2 h-2 rounded-full shrink-0 ${selectedRoleId === null && !onlyFavorites && selectedTag === null ? 'bg-indigo-600 dark:bg-indigo-400' : 'bg-slate-300 dark:bg-slate-700'}`} />
              {!isCollapsed && <span>All Stored Prompts</span>}
            </div>
            {!isCollapsed && (
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                {totalPromptsCount}
              </span>
            )}
          </button>

          <button
            id="filter-favorites-prompts-btn"
            onClick={() => {
              onToggleFavoritesOnly(!onlyFavorites);
              if (!onlyFavorites) {
                onSelectRole(null);
                onSelectTag(null);
              }
            }}
            className={`role-tab w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg text-left transition-all ${
              onlyFavorites
                ? 'active text-amber-600 dark:text-amber-400 font-bold bg-amber-50/70 dark:bg-amber-950/40'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
              {!isCollapsed && <span>Starred Favorites</span>}
            </div>
            {!isCollapsed && (
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                {favoritesCount}
              </span>
            )}
          </button>
        </div>

        {/* Roles / Folders Section */}
        <div className="space-y-1">
          {!isCollapsed && (
            <div className="flex items-center justify-between px-2 py-1">
              <button
                onClick={() => setIsRolesOpen(!isRolesOpen)}
                className="flex items-center gap-1 text-[10px] font-heading font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                {isRolesOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                Roles & Categories
              </button>
              <button
                id="add-role-drawer-btn"
                onClick={onOpenManageRoles}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                title="Manage Roles"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {(isRolesOpen || isCollapsed) && (
            <div className="space-y-1">
              {roles.map((role) => {
                const isSelected = selectedRoleId === role.id && !onlyFavorites && selectedTag === null;
                const isDragTarget = dragOverRoleId === role.id;
                const count = promptsCountByRole[role.id] || 0;

                return (
                  <button
                    key={role.id}
                    id={`role-item-${role.id}`}
                    onClick={() => {
                      onSelectRole(role.id);
                      onSelectTag(null);
                      onToggleFavoritesOnly(false);
                    }}
                    onDragOver={(e) => handleDragOver(e, role.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, role.id)}
                    className={`role-tab w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg text-left transition-all ${
                      isDragTarget
                        ? 'bg-indigo-100 dark:bg-indigo-950/80 ring-2 ring-indigo-500 scale-[1.02]'
                        : isSelected
                        ? 'active font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/40'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                    }`}
                    title={role.description || role.name}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: role.color_accent || '#6366F1' }}
                      />
                      {!isCollapsed && <span className="truncate">{role.name}</span>}
                    </div>

                    {!isCollapsed && (
                      <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Free-form Tags Cloud */}
        {!isCollapsed && allTags.length > 0 && (
          <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between px-2 py-0.5">
              <button
                onClick={() => setIsTagsOpen(!isTagsOpen)}
                className="flex items-center gap-1 text-[10px] font-heading font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                {isTagsOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                Filter by Tag
              </button>
              {selectedTag && (
                <button
                  onClick={() => onSelectTag(null)}
                  className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                >
                  <FilterX className="w-3 h-3" /> Clear
                </button>
              )}
            </div>

            {isTagsOpen && (
              <div className="flex flex-wrap gap-1.5 px-1 py-1 max-h-40 overflow-y-auto">
                {allTags.map((tag) => {
                  const isSelected = selectedTag === tag;
                  return (
                    <button
                      key={tag}
                      onClick={() => {
                        onSelectTag(isSelected ? null : tag);
                        if (!isSelected) {
                          onToggleFavoritesOnly(false);
                        }
                      }}
                      className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all border ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-500 dark:bg-indigo-500 font-semibold shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      #{tag}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Footer Role Manager Trigger */}
      {!isCollapsed && (
        <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-[#0D121F]">
          <button
            onClick={onOpenManageRoles}
            className="w-full text-center px-3 py-2 text-xs font-heading font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            Manage Roles & Categories
          </button>
        </div>
      )}
    </aside>
  );
};
