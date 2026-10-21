<template>
  <div class="skel" aria-hidden="true">
    <div class="skeleton skel__media" />
    <div class="skel__body">
      <div class="skeleton skel__line" style="inline-size: 85%" />
      <div class="skeleton skel__line" style="inline-size: 55%" />
      <div class="skeleton skel__line skel__line--price" />
      <div class="skeleton skel__btn" />
    </div>
  </div>
</template>

<style scoped>
.skel {
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  overflow: hidden;
}
.skel__media {
  aspect-ratio: 4 / 5;
  border-radius: 0;
}
.skel__body {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-4);
}
.skel__line {
  block-size: 0.9rem;
}
.skel__line--price {
  inline-size: 40%;
  block-size: 1.2rem;
  margin-block-start: var(--space-2);
}
.skel__btn {
  block-size: 2.25rem;
  border-radius: var(--radius-full);
}
</style>
