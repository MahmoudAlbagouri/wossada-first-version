export interface Crumb {
  label: string;
  /** Omit for the current page. */
  to?: string;
}

export interface TableColumn {
  key: string;
  label: string;
  align?: 'start' | 'center' | 'end';
  width?: string;
  /** Hide on phones (each row becomes a labelled card there). */
  hideMobile?: boolean;
}

/** Home page content blocks managed in /admin/sliders-banners. */
export type HomeBlockType = 'mainSlider' | 'productSlider' | 'fixedBanner' | 'fullImage' | 'staticSection';
