import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  X,
  Search,
  Wand2,
  Copy,
  Check,
  Star,
  ThumbsUp,
  AlertCircle,
  RefreshCw,
  PlusCircle,
  Bot,
  Tag,
} from 'lucide-react';
import { PromptItem, AssistantSuggestMatch, AssistantRefactorResult } from '../types';

interface AssistantGenerateResult {
  title: string;
  body: string;
  tags?: string[];
  suggestedRole?: string;
  usageInstructions?: string;
}

interface AssistantPanelProps {
  isOpen: boolean;
  onClose: () => void;
  prompts: PromptItem[];
  onCopyPrompt: (prompt: PromptItem) => void;
  onUpdatePromptBody: (promptId: string, newBody: string) => void;
  onCreateNewPromptWithBody: (body: string, title?: string) => void;
  initialRefactorPrompt?: PromptItem | null;
}

export const AssistantPanel: React.FC<AssistantPanelProps> = ({
  isOpen,
  onClose,
  prompts,
  onCopyPrompt,
  onUpdatePromptBody,
  onCreateNewPromptWithBody,
  initialRefactorPrompt,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'generate' | 'refactor' | 'suggest'>('generate');
  const [providerInfo, setProviderInfo] = useState<{ llmProvider?: string; model?: string }>({});

  // Suggest Mode state
  const [suggestQuery, setSuggestQuery] = useState('');
  const [isSuggestLoading, setIsSuggestLoading] = useState(false);
  const [suggestMatches, setSuggestMatches] = useState<AssistantSuggestMatch[]>([]);
  const [suggestError, setSuggestError] = useState<string | null>(null);

  // Refactor Mode state
  const [refactorInput, setRefactorInput] = useState(initialRefactorPrompt?.body || '');
  const [refactorTitle, setRefactorTitle] = useState(initialRefactorPrompt?.title || '');
  const [activePromptId, setActivePromptId] = useState<string | null>(initialRefactorPrompt?.id || null);
  const [isRefactorLoading, setIsRefactorLoading] = useState(false);
  const [refactorResult, setRefactorResult] = useState<AssistantRefactorResult | null>(null);
  const [refactorError, setRefactorError] = useState<string | null>(null);
  const [copiedTightened, setCopiedTightened] = useState(false);

  // Generate Mode state
  const [generateTopic, setGenerateTopic] = useState('');
  const [generateRole, setGenerateRole] = useState('');
  const [generateDomain, setGenerateDomain] = useState('');
  const [isGenerateLoading, setIsGenerateLoading] = useState(false);
  const [generateResult, setGenerateResult] = useState<AssistantGenerateResult | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [copiedGenerated, setCopiedGenerated] = useState(false);

  // Fetch AI Health/Provider info
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setProviderInfo(data))
      .catch(() => {});
  }, []);

  // Trigger Suggest API
  const handleRunSuggest = async () => {
    if (!suggestQuery.trim()) return;
    setIsSuggestLoading(true);
    setSuggestError(null);
    try {
      const response = await fetch('/api/assistant/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userQuery: suggestQuery,
          prompts,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch prompt recommendations');
      }

      const data = await response.json();
      setSuggestMatches(data.matches || []);
    } catch (e: any) {
      setSuggestError(e.message || 'Error executing suggest');
    } finally {
      setIsSuggestLoading(false);
    }
  };

  // Trigger Refactor API
  const handleRunRefactor = async () => {
    if (!refactorInput.trim()) return;
    setIsRefactorLoading(true);
    setRefactorError(null);
    setRefactorResult(null);
    try {
      const response = await fetch('/api/assistant/refactor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptBody: refactorInput,
          promptTitle: refactorTitle,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to refactor prompt');
      }

      const data = await response.json();
      setRefactorResult(data);
    } catch (e: any) {
      setRefactorError(e.message || 'Error refactoring prompt');
    } finally {
      setIsRefactorLoading(false);
    }
  };

  // Trigger Generate API
  const handleRunGenerate = async () => {
    if (!generateTopic.trim()) return;
    setIsGenerateLoading(true);
    setGenerateError(null);
    setGenerateResult(null);
    try {
      const response = await fetch('/api/assistant/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: generateTopic,
          role: generateRole,
          domain: generateDomain,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate prompt');
      }

      const data = await response.json();
      setGenerateResult(data);
    } catch (e: any) {
      setGenerateError(e.message || 'Error generating prompt');
    } finally {
      setIsGenerateLoading(false);
    }
  };

  const handleCopyTightened = () => {
    if (!refactorResult?.tightened_prompt) return;
    navigator.clipboard.writeText(refactorResult.tightened_prompt);
    setCopiedTightened(true);
    setTimeout(() => setCopiedTightened(false), 2000);
  };

  const handleCopyGenerated = () => {
    if (!generateResult?.body) return;
    navigator.clipboard.writeText(generateResult.body);
    setCopiedGenerated(true);
    setTimeout(() => setCopiedGenerated(false), 2000);
  };

  return (
    <aside className="fixed inset-y-0 right-0 z-40 w-full sm:w-[520px] bg-white dark:bg-[#0B0F17] border-l border-slate-200/80 dark:border-slate-800/80 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-heading font-bold text-base text-slate-900 dark:text-slate-100">
                AI Prompt Studio
              </h2>
              {providerInfo.llmProvider && (
                <span className="px-2 py-0.5 text-[10px] font-mono font-medium rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                  <Bot className="w-3 h-3" />
                  {providerInfo.llmProvider.includes('OpenRouter') ? 'OpenRouter Llama-3.3' : 'Gemini AI'}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Generate, rewrite & search prompts with open models
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs Bar */}
      <div className="px-3 pt-3 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/30 flex gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('generate')}
          className={`px-3 py-2 text-xs font-heading font-bold tracking-wide rounded-t-xl transition-all border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'generate'
              ? 'bg-white dark:bg-[#0B0F17] text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400 shadow-xs'
              : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 border-transparent'
          }`}
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Write & Generate</span>
        </button>
        <button
          onClick={() => setActiveTab('refactor')}
          className={`px-3 py-2 text-xs font-heading font-bold tracking-wide rounded-t-xl transition-all border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'refactor'
              ? 'bg-white dark:bg-[#0B0F17] text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400 shadow-xs'
              : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 border-transparent'
          }`}
        >
          <Wand2 className="w-3.5 h-3.5" />
          <span>Rewrite & Polish</span>
        </button>
        <button
          onClick={() => setActiveTab('suggest')}
          className={`px-3 py-2 text-xs font-heading font-bold tracking-wide rounded-t-xl transition-all border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'suggest'
              ? 'bg-white dark:bg-[#0B0F17] text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400 shadow-xs'
              : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 border-transparent'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Find & Suggest</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* ================= TAB 1: WRITE & GENERATE ================= */}
        {activeTab === 'generate' && (
          <div className="space-y-4">
            <div className="bg-slate-50/60 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div>
                <label className="text-xs font-heading font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Prompt Goal or Topic: *
                </label>
                <textarea
                  value={generateTopic}
                  onChange={(e) => setGenerateTopic(e.target.value)}
                  placeholder="e.g., 'An expert code reviewer that audits React components for performance, accessibility, and clean code'..."
                  className="w-full mt-1.5 p-3 text-xs font-sans text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-heading font-semibold text-slate-500 dark:text-slate-400">
                    Target Persona / Role:
                  </label>
                  <input
                    type="text"
                    value={generateRole}
                    onChange={(e) => setGenerateRole(e.target.value)}
                    placeholder="e.g. Senior Frontend Architect"
                    className="w-full mt-1 p-2 text-xs bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-heading font-semibold text-slate-500 dark:text-slate-400">
                    Domain / Field:
                  </label>
                  <input
                    type="text"
                    value={generateDomain}
                    onChange={(e) => setGenerateDomain(e.target.value)}
                    placeholder="e.g. Web Development"
                    className="w-full mt-1 p-2 text-xs bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleRunGenerate}
                disabled={isGenerateLoading || !generateTopic.trim()}
                className="w-full py-2.5 px-4 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 text-white shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isGenerateLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Writing Prompt with AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Structured Prompt</span>
                  </>
                )}
              </motion.button>
            </div>

            {generateError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{generateError}</span>
              </div>
            )}

            {/* Generated Prompt Output */}
            {generateResult && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className="bg-slate-50/60 dark:bg-slate-900/40 p-4 rounded-2xl border border-indigo-200/80 dark:border-indigo-900/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading font-bold text-sm text-indigo-900 dark:text-indigo-200">
                      {generateResult.title}
                    </h3>
                    {generateResult.suggestedRole && (
                      <span className="px-2 py-0.5 text-[10px] font-heading font-semibold rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                        {generateResult.suggestedRole}
                      </span>
                    )}
                  </div>

                  {generateResult.tags && generateResult.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {generateResult.tags.map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 text-[10px] rounded-md bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center gap-1">
                          <Tag className="w-2.5 h-2.5" /> {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="p-3 bg-slate-900 text-indigo-200 font-mono text-xs rounded-xl whitespace-pre-wrap max-h-64 overflow-y-auto border border-slate-800">
                    {generateResult.body}
                  </div>

                  {generateResult.usageInstructions && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                      💡 {generateResult.usageInstructions}
                    </p>
                  )}

                  <div className="pt-2 flex items-center gap-2 justify-end">
                    <button
                      onClick={handleCopyGenerated}
                      className="px-3 py-1.5 text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl hover:bg-slate-300 transition-colors flex items-center gap-1"
                    >
                      {copiedGenerated ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      {copiedGenerated ? 'Copied' : 'Copy'}
                    </button>

                    <button
                      onClick={() => {
                        onCreateNewPromptWithBody(generateResult.body, generateResult.title);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 text-white dark:bg-indigo-500 rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-1 shadow-xs"
                    >
                      <PlusCircle className="w-3 h-3" /> Save to Library
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 1: SUGGEST ================= */}
        {activeTab === 'suggest' && (
          <div className="space-y-4">
            <div className="bg-slate-50/60 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
              <label className="text-xs font-heading font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Describe your objective:
              </label>
              <textarea
                value={suggestQuery}
                onChange={(e) => setSuggestQuery(e.target.value)}
                placeholder="e.g. 'I need a system prompt to conduct code reviews on Python backends'..."
                className="w-full p-3 text-xs font-sans text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none h-24"
              />
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleRunSuggest}
                disabled={isSuggestLoading || !suggestQuery.trim()}
                className="w-full py-2.5 px-4 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 text-white shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSuggestLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing Library Prompts...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    <span>Find Matching Saved Prompts</span>
                  </>
                )}
              </motion.button>
            </div>

            {suggestError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{suggestError}</span>
              </div>
            )}

            {/* Match Results */}
            {suggestMatches.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Recommended Prompts ({suggestMatches.length})
                </h3>

                {suggestMatches.map((match) => {
                  const targetPrompt = prompts.find((p) => p.id === match.promptId);
                  if (!targetPrompt) return null;

                  return (
                    <div
                      key={match.promptId}
                      className="bg-slate-50/60 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-slate-100">
                          {targetPrompt.title}
                        </h4>
                        <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          {match.score}% Match
                        </span>
                      </div>

                      <p className="text-xs text-indigo-700 dark:text-indigo-300 font-sans italic bg-indigo-50/60 dark:bg-indigo-950/40 p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-900/40">
                        "{match.reason}"
                      </p>

                      <p className="font-mono text-xs text-slate-600 dark:text-slate-400 line-clamp-3 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                        {targetPrompt.body}
                      </p>

                      <div className="pt-1 flex items-center justify-end">
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onCopyPrompt(targetPrompt)}
                          className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 text-white dark:bg-indigo-500 rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-1 shadow-xs"
                        >
                          <Copy className="w-3.5 h-3.5" /> Copy Prompt
                        </motion.button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: REFACTOR ================= */}
        {activeTab === 'refactor' && (
          <div className="space-y-4">
            <div className="bg-slate-50/60 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
              <label className="text-xs font-heading font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Paste or select prompt to optimize:
              </label>

              {/* Quick Prompt Select Dropdown */}
              <select
                onChange={(e) => {
                  const p = prompts.find((item) => item.id === e.target.value);
                  if (p) {
                    setRefactorInput(p.body);
                    setRefactorTitle(p.title);
                    setActivePromptId(p.id);
                  }
                }}
                className="w-full text-xs bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 font-medium focus:outline-none"
              >
                <option value="">-- Or choose from Library --</option>
                {prompts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>

              <textarea
                value={refactorInput}
                onChange={(e) => setRefactorInput(e.target.value)}
                placeholder="Paste raw, unformatted prompt here..."
                className="w-full p-3 text-xs font-mono text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none h-32"
              />

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleRunRefactor}
                disabled={isRefactorLoading || !refactorInput.trim()}
                className="w-full py-2.5 px-4 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 text-white shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isRefactorLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Refactoring & Grading Prompt...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Refactor & Grade Prompt</span>
                  </>
                )}
              </motion.button>
            </div>

            {refactorError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{refactorError}</span>
              </div>
            )}

            {/* Refactor Results */}
            {refactorResult && (
              <div className="space-y-4 animate-in fade-in duration-200">
                
                {/* Score Header Card */}
                <div className="bg-slate-50/60 dark:bg-slate-900/40 p-4 rounded-2xl border border-indigo-200/80 dark:border-indigo-900/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-heading font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Original Grade
                    </span>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold text-sm border border-amber-500/20">
                      <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                      <span>{refactorResult.rating} / 10</span>
                    </div>
                  </div>

                  {refactorResult.biggest_fix && (
                    <div className="p-2.5 bg-indigo-50/80 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-200">
                      <strong className="font-heading">Core Improvement:</strong> {refactorResult.biggest_fix}
                    </div>
                  )}
                </div>

                {/* What Changed */}
                {refactorResult.changes && refactorResult.changes.length > 0 && (
                  <div className="bg-slate-50/60 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2">
                    <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Key Refactoring Improvements:
                    </h4>
                    <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300 list-disc list-inside">
                      {refactorResult.changes.map((change, i) => (
                        <li key={i}>{change}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tightened Prompt Preview */}
                <div className="bg-slate-50/60 dark:bg-slate-900/40 p-4 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                      <ThumbsUp className="w-3.5 h-3.5" /> Refactored Version
                    </h4>

                    <button
                      onClick={handleCopyTightened}
                      className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-1"
                    >
                      {copiedTightened ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-3 bg-slate-900 text-emerald-300 font-mono text-xs rounded-xl whitespace-pre-wrap max-h-60 overflow-y-auto border border-slate-800">
                    {refactorResult.tightened_prompt}
                  </div>

                  <div className="pt-2 flex flex-wrap gap-2 justify-end">
                    {activePromptId && (
                      <button
                        onClick={() => {
                          onUpdatePromptBody(activePromptId, refactorResult.tightened_prompt);
                        }}
                        className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                      >
                        Update Current Prompt
                      </button>
                    )}

                    <button
                      onClick={() => {
                        onCreateNewPromptWithBody(
                          refactorResult.tightened_prompt,
                          refactorTitle ? `${refactorTitle} (Refactored)` : 'Refactored Prompt'
                        );
                      }}
                      className="px-3 py-1.5 text-xs font-semibold bg-slate-800 text-slate-100 dark:bg-slate-800 dark:text-slate-100 rounded-xl hover:bg-slate-900 transition-colors"
                    >
                      Save as New Prompt
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

      </div>
    </aside>
  );
};
