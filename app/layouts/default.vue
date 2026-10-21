<script setup lang="ts">
const menuOpen = ref(false);
await loadNavCategories();
</script>

<template>
  <div class="shell">
    <AppHeader @open-menu="menuOpen = true" />
    <main id="main" class="shell__main">
      <slot />
    </main>
    <AppFooter />
    <MobileTabBar @open-menu="menuOpen = true" />
    <MobileMenu v-model="menuOpen" />
    <WhatsAppButton />
  </div>
</template>

<style scoped>
.shell {
  display: flex;
  flex-direction: column;
  min-block-size: 100dvh;
}
.shell__main {
  flex: 1;
}
</style>
