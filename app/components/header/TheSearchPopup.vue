<template>
  <div class="search-popup">
    <div class="search-popup-content">
      <button @click="close" class="search-close-btn" aria-label="إغلاق البحث">
        <Icon name="ph:x" class="close-icon" />
      </button>
      <div class="search-input-container">
        <Icon name="ph:magnifying-glass" class="search-popup-icon" />
        <input
          :ref="() => searchInputRef"
          :value="searchQuery"
          @input="$emit('update:search-query', $event.target.value)"
          type="text"
          placeholder="ابحث عن المنتجات..."
          class="search-popup-input"
          @keyup.enter="performSearch"
        />
      </div>
      <button @click="performSearch" class="search-submit-btn">بحث</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  searchQuery: String,
  searchInputRef: Object,
});

const emit = defineEmits(["close", "perform-search", "update:search-query"]);

const close = () => emit("close");
const performSearch = () => emit("perform-search");
</script>

<style scoped lang="scss">
.search-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.7);
  opacity: 1;
  visibility: visible;
  transition: all 0.3s ease;
  z-index: 2100;
  cursor: pointer;
}
.search-popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(1);
  width: 90%;
  max-width: 500px;
  background: var(--bg-body);
  border-radius: 16px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  z-index: 2200;
  opacity: 1;
  visibility: visible;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.search-popup-content {
  padding: 30px;
  position: relative;
}
.search-close-btn {
  position: absolute;
  top: 0;
  right: 0;
  background: none;
  border: none;
  cursor: pointer;
  padding: 3px;
  color: var(--text-muted);
  font-size: 24px;
  transition: color 0.2s;
  z-index: 10;
  height: 40px;
}
.search-close-btn:hover {
  color: var(--color-green-primary);
}
.search-input-container {
  position: relative;
  margin-bottom: 20px;
}
.search-popup-icon {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-green-primary);
  font-size: 20px;
}
.search-popup-input {
  width: 100%;
  padding: 16px 20px 16px 20px;
  padding-right: 50px;
  border: 2px solid var(--color-green-primary);
  border-radius: 12px;
  background-color: var(--color-green-white);
  font-size: 16px;
  outline: none;
  transition: all 0.3s;
  direction: rtl;
  text-align: right;
}
.search-popup-input:focus {
  border-color: var(--color-green-light-active);
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.2);
}
.search-submit-btn {
  width: 100%;
  padding: 14px;
  background-color: var(--color-green-primary);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}
.search-submit-btn:hover {
  background-color: var(--color-green-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}
</style>
