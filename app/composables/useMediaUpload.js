// composables/useMediaUpload.js

export const useMediaUpload = () => {
  const nuxtApp = useNuxtApp();
  const config = useRuntimeConfig();

  const _getToken = () =>
    useCookie("auth_token").value || nuxtApp.$pinia?.state?.value?.auth?.token;

  const _baseURL = config.public.apiBase;

  // ====== رفع صور ======
  // folder: "products" | "categories" | "brands" | etc.
  const uploadImages = async (files, folder = "products") => {
    const token = _getToken();
    const formData = new FormData();

    // قبول File واحد أو مصفوفة
    const fileList = Array.isArray(files) ? files : [files];
    fileList.forEach((file) => formData.append("files", file));

    try {
      const response = await $fetch(`/media/upload/${folder}`, {
        method: "POST",
        baseURL: _baseURL,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          // لا تضع Content-Type هنا — المتصفح يضعه تلقائياً مع boundary لـ FormData
        },
        body: formData,
      });

      if (response.success) {
        // البيانات داخل data.data
        const uploaded = response.data?.data || [];
        return { success: true, files: uploaded };
      }
      return { success: false, files: [] };
    } catch (error) {
      console.error("uploadImages error:", error);
      return { success: false, files: [], error };
    }
  };

  // ====== جلب قائمة الصور المرفوعة ======
  const listImages = async (folder = "products") => {
    const token = _getToken();
    try {
      const response = await $fetch(`/media/list/${folder}`, {
        baseURL: _baseURL,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (response.success) {
        return { success: true, files: response.data };
      }
      return { success: false, files: [] };
    } catch (error) {
      console.error("listImages error:", error);
      return { success: false, files: [], error };
    }
  };

  return { uploadImages, listImages };
};
