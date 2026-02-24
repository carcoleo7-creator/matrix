/**
 * Utilities for managing Anthropic API message arrays.
 *
 * The Anthropic Messages API requires every `tool_use` block across the entire
 * `messages` array to carry a globally-unique `id`.  Duplicate IDs produce:
 *
 *   400 invalid_request_error — messages.N.content.M: `tool_use` ids must be unique
 *
 * These helpers detect and automatically fix that condition before a request
 * is sent so callers never have to handle the error manually.
 */

/**
 * Generate a random, Anthropic-compatible tool_use ID.
 *
 * Anthropic IDs are conventionally "toolu_" followed by alphanumeric chars.
 * Using crypto.randomUUID() (available in all modern browsers and Node ≥ 14.17)
 * guarantees collision-free IDs.
 *
 * @returns {string}  e.g. "toolu_01a2b3c4d5e6f7a8b9c0d1e2"
 */
export function generateToolUseId() {
  return 'toolu_' + crypto.randomUUID().replace(/-/g, '').slice(0, 24);
}

/**
 * Collect all tool_use IDs found in a messages array, in document order.
 *
 * @param {object[]} messages  Anthropic-format message objects
 * @returns {string[]}         Ordered list of tool_use ids (may contain duplicates)
 */
export function collectToolUseIds(messages) {
  const ids = [];
  for (const message of messages) {
    const content = Array.isArray(message.content) ? message.content : [];
    for (const block of content) {
      if (block.type === 'tool_use' && block.id) {
        ids.push(block.id);
      }
    }
  }
  return ids;
}

/**
 * Return true if any tool_use ID appears more than once in the messages array.
 *
 * @param {object[]} messages  Anthropic-format message objects
 * @returns {boolean}
 */
export function hasDuplicateToolUseIds(messages) {
  const ids = collectToolUseIds(messages);
  return ids.length !== new Set(ids).size;
}

/**
 * Deep-clone the messages array and assign fresh IDs to any duplicate
 * `tool_use` blocks, keeping matching `tool_result.tool_use_id` references
 * in sync.
 *
 * Non-duplicate IDs are left untouched so existing references remain valid.
 *
 * @param {object[]} messages  Anthropic-format message objects (not mutated)
 * @returns {{ messages: object[], remapped: Map<string, string> }}
 *   `messages`  — sanitised deep-clone ready to send to the API
 *   `remapped`  — Map of oldId → newId for any IDs that were replaced
 *                 (useful for debugging; empty when no duplicates were found)
 */
export function sanitizeMessages(messages) {
  const cloned = structuredClone(messages);
  const seen = new Set();
  const remapped = new Map();

  // First pass: fix duplicate tool_use IDs
  for (const message of cloned) {
    const content = Array.isArray(message.content) ? message.content : [];
    for (const block of content) {
      if (block.type === 'tool_use' && block.id) {
        if (seen.has(block.id)) {
          const newId = generateToolUseId();
          remapped.set(block.id, newId);
          block.id = newId;
        } else {
          seen.add(block.id);
        }
      }
    }
  }

  // Second pass: update tool_result references that pointed to a replaced id
  if (remapped.size > 0) {
    for (const message of cloned) {
      const content = Array.isArray(message.content) ? message.content : [];
      for (const block of content) {
        if (block.type === 'tool_result' && remapped.has(block.tool_use_id)) {
          block.tool_use_id = remapped.get(block.tool_use_id);
        }
      }
    }
  }

  return { messages: cloned, remapped };
}

/**
 * Assert that the messages array contains no duplicate tool_use IDs.
 * Throws an Error with a descriptive message if a duplicate is found.
 *
 * Use this as a guard after sanitizeMessages() to catch any logic errors
 * in the sanitizer itself during development / testing.
 *
 * @param {object[]} messages  Anthropic-format message objects
 * @throws {Error}  if duplicate IDs are present
 */
export function validateMessages(messages) {
  const ids = collectToolUseIds(messages);
  const seen = new Set();
  for (const id of ids) {
    if (seen.has(id)) {
      throw new Error(
        `Duplicate tool_use id detected after sanitisation: "${id}". ` +
        'This is a bug in the sanitizer — please report it.'
      );
    }
    seen.add(id);
  }
}
