import type { LocationQuery, LocationQueryValue } from 'vue-router';

type Primitive = string | number | boolean;
type QueryInput = Record<string, Primitive | Primitive[] | null | undefined>;

/** Drops empty values and joins arrays with commas (API accepts `a,b`). */
export function toApiQuery(input: QueryInput): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value === null || value === undefined || value === '') continue;
    if (Array.isArray(value)) {
      if (value.length) out[key] = value.join(',');
      continue;
    }
    out[key] = value;
  }
  return out;
}

const first = (v: LocationQueryValue | LocationQueryValue[] | undefined): string | undefined =>
  (Array.isArray(v) ? v[0] : v) ?? undefined;

export function queryString(query: LocationQuery, key: string): string | undefined {
  return first(query[key]) || undefined;
}

export function queryNumber(query: LocationQuery, key: string): number | undefined {
  const raw = first(query[key]);
  if (raw === undefined || raw === '') return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

export function queryList(query: LocationQuery, key: string): string[] {
  const raw = query[key];
  const values = (Array.isArray(raw) ? raw : [raw]).filter((v): v is string => !!v);
  return values.flatMap((v) => v.split(',')).filter(Boolean);
}
