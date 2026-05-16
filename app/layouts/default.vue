<template>
  <div class="main-app">
    <TheHeader />

    <main class="main-content">
      <slot />
    </main>

    <TheFooter />

    <!-- ✅ إضافة مكون الجوال في أسفل الصفحة ليظهر فوق الفوتر أو تحته حسب التصميم -->
    <TheMobileActions />
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useCartStore } from "@/stores/cart";
import { useWishlistStore } from "@/stores/wishlist";

// 1. تهيئة الـ Stores
const cartStore = useCartStore();
const wishlistStore = useWishlistStore();

// 2. التحقق من التوكن (يمكن استيراده هنا أو الاعتماد على الـ Middleware)
const token = useCookie("auth_token");

// 3. جلب البيانات عند تحميل التطبيق لأول مرة
onMounted(async () => {
  // نتأكد أن المستخدم مسجل دخول قبل جلب البيانات الخاصة به
  if (token.value) {
    // نستخدم Promise.all لجلب البيانات بالتوازي لسرعة الأداء
    await Promise.all([cartStore.fetchCart(), wishlistStore.fetchWishlist()]);
  }
});
</script>

<style scoped>
.main-content {
  position: relative;
  padding-top: 215px;
  /* إضافة مساحة في الأسفل لضمان عدم تغطية شريط الجوال للمحتوى */
  padding-bottom: 80px;
}

@media (max-width: 870px) {
  .main-content {
    padding-top: 160px;
  }
}
</style>
