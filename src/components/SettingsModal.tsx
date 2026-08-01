import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Download,
  Upload,
  RotateCcw,
  Palette,
  Check,
  Folder,
  Sliders,
  AlertTriangle,
} from 'lucide-react';
import { RoleItem, PromptItem } from '../types';
import { deleteRoleFromFirestore } from '../lib/firebase';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  roles: RoleItem[];
  onSaveRoles: (roles: RoleItem[]) => void;
  prompts: PromptItem[];
  onExportJSON: () => void;
  onImportJSON: (jsonText: string) => void;
  onResetDefaults: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const COLOR_OPTIONS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#EF4444', // Red
  '#06B6D4', // Cyan
  '#8B263E', // Oxblood
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  roles,
  onSaveRoles,
  prompts,
  onExportJSON,
  onImportJSON,
  onResetDefaults,
  theme,
  onToggleTheme,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'roles' | 'backup' | 'theme'>('roles');

  // Role creation state
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [newRoleColor, setNewRoleColor] = useState('#3B82F6');

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  const handleAddRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    const newRole: RoleItem = {
      id: `role-${Date.now()}`,
      name: newRoleName.trim(),
      description: newRoleDesc.trim(),
      color_accent: newRoleColor,
      sort_order: roles.length + 1,
    };

    onSaveRoles([...roles, newRole]);
    setNewRoleName('');
    setNewRoleDesc('');
  };

  const handleDeleteRole = (roleId: string) => {
    if (roles.length <= 1) {
      alert('You must keep at least one role in the catalog.');
      return;
    }
    const updated = roles.filter((r) => r.id !== roleId);
    deleteRoleFromFirestore(roleId);
    onSaveRoles(updated);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        onImportJSON(text);
        setImportSuccess('Library imported successfully!');
        setImportError(null);
      } catch (err: any) {
        setImportError(err.message || 'Failed to parse JSON file');
        setImportSuccess(null);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-[#FAF7F2] dark:bg-[#16181C] border border-[#E5DFD3] dark:border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5DFD3] dark:border-stone-800 bg-[#F5F0E6] dark:bg-[#1D2026] flex items-center justify-between">
          <h2 className="font-serif font-bold text-lg text-[#1A212D] dark:text-stone-100 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-800 dark:text-amber-400" />
            Library Settings & Preferences
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100 rounded-lg hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 border-b border-[#E5DFD3] dark:border-stone-800 bg-[#FAF7F2] dark:bg-[#141619] flex gap-2">
          <button
            onClick={() => setActiveTab('roles')}
            className={`px-4 py-2 text-xs font-serif font-bold tracking-wide rounded-t-lg transition-all border-b-2 ${
              activeTab === 'roles'
                ? 'bg-[#FAF7F2] dark:bg-[#16181C] text-amber-950 dark:text-amber-300 border-amber-800 dark:border-amber-400 shadow-xs'
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 border-transparent'
            }`}
          >
            Roles & Drawers ({roles.length})
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`px-4 py-2 text-xs font-serif font-bold tracking-wide rounded-t-lg transition-all border-b-2 ${
              activeTab === 'backup'
                ? 'bg-[#FAF7F2] dark:bg-[#16181C] text-amber-950 dark:text-amber-300 border-amber-800 dark:border-amber-400 shadow-xs'
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 border-transparent'
            }`}
          >
            Export & Import JSON
          </button>

          <button
            onClick={() => setActiveTab('theme')}
            className={`px-4 py-2 text-xs font-serif font-bold tracking-wide rounded-t-lg transition-all border-b-2 ${
              activeTab === 'theme'
                ? 'bg-[#FAF7F2] dark:bg-[#16181C] text-amber-950 dark:text-amber-300 border-amber-800 dark:border-amber-400 shadow-xs'
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 border-transparent'
            }`}
          >
            Theme & Appearance
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">

          {/* TAB 1: ROLES MANAGEMENT */}
          {activeTab === 'roles' && (
            <div className="space-y-6">
              
              {/* Add Role Form */}
              <form onSubmit={handleAddRole} className="p-4 bg-[#FFFDF9] dark:bg-[#1D2026] border border-[#E5DFD3] dark:border-stone-800 rounded-xl space-y-3">
                <h3 className="font-serif font-bold text-sm text-[#1A212D] dark:text-stone-100 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-amber-800 dark:text-amber-400" /> Add New Role Drawer
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    placeholder="Role Name (e.g. Finance, Designer)..."
                    className="p-2 text-xs bg-[#F8F5F0] dark:bg-[#121417] border border-[#E0D7C8] dark:border-stone-700 rounded-md focus:outline-none"
                    required
                  />
                  <input
                    type="text"
                    value={newRoleDesc}
                    onChange={(e) => setNewRoleDesc(e.target.value)}
                    placeholder="Brief description..."
                    className="p-2 text-xs bg-[#F8F5F0] dark:bg-[#121417] border border-[#E0D7C8] dark:border-stone-700 rounded-md focus:outline-none"
                  />
                </div>

                {/* Color Palette Picker */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-serif text-stone-500">Accent:</span>
                    {COLOR_OPTIONS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNewRoleColor(c)}
                        className={`w-5 h-5 rounded-full transition-transform ${
                          newRoleColor === c ? 'scale-125 ring-2 ring-stone-700 dark:ring-white' : ''
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold bg-[#8B263E] text-white dark:bg-amber-600 dark:text-stone-950 rounded-md hover:bg-[#721F32] transition-colors"
                  >
                    Add Role Drawer
                  </button>
                </div>
              </form>

              {/* Roles List */}
              <div className="space-y-2">
                <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  Existing Role Drawers
                </h4>
                {roles.map((r) => (
                  <div
                    key={r.id}
                    className="p-3 bg-[#FFFDF9] dark:bg-[#1D2026] border border-[#E5DFD3] dark:border-stone-800 rounded-xl flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: r.color_accent || '#3B82F6' }}
                      />
                      <div>
                        <h5 className="font-serif font-bold text-sm text-[#1A212D] dark:text-stone-100">
                          {r.name}
                        </h5>
                        {r.description && (
                          <p className="text-xs text-stone-500 dark:text-stone-400">{r.description}</p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteRole(r.id)}
                      className="p-1.5 text-stone-400 hover:text-red-600 dark:hover:text-red-400 rounded hover:bg-stone-200/50"
                      title="Delete Role Drawer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 2: EXPORT / IMPORT BACKUP */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              
              <div className="p-4 bg-[#FFFDF9] dark:bg-[#1D2026] border border-[#E5DFD3] dark:border-stone-800 rounded-xl space-y-3">
                <h3 className="font-serif font-bold text-sm text-[#1A212D] dark:text-stone-100 flex items-center gap-2">
                  <Download className="w-4 h-4 text-amber-800 dark:text-amber-400" /> Export Complete Library
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-400">
                  Download a complete backup of all {prompts.length} prompts, custom roles, tags, and version histories as a single self-contained JSON file.
                </p>
                <button
                  onClick={onExportJSON}
                  className="px-4 py-2 text-xs font-semibold bg-[#8B263E] text-white dark:bg-amber-600 dark:text-stone-950 rounded-lg shadow-sm hover:bg-[#721F32] transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download JSON Backup File
                </button>
              </div>

              {/* Import Section */}
              <div className="p-4 bg-[#FFFDF9] dark:bg-[#1D2026] border border-[#E5DFD3] dark:border-stone-800 rounded-xl space-y-3">
                <h3 className="font-serif font-bold text-sm text-[#1A212D] dark:text-stone-100 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-amber-800 dark:text-amber-400" /> Import Library JSON
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-400">
                  Restore or merge a previously saved JSON library file into PromptVault.
                </p>

                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="block w-full text-xs text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#8B263E] file:text-white dark:file:bg-amber-600 dark:file:text-stone-950 hover:file:bg-[#721F32]"
                />

                {importSuccess && (
                  <p className="text-xs text-emerald-600 font-semibold">{importSuccess}</p>
                )}
                {importError && <p className="text-xs text-red-600 font-semibold">{importError}</p>}
              </div>

              {/* Reset Defaults */}
              <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl space-y-3">
                <h3 className="font-serif font-bold text-sm text-red-800 dark:text-red-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Reset Library to Starter Defaults
                </h3>
                <p className="text-xs text-red-700 dark:text-red-300">
                  Replaces your active library with the original pre-populated starter library templates.
                </p>

                {showResetConfirm ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onResetDefaults();
                        setShowResetConfirm(false);
                      }}
                      className="px-3 py-1.5 text-xs font-bold bg-red-700 text-white rounded-md hover:bg-red-800"
                    >
                      Yes, Reset Library
                    </button>
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="px-3 py-1.5 text-xs bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-md"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="px-4 py-2 text-xs font-semibold bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-800 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" /> Reset to Starter Defaults
                  </button>
                )}
              </div>

            </div>
          )}

          {/* TAB 3: THEME PREFERENCES */}
          {activeTab === 'theme' && (
            <div className="space-y-4">
              <h3 className="font-serif font-bold text-sm text-[#1A212D] dark:text-stone-100">
                Visual Aesthetic & Palette
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    if (theme !== 'light') onToggleTheme();
                  }}
                  className={`p-4 rounded-xl border-2 text-left space-y-2 transition-all ${
                    theme === 'light'
                      ? 'border-[#8B263E] bg-[#FAF7F2] shadow-md'
                      : 'border-stone-300 bg-stone-100 opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-bold text-sm text-[#1A212D]">Classic Parchment & Ink</span>
                    {theme === 'light' && <Check className="w-4 h-4 text-[#8B263E]" />}
                  </div>
                  <p className="text-xs text-stone-600">
                    Warm parchment ivory canvas with rich oxblood accents & card-catalog index tabs.
                  </p>
                </button>

                <button
                  onClick={() => {
                    if (theme !== 'dark') onToggleTheme();
                  }}
                  className={`p-4 rounded-xl border-2 text-left space-y-2 transition-all ${
                    theme === 'dark'
                      ? 'border-amber-500 bg-[#16181C] text-stone-100 shadow-md'
                      : 'border-stone-700 bg-stone-900 text-stone-300 opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-bold text-sm">Charcoal & Warm Amber</span>
                    {theme === 'dark' && <Check className="w-4 h-4 text-amber-400" />}
                  </div>
                  <p className="text-xs text-stone-400">
                    Warm dark charcoal canvas with amber highlights & fine hairline borders.
                  </p>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
