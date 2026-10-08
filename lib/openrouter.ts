const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

/** Shared text model used for shot lists and TTS narration scripts. */
export const TEXT_MODEL = "meta-llama/llama-3.3-70b-instruct";

export type ChatMessage = { role: "system" | "user"; content: string };

export class MissingApiKeyError extends Error {
  constructor() {
    super(
      "OPENROUTER_API_KEY is not set. Add your OpenRouter key in the app's secrets to enable generation."
    );
    this.name = "MissingApiKeyError";
  }
}

/**
 * Single chat completion against OpenRouter. Throws MissingApiKeyError when the
 * key has not been provided, and an Error with the provider message otherwise.
 */
export async function callOpenRouter(
  messages: ChatMessage[],
  options: { temperature?: number; maxTokens?: number } = {}
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new MissingApiKeyError();

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: TEXT_MODEL,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2000,
      messages,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.error?.message || `OpenRouter request failed (${response.status})`
    );
  }

  return data?.choices?.[0]?.message?.content ?? "";
}

/** Pulls a JSON object/array out of a model reply, tolerating code fences. */
export function extractJson<T>(raw: string): T {
  const trimmed = raw.replace(/```json/gi, "```").trim();
  const fenced = trimmed.match(/```([\s\S]*?)```/);
  const candidate = (fenced ? fenced[1] : trimmed).trim();

  try {
    return JSON.parse(candidate) as T;
  } catch {
    const start = candidate.search(/[[{]/);
    const end = Math.max(candidate.lastIndexOf("}"), candidate.lastIndexOf("]"));
    if (start !== -1 && end > start) {
      return JSON.parse(candidate.slice(start, end + 1)) as T;
    }
    throw new Error("The model did not return valid JSON. Try again.");
  }
}
