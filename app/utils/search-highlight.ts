/**
 * Marks the words of a search inside a text, comparing the way the API
 * searches (see its `search.util.ts`): hamza forms, ة/ه, ى/ي, tashkeel,
 * tatweel and the article "ال" don't matter.
 */
const TASHKEEL_AND_TATWEEL = String.fromCharCode(0x064b, 0x064c, 0x064d, 0x064e, 0x064f, 0x0650, 0x0651, 0x0652, 0x0670, 0x0640);
const FROM = 'أإآٱةىؤئ٠١٢٣٤٥٦٧٨٩' + TASHKEEL_AND_TATWEEL;
const TO = 'ااااهيوي0123456789';
const CHAR_MAP = new Map([...FROM].map((char, i) => [char, TO[i] ?? '']));

const normalizeChar = (char: string) => {
  const lower = char.toLowerCase();
  return CHAR_MAP.get(lower) ?? lower;
};

export interface TextPart {
  text: string;
  match: boolean;
}

function searchWords(query: string): string[] {
  const normalized = [...query].map(normalizeChar).join('').replace(/(^|\s)ال(\S{3,})/g, '$1$2');
  const words = normalized.split(/\s+/).filter(Boolean);
  const meaningful = words.filter((word) => word.length > 1);
  return [...new Set(meaningful.length ? meaningful : words)];
}

export function highlightParts(text: string, query: string): TextPart[] {
  const words = searchWords(query);
  if (!text || !words.length) return [{ text, match: false }];

  // The normalized text, and for each of its characters the index it came from.
  let normalized = '';
  const source: number[] = [];
  for (let i = 0; i < text.length; i++) {
    for (const char of normalizeChar(text[i]!)) {
      normalized += char;
      source.push(i);
    }
  }

  const marked = new Array<boolean>(text.length).fill(false);
  for (const word of words) {
    for (let at = normalized.indexOf(word); at !== -1; at = normalized.indexOf(word, at + word.length)) {
      let end = source[at + word.length - 1]!;
      // Keep trailing tashkeel with its letter.
      while (end + 1 < text.length && normalizeChar(text[end + 1]!) === '') end++;
      for (let i = source[at]!; i <= end; i++) marked[i] = true;
    }
  }

  const parts: TextPart[] = [];
  for (let i = 0; i < text.length; i++) {
    const last = parts.at(-1);
    if (last && last.match === marked[i]) last.text += text[i];
    else parts.push({ text: text[i]!, match: marked[i]! });
  }
  return parts;
}
