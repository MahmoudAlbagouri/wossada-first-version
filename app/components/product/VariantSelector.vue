<script setup lang="ts">
import type { Color, Material, Product, Size } from '~/types/models';
import type { Attribute, VariantSelection } from '~/utils/product';

const selection = defineModel<VariantSelection>({ required: true });
const props = defineProps<{ product: Product }>();

const { t } = useI18n();
const { name } = useLocalized();

const colors = computed(() => variantAttributeValues<Color>(props.product.variants, 'color'));
const sizes = computed(() => variantAttributeValues<Size>(props.product.variants, 'size'));
const materials = computed(() => variantAttributeValues<Material>(props.product.variants, 'material'));

const available = (attribute: Attribute, id: string) => isOptionAvailable(props.product, attribute, id, selection.value);

function pick(attribute: Attribute, id: string) {
  const next: VariantSelection = { ...selection.value, [attribute]: selection.value[attribute] === id ? null : id };
  // Drop picks that no longer combine into an existing variant.
  for (const other of VARIANT_ATTRIBUTES) {
    if (other === attribute || !next[other]) continue;
    const stillExists = props.product.variants.some(
      (v) => v[attribute]?.id === next[attribute] && v[other]?.id === next[other],
    );
    if (next[attribute] && !stillExists) next[other] = null;
  }
  selection.value = next;
}

const selectedName = (attribute: Attribute, list: (Color | Size | Material)[]) => {
  const value = list.find((item) => item.id === selection.value[attribute]);
  return value ? name(value) : '';
};
</script>

<template>
  <div class="variants">
    <fieldset v-if="colors.length" class="variants__group">
      <legend class="variants__label">
        {{ t('product.color') }}<span v-if="selection.color" class="variants__value">: {{ selectedName('color', colors) }}</span>
      </legend>
      <div class="variants__options">
        <button
          v-for="color in colors"
          :key="color.id"
          type="button"
          class="swatch"
          :class="{ 'is-active': selection.color === color.id, 'is-unavailable': !available('color', color.id) }"
          :style="{ '--swatch': color.hexCode }"
          :aria-pressed="selection.color === color.id"
          :aria-label="name(color)"
          :title="name(color)"
          @click="pick('color', color.id)"
        />
      </div>
    </fieldset>

    <fieldset v-if="sizes.length" class="variants__group">
      <legend class="variants__label">
        {{ t('product.size') }}<span v-if="selection.size" class="variants__value">: {{ selectedName('size', sizes) }}</span>
      </legend>
      <div class="variants__options">
        <button
          v-for="size in sizes"
          :key="size.id"
          type="button"
          class="option"
          :class="{ 'is-active': selection.size === size.id, 'is-unavailable': !available('size', size.id) }"
          :aria-pressed="selection.size === size.id"
          @click="pick('size', size.id)"
        >
          {{ name(size, size.type) }}
        </button>
      </div>
    </fieldset>

    <fieldset v-if="materials.length" class="variants__group">
      <legend class="variants__label">
        {{ t('product.material') }}<span v-if="selection.material" class="variants__value">: {{ selectedName('material', materials) }}</span>
      </legend>
      <div class="variants__options">
        <button
          v-for="material in materials"
          :key="material.id"
          type="button"
          class="option"
          :class="{ 'is-active': selection.material === material.id, 'is-unavailable': !available('material', material.id) }"
          :aria-pressed="selection.material === material.id"
          @click="pick('material', material.id)"
        >
          {{ name(material) }}
        </button>
      </div>
    </fieldset>
  </div>
</template>

<style scoped>
.variants {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}
.variants__group {
  border: none;
  padding: 0;
  margin: 0;
}
.variants__label {
  margin-block-end: var(--space-3);
  font-size: var(--text-sm);
  font-weight: var(--weight-bold);
}
.variants__value {
  font-weight: var(--weight-medium);
  color: var(--color-text-muted);
}
.variants__options {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}
.swatch {
  position: relative;
  inline-size: 2.5rem;
  block-size: 2.5rem;
  border-radius: 50%;
  background: var(--swatch);
  box-shadow:
    inset 0 0 0 1px rgb(0 0 0 / 0.12),
    0 0 0 3px var(--color-surface),
    0 0 0 4px var(--color-border);
  transition:
    box-shadow var(--duration-fast) ease,
    transform var(--duration-base) var(--ease-spring);
}
.swatch:hover {
  transform: scale(1.08);
}
.swatch.is-active {
  box-shadow:
    inset 0 0 0 1px rgb(0 0 0 / 0.12),
    0 0 0 3px var(--color-surface),
    0 0 0 5px var(--color-primary);
}
.option {
  min-inline-size: 3rem;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  border: 1.5px solid var(--color-border);
  background: var(--color-surface);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  transition:
    border-color var(--duration-fast) ease,
    background-color var(--duration-fast) ease,
    color var(--duration-fast) ease;
}
.option:hover {
  border-color: var(--color-primary);
}
.option.is-active {
  border-color: var(--color-primary);
  background: var(--color-primary-softer);
  color: var(--gold-800);
  box-shadow: inset 0 0 0 1px var(--color-primary);
}
.is-unavailable {
  opacity: 0.45;
  background-image: linear-gradient(
    to top left,
    transparent calc(50% - 1px),
    var(--color-text-subtle) 50%,
    transparent calc(50% + 1px)
  );
}
.swatch.is-unavailable {
  background-image:
    linear-gradient(to top left, transparent calc(50% - 1px), #fff 50%, transparent calc(50% + 1px)),
    linear-gradient(var(--swatch), var(--swatch));
}
</style>
