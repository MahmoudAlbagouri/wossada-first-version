<template>
  <div class="not-found-page" dir="rtl">
    <div class="container">
      <!-- Illustration / Visual -->
      <div class="visual-content animate-float">
        <svg
          width="280"
          height="280"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#987226"
          stroke-width="1"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="10" stroke-dasharray="4 4" />
          <path d="M12 8v4M12 16h.01" stroke-width="3" />
          <path
            d="M9 10a3 3 0 0 1 6 0v4a3 3 0 0 1-6 0z"
            fill="#fff"
            stroke="#987226"
          />
          <path d="M15 10l4-4M9 10l-4-4" stroke-opacity="0.5" />
        </svg>
      </div>

      <!-- Text Content -->
      <div class="text-content">
        <h1 class="error-code">404</h1>
        <h2 class="error-title">عذراً! الصفحة غير موجودة</h2>
        <p class="error-message">
          يبدو أن الرابط الذي تحاول الوصول إليه قد تم تغييره أو حذفه، أو أنك
          أدخلت رابطاً خاطئاً.
        </p>

        <div class="action-buttons">
          <NuxtLink to="/" class="btn-primary">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            العودة للرئيسية
          </NuxtLink>

          <button @click="$router.back()" class="btn-secondary">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            الرجوع للخلف
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// يمكن إضافة منطق SEO هنا إذا لزم الأمر
useHead({
  title: "صفحة غير موجودة - 404",
  meta: [{ name: "description", content: "الصفحة التي تبحث عنها غير موجودة." }],
});
</script>

<style scoped>
.not-found-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f7f5f0; /* نفس خلفية المشروع */
  font-family: "Cairo", sans-serif;
  padding: 20px;
  text-align: center;
  overflow: hidden;
}

.container {
  max-width: 600px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
}

/* Visual Animation */
.visual-content {
  position: relative;
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
  100% {
    transform: translateY(0px);
  }
}

/* Typography */
.error-code {
  font-size: 120px;
  font-weight: 900;
  color: #987226; /* اللون الأساسي الذهبي/البني */
  line-height: 1;
  margin: 0;
  opacity: 0.1; /* تأثير شفاف للخلفية */
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 0;
  pointer-events: none;
}

.text-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.error-title {
  font-size: 32px;
  font-weight: 800;
  color: #3a2e1a;
  margin: 0;
}

.error-message {
  font-size: 18px;
  color: #666;
  line-height: 1.6;
  max-width: 450px;
  margin: 0;
}

/* Buttons */
.action-buttons {
  display: flex;
  gap: 16px;
  margin-top: 24px;
  flex-wrap: wrap;
  justify-content: center;
}

.btn-primary,
.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  border-radius: 12px;
  font-family: "Cairo", sans-serif;
  font-size: 16px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background: #987226;
  color: #fff;
  box-shadow: 0 4px 15px rgba(152, 114, 38, 0.3);
}

.btn-primary:hover {
  background: #7a5b1e;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(152, 114, 38, 0.4);
}

.btn-secondary {
  background: #fff;
  color: #3a2e1a;
  border: 2px solid #e8e0cf;
}

.btn-secondary:hover {
  border-color: #987226;
  color: #987226;
  background: #fdfaf4;
}

/* Responsive */
@media (max-width: 480px) {
  .error-code {
    font-size: 80px;
  }

  .error-title {
    font-size: 24px;
  }

  .error-message {
    font-size: 16px;
  }

  .action-buttons {
    flex-direction: column;
    width: 100%;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    justify-content: center;
  }
}
</style>
