# Storefront & admin (Nuxt 4)

Arabic-first (RTL) furniture store with an English version and a back office,
built on Nuxt 4 + TypeScript (strict) and the NestJS API in
`back-end/ecommerce-api`.

## Quick start

```bash
cp .env.example .env      # point NUXT_PUBLIC_API_BASE at the API
npm install
npm run dev               # http://localhost:3000
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server with HMR |
| `npm run build` / `node .output/server/index.mjs` | Production build / run it |
| `npm run typecheck` | `vue-tsc` over the whole app (strict mode) |

`NUXT_PUBLIC_API_BASE` and `NUXT_PUBLIC_SITE_URL` are read at build time for
image domains and the sitemap, so set them before `npm run build` as well as at
runtime.

## Structure

```
app/
  assets/css/     design tokens, base, utilities, motion (no CSS framework)
  components/
    ui/           design system: BaseButton, BaseInput, BaseModal, BaseDrawer,
                  BaseImage, BasePagination, ToastHost, ConfirmHost, ...
    layout/       header, mega menu, search, mobile menu & tab bar, footer
    product/      card, grid, carousel, gallery, variant picker, filters,
                  CatalogView (shared by /products and /category/:slug)
    home/         hero slider, category grid, banners, features, HomeSections
    account/ auth/ admin/ info/
  composables/    useForm + useValidators, useAdminCrud, useCatalogQuery,
                  usePageSeo/useJsonLd, useToast, useConfirm, useScroller, ...
  services/       the only place that knows API URLs (catalog, shop, auth, admin)
  stores/         Pinia: auth (cookies + refresh), cart, wishlist
  plugins/        $api client, session bootstrap, v-reveal directive
  pages/          file-based routes; /admin/** is a client-only SPA
  types/          API + model types shared everywhere
  utils/          pricing mirror, formatting, query parsing, order statuses
i18n/locales/     ar.json, en.json (storefront); the admin is Arabic only
server/           sitemap source + default-locale middleware
```

## How things fit together

- **One HTTP client**: `plugins/01.api.ts` adds the language and token headers,
  unwraps the API envelope, refreshes the token once on 401 and throws a typed
  `ApiError`. Components call services (`useShopService()`), never `fetch`.
- **Forms**: `useForm(initial, rules)` gives typed values, client validation,
  API field errors on the right inputs, and a submitting flag.
- **Admin screens** reuse `useAdminCrud` (list + modal + delete) and
  `DataTable`, `ImageUploader`, `TranslationTabs`, `LookupManager`,
  `HomeBlockManager`.
- **Catalog filters live in the URL** (`?colors=..&min=..&sort=..&page=..`),
  so filtered pages are shareable and crawlable.
- **Language**: Arabic by default for everyone; the switcher stores the
  choice in the `i18n_locale` cookie. Each URL serves one language to crawlers.

## SEO

Server-rendered pages with per-page title/description/canonical/Open Graph
(`usePageSeo`), JSON-LD (store, website search, product with offers and
ratings, breadcrumbs, collection pages), `sitemap.xml` with every product and
category, `robots.txt` that hides private pages, `noindex` on account,
checkout and filtered/search results, real 404 status codes, optimized
AVIF/WebP images with responsive `srcset`, and self-hosted WOFF2 fonts.

## Branding

Store name, tagline, contact details, social links, branches, payment logos
and app-store links live in `app/app.config.ts`; colors, type scale, spacing
and motion in `app/assets/css/tokens.css`.
