import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

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
    // Attempt regex extraction for json object or array
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

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    llmProvider: process.env.OPENROUTER_API_KEY ? 'OpenRouter (Open-Source)' : 'Gemini AI',
    model: process.env.OPENROUTER_API_KEY ? (process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct') : 'gemini-3.6-flash',
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

    // Limit prompts sent to model for efficiency
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
      systemInstruction: 'You are an expert Prompt Engineering Curator. Analyze prompt intents and accurately match user requests to saved prompt templates. Respond ONLY in valid JSON.',
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
      systemInstruction: 'You are a master Prompt Engineer specializing in prompt optimization, LLM instruction tuning, clarity, and structural formatting. Respond ONLY in valid JSON format.',
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
      systemInstruction: 'You are an expert AI Systems Prompt Architect. You write high-precision system prompts for LLMs using professional prompt engineering principles. Respond ONLY in valid JSON format.',
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

// Custom AI route using OpenRouter DeepSeek free model
app.post('/api/ai', async (req, res) => {
  try {
    const { prompt } = req.body || {};

    const openrouterKey = process.env.OPENROUTER_API_KEY;
    const modelName = process.env.OPENROUTER_MODEL || "deepseek/deepseek-chat-v3-0324:free";

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openrouterKey || ''}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.APP_URL || "https://your-app.vercel.app",
        "X-Title": "AI App",
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          {
            role: "user",
            content: prompt || "Hello"
          }
        ],
        temperature: 0,
        max_tokens: 800
      }),
    });

    const data = await response.json();
    console.log("OPENROUTER RESPONSE:", data);

    return res.json({
      output: data?.choices?.[0]?.message?.content || "No response",
      data
    });
  } catch (error: any) {
    console.error("ERROR in /api/ai:", error);
    return res.status(500).json({
      error: "Something went wrong",
      details: error.message
    });
  }
});

// Server boot with Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PromptVault Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
