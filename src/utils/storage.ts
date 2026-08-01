import { PromptItem, RoleItem } from '../types';
import { DEFAULT_PROMPTS, DEFAULT_ROLES } from '../data/initialData';

const STORAGE_KEY_PROMPTS = 'promptvault_prompts_v1';
const STORAGE_KEY_ROLES = 'promptvault_roles_v1';
const STORAGE_KEY_THEME = 'promptvault_theme_v1';

export function loadStoredPrompts(): PromptItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROMPTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse stored prompts:', e);
  }
  // Fallback to default prompts
  saveStoredPrompts(DEFAULT_PROMPTS);
  return DEFAULT_PROMPTS;
}

export function saveStoredPrompts(prompts: PromptItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_PROMPTS, JSON.stringify(prompts));
  } catch (e) {
    console.error('Failed to save prompts to localStorage:', e);
  }
}

export function loadStoredRoles(): RoleItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ROLES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse stored roles:', e);
  }
  saveStoredRoles(DEFAULT_ROLES);
  return DEFAULT_ROLES;
}

export function saveStoredRoles(roles: RoleItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_ROLES, JSON.stringify(roles));
  } catch (e) {
    console.error('Failed to save roles to localStorage:', e);
  }
}

export function loadStoredTheme(): 'light' | 'dark' {
  try {
    const theme = localStorage.getItem(STORAGE_KEY_THEME);
    if (theme === 'dark' || theme === 'light') return theme;
  } catch (e) {
    // ignore
  }
  return 'light'; // Default to warm parchment light theme per requirement
}

export function saveStoredTheme(theme: 'light' | 'dark'): void {
  try {
    localStorage.setItem(STORAGE_KEY_THEME, theme);
  } catch (e) {
    // ignore
  }
}

export function exportLibraryAsJSON(prompts: PromptItem[], roles: RoleItem[]): void {
  const exportData = {
    app: 'PromptVault',
    version: '1.0',
    exported_at: new Date().toISOString(),
    roles,
    prompts,
  };
  const jsonStr = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `PromptVault_Library_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importLibraryFromJSON(
  jsonText: string
): { prompts: PromptItem[]; roles: RoleItem[] } {
  const data = JSON.parse(jsonText);

  if (!data || typeof data !== 'object') {
    throw new Error('Invalid JSON format');
  }

  const importedPrompts: PromptItem[] = Array.isArray(data.prompts) ? data.prompts : [];
  const importedRoles: RoleItem[] = Array.isArray(data.roles) ? data.roles : [];

  if (importedPrompts.length === 0) {
    throw new Error('No valid prompts found in JSON file');
  }

  return {
    prompts: importedPrompts,
    roles: importedRoles.length > 0 ? importedRoles : DEFAULT_ROLES,
  };
}

export function resetLibraryToDefaults(): { prompts: PromptItem[]; roles: RoleItem[] } {
  saveStoredPrompts(DEFAULT_PROMPTS);
  saveStoredRoles(DEFAULT_ROLES);
  return { prompts: DEFAULT_PROMPTS, roles: DEFAULT_ROLES };
}
