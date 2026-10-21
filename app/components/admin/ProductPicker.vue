<script setup lang="ts">
import { watchDebounced } from '@vueuse/core';
import type { Product } from '~/types/models';

/** Search-and-pick products (product sliders). `v-model` holds the ids in order. */
const ids = defineModel<string[]>({ default: () => [] });
const props = defineProps<{ initial?: Product[]; max?: number }>();

const admin = useAdminService();
const { pick, price } = useLocalized();

const known = ref(new Map<string, Product>((props.initial ?? []).map((p) => [p.id, p])));
const search = ref('');
const results = ref<Product[]>([]);
const searching = ref(false);

watchDebounced(
  search,
  async (term) => {
    if (!term.trim()) {
      results.value = [];
      return;
    }
    searching.value = true;
    try {
      results.value = (await admin.products.list({ searchTerm: term.trim(), limit: 8 })).data;
    } finally {
      searching.value = false;
    }
  },
  { debounce: 300 },
);

const selected = computed(() => ids.value.map((id) => known.value.get(id)).filter((p): p is Product => !!p));

function add(product: Product) {
  if (ids.value.includes(product.id) || (props.max && ids.value.length >= props.max)) return;
  known.value.set(product.id, product);
  ids.value = [...ids.value, product.id];
}
const remove = (id: string) => (ids.value = ids.value.filter((x) => x !== id));
const name = (p: Product) => pick(p.translations)?.name ?? p.slug;
</script>

<template>
  <div class="picker">
    <BaseInput v-model="search" icon="ph:magnifying-glass" placeholder="ابحث عن منتج لإضافته…">
      <template #suffix><BaseSpinner v-if="searching" size="1rem" /></template>
    </BaseInput>

    <ul v-if="results.length" class="picker__results">
      <li v-for="product in results" :key="product.id">
        <button type="button" class="picker__result" :disabled="ids.includes(product.id)" @click="add(product)">
          <BaseImage :src="product.mainImage" alt="" :width="40" :height="40" ratio="1" rounded class="picker__thumb" />
          <span class="line-clamp-1">{{ name(product) }}</span>
          <small>{{ price(displayPrice(product).price) }}</small>
          <Icon :name="ids.includes(product.id) ? 'ph:check' : 'ph:plus'" />
        </button>
      </li>
    </ul>

    <p class="picker__label">المنتجات المختارة ({{ ids.length }})</p>
    <TransitionGroup v-if="selected.length" name="list" tag="ul" class="picker__selected">
      <li v-for="product in selected" :key="product.id" class="picker__chip">
        <BaseImage :src="product.mainImage" alt="" :width="32" :height="32" ratio="1" rounded class="picker__thumb picker__thumb--sm" />
        <span class="line-clamp-1">{{ name(product) }}</span>
        <button type="button" aria-label="إزالة" @click="remove(product.id)"><Icon name="ph:x" /></button>
      </li>
    </TransitionGroup>
    <p v-else class="text-subtle picker__empty">لم تُختر منتجات بعد.</p>
  </div>
</template>

<style scoped>
.picker {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.picker__results {
  display: flex;
  flex-direction: column;
  max-block-size: 16rem;
  overflow-y: auto;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}
.picker__result {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  inline-size: 100%;
  padding: var(--space-2) var(--space-3);
  text-align: start;
  font-size: var(--text-sm);
}
.picker__result:hover:not(:disabled) {
  background: var(--color-primary-softer);
}
.picker__result:disabled {
  opacity: 0.5;
}
.picker__result span {
  flex: 1;
}
.picker__result small {
  color: var(--color-text-subtle);
}
.picker__thumb {
  inline-size: 2.5rem;
  flex-shrink: 0;
}
.picker__thumb--sm {
  inline-size: 2rem;
}
.picker__label {
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
}
.picker__selected {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}
.picker__chip {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  max-inline-size: 260px;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  background: var(--color-surface-muted);
  border: 1px solid var(--color-border);
  font-size: var(--text-xs);
}
.picker__chip button {
  display: grid;
  place-items: center;
  inline-size: 1.4rem;
  block-size: 1.4rem;
  border-radius: 50%;
}
.picker__chip button:hover {
  background: var(--color-danger-soft);
  color: var(--color-danger);
}
.picker__empty {
  font-size: var(--text-sm);
}
</style>
