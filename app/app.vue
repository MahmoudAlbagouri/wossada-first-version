<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
<script setup>
const { initLanguage } = useLanguage();
onMounted(() => {
  initLanguage();
});
</script>
