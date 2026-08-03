import express from 'express';
import { GoogleGenAI } from '@google/genai';

// ---------------------------------------------------------------------------
// This file contains ONLY the Express app + routes + the callLLM helper.
// It has no app.listen() and no Vite dev-middleware wiring, so the exact
// same app object can be:
//   - imported by server.ts for local dev (which adds Vite + listen), and
//   - imported by api/[...slug].ts for Vercel (which wraps it with
//     serverless-http instead of listening on a port).
// ---------------------------------------------------------------------------

export const app = express();

app.use(express.json({ limit: '5mb' }));

// Unified LLM Invocation Helper (Supports OpenRouter open-source models & Gemini)
async function callLLM({
  systemInstruction,
  promptText,
}: {
  systemInstruction: string;
  promptText: string;
}): Promise<string> {
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const modelName = process.env.OPENROUTER_MODEL || 'deepseek/deepseek-chat';

  if (openrouterKey && openrouterKey.trim() !== '') {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openrouterKey.trim()}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.APP_URL || 'https://ai.studio',
        'X-Title': 'PromptVault',
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: promptText },
        ],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenRouter Error (${response.status}):`, errorText);
      throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  // Fallback to Gemini if OpenRouter key is not set
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Neither OPENROUTER_API_KEY nor GEMINI_API_KEY environment variable is configured.');
  }
  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
  });

  const response = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: promptText,
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
    },
  });

  return response.text || '';
}

function parseJSONFromResponse(raw: string): any {
  if (!raw || typeof raw !== 'string') return {};
  let cleaned = raw.trim();

  // Strip markdown codeblocks
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    const jsonMatch = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (innerErr) {
        console.error('Failed to parse extracted JSON match:', innerErr);
      }
    }
    console.error('Raw string failed JSON parsing:', raw);
    throw new Error('LLM output was not valid JSON format.');
  }
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    llmProvider: process.env.OPENROUTER_API_KEY ? 'OpenRouter (Open-Source)' : 'Gemini AI',
    model: process.env.OPENROUTER_API_KEY
      ? (process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct')
      : 'gemini-3.6-flash',
  });
});

// Assistant: Suggest Prompts
app.post('/api/assistant/suggest', async (req, res) => {
  try {
    const { userQuery, prompts } = req.body;

    if (!userQuery || typeof userQuery !== 'string') {
      return res.status(400).json({ error: 'userQuery string is required' });
    }

    if (!Array.isArray(prompts) || prompts.length === 0) {
      return res.json({ matches: [] });
    }

    const trimmedPrompts = prompts.slice(0, 40).map((p: any) => ({
      id: p.id,
      title: p.title,
      role: p.roleName || 'General',
      tags: p.tags || [],
      snippet: p.body.substring(0, 300),
    }));

    const promptText = `User is looking for a prompt to solve this intent: "${userQuery}".

Here is the library of saved prompts:
${JSON.stringify(trimmedPrompts, null, 2)}

Identify up to 3 best matching prompts. For each match, provide:
- promptId (matching the id from library)
- score (percentage match 0-100)
- reason (a single concise, crisp sentence explaining why this prompt fits the user's need)

Return a JSON object with key "matches" containing array of matching objects. Example:
{ "matches": [ { "promptId": "...", "score": 95, "reason": "..." } ] }`;

    const rawOutput = await callLLM({
      systemInstruction:
        'You are an expert Prompt Engineering Curator. Analyze prompt intents and accurately match user requests to saved prompt templates. Respond ONLY in valid JSON.',
      promptText,
    });

    const parsed = parseJSONFromResponse(rawOutput);
    const matches = parsed.matches || (Array.isArray(parsed) ? parsed : []);
    return res.json({ matches });
  } catch (error: any) {
    console.error('Error in /api/assistant/suggest:', error);
    return res.status(500).json({
      error: error.message || 'Failed to analyze prompt suggestions',
    });
  }
});

// Assistant: Refactor & Rewrite Prompt
app.post('/api/assistant/refactor', async (req, res) => {
  try {
    const { promptBody, promptTitle } = req.body;

    if (!promptBody || typeof promptBody !== 'string') {
      return res.status(400).json({ error: 'promptBody string is required' });
    }

    const promptText = `Refactor and tighten the following prompt:
Title: "${promptTitle || 'Untitled Prompt'}"

Original Prompt:
\`\`\`
${promptBody}
\`\`\`

Instructions:
1. Rewrite the prompt into a clear, highly effective, structured, and unambiguous version. Use role framing, clear delimiters, step-by-step instructions, and expected output format where appropriate.
2. Calculate a Quality Rating score from 1 to 10 for the ORIGINAL prompt.
3. Identify the SINGLE BIGGEST thing to fix in the original prompt.
4. List 3 to 5 concise bullet points explaining what was improved and why (clarity, specificity, structure, removed redundancy, formatting).

Return a JSON object with exact structure:
{
  "tightened_prompt": "string",
  "rating": 8,
  "biggest_fix": "string",
  "changes": ["string", "string"]
}`;

    const rawOutput = await callLLM({
      systemInstruction:
        'You are a master Prompt Engineer specializing in prompt optimization, LLM instruction tuning, clarity, and structural formatting. Respond ONLY in valid JSON format.',
      promptText,
    });

    const result = parseJSONFromResponse(rawOutput);
    return res.json(result);
  } catch (error: any) {
    console.error('Error in /api/assistant/refactor:', error);
    return res.status(500).json({
      error: error.message || 'Failed to refactor prompt',
    });
  }
});

// Assistant: Generate Brand New Prompt
app.post('/api/assistant/generate', async (req, res) => {
  try {
    const { topic, role, domain } = req.body;

    if (!topic || typeof topic !== 'string') {
      return res.status(400).json({ error: 'topic string is required' });
    }

    const promptText = `Write a high-performance, structured system prompt from scratch for the following goal:
Topic/Goal: "${topic}"
Role Context: "${role || 'AI Specialist'}"
Domain/Field: "${domain || 'General'}"

Instructions:
1. Create a professional, catchy prompt Title.
2. Write a comprehensive, production-ready Prompt Body containing persona definition, context, clear instructions, output formatting, and placeholder variables like {{VARIABLE_NAME}}.
3. Suggest 3 to 5 relevant tags.
4. Suggest a suitable Role Category name.

Return a JSON object with exact structure:
{
  "title": "string",
  "body": "string",
  "tags": ["string"],
  "suggestedRole": "string",
  "usageInstructions": "string"
}`;

    const rawOutput = await callLLM({
      systemInstruction:
        'You are an expert AI Systems Prompt Architect. You write high-precision system prompts for LLMs using professional prompt engineering principles. Respond ONLY in valid JSON format.',
      promptText,
    });

    const result = parseJSONFromResponse(rawOutput);
    return res.json(result);
  } catch (error: any) {
    console.error('Error in /api/assistant/generate:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate prompt',
    });
  }
});
