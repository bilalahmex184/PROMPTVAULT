export interface PromptVersion {
  id: string;
  body: string;
  title: string;
  timestamp: string;
  note?: string;
}

export interface PromptItem {
  id: string;
  title: string;
  body: string;
  role_id: string;
  tags: string[];
  is_favorite: boolean;
  usage_count: number;
  version_history: PromptVersion[];
  created_at: string;
  updated_at: string;
}

export interface RoleItem {
  id: string;
  name: string;
  description?: string;
  color_accent?: string;
  icon?: string;
  sort_order: number;
}

export type ViewMode = 'grid' | 'list';

export type SortOption = 'recent' | 'most_used' | 'alphabetical' | 'favorites';

export interface AssistantSuggestMatch {
  promptId: string;
  score: number;
  reason: string;
}

export interface AssistantRefactorResult {
  tightened_prompt: string;
  rating: number;
  biggest_fix: string;
  changes: string[];
}
