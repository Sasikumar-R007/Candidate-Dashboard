/**
 * Normalizes AI / JSON / Postgres-array education values into readable plain text.
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

/** Postgres text[] literal: {"elem1","elem2"} */
function parsePostgresTextArray(text: string): string[] | null {
  const t = text.trim();
  if (!t.startsWith("{") || !t.endsWith("}")) return null;

  const inner = t.slice(1, -1);
  if (!inner.trim()) return [];

  const items: string[] = [];
  let i = 0;

  while (i < inner.length) {
    while (i < inner.length && /[\s,]/.test(inner[i])) i++;
    if (i >= inner.length) break;

    if (inner[i] === '"') {
      i++;
      let buf = "";
      while (i < inner.length) {
        const c = inner[i];
        if (c === "\\" && i + 1 < inner.length) {
          buf += inner[i + 1];
          i += 2;
          continue;
        }
        if (c === '"') {
          items.push(buf);
          i++;
          break;
        }
        buf += c;
        i++;
      }
      continue;
    }

    let j = i;
    while (j < inner.length && inner[j] !== ",") j++;
    items.push(inner.slice(i, j).trim());
    i = j;
  }

  return items;
}

function extractMultipleEducationObjects(text: string): string[] {
  const results: string[] = [];
  const regex = /\{(?:[^{}]|\\.)*\}/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    if (/degree/i.test(match[0])) {
      results.push(match[0]);
    }
  }
  return results;
}

function formatEducationObject(obj: Record<string, unknown>): string | null {
  const degree = pickString(obj, [
    "degree",
    "qualification",
    "degree_level",
    "degreeLevel",
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
    "collegeName",
    "school",
  ]);
  const year = pickString(obj, ["year", "graduation_year", "end_year", "passing_year", "yearOfCompletion"]);

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

    const pgArray = parsePostgresTextArray(text);
    if (pgArray && pgArray.length > 0 && pgArray.some((item) => /degree/i.test(item))) {
      return pgArray.flatMap((item) => collectEducationEntries(item, depth + 1));
    }

    if (text.includes("degree") && (text.includes("{") || text.includes("\\"))) {
      const chunks = extractMultipleEducationObjects(text);
      if (chunks.length > 1) {
        return chunks.flatMap((chunk) => collectEducationEntries(chunk, depth + 1));
      }
    }

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

    const values = Object.values(obj);
    const fromValues = values.flatMap((v) => collectEducationEntries(v, depth + 1));
    if (fromValues.length > 0) return fromValues;
  }

  return [];
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

/** Human-readable education for UI (handles legacy malformed DB values). */
export function formatEducationDisplay(
  education?: string | null,
  highestQualification?: string | null,
  collegeName?: string | null,
): string {
  const normalized =
    normalizeParsedEducation(education) ||
    normalizeParsedEducation(highestQualification) ||
    null;

  if (normalized) return normalized;

  const parts = [education, highestQualification, collegeName]
    .map((p) => (p && String(p).trim()) || "")
    .filter(Boolean);
  const unique = [...new Set(parts)];
  return unique.length > 0 ? unique.join(" · ") : "Not Available";
}

/** Best institution label for university / college fields. */
export function extractPrimaryInstitution(raw: unknown): string | null {
  const unwrapped = unwrapJsonLike(raw);
  const entries: Record<string, unknown>[] = [];

  const collectObjects = (value: unknown, depth = 0): void => {
    if (depth > 6 || value == null) return;
    const next = unwrapJsonLike(value);
    if (Array.isArray(next)) {
      next.forEach((item) => collectObjects(item, depth + 1));
      return;
    }
    if (typeof next === "object") {
      entries.push(next as Record<string, unknown>);
      Object.values(next as Record<string, unknown>).forEach((v) => collectObjects(v, depth + 1));
      return;
    }
    if (typeof next === "string") {
      const pg = parsePostgresTextArray(next);
      if (pg) {
        pg.forEach((item) => collectObjects(item, depth + 1));
        return;
      }
      extractMultipleEducationObjects(next).forEach((chunk) => collectObjects(chunk, depth + 1));
    }
  };

  collectObjects(unwrapped);

  for (const obj of entries) {
    const inst = pickString(obj, ["institution", "college", "university", "collegeName", "school"]);
    if (inst) return inst;
  }
  return null;
}
