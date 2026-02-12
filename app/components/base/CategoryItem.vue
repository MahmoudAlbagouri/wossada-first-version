<!-- components/CategoryItem.vue -->
<template>
  <div class="category-item">
    <div class="category-image">
      <img :src="image" :alt="title" loading="lazy" width="100" height="100" />
    </div>
    <p class="category-title">{{ title }}</p>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  image: { type: String, required: true },
});
</script>

<style scoped>
.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 12px;
  background: #faf8f5;
  border-radius: 16px;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.category-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.05);
}

.category-image {
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.category-image img {
  max-width: 80%;
  max-height: 80%;
  object-fit: contain;
}

.category-title {
  font-weight: 600;
  font-size: 16px;
  color: #333;
  margin: 0;
}
</style>
