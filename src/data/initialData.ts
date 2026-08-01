import { PromptItem, RoleItem } from '../types';

export const DEFAULT_ROLES: RoleItem[] = [
  {
    id: 'role-developer',
    name: 'Developer',
    description: 'Code reviews, SQL queries, architecture specs, and refactoring',
    color_accent: '#3B82F6', // Blue
    icon: 'Code2',
    sort_order: 1,
  },
  {
    id: 'role-assistant',
    name: 'Executive Assistant',
    description: 'Meeting summaries, email drafts, action items, and task breakdown',
    color_accent: '#10B981', // Emerald
    icon: 'Briefcase',
    sort_order: 2,
  },
  {
    id: 'role-marketer',
    name: 'Marketer & Copy',
    description: 'Landing pages, launch copy, headlines, and content outlines',
    color_accent: '#F59E0B', // Amber
    icon: 'Megaphone',
    sort_order: 3,
  },
  {
    id: 'role-researcher',
    name: 'Researcher',
    description: 'Paper synthesis, methodology review, competitor breakdown',
    color_accent: '#8B5CF6', // Purple
    icon: 'BookOpen',
    sort_order: 4,
  },
  {
    id: 'role-product',
    name: 'Product Manager',
    description: 'PRDs, user story mapping, acceptance criteria, & feature specs',
    color_accent: '#EC4899', // Pink
    icon: 'Compass',
    sort_order: 5,
  },
];

export const DEFAULT_PROMPTS: PromptItem[] = [
  {
    id: 'p-1',
    title: 'Senior React & TypeScript Code Reviewer',
    role_id: 'role-developer',
    tags: ['react', 'typescript', 'code-review', 'best-practices'],
    is_favorite: true,
    usage_count: 24,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    body: `You are a Principal Software Engineer specializing in React, TypeScript, and web performance. Review the provided code snippet against these strict criteria:

1. **Type Safety & Integrity**: No 'any' types, proper generic usage, strict null checking, precise props interface.
2. **Performance & Rendering**: Avoid unnecessary re-renders, correct hook dependencies, memoization where strictly necessary.
3. **Clean Code & Patterns**: Single responsibility principle, modular structure, semantic naming, readable logic.
4. **Security & Edge Cases**: Input sanitization, memory leak prevention, error handling.

Format output as:
- **Summary Verdict**: (1-2 sentences)
- **Critical Issues** (if any)
- **Refactored Code Block** (with clear line comments)
- **Key Takeaways & Anti-patterns Avoided**`,
    version_history: [
      {
        id: 'v1-1',
        title: 'Senior React Code Reviewer (v1)',
        body: `Review this React code for bugs, missing TypeScript types, and performance issues. Give refactored code.`,
        timestamp: new Date(Date.now() - 7 * 86400000).toISOString(),
        note: 'Initial draft',
      },
    ],
  },
  {
    id: 'p-2',
    title: 'PostgreSQL Query & Index Optimizer',
    role_id: 'role-developer',
    tags: ['database', 'postgres', 'sql', 'performance'],
    is_favorite: false,
    usage_count: 15,
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    body: `Act as a Database Administrator specializing in PostgreSQL query optimization. Examine the query provided below along with table schema descriptions.

Please perform:
1. **Execution Plan Analysis**: Estimate bottleneck causes (Seq Scan, join cost, missing indexes).
2. **Index Recommendations**: Suggest specific composite or partial indexes with exact SQL CREATE INDEX statements.
3. **Optimized SQL Query**: Rewrite the query using proper CTEs, window functions, or optimized JOIN clauses.
4. **Explain Analyze Guidance**: Provide the EXPLAIN (ANALYZE, BUFFERS) command to verify improvements.`,
    version_history: [],
  },
  {
    id: 'p-3',
    title: 'Executive Meeting Summary & Action Tracker',
    role_id: 'role-assistant',
    tags: ['meeting', 'summary', 'productivity', 'actions'],
    is_favorite: true,
    usage_count: 32,
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    body: `Synthesize the raw transcript or notes below into a concise Executive Summary for senior leadership:

### Structure:
1. **Executive Summary**: 3 bullet points summarizing the core objective and outcomes.
2. **Key Decisions Made**: Bulleted list of binding agreements.
3. **Action Items Table**:
   | Action Item | Owner | Deadline | Priority (High/Med/Low) |
4. **Open Risks & Next Steps**: Unresolved blockers requiring follow-up.

Tone: Professional, direct, actionable, zero filler phrases.`,
    version_history: [],
  },
  {
    id: 'p-4',
    title: 'SaaS High-Converting Hero Copy Generator',
    role_id: 'role-marketer',
    tags: ['copywriting', 'saas', 'hero-section', 'marketing'],
    is_favorite: true,
    usage_count: 18,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    body: `You are a direct-response conversion copywriter for high-growth SaaS products. Given the target audience and value proposition below, generate 3 high-converting Hero Section variations.

Each variation must include:
- **Eyebrow Tag**: (2-4 words target positioning)
- **Primary Headline**: (Punchy, outcome-focused, under 10 words, avoiding SaaS cliches like "supercharge")
- **Subheadline**: (Clarity-focused, explaining how it works and primary benefit in 2 sentences)
- **Primary Call to Action (CTA)**: (Action-oriented button label)
- **Secondary CTA**: (Low friction option, e.g., "Watch 2-min demo")
- **Social Proof Micro-copy**: (e.g., "Trusted by 5,000+ solo founders")`,
    version_history: [],
  },
  {
    id: 'p-5',
    title: 'Deep Research Paper Synthesizer & Auditor',
    role_id: 'role-researcher',
    tags: ['research', 'synthesis', 'academic', 'analysis'],
    is_favorite: false,
    usage_count: 9,
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    body: `Analyze the attached research text or excerpt as a rigorous academic peer reviewer.

Deconstruct the content across five key axes:
1. **Core Thesis & Novelty**: What is the primary contribution to the field?
2. **Methodological Rigor**: Evaluate experimental design, sample sizes, controls, and baseline comparisons.
3. **Key Empirical Results**: Summarize quantitative metrics and statistical significance.
4. **Limitations & Potential Bias**: Identify unstated assumptions, sampling limitations, or missing counter-arguments.
5. **Practical Implications**: How can these findings be applied in real-world engineering or product design?`,
    version_history: [],
  },
  {
    id: 'p-6',
    title: 'Product Requirement Document (PRD) Scaffold',
    role_id: 'role-product',
    tags: ['prd', 'product-spec', 'user-stories', 'agile'],
    is_favorite: false,
    usage_count: 14,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    body: `Draft a comprehensive, developer-ready Product Requirement Document (PRD) based on the feature description below:

1. **Problem Statement & Business Impact**: Why are we building this now? What metric does it move?
2. **Target User Persona & Pain Point**: Who needs this and why?
3. **Functional Scope**:
   - Must Have (In-scope for v1)
   - Out of Scope (Explicit non-goals)
4. **User Stories & Acceptance Criteria**:
   - Format: *As a [user], I want [action], so that [outcome].*
   - Acceptance criteria formatted as Given-When-Then testable statements.
5. **Technical Dependencies & Risks**: Data requirements, security/privacy considerations, edge cases.`,
    version_history: [],
  },
];
