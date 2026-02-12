<template>
  <div class="main-app">
    <TheHeader />

    <main class="main-content">
      <slot />
    </main>
    <TheFooter />
  </div>
</template>
<style scoped>
.main-content {
  position: relative;
  padding-top: 185px;
}
</style>
