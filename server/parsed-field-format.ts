/**
 * Converts AI/JSON-shaped skills and education into plain text for storage and UI.
 */

function pickString(obj: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const v = obj[key];
    if (v != null && String(v).trim()) return String(v).trim();
  }
  return null;
}

function stripErroneousOuterWrapper(value: string): string {
  let t = value.trim();
  if (t.startsWith('{"') && t.endsWith('"}')) {
    const inner = t.slice(2, -2).trim();
    if (inner.startsWith("{") || inner.includes("degree")) {
      return inner.replace(/\\"/g, '"');
    }
  }
  if (t.startsWith("{") && t.endsWith("}") && t.length > 2) {
    const inner = t.slice(1, -1).trim();
    if (inner.startsWith('"') && inner.endsWith('"')) {
      return inner.slice(1, -1).replace(/\\"/g, '"');
    }
  }
  return t;
}

function extractEducationKeyValues(text: string): Record<string, string> | null {
  const pairs: Record<string, string> = {};
  const re = /"?([a-z_]+)"?\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    pairs[match[1]] = match[2].replace(/\\"/g, '"').trim();
  }
  return Object.keys(pairs).length > 0 ? pairs : null;
}

function tryParseLooseJson(value: string): unknown | undefined {
  const trimmed = stripErroneousOuterWrapper(value.trim());
  if (!trimmed) return undefined;

  const attempts = [
    trimmed,
    trimmed.replace(/\\"/g, '"'),
    trimmed.replace(/^\uFEFF/, ""),
  ];

  for (const candidate of attempts) {
    try {
      return JSON.parse(candidate);
    } catch {
      // continue
    }
  }

  const objectMatch = trimmed.match(/\{[\s\S]*\}/);
  if (objectMatch) {
    for (const snippet of [objectMatch[0], objectMatch[0].replace(/\\"/g, '"')]) {
      try {
        return JSON.parse(snippet);
      } catch {
        // continue
      }
    }
  }

  const arrayMatch = trimmed.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    for (const snippet of [arrayMatch[0], arrayMatch[0].replace(/\\"/g, '"')]) {
      try {
        return JSON.parse(snippet);
      } catch {
        // continue
      }
    }
  }

  return undefined;
}

function unwrapJsonLike(value: unknown, depth = 0): unknown {
  if (depth > 6) return value;
  if (typeof value !== "string") return value;

  const trimmed = value.trim();
  if (!trimmed) return value;

  const parsed = tryParseLooseJson(trimmed);
  if (parsed === undefined) return value;
  if (parsed === value) return value;
  return unwrapJsonLike(parsed, depth + 1);
}

function stripJsonDecorators(text: string): string {
  return text
    .trim()
    .replace(/^[\s{"'`]+/, "")
    .replace(/[\s}"'`]+$/, "")
    .replace(/\\"/g, '"')
    .trim();
}

function tokenizeSkillString(text: string): string[] {
  const quoted = [...text.matchAll(/"([^"]+)"/g)].map((m) => m[1].trim());
  if (quoted.length > 0) {
    return quoted.filter(Boolean);
  }

  const cleaned = stripJsonDecorators(text).replace(/^\[|\]$/g, "");
  return cleaned
    .split(/[,;|•\n\t]+/)
    .map((part) => stripJsonDecorators(part))
    .filter((part) => part.length > 0 && part.length < 80);
}

function collectSkillTokens(raw: unknown, depth = 0): string[] {
  if (raw == null || depth > 6) return [];

  const unwrapped = depth === 0 ? unwrapJsonLike(raw) : raw;

  if (typeof unwrapped === "string") {
    const text = unwrapped.trim();
    if (!text) return [];
    if (text.startsWith("{") || text.startsWith("[") || text.includes('","')) {
      const reparsed = unwrapJsonLike(text, depth + 1);
      if (reparsed !== text) return collectSkillTokens(reparsed, depth + 1);
    }
    return tokenizeSkillString(text);
  }

  if (Array.isArray(unwrapped)) {
    return unwrapped.flatMap((item) => collectSkillTokens(item, depth + 1));
  }

  if (typeof unwrapped === "object") {
    const obj = unwrapped as Record<string, unknown>;
    if (Array.isArray(obj.skills)) {
      return collectSkillTokens(obj.skills, depth + 1);
    }
    const values = Object.values(obj);
    if (values.every((v) => typeof v === "string" || typeof v === "number")) {
      return values.map((v) => String(v).trim()).filter(Boolean);
    }
    return values.flatMap((v) => collectSkillTokens(v, depth + 1));
  }

  return [];
}

function formatEducationObject(obj: Record<string, unknown>): string | null {
  const degree = pickString(obj, [
    "degree",
    "qualification",
    "degree_level",
    "course",
    "title",
    "name",
  ]);
  const field = pickString(obj, [
    "field_of_study",
    "field",
    "major",
    "specialization",
    "branch",
    "stream",
  ]);
  const institution = pickString(obj, [
    "institution",
    "college",
    "university",
    "school",
  ]);
  const year = pickString(obj, ["year", "graduation_year", "end_year", "passing_year"]);

  const parts: string[] = [];
  if (degree && field) {
    parts.push(`${degree} in ${field}`);
  } else if (degree) {
    parts.push(degree);
  } else if (field) {
    parts.push(field);
  }

  if (institution) parts.push(institution);
  if (year) parts.push(`(${year})`);

  return parts.length > 0 ? parts.join(", ") : null;
}

function collectEducationEntries(raw: unknown, depth = 0): string[] {
  if (raw == null || depth > 6) return [];

  const unwrapped = depth === 0 ? unwrapJsonLike(raw) : raw;

  if (typeof unwrapped === "string") {
    const text = unwrapped.trim();
    if (!text) return [];
    if (text.startsWith("{") || text.startsWith("[") || text.includes("\\\"")) {
      const reparsed = unwrapJsonLike(text, depth + 1);
      if (reparsed !== text) return collectEducationEntries(reparsed, depth + 1);
    }
    const kv = extractEducationKeyValues(text);
    if (kv) {
      const formatted = formatEducationObject(kv);
      if (formatted) return [formatted];
    }
    const plain = stripJsonDecorators(text);
    return plain && !plain.startsWith("{") && !plain.includes("field_of_study") ? [plain] : [];
  }

  if (Array.isArray(unwrapped)) {
    return unwrapped.flatMap((item) => collectEducationEntries(item, depth + 1));
  }

  if (typeof unwrapped === "object") {
    const obj = unwrapped as Record<string, unknown>;
    const formatted = formatEducationObject(obj);
    if (formatted) return [formatted];

    for (const key of Object.keys(obj)) {
      const fromKey = collectEducationEntries(key, depth + 1);
      if (fromKey.length > 0) return fromKey;
    }

    const values = Object.values(obj);
    const fromValues = values.flatMap((v) => collectEducationEntries(v, depth + 1));
    if (fromValues.length > 0) return fromValues;
  }

  return [];
}

export function normalizeParsedSkills(raw: unknown): string | null {
  const tokens = collectSkillTokens(raw);
  const seen = new Set<string>();
  const unique: string[] = [];

  for (const token of tokens) {
    const key = token.toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    unique.push(token);
  }

  return unique.length > 0 ? unique.join(", ") : null;
}

export function normalizeParsedEducation(raw: unknown): string | null {
  const entries = collectEducationEntries(raw);
  const seen = new Set<string>();
  const unique: string[] = [];

  for (const entry of entries) {
    const trimmed = entry.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(trimmed);
  }

  return unique.length > 0 ? unique.join(" · ") : null;
}
