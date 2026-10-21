<script setup lang="ts">
import type { Address, City, Governorate } from '~/types/models';

const props = defineProps<{ address?: Address | null; makeDefault?: boolean }>();
const emit = defineEmits<{ saved: [address: Address]; cancel: [] }>();

const { t } = useI18n();
const { placeName } = useLocalized();
const shop = useShopService();
const auth = useAuthStore();
const v = useValidators();

const governorates = ref<Governorate[]>([]);
const cities = ref<City[]>([]);
const loadingCities = ref(false);

const { values, errors, submitting, formError, handleSubmit } = useForm(
  () => ({
    addressName: props.address?.addressName ?? t('address.defaultLabel'),
    fullName: props.address?.fullName ?? auth.user?.name ?? '',
    phoneNumber: props.address?.phoneNumber ?? auth.user?.phone?.replace(/^\+20/, '0') ?? '',
    governorateId: props.address?.city.governorate?.id ?? '',
    cityId: props.address?.city.id ?? '',
    streetAddress: props.address?.streetAddress ?? '',
    landmark: props.address?.landmark ?? '',
    isDefault: props.address?.isDefault ?? !!props.makeDefault,
  }),
  {
    addressName: [v.required(), v.maxLength(50)],
    fullName: [v.required(), v.maxLength(100)],
    phoneNumber: [v.required(), v.phone()],
    governorateId: [v.required(t('address.chooseGovernorate'))],
    cityId: [v.required(t('address.chooseCity'))],
    streetAddress: [v.required(), v.maxLength(300)],
    landmark: [v.maxLength(200)],
  },
);

const governorateOptions = computed(() => governorates.value.map((g) => ({ value: g.id, label: placeName(g) })));
const cityOptions = computed(() => cities.value.map((c) => ({ value: c.id, label: placeName(c) })));

async function loadCities(governorateId: string) {
  if (!governorateId) {
    cities.value = [];
    return;
  }
  loadingCities.value = true;
  try {
    cities.value = await shop.cities(governorateId);
  } finally {
    loadingCities.value = false;
  }
}

watch(
  () => values.governorateId,
  async (id, previous) => {
    if (previous !== undefined && id !== previous) values.cityId = '';
    await loadCities(id);
  },
);

onMounted(async () => {
  governorates.value = await shop.governorates();
  if (values.governorateId) await loadCities(values.governorateId);
});

const submit = handleSubmit(async ({ governorateId: _governorate, landmark, ...rest }) => {
  const payload = { ...rest, landmark: landmark || undefined };
  const saved = props.address
    ? await shop.updateAddress(props.address.id, payload)
    : await shop.createAddress(payload);
  emit('saved', saved);
});
</script>

<template>
  <form class="address-form" novalidate @submit="submit">
    <div class="address-form__grid">
      <BaseInput v-model="values.addressName" :label="t('address.label')" :placeholder="t('address.labelPlaceholder')" :error="errors.addressName" required />
      <BaseInput v-model="values.fullName" :label="t('address.fullName')" autocomplete="name" :error="errors.fullName" required />
      <BaseInput
        v-model="values.phoneNumber"
        type="tel"
        :label="t('address.phone')"
        autocomplete="tel"
        inputmode="tel"
        dir="ltr"
        :error="errors.phoneNumber"
        required
      />
      <BaseSelect
        v-model="values.governorateId"
        :label="t('address.governorate')"
        :options="governorateOptions"
        :placeholder="t('address.chooseGovernorate')"
        :error="errors.governorateId"
        required
      />
      <BaseSelect
        v-model="values.cityId"
        :label="t('address.city')"
        :options="cityOptions"
        :placeholder="loadingCities ? t('common.loading') : t('address.chooseCity')"
        :disabled="!values.governorateId || loadingCities"
        :error="errors.cityId"
        required
      />
      <BaseInput v-model="values.landmark" :label="t('address.landmark')" :placeholder="t('address.landmarkPlaceholder')" :error="errors.landmark" />
    </div>
    <BaseTextarea
      v-model="values.streetAddress"
      :label="t('address.street')"
      :placeholder="t('address.streetPlaceholder')"
      :rows="2"
      :maxlength="300"
      :error="errors.streetAddress"
      required
    />
    <BaseCheckbox v-model="values.isDefault" switch :label="t('address.setDefault')" />
    <BaseAlert v-if="formError" tone="danger">{{ formError }}</BaseAlert>
    <div class="address-form__actions">
      <BaseButton variant="ghost" @click="emit('cancel')">{{ t('common.cancel') }}</BaseButton>
      <BaseButton type="submit" :loading="submitting" icon="ph:check">{{ t('address.save') }}</BaseButton>
    </div>
  </form>
</template>

<style scoped>
.address-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.address-form__grid {
  display: grid;
  /* minmax(0, …) lets the column shrink below its content (no page overflow). */
  grid-template-columns: minmax(0, 1fr);
  gap: var(--space-4);
}
@media (min-width: 640px) {
  .address-form__grid {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }
}
.address-form__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
}
</style>
