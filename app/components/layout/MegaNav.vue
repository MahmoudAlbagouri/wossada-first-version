<script setup lang="ts">
const { t } = useI18n();
const { name } = useLocalized();
const categories = useNavCategories();
const route = useRoute();

/** Index of the category whose panel is open (hover or keyboard focus). */
const openIndex = ref<number | null>(null);
let closeTimer: ReturnType<typeof setTimeout> | undefined;

function show(index: number) {
  clearTimeout(closeTimer);
  openIndex.value = index;
}
function hide() {
  closeTimer = setTimeout(() => (openIndex.value = null), 120);
}

watch(() => route.fullPath, () => (openIndex.value = null));
const visible = computed(() => categories.value.slice(0, 8));
</script>

<template>
  <nav class="mega" :aria-label="t('nav.categories')">
    <div class="container mega__inner">
      <ul class="mega__list">
        <li>
          <NuxtLink to="/products" class="mega__link mega__link--all">
            <Icon name="ph:squares-four" aria-hidden="true" />{{ t('nav.allProducts') }}
          </NuxtLink>
        </li>
        <li
          v-for="(category, index) in visible"
          :key="category.id"
          class="mega__item"
          @mouseenter="show(index)"
          @mouseleave="hide"
          @focusin="show(index)"
          @focusout="hide"
        >
          <NuxtLink
            :to="`/category/${category.slug}`"
            class="mega__link"
            :aria-expanded="category.children?.length ? openIndex === index : undefined"
          >
            {{ name(category) }}
            <Icon v-if="category.children?.length" name="ph:caret-down" class="mega__caret" aria-hidden="true" />
          </NuxtLink>

          <Transition name="slide-up">
            <div v-if="category.children?.length && openIndex === index" class="mega__panel">
              <div class="container mega__panel-inner">
                <div class="mega__children">
                  <NuxtLink
                    v-for="child in category.children"
                    :key="child.id"
                    :to="`/category/${child.slug}`"
                    class="mega__child"
                  >
                    <BaseImage
                      v-if="child.image"
                      :src="child.image"
                      :alt="name(child)"
                      :width="64"
                      :height="64"
                      ratio="1"
                      rounded
                      class="mega__child-img"
                    />
                    <span v-else class="mega__child-icon" aria-hidden="true"><Icon name="ph:armchair" /></span>
                    <span>{{ name(child) }}</span>
                  </NuxtLink>
                </div>
                <NuxtLink :to="`/category/${category.slug}`" class="mega__feature">
                  <BaseImage
                    :src="category.image"
                    :alt="name(category)"
                    :width="320"
                    :height="200"
                    ratio="16/10"
                    rounded
                  />
                  <span class="mega__feature-cta">
                    {{ t('nav.shopCategory', { name: name(category) }) }}
                    <Icon name="ph:arrow-right" class="flip-rtl" aria-hidden="true" />
                  </span>
                </NuxtLink>
              </div>
            </div>
          </Transition>
        </li>
      </ul>
    </div>
  </nav>
</template>

<style scoped>
.mega {
  border-block-start: 1px solid var(--color-border);
}
.mega__list {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  block-size: 3rem;
  overflow-x: auto;
  scrollbar-width: none;
}
.mega__link {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  white-space: nowrap;
  color: var(--color-text-muted);
  transition:
    color var(--duration-fast) ease,
    background-color var(--duration-fast) ease;
}
.mega__link::after {
  content: '';
  position: absolute;
  inset-inline: var(--space-3);
  inset-block-end: 2px;
  block-size: 2px;
  border-radius: var(--radius-full);
  background: var(--color-primary);
  transform: scaleX(0);
  transition: transform var(--duration-base) var(--ease-out);
}
.mega__link:hover,
.mega__link.router-link-active {
  color: var(--color-primary);
}
.mega__link:hover::after,
.mega__link.router-link-active::after {
  transform: scaleX(1);
}
.mega__link--all {
  color: var(--color-primary);
  background: var(--color-primary-softer);
}
.mega__link--all::after {
  display: none;
}
.mega__caret {
  font-size: 0.8rem;
  transition: transform var(--duration-base) var(--ease-out);
}
.mega__item:hover .mega__caret {
  transform: rotate(180deg);
}

.mega__panel {
  position: absolute;
  inset-inline: 0;
  inset-block-start: 100%;
  z-index: var(--z-dropdown);
  padding-block: var(--space-6);
  background: var(--color-surface);
  border-block: 1px solid var(--color-border);
  box-shadow: var(--shadow-lg);
}
.mega__panel-inner {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: var(--space-8);
}
.mega__children {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--space-2);
  align-content: start;
}
.mega__child {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  transition:
    background-color var(--duration-fast) ease,
    color var(--duration-fast) ease,
    transform var(--duration-base) var(--ease-out);
}
.mega__child:hover {
  background: var(--color-primary-softer);
  color: var(--color-primary);
  transform: translateX(-4px);
}
:dir(ltr) .mega__child:hover {
  transform: translateX(4px);
}
.mega__child-img {
  inline-size: 3rem;
  flex-shrink: 0;
}
.mega__child-icon {
  display: grid;
  place-items: center;
  inline-size: 3rem;
  block-size: 3rem;
  border-radius: var(--radius-md);
  background: var(--color-surface-sunken);
  color: var(--color-primary);
  font-size: 1.4rem;
}
.mega__feature {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.mega__feature :deep(.img-frame__img) {
  transition: transform 0.8s var(--ease-out);
}
.mega__feature:hover :deep(.img-frame__img) {
  transform: scale(1.06);
}
.mega__feature-cta {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-weight: var(--weight-bold);
  color: var(--color-primary);
}
</style>
