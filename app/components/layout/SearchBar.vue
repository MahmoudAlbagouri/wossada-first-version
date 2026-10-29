<script setup lang="ts">
import { onClickOutside, useLocalStorage, watchDebounced } from '@vueuse/core';
import type { RouteLocationRaw } from 'vue-router';
import type { SearchSuggestions } from '~/types/models';

const props = withDefaults(defineProps<{ autofocus?: boolean; /** Unique per instance on a page. */ idPrefix?: string }>(), {
  idPrefix: 'search',
});
const emit = defineEmits<{ navigate: [] }>();

const MIN_CHARS = 2;
const RECENT_LIMIT = 6;

const { t } = useI18n();
const route = useRoute();
const catalog = useCatalogService();
const { name, number } = useLocalized();

const query = ref(typeof route.query.q === 'string' ? route.query.q : '');
const suggestions = ref<SearchSuggestions | null>(null);
/** The term `suggestions` belong to (highlighting must not jump ahead while typing). */
const resultsFor = ref('');
const loading = ref(false);
const open = ref(false);
const highlighted = ref(-1);
const input = ref<HTMLInputElement | null>(null);
const root = ref<HTMLElement | null>(null);
const listId = `${props.idPrefix}-suggestions`;
let requestId = 0;

/** Last searches on this device, newest first (shared by every search box). */
const recent = useLocalStorage<string[]>('search:recent', [], { initOnMounted: true });

const term = computed(() => query.value.trim());
const typing = computed(() => term.value.length >= MIN_CHARS);
const searchLink = (q: string): RouteLocationRaw => ({ path: '/products', query: { q } });

watchDebounced(
  query,
  async (value) => {
    const current = ++requestId;
    highlighted.value = -1;
    const q = value.trim();
    if (q.length < MIN_CHARS) {
      suggestions.value = null;
      loading.value = false;
      return;
    }
    loading.value = true;
    try {
      const found = await catalog.searchSuggestions(q);
      if (current !== requestId) return;
      suggestions.value = found;
      resultsFor.value = q;
    } catch {
      if (current === requestId) suggestions.value = null;
    } finally {
      if (current === requestId) loading.value = false;
    }
  },
  { debounce: 250 },
);

interface PanelItem {
  to: RouteLocationRaw;
  /** What to remember as a recent search when chosen. */
  term: string;
}

/** Everything the arrow keys move through, in display order. */
const items = computed<PanelItem[]>(() => {
  if (!typing.value) return recent.value.map((q) => ({ to: searchLink(q), term: q }));
  const s = suggestions.value;
  if (!s) return [];
  const q = resultsFor.value;
  return [
    ...s.categories.map((c) => ({ to: `/category/${c.slug}`, term: q })),
    ...s.brands.map((b) => ({ to: { path: '/products', query: { brands: b.id } }, term: q })),
    ...s.products.map((p) => ({ to: `/product/${p.slug}`, term: q })),
    ...(s.total ? [{ to: searchLink(q), term: q }] : []),
  ];
});

// Section offsets inside `items`.
const brandsAt = computed(() => suggestions.value?.categories.length ?? 0);
const productsAt = computed(() => brandsAt.value + (suggestions.value?.brands.length ?? 0));
const viewAllAt = computed(() => productsAt.value + (suggestions.value?.products.length ?? 0));

const hasResults = computed(() => !!suggestions.value && items.value.length > 0);
const showPanel = computed(() => open.value && (typing.value || recent.value.length > 0));
const optionId = (index: number) => `${listId}-${index}`;

onMounted(() => {
  if (props.autofocus) input.value?.focus();
});

function close() {
  open.value = false;
  highlighted.value = -1;
}

onClickOutside(root, close);

function onFocusOut(event: FocusEvent) {
  if (!root.value?.contains(event.relatedTarget as Node | null)) close();
}

function remember(q: string) {
  const value = q.trim();
  if (value.length < MIN_CHARS) return;
  const key = value.toLowerCase();
  recent.value = [value, ...recent.value.filter((item) => item.toLowerCase() !== key)].slice(0, RECENT_LIMIT);
}

function forget(q: string) {
  recent.value = recent.value.filter((item) => item !== q);
  input.value?.focus();
}

function clearRecent() {
  recent.value = [];
  input.value?.focus();
}

/** Clicks on panel links: the link navigates, this records and closes. */
function chose(item: PanelItem | undefined) {
  if (item) remember(item.term);
  close();
  emit('navigate');
}

async function go(item: PanelItem) {
  chose(item);
  input.value?.blur();
  await navigateTo(item.to);
}

function submit() {
  const selected = items.value[highlighted.value];
  if (selected) return go(selected);
  if (term.value) return go({ to: searchLink(term.value), term: term.value });
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') return close();
  const count = items.value.length;
  if (!count || (event.key !== 'ArrowDown' && event.key !== 'ArrowUp')) return;
  event.preventDefault();
  open.value = true;
  const step = event.key === 'ArrowDown' ? 1 : -1;
  highlighted.value = highlighted.value < 0 && step < 0 ? count - 1 : (highlighted.value + step + count) % count;
}
</script>

<template>
  <div ref="root" class="search" @focusout="onFocusOut">
    <form class="search__form" role="search" @submit.prevent="submit">
      <Icon name="ph:magnifying-glass" class="search__icon" aria-hidden="true" />
      <input
        ref="input"
        v-model="query"
        type="search"
        class="search__input"
        :placeholder="t('search.placeholder')"
        :aria-label="t('search.label')"
        autocomplete="off"
        enterkeyhint="search"
        role="combobox"
        :aria-expanded="showPanel"
        :aria-controls="listId"
        :aria-activedescendant="showPanel && highlighted >= 0 ? optionId(highlighted) : undefined"
        @focus="open = true"
        @input="open = true"
        @keydown="onKeydown"
      />
      <BaseSpinner v-if="loading" size="1.1rem" />
      <button v-else-if="query" type="button" class="search__clear" :aria-label="t('search.clear')" @click="(query = ''), input?.focus()">
        <Icon name="ph:x" />
      </button>
      <button type="submit" class="search__submit">{{ t('search.submit') }}</button>
    </form>

    <Transition name="slide-up">
      <div v-if="showPanel" class="search__panel">
        <!-- Recent searches (empty box) -->
        <template v-if="!typing">
          <div class="search__head">
            <span>{{ t('search.recent') }}</span>
            <button type="button" class="search__head-action" @mousedown.prevent @click="clearRecent">{{ t('search.clearRecent') }}</button>
          </div>
          <ul :id="listId" class="search__list" role="listbox" :aria-label="t('search.recent')">
            <li
              v-for="(q, index) in recent"
              :id="optionId(index)"
              :key="q"
              role="option"
              :aria-selected="index === highlighted"
              class="search__recent"
              :class="{ 'is-active': index === highlighted }"
              @mouseenter="highlighted = index"
            >
              <NuxtLink :to="searchLink(q)" class="search__recent-link" @click="chose(items[index])">
                <Icon name="ph:clock-counter-clockwise" class="search__recent-icon" aria-hidden="true" />
                <span class="line-clamp-1">{{ q }}</span>
              </NuxtLink>
              <button type="button" class="search__remove" :aria-label="t('search.removeRecent', { q })" @mousedown.prevent @click="forget(q)">
                <Icon name="ph:x" />
              </button>
            </li>
          </ul>
        </template>

        <!-- Suggestions -->
        <template v-else>
          <div v-if="hasResults && suggestions" :id="listId" class="search__results" role="listbox" :aria-label="t('search.label')">
            <div v-if="suggestions.categories.length" role="group" :aria-label="t('search.categories')" class="search__group">
              <p class="search__group-title" aria-hidden="true">{{ t('search.categories') }}</p>
              <NuxtLink
                v-for="(category, i) in suggestions.categories"
                :id="optionId(i)"
                :key="category.id"
                :to="`/category/${category.slug}`"
                role="option"
                :aria-selected="i === highlighted"
                class="search__item search__item--compact"
                :class="{ 'is-active': i === highlighted }"
                @click="chose(items[i])"
                @mouseenter="highlighted = i"
              >
                <BaseImage v-if="category.image" :src="category.image" alt="" :width="40" :height="40" ratio="1" rounded class="search__icon-img" />
                <span v-else class="search__badge-icon"><Icon name="ph:squares-four" aria-hidden="true" /></span>
                <HighlightText :text="category.name" :query="resultsFor" class="search__name" />
                <span class="search__kind">{{ t('search.category') }}</span>
              </NuxtLink>
            </div>

            <div v-if="suggestions.brands.length" role="group" :aria-label="t('search.brands')" class="search__group">
              <p class="search__group-title" aria-hidden="true">{{ t('search.brands') }}</p>
              <NuxtLink
                v-for="(brand, i) in suggestions.brands"
                :id="optionId(brandsAt + i)"
                :key="brand.id"
                :to="{ path: '/products', query: { brands: brand.id } }"
                role="option"
                :aria-selected="brandsAt + i === highlighted"
                class="search__item search__item--compact"
                :class="{ 'is-active': brandsAt + i === highlighted }"
                @click="chose(items[brandsAt + i])"
                @mouseenter="highlighted = brandsAt + i"
              >
                <BaseImage v-if="brand.logo" :src="brand.logo" alt="" :width="40" :height="40" ratio="1" fit="contain" rounded class="search__icon-img" />
                <span v-else class="search__badge-icon"><Icon name="ph:seal-check" aria-hidden="true" /></span>
                <HighlightText :text="brand.name" :query="resultsFor" class="search__name" />
                <span class="search__kind">{{ t('search.brand') }}</span>
              </NuxtLink>
            </div>

            <div v-if="suggestions.products.length" role="group" :aria-label="t('search.products')" class="search__group">
              <p class="search__group-title" aria-hidden="true">{{ t('search.products') }}</p>
              <NuxtLink
                v-for="(product, i) in suggestions.products"
                :id="optionId(productsAt + i)"
                :key="product.id"
                :to="`/product/${product.slug}`"
                role="option"
                :aria-selected="productsAt + i === highlighted"
                class="search__item"
                :class="{ 'is-active': productsAt + i === highlighted }"
                @click="chose(items[productsAt + i])"
                @mouseenter="highlighted = productsAt + i"
              >
                <BaseImage :src="product.mainImage" :alt="name(product)" :width="56" :height="56" ratio="1" rounded class="search__thumb" />
                <HighlightText :text="name(product)" :query="resultsFor" class="search__name line-clamp-2" />
                <BasePrice :amount="displayPrice(product).price" :compare-at="displayPrice(product).compareAt" size="sm" class="search__price" />
              </NuxtLink>
            </div>

            <NuxtLink
              v-if="suggestions.total"
              :id="optionId(viewAllAt)"
              :to="searchLink(resultsFor)"
              role="option"
              :aria-selected="viewAllAt === highlighted"
              class="search__all"
              :class="{ 'is-active': viewAllAt === highlighted }"
              @click="chose(items[viewAllAt])"
              @mouseenter="highlighted = viewAllAt"
            >
              {{ t('search.viewAll', { q: resultsFor, count: number(suggestions.total) }) }}
              <Icon name="ph:arrow-right" class="flip-rtl" />
            </NuxtLink>
          </div>

          <div v-else-if="!loading && suggestions" class="search__empty">
            <Icon name="ph:magnifying-glass" class="search__empty-icon" aria-hidden="true" />
            <p>{{ t('search.noResults', { q: resultsFor }) }}</p>
            <p class="search__empty-hint">{{ t('search.noResultsHint') }}</p>
          </div>

          <div v-else-if="loading && !suggestions" class="search__loading" aria-hidden="true">
            <div v-for="n in 3" :key="n" class="search__skeleton">
              <span class="skeleton search__skeleton-thumb" />
              <span class="skeleton search__skeleton-line" />
            </div>
          </div>
        </template>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.search {
  position: relative;
  inline-size: 100%;
}
.search__form {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  block-size: 3rem;
  padding-inline: var(--space-4) var(--space-1);
  border-radius: var(--radius-full);
  background: var(--color-surface-muted);
  border: 1.5px solid var(--color-border);
  transition:
    border-color var(--duration-fast) ease,
    box-shadow var(--duration-base) var(--ease-out),
    background-color var(--duration-fast) ease;
}
.search__form:focus-within {
  background: var(--color-surface);
  border-color: var(--color-primary);
  box-shadow: var(--ring);
}
.search__icon {
  font-size: 1.25rem;
  color: var(--color-text-subtle);
}
.search__input {
  flex: 1;
  min-inline-size: 0;
  border: none;
  outline: none;
  background: transparent;
  font-size: var(--text-sm);
}
.search__input::-webkit-search-cancel-button {
  display: none;
}
.search__clear {
  display: grid;
  place-items: center;
  inline-size: 1.75rem;
  block-size: 1.75rem;
  border-radius: 50%;
  color: var(--color-text-subtle);
}
.search__clear:hover {
  background: var(--color-surface-sunken);
}
.search__submit {
  block-size: 2.4rem;
  padding-inline: var(--space-5);
  border-radius: var(--radius-full);
  background: var(--color-primary);
  color: var(--color-on-primary);
  font-size: var(--text-sm);
  font-weight: var(--weight-bold);
  transition: background-color var(--duration-fast) ease;
}
.search__submit:hover {
  background: var(--color-primary-hover);
}

.search__panel {
  position: absolute;
  inset-inline: 0;
  inset-block-start: calc(100% + var(--space-2));
  z-index: var(--z-dropdown);
  max-block-size: min(75vh, 36rem);
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: var(--space-2);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-lg);
}
.search__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-2) var(--space-2) var(--space-1);
  font-size: var(--text-xs);
  font-weight: var(--weight-bold);
  color: var(--color-text-subtle);
}
.search__head-action {
  color: var(--color-primary);
  font-weight: var(--weight-semibold);
}
.search__head-action:hover {
  text-decoration: underline;
}
.search__recent {
  display: flex;
  align-items: center;
  border-radius: var(--radius-md);
  transition: background-color var(--duration-fast) ease;
}
.search__recent.is-active {
  background: var(--color-primary-softer);
}
.search__recent-link {
  display: flex;
  flex: 1;
  align-items: center;
  gap: var(--space-3);
  min-inline-size: 0;
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-sm);
}
.search__recent-icon {
  flex-shrink: 0;
  font-size: 1.1rem;
  color: var(--color-text-subtle);
}
.search__remove {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  inline-size: 2rem;
  block-size: 2rem;
  margin-inline-end: var(--space-1);
  border-radius: 50%;
  color: var(--color-text-subtle);
}
.search__remove:hover {
  background: var(--color-surface-sunken);
  color: var(--color-text);
}
.search__group + .search__group {
  margin-block-start: var(--space-1);
  padding-block-start: var(--space-1);
  border-block-start: 1px solid var(--color-border);
}
.search__group-title {
  padding: var(--space-2) var(--space-2) var(--space-1);
  font-size: var(--text-xs);
  font-weight: var(--weight-bold);
  color: var(--color-text-subtle);
}
.search__item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2);
  border-radius: var(--radius-md);
  transition: background-color var(--duration-fast) ease;
}
.search__item.is-active {
  background: var(--color-primary-softer);
}
.search__item--compact {
  padding-block: var(--space-1);
}
.search__thumb {
  inline-size: 3.25rem;
  flex-shrink: 0;
}
.search__icon-img {
  inline-size: 2.5rem;
  flex-shrink: 0;
}
.search__badge-icon {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  inline-size: 2.5rem;
  block-size: 2.5rem;
  border-radius: var(--radius-md);
  background: var(--color-primary-softer);
  color: var(--color-primary);
  font-size: 1.2rem;
}
.search__name {
  flex: 1;
  min-inline-size: 0;
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
}
.search__kind {
  flex-shrink: 0;
  font-size: var(--text-2xs);
  color: var(--color-text-subtle);
}
.search__price {
  flex-shrink: 0;
  white-space: nowrap;
}
.search__all {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  margin-block-start: var(--space-1);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  color: var(--color-primary);
  font-size: var(--text-sm);
  font-weight: var(--weight-bold);
  text-align: center;
}
.search__all:hover,
.search__all.is-active {
  background: var(--color-primary-softer);
}
.search__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-6) var(--space-4);
  text-align: center;
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}
.search__empty-icon {
  font-size: 1.75rem;
  color: var(--color-text-subtle);
}
.search__empty-hint {
  font-size: var(--text-xs);
  color: var(--color-text-subtle);
}
.search__skeleton {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2);
}
.search__skeleton-thumb {
  inline-size: 3.25rem;
  block-size: 3.25rem;
  border-radius: var(--radius-md);
}
.search__skeleton-line {
  flex: 1;
  block-size: 0.9rem;
  border-radius: var(--radius-sm);
}
@media (max-width: 640px) {
  .search__submit {
    display: none;
  }
}
</style>
