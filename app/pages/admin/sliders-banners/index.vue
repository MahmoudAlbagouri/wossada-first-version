<script setup lang="ts">
import type { HomeBlockType } from '~/types/ui';

const route = useRoute();
const router = useRouter();

useHead({ title: 'السلايدر والبانرات' });

const tabs: { key: HomeBlockType; label: string; icon: string }[] = [
  { key: 'mainSlider', label: 'السلايدر الرئيسي', icon: 'ph:slideshow' },
  { key: 'productSlider', label: 'سلايدر المنتجات', icon: 'ph:squares-four' },
  { key: 'fixedBanner', label: 'البانرات', icon: 'ph:image-square' },
  { key: 'fullImage', label: 'الصور العريضة', icon: 'ph:image' },
  { key: 'staticSection', label: 'أقسام ثابتة', icon: 'ph:puzzle-piece' },
];

const initial = tabs.find((t) => t.key === route.query.tab)?.key ?? 'mainSlider';
const tab = ref<HomeBlockType>(initial);
watch(tab, (value) => router.replace({ query: { ...route.query, tab: value } }));
</script>

<template>
  <AdminPage title="السلايدر والبانرات" description="محتوى الصفحة الرئيسية. بعد الإضافة اربط المحتوى بقسم من صفحة «الصفحة الرئيسية» عن طريق المفتاح.">
    <template #actions>
      <BaseButton to="/admin/home" variant="outline" icon="ph:layout">ترتيب الصفحة الرئيسية</BaseButton>
    </template>
    <BaseTabs v-model="tab" :tabs="tabs" />
    <HomeBlockManager :key="tab" :type="tab" />
  </AdminPage>
</template>
