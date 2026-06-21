// ============================================================
// autosuggest.js — TWO engines:
// 1. customAutosuggest()  -> my own prefix-search implementation
// 2. bootcampAutosuggest() -> calls the bootcamp-provided shared API
// ============================================================

const BOOTCAMP_API_BASE = "https://autosuggest-backend.onrender.com";

/**
 * MY OWN AUTOSUGGEST ENGINE
 * A simple but real prefix-matching search I built myself over the
 * SKILLS_DATASET. Matches case-insensitively, prioritizes results
 * where the prefix matches the start of the word.
 */
function customAutosuggest(query, limit = 6) {
  if (!query || query.trim().length === 0) return [];

  const q = query.trim().toLowerCase();

  const startsWith = [];
  const contains = [];

  for (const item of SKILLS_DATASET) {
    const name = item.name.toLowerCase();
    if (name.startsWith(q)) {
      startsWith.push(item);
    } else if (name.includes(q)) {
      contains.push(item);
    }
  }

  // Prefix matches ranked above "contains" matches
  return [...startsWith, ...contains].slice(0, limit);
}

/**
 * BOOTCAMP API ENGINE
 * Calls the shared multi-algorithm AutoSuggest API provided in the bootcamp.
 * Falls back to an empty array on any failure (network, CORS, etc.)
 * so the UI never breaks even if the shared API is down or rate-limited.
 */
async function bootcampAutosuggest(query, limit = 6) {
  if (!query || query.trim().length === 0) return [];

  try {
    const url = `${BOOTCAMP_API_BASE}/api/autosuggest?prefix=${encodeURIComponent(query.trim())}`;
    const res = await fetch(url);

    if (!res.ok) throw new Error(`Bootcamp API responded ${res.status}`);

    const data = await res.json();

    // Normalize whatever shape comes back into { name, category } objects
    // so the rest of the UI doesn't need to care which engine ran.
    let suggestions = [];
    if (Array.isArray(data)) {
      suggestions = data;
    } else if (Array.isArray(data.suggestions)) {
      suggestions = data.suggestions;
    } else if (Array.isArray(data.results)) {
      suggestions = data.results;
    }

    return suggestions.slice(0, limit).map((s) => ({
      name: typeof s === "string" ? s : (s.name || s.word || s.phrase || String(s)),
      category: "Bootcamp API",
    }));
  } catch (err) {
    console.warn("Bootcamp API unavailable, returning no results:", err.message);
    return [];
  }
}

/**
 * Unified entry point — picks the engine based on current UI toggle state.
 */
async function getSuggestions(query, engine) {
  if (engine === "bootcamp") {
    const results = await bootcampAutosuggest(query);
    // If the bootcamp API fails/returns nothing, gracefully fall back
    // to the custom engine so the user always gets a usable result.
    if (results.length === 0) {
      return customAutosuggest(query);
    }
    return results;
  }
  return customAutosuggest(query);
}
