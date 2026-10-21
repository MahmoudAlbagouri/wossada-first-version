<script setup lang="ts">
import { onClickOutside, watchDebounced } from '@vueuse/core';
import type { Product } from '~/types/models';

const props = withDefaults(defineProps<{ autofocus?: boolean; /** Unique per instance on a page. */ idPrefix?: string }>(), {
  idPrefix: 'search',
});
const emit = defineEmits<{ navigate: [] }>();

const { t } = useI18n();
const route = useRoute();
const catalog = useCatalogService();
const { name, price } = useLocalized();

const query = ref(typeof route.query.q === 'string' ? route.query.q : '');
const results = ref<Product[]>([]);
const loading = ref(false);
const open = ref(false);
const highlighted = ref(-1);
const input = ref<HTMLInputElement | null>(null);
const root = ref<HTMLElement | null>(null);
const listId = `${props.idPrefix}-suggestions`;
let requestId = 0;

watchDebounced(
  query,
  async (value) => {
    const term = value.trim();
    highlighted.value = -1;
    if (term.length < 2) {
      results.value = [];
      return;
    }
    const current = ++requestId;
    loading.value = true;
    try {
      const found = await catalog.searchSuggestions(term);
      if (current === requestId) results.value = found.slice(0, 6);
    } catch {
      results.value = [];
    } finally {
      if (current === requestId) loading.value = false;
    }
  },
  { debounce: 280 },
);

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

async function go(path: string, extra: Record<string, string> = {}) {
  close();
  emit('navigate');
  input.value?.blur();
  await navigateTo({ path, query: extra });
}

function submit() {
  const selected = results.value[highlighted.value];
  if (selected) return go(`/product/${selected.slug}`);
  const term = query.value.trim();
  if (term) return go('/products', { q: term });
}

function onKeydown(event: KeyboardEvent) {
  if (!results.value.length) return;
  if (event.key === 'ArrowDown') {
    open.value = true;
    highlighted.value = (highlighted.value + 1) % results.value.length;
    event.preventDefault();
  } else if (event.key === 'ArrowUp') {
    highlighted.value = highlighted.value <= 0 ? results.value.length - 1 : highlighted.value - 1;
    event.preventDefault();
  } else if (event.key === 'Escape') {
    close();
  }
}

const showPanel = computed(() => open.value && query.value.trim().length >= 2);
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
        :aria-activedescendant="highlighted >= 0 ? `${listId}-${highlighted}` : undefined"
        @focus="open = true"
        @input="open = true"
        @keydown="onKeydown"
      />
      <BaseSpinner v-if="loading" size="1.1rem" />
      <button v-else-if="query" type="button" class="search__clear" :aria-label="t('search.clear')" @click="query = ''">
        <Icon name="ph:x" />
      </button>
      <button type="submit" class="search__submit">{{ t('search.submit') }}</button>
    </form>

    <Transition name="slide-up">
      <div v-if="showPanel" class="search__panel">
        <ul v-if="results.length" :id="listId" class="search__list" role="listbox">
          <li v-for="(product, index) in results" :id="`${listId}-${index}`" :key="product.id" role="option" :aria-selected="index === highlighted">
            <NuxtLink
              :to="`/product/${product.slug}`"
              class="search__item"
              :class="{ 'is-active': index === highlighted }"
              @click="close(), emit('navigate')"
              @mouseenter="highlighted = index"
            >
              <BaseImage :src="product.mainImage" :alt="name(product)" :width="56" :height="56" ratio="1" rounded class="search__thumb" />
              <span class="search__name line-clamp-2">{{ name(product) }}</span>
              <span class="search__price">{{ price(displayPrice(product).price) }}</span>
            </NuxtLink>
          </li>
        </ul>
        <p v-else-if="!loading" class="search__empty">{{ t('search.noResults', { q: query.trim() }) }}</p>
        <button type="button" class="search__all" @click="go('/products', { q: query.trim() })">
          {{ t('search.viewAll', { q: query.trim() }) }}
          <Icon name="ph:arrow-right" class="flip-rtl" />
        </button>
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
  padding: var(--space-2);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-lg);
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
.search__thumb {
  inline-size: 3.25rem;
  flex-shrink: 0;
}
.search__name {
  flex: 1;
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
}
.search__price {
  font-size: var(--text-sm);
  font-weight: var(--weight-bold);
  color: var(--color-primary);
  white-space: nowrap;
}
.search__empty {
  padding: var(--space-4);
  text-align: center;
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}
.search__all {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  inline-size: 100%;
  margin-block-start: var(--space-1);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  color: var(--color-primary);
  font-size: var(--text-sm);
  font-weight: var(--weight-bold);
}
.search__all:hover {
  background: var(--color-primary-softer);
}
@media (max-width: 640px) {
  .search__submit {
    display: none;
  }
}
</style>
