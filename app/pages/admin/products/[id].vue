<script setup lang="ts">
const route = useRoute();
useHead({ title: 'تعديل منتج' });
</script>

<template>
  <ProductEditor :key="String(route.params.id)" :product-id="String(route.params.id)" />
</template>
