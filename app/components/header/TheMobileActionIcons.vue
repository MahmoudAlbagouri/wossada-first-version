<template>
  <div class="action-icons-mobile">
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
.action-icons-mobile {
  display: none;
  position: fixed;
  bottom: 0;
  right: 0;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 30px;
  background-color: var(--color-green-white);
  color: var(--color-green-primary);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}
.action-icons-mobile .icon-md {
  font-size: 30px;
  cursor: pointer;
  transition: transform 0.2s;
}
.action-icons-mobile .icon-md:hover {
  transform: translateY(-2px);
}
@media (max-width: 870px) {
  .action-icons-mobile {
    display: flex;
  }
}
</style>
