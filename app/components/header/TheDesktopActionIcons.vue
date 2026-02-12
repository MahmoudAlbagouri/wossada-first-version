<template>
  <div class="action-icons">
    <NuxtLink to="/account/cart">
      <div class="icon-wrapper basket">
        <Icon name="ph:basket-light" class="icon-md" />
      </div>
    </NuxtLink>
    <NuxtLink to="/login">
      <div class="icon-wrapper">
        <Icon name="ph:user-circle-light" class="icon-md" />
      </div>
    </NuxtLink>
    <NuxtLink to="/account/wishlist">
      <div class="icon-wrapper">
        <Icon name="ph:heart-light" class="icon-md" />
      </div>
    </NuxtLink>

    <div class="icon-wrapper">
      <Icon name="ph:truck-light" class="icon-md" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.action-icons {
  display: flex;
  gap: 22px;
  color: var(--color-green-primary);
}
.action-icons .icon-md {
  font-size: 30px;
  cursor: pointer;
  transition: transform 0.2s;
}
.action-icons .icon-md:hover {
  transform: translateY(-2px);
}
</style>
