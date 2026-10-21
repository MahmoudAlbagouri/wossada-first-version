<script setup lang="ts">
// Every /admin/* page shares the back-office layout and admin guard.
definePageMeta({ layout: 'admin', middleware: 'admin' });
useSeoMeta({ robots: 'noindex, nofollow' });
</script>

<template>
  <NuxtPage />
</template>
