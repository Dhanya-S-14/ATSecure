/**
 * Robust Gemini AI Client & Model Orchestration Layer
 * Handles multiple models (gemini-1.5-flash, gemini-2.0-flash, gemini-1.5-pro),
 * seamless fallback, key resolution, structured JSON extraction, and connection testing.
 */

export interface GeminiCallParams {
  prompt: string;
  systemInstruction?: string;
  jsonMode?: boolean;
  temperature?: number;
  maxTokens?: number;
  apiKey?: string;
  preferredModel?: string;
}

export interface GeminiCallResult<T = any> {
  success: boolean;
  text?: string;
  data?: T;
  modelUsed?: string;
  error?: string;
}

const SUPPORTED_GEMINI_MODELS = [
  'gemini-1.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-pro'
];

/**
 * Resolves the Gemini API Key from multiple potential sources
 */
export function resolveGeminiApiKey(customKey?: string, req?: Request): string {
  if (customKey && customKey.trim().length > 5) {
    return customKey.trim();
  }

  if (req) {
    const headerKey = req.headers.get('x-gemini-api-key') || req.headers.get('x-gemini-key');
    if (headerKey && headerKey.trim().length > 5) {
      return headerKey.trim();
    }

    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      if (token.length > 5 && !token.includes(' ')) {
        return token;
      }
    }
  }

  return (
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GOOGLE_GEMINI_API_KEY ||
    ''
  ).trim();
}

/**
 * Clean and parse JSON from LLM output (handles ```json fences or raw JSON)
 */
export function extractJsonFromLlmResponse<T = any>(rawText: string): T | null {
  if (!rawText) return null;
  const trimmed = rawText.trim();

  // Try direct parse first
  try {
    return JSON.parse(trimmed) as T;
  } catch {}

  // Strip markdown code fences if present
  const jsonFenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (jsonFenceMatch && jsonFenceMatch[1]) {
    try {
      return JSON.parse(jsonFenceMatch[1].trim()) as T;
    } catch {}
  }

  // Look for first '{' and last '}'
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1)) as T;
    } catch {}
  }

  // Look for first '[' and last ']'
  const firstBracket = trimmed.indexOf('[');
  const lastBracket = trimmed.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    try {
      return JSON.parse(trimmed.slice(firstBracket, lastBracket + 1)) as T;
    } catch {}
  }

  return null;
}

/**
 * Call Google Generative Language API with model fallback chain
 */
export async function callGeminiApi<T = any>(
  params: GeminiCallParams
): Promise<GeminiCallResult<T>> {
  const {
    prompt,
    systemInstruction,
    jsonMode = false,
    temperature = 0.4,
    maxTokens = 2048,
    apiKey,
    preferredModel
  } = params;

  if (!apiKey) {
    return {
      success: false,
      error: 'No Gemini API key provided. Set GEMINI_API_KEY in .env or provide it in Settings.'
    };
  }

  const modelsToTry = preferredModel
    ? [preferredModel, ...SUPPORTED_GEMINI_MODELS.filter(m => m !== preferredModel)]
    : SUPPORTED_GEMINI_MODELS;

  let lastError = 'Failed to generate response with Gemini API';

  for (const model of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const requestBody: any = {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens
        }
      };

      if (systemInstruction) {
        requestBody.systemInstruction = {
          parts: [{ text: systemInstruction }]
        };
      }

      if (jsonMode) {
        requestBody.generationConfig.responseMimeType = 'application/json';
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        const errMsg = errorData?.error?.message || `HTTP ${res.status}: ${res.statusText}`;
        lastError = `Model ${model} error: ${errMsg}`;

        // If rate limited or quota exceeded, or key invalid, don't keep trying models if key is invalid
        if (res.status === 400 && errMsg.toLowerCase().includes('api_key_invalid')) {
          return { success: false, error: 'Invalid Gemini API key. Please check your key in Settings.' };
        }
        continue;
      }

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        lastError = `Empty response received from ${model}`;
        continue;
      }

      if (jsonMode) {
        const parsed = extractJsonFromLlmResponse<T>(text);
        if (parsed !== null) {
          return {
            success: true,
            text,
            data: parsed,
            modelUsed: model
          };
        }
      }

      return {
        success: true,
        text,
        modelUsed: model
      };
    } catch (err: any) {
      lastError = err?.message || String(err);
    }
  }

  return {
    success: false,
    error: lastError
  };
}

/**
 * Ping Gemini API to test if the key is valid and check latency
 */
export async function testGeminiApiKey(apiKey: string): Promise<{
  valid: boolean;
  model?: string;
  latencyMs?: number;
  error?: string;
}> {
  if (!apiKey || apiKey.trim().length < 5) {
    return { valid: false, error: 'Gemini API key is empty or too short.' };
  }

  const startTime = Date.now();
  const result = await callGeminiApi({
    apiKey: apiKey.trim(),
    prompt: 'Respond with the word "PONG" only.',
    temperature: 0.1,
    maxTokens: 10
  });

  const latencyMs = Date.now() - startTime;

  if (result.success && result.text) {
    return {
      valid: true,
      model: result.modelUsed,
      latencyMs
    };
  }

  return {
    valid: false,
    error: result.error || 'Gemini API failed to respond.'
  };
}

/**
 * Client-side helper to read saved Gemini API key from localStorage
 */
export function getClientGeminiApiKey(): string {
  if (typeof window === 'undefined') return '';
  try {
    return (
      localStorage.getItem('GEMINI_API_KEY') ||
      localStorage.getItem('AI_API_KEY') ||
      ''
    );
  } catch {
    return '';
  }
}

