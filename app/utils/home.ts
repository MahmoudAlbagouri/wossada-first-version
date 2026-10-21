import type { HomeSection } from '~/types/models';

/**
 * Sections that actually have content. A section whose data is missing or
 * malformed (e.g. from an older API) is skipped instead of breaking the page.
 */
export function renderableHomeSections(sections: unknown): HomeSection[] {
  if (!Array.isArray(sections)) return [];
  return sections.filter(
    (section): section is HomeSection => Array.isArray(section?.data) && section.data.length > 0,
  );
}
