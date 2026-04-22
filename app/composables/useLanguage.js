export const useLanguage = () => {
  const { locale, setLocale } = useI18n();
  // const categoryStore = useCategoryStore();

  const currentLang = computed(() => locale.value);

  const applyLanguageSettings = (lang) => {
    if (process.client) {
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = lang;
    }
  };

  const setLanguage = async (lang) => {
    if (!["ar", "en"].includes(lang) || lang === locale.value) return;
    console.log("🌍 setLanguage اتنادى بـ:", lang);
    try {
      await setLocale(lang);
      console.log("✅ locale بعد setLocale:", locale.value);
      applyLanguageSettings(lang);
      // await categoryStore.fetchCategories(lang);
    } catch (error) {
      console.error("Language Switch Error:", error);
    }
  };
  const initLanguage = () => {
    if (process.client) {
      applyLanguageSettings(locale.value);
    }
  };

  return { currentLang, setLanguage, initLanguage };
};
