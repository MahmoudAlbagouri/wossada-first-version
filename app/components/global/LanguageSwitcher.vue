<template>
  <div class="lang-switcher">
    <button @click="toggleLanguage" class="lang-btn" aria-label="تغيير اللغة">
      <span v-if="currentLang === 'ar'">EN</span>
      <span v-else>عربي</span>
    </button>
  </div>
</template>

<script setup>
const { currentLang, setLanguage } = useLanguage();

const toggleLanguage = () => {
  const newLang = currentLang.value === "ar" ? "en" : "ar";
  setLanguage(newLang);

  // اختياري: إعادة تحميل الصفحة لضمان تطبيق الترجمات في النصوص الثابتة
  // إذا كنت تستخدم نصوصاً ديناميكية فقط من الـ API، فلا حاجة لإعادة التحميل
  // window.location.reload();
};
</script>

<style scoped>
.lang-switcher {
  display: inline-block;
}

.lang-btn {
  background: transparent;
  border: 1px solid var(--color-green-primary);
  color: var(--color-green-primary);
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  font-size: 14px;
  transition: all 0.3s ease;
}

.lang-btn:hover {
  background-color: var(--color-green-primary);
  color: white;
}
</style>
