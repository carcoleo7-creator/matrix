/**
 * Thin wrapper around the Anthropic Messages API.
 *
 * This module exists to ensure that every request sent to the API has
 * globally-unique `tool_use` IDs.  Duplicate IDs cause:
 *
 *   400 invalid_request_error — `tool_use` ids must be unique
 *
 * The wrapper automatically detects and remaps duplicate IDs before the
 * network call is made, so callers never need to manage IDs by hand.
 */

import { hasDuplicateToolUseIds, sanitizeMessages } from '../utils/messageUtils.js';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';

/**
 * Send a request to the Anthropic Messages API.
 *
 * Duplicate `tool_use` IDs in the `messages` array are automatically fixed
 * before the request is sent.  Everything else is forwarded as-is.
 *
 * @param {object}   params
 * @param {string}   params.apiKey      Anthropic API key (required)
 * @param {string}   params.model       Model ID, e.g. "claude-opus-4-6" (required)
 * @param {number}   params.maxTokens   Maximum tokens in the response (required)
 * @param {object[]} params.messages    Anthropic-format conversation history (required)
 * @param {object[]} [params.tools]     Tool definitions to make available to the model
 * @param {string}   [params.system]    System prompt
 * @returns {Promise<object>}           Parsed JSON response from the API
 * @throws {Error}                      On non-2xx responses or network failures
 *
 * @example
 * const response = await callClaude({
 *   apiKey: process.env.ANTHROPIC_API_KEY,
 *   model: 'claude-opus-4-6',
 *   maxTokens: 1024,
 *   messages: conversationHistory,
 *   tools: myTools,
 * });
 */
export async function callClaude({ apiKey, model, maxTokens, messages, tools, system }) {
  if (!apiKey)    throw new Error('callClaude: apiKey is required');
  if (!model)     throw new Error('callClaude: model is required');
  if (!maxTokens) throw new Error('callClaude: maxTokens is required');
  if (!Array.isArray(messages)) throw new Error('callClaude: messages must be an array');

  // --- Fix duplicate tool_use IDs before sending ---
  let safeMessages = messages;
  if (hasDuplicateToolUseIds(messages)) {
    const { messages: sanitised, remapped } = sanitizeMessages(messages);
    safeMessages = sanitised;
    // Surface remapping information in development so callers can fix the root cause
    if (process.env.NODE_ENV !== 'production' && remapped.size > 0) {
      console.warn(
        '[claudeApi] Duplicate tool_use IDs were found and automatically remapped.',
        'Fix the root cause to avoid silent data mutation.',
        Object.fromEntries(remapped)
      );
    }
  }

  // --- Build request body ---
  const body = {
    model,
    max_tokens: maxTokens,
    messages:   safeMessages,
  };
  if (Array.isArray(tools) && tools.length > 0) body.tools  = tools;
  if (system) body.system = system;

  // --- Send the request ---
  const response = await fetch(ANTHROPIC_API_URL, {
    method:  'POST',
    headers: {
      'Content-Type':      'application/json',
      'x-api-key':         apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let errorDetail;
    try {
      errorDetail = await response.json();
    } catch {
      errorDetail = await response.text().catch(() => '(unreadable body)');
    }
    throw new Error(`API Error: ${response.status} ${JSON.stringify(errorDetail)}`);
  }

  return response.json();
}
