<script setup lang="ts">
import type { Address } from '~/types/models';

const { t } = useI18n();
const shop = useShopService();
const toast = useToast();
const { confirm } = useConfirm();

useHead({ title: t('account.addresses') });

const { data: addresses, status, refresh } = await useLazyAsyncData('my-addresses', () => shop.addresses(), {
  server: false,
  default: () => [] as Address[],
});

const modalOpen = ref(false);
const editing = ref<Address | null>(null);

function open(address: Address | null = null) {
  editing.value = address;
  modalOpen.value = true;
}

async function onSaved() {
  modalOpen.value = false;
  toast.success(editing.value ? t('address.updated') : t('address.added'));
  await refresh();
}

async function remove(address: Address) {
  const ok = await confirm({
    title: t('address.deleteConfirm'),
    message: address.addressName,
    tone: 'danger',
    confirmText: t('common.delete'),
  });
  if (!ok) return;
  try {
    await shop.deleteAddress(address.id);
    toast.success(t('address.deleted'));
    await refresh();
  } catch (error) {
    toast.fromError(error);
  }
}
</script>

<template>
  <AccountSection :title="t('account.addresses')" :description="t('address.hint')" flat>
    <template #actions>
      <BaseButton icon="ph:plus" @click="open()">{{ t('address.add') }}</BaseButton>
    </template>

    <div v-if="isFetching(status) && !addresses.length" class="grid-auto" style="--min: 280px">
      <div v-for="n in 2" :key="n" class="skeleton" style="block-size: 12rem; border-radius: var(--radius-lg)" />
    </div>
    <div v-else-if="!addresses.length" class="card">
      <BaseEmptyState icon="ph:map-pin-line" :title="t('address.emptyTitle')" :description="t('address.emptyText')">
        <BaseButton icon="ph:plus" @click="open()">{{ t('address.add') }}</BaseButton>
      </BaseEmptyState>
    </div>
    <TransitionGroup v-else name="list" tag="div" class="grid-auto" style="--min: 280px">
      <AddressCard
        v-for="address in addresses"
        :key="address.id"
        :address="address"
        @edit="open(address)"
        @remove="remove(address)"
      />
    </TransitionGroup>

    <BaseModal v-model="modalOpen" :title="editing ? t('address.edit') : t('address.add')" size="lg" persistent>
      <AddressForm v-if="modalOpen" :address="editing" :make-default="!addresses.length" @saved="onSaved" @cancel="modalOpen = false" />
    </BaseModal>
  </AccountSection>
</template>
