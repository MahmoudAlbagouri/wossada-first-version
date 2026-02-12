<template>
  <div
    :class="{ 'overlay-active': mobileMenuOpen }"
    class="mobile-menu-overlay"
    @click="close"
  ></div>
</template>

<script setup>
defineProps({
  mobileMenuOpen: Boolean,
});
const emit = defineEmits(["close"]);
const close = () => emit("close");
</script>

<style scoped lang="scss">
.mobile-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  z-index: 1999;
  cursor: pointer;
}
.mobile-menu-overlay.overlay-active {
  opacity: 1;
  visibility: visible;
}
</style>
