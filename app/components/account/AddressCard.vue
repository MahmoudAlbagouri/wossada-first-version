<script setup lang="ts">
import type { Address } from '~/types/models';

defineProps<{
  address: Address;
  /** Checkout: the card is a radio option. */
  selectable?: boolean;
  selected?: boolean;
}>();
const emit = defineEmits<{ select: []; edit: []; remove: [] }>();

const { t } = useI18n();
const { placeName } = useLocalized();
</script>

<template>
  <article
    class="address"
    :class="{ 'address--selectable': selectable, 'is-selected': selected }"
    :role="selectable ? 'radio' : undefined"
    :aria-checked="selectable ? selected : undefined"
    :tabindex="selectable ? 0 : undefined"
    @click="selectable && emit('select')"
    @keydown.enter.space.prevent="selectable && emit('select')"
  >
    <header class="address__head">
      <span v-if="selectable" class="address__radio" aria-hidden="true" />
      <Icon v-else name="ph:map-pin" class="address__pin" aria-hidden="true" />
      <strong>{{ address.addressName }}</strong>
      <BaseBadge v-if="address.isDefault" tone="primary" size="sm">{{ t('address.default') }}</BaseBadge>
    </header>
    <div class="address__body">
      <p class="address__name">{{ address.fullName }}</p>
      <p>{{ address.streetAddress }}</p>
      <p>
        {{ placeName(address.city) }}<template v-if="address.city.governorate">، {{ placeName(address.city.governorate) }}</template>
      </p>
      <p v-if="address.landmark" class="text-subtle">{{ t('address.landmark') }}: {{ address.landmark }}</p>
      <p dir="ltr" class="address__phone">{{ address.phoneNumber }}</p>
    </div>
    <footer class="address__actions">
      <BaseButton variant="ghost" size="sm" icon="ph:pencil-simple" @click.stop="emit('edit')">{{ t('common.edit') }}</BaseButton>
      <BaseButton v-if="!selectable" variant="ghost" size="sm" icon="ph:trash" class="address__delete" @click.stop="emit('remove')">
        {{ t('common.delete') }}
      </BaseButton>
    </footer>
  </article>
</template>

<style scoped>
.address {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-5);
  border-radius: var(--radius-lg);
  border: 1.5px solid var(--color-border);
  background: var(--color-surface);
  transition:
    border-color var(--duration-fast) ease,
    box-shadow var(--duration-base) var(--ease-out),
    background-color var(--duration-fast) ease;
}
.address--selectable {
  cursor: pointer;
}
.address--selectable:hover {
  border-color: var(--color-border-strong);
}
.address.is-selected {
  border-color: var(--color-primary);
  background: var(--color-primary-softer);
  box-shadow: 0 0 0 3px var(--color-focus);
}
.address__head {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.address__pin {
  color: var(--color-primary);
  font-size: 1.2rem;
}
.address__radio {
  position: relative;
  inline-size: 1.2rem;
  block-size: 1.2rem;
  border-radius: 50%;
  border: 2px solid var(--color-border-strong);
  transition: border-color var(--duration-fast) ease;
}
.address__radio::after {
  content: '';
  position: absolute;
  inset: 3px;
  border-radius: 50%;
  background: var(--color-primary);
  transform: scale(0);
  transition: transform var(--duration-base) var(--ease-spring);
}
.is-selected .address__radio {
  border-color: var(--color-primary);
}
.is-selected .address__radio::after {
  transform: scale(1);
}
.address__body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}
.address__name {
  font-weight: var(--weight-semibold);
  color: var(--color-text);
}
.address__phone {
  text-align: end;
  align-self: flex-start;
}
.address__actions {
  display: flex;
  gap: var(--space-1);
  margin-block-start: auto;
  margin-inline-start: calc(var(--space-3) * -1);
}
.address__delete:hover {
  color: var(--color-danger);
  background: var(--color-danger-soft);
}
</style>
