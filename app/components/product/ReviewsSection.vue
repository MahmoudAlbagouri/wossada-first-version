<script setup lang="ts">
import type { ProductReviews } from '~/types/models';

const props = defineProps<{ productId: string }>();
const emit = defineEmits<{ reviewed: [] }>();

const { t } = useI18n();
const { date, number } = useLocalized();
const catalog = useCatalogService();
const auth = useAuthStore();
const toast = useToast();
const v = useValidators();

const { data, refresh, status } = await useAsyncData(
  `reviews-${props.productId}`,
  () => catalog.getReviews(props.productId),
  { default: (): ProductReviews => ({ items: [], average: 0, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }) },
);

const alreadyReviewed = computed(() => data.value.items.some((r) => r.user?.id === auth.user?.id));
const showForm = ref(false);

const form = useForm(() => ({ rating: 0, comment: '' }), {
  rating: [(value) => Number(value) > 0 || t('reviews.ratingRequired')],
  comment: [v.maxLength(2000)],
});

const submit = form.handleSubmit(async (values) => {
  await catalog.createReview({ productId: props.productId, rating: values.rating, comment: values.comment || undefined });
  toast.success(t('reviews.thanks'));
  form.reset();
  showForm.value = false;
  await refresh();
  emit('reviewed');
});

const percent = (stars: 1 | 2 | 3 | 4 | 5) =>
  data.value.count ? Math.round(((data.value.distribution[stars] ?? 0) / data.value.count) * 100) : 0;
</script>

<template>
  <section id="reviews" class="reviews">
    <div class="reviews__summary card card-pad">
      <h2 class="title-lg">{{ t('reviews.title') }}</h2>
      <div class="reviews__score">
        <strong>{{ data.average.toFixed(1) }}</strong>
        <div>
          <BaseRating :value="data.average" size="1.15rem" />
          <p class="text-subtle">{{ t('reviews.basedOn', { count: number(data.count) }, data.count) }}</p>
        </div>
      </div>
      <ul class="reviews__bars">
        <li v-for="stars in ([5, 4, 3, 2, 1] as const)" :key="stars">
          <span>{{ stars }}<Icon name="ph:star-fill" class="reviews__star" aria-hidden="true" /></span>
          <span class="reviews__bar"><span :style="{ inlineSize: `${percent(stars)}%` }" /></span>
          <span class="reviews__pct">{{ percent(stars) }}%</span>
        </li>
      </ul>

      <template v-if="auth.isLoggedIn">
        <BaseButton v-if="!alreadyReviewed && !showForm" variant="outline" block icon="ph:pencil-simple" @click="showForm = true">
          {{ t('reviews.write') }}
        </BaseButton>
        <p v-else-if="alreadyReviewed" class="reviews__note"><Icon name="ph:check-circle" aria-hidden="true" />{{ t('reviews.alreadyReviewed') }}</p>
      </template>
      <BaseButton v-else variant="outline" block :to="`/login?redirect=${encodeURIComponent($route.fullPath + '#reviews')}`">
        {{ t('reviews.loginToReview') }}
      </BaseButton>
    </div>

    <div class="reviews__main">
      <Transition name="slide-up">
        <form v-if="showForm" class="card card-pad reviews__form" novalidate @submit="submit">
          <h3>{{ t('reviews.yourRating') }}</h3>
          <BaseRating v-model="form.values.rating" interactive size="1.25rem" />
          <p v-if="form.errors.rating" class="reviews__error" role="alert">{{ form.errors.rating }}</p>
          <BaseTextarea v-model="form.values.comment" :label="t('reviews.comment')" :placeholder="t('reviews.commentPlaceholder')" :maxlength="2000" :error="form.errors.comment" />
          <BaseAlert v-if="form.formError.value" tone="danger">{{ form.formError.value }}</BaseAlert>
          <div class="cluster">
            <BaseButton type="submit" :loading="form.submitting.value">{{ t('reviews.submit') }}</BaseButton>
            <BaseButton variant="ghost" @click="showForm = false">{{ t('common.cancel') }}</BaseButton>
          </div>
        </form>
      </Transition>

      <div v-if="isFetching(status) && !data.items.length" class="reviews__list">
        <div v-for="n in 2" :key="n" class="skeleton" style="block-size: 7rem" />
      </div>
      <BaseEmptyState v-else-if="!data.items.length" compact icon="ph:chat-circle-dots" :title="t('reviews.emptyTitle')" :description="t('reviews.emptyText')" />
      <ul v-else v-auto-animate class="reviews__list">
        <li v-for="review in data.items" :key="review.id" class="review card">
          <header class="review__head">
            <span class="review__avatar">{{ initials(review.user?.name) || '?' }}</span>
            <div class="review__who">
              <strong>{{ review.user?.name ?? t('reviews.anonymous') }}</strong>
              <time :datetime="review.createdAt">{{ date(review.createdAt) }}</time>
            </div>
            <BaseBadge v-if="review.isVerifiedPurchase" tone="success" icon="ph:seal-check" size="sm">{{ t('reviews.verified') }}</BaseBadge>
          </header>
          <BaseRating :value="review.rating" size="0.95rem" />
          <p v-if="review.comment" class="review__text">{{ review.comment }}</p>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.reviews {
  display: grid;
  /* minmax(0, …) lets the column shrink below its content (no page overflow). */
  grid-template-columns: minmax(0, 1fr);
  gap: var(--space-6);
  align-items: start;
}
@media (min-width: 1024px) {
  .reviews {
    grid-template-columns: 360px minmax(0, 1fr);
  }
  .reviews__summary {
    position: sticky;
    inset-block-start: calc(var(--header-height) + 4rem);
  }
}
.reviews__summary {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}
.reviews__score {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}
.reviews__score strong {
  font-size: var(--text-5xl);
  font-weight: var(--weight-black);
  line-height: 1;
}
.reviews__score p {
  margin-block-start: var(--space-1);
  font-size: var(--text-sm);
}
.reviews__bars {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  font-size: var(--text-sm);
}
.reviews__bars li {
  display: grid;
  grid-template-columns: 2.5rem minmax(0, 1fr) 2.5rem;
  align-items: center;
  gap: var(--space-2);
}
.reviews__bars li > :first-child {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-weight: var(--weight-bold);
}
.reviews__star {
  color: #f5b301;
  font-size: 0.85rem;
}
.reviews__bar {
  block-size: 0.5rem;
  border-radius: var(--radius-full);
  background: var(--color-surface-sunken);
  overflow: hidden;
}
.reviews__bar span {
  display: block;
  block-size: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #f5b301, #f59e0b);
  transition: inline-size 0.8s var(--ease-out);
}
.reviews__pct {
  color: var(--color-text-subtle);
  font-size: var(--text-xs);
  text-align: end;
}
.reviews__note {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-success);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
}
.reviews__main {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.reviews__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.reviews__error {
  color: var(--color-danger);
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
}
.reviews__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.review {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-5);
}
.review__head {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}
.review__avatar {
  display: grid;
  place-items: center;
  inline-size: 2.5rem;
  block-size: 2.5rem;
  border-radius: 50%;
  background: var(--color-primary-soft);
  color: var(--gold-800);
  font-weight: var(--weight-bold);
  font-size: var(--text-sm);
}
.review__who {
  display: flex;
  flex-direction: column;
  margin-inline-end: auto;
  font-size: var(--text-sm);
}
.review__who time {
  font-size: var(--text-xs);
  color: var(--color-text-subtle);
}
.review__text {
  color: var(--color-text-muted);
  line-height: var(--leading-relaxed);
  white-space: pre-line;
}
</style>
