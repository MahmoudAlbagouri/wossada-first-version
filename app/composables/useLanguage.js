// app/composables/useLanguage.js

export const useLanguage = () => {
  const { locale, setLocale } = useI18n();
  // لو عندك ستور للمنتجات أو الأقسام وعايز تحدثهم أول ما اللغة تتغير فك الكومنت
  // const categoryStore = useCategoryStore();

  const currentLang = computed(() => locale.value);

  /**
   * تحديث إعدادات الـ DOM (الاتجاه واللغة)
   */
  const applyLanguageSettings = (lang) => {
    if (process.client) {
      const dir = lang === "ar" ? "rtl" : "ltr";
      document.documentElement.dir = dir;
      document.documentElement.lang = lang;
    }
  };

  /**
   * تغيير لغة الموقع بالكامل
   */
  const setLanguage = async (lang) => {
    // التأكد من أن اللغة جديدة ومدعومة
    if (!["ar", "en"].includes(lang) || lang === locale.value) return;

    try {
      // 1. تغيير اللغة في نظام i18n (ده هيخلي useApi يبعت الهيدر الجديد في الطلبات الجاية)
      await setLocale(lang);

      // 2. تحديث اتجاه الصفحة بصرياً
      applyLanguageSettings(lang);

      // 3. (اختياري) إعادة جلب البيانات من السيرفر باللغة الجديدة
      // await categoryStore.fetchCategories();

      console.log(`🌍 تم تغيير اللغة بنجاح إلى: ${lang}`);
    } catch (error) {
      console.error("خطأ أثناء تغيير اللغة:", error);
    }
  };

  /**
   * تشغيل الإعدادات الأولية عند تحميل التطبيق
   */
  const initLanguage = () => {
    if (process.client) {
      applyLanguageSettings(locale.value);
    }
  };

  return { currentLang, setLanguage, initLanguage };
};
