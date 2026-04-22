// stores/productDetail.js
import { defineStore } from "pinia";

export const useProductDetailStore = defineStore("productDetail", {
  state: () => ({
    product: null,
    reviews: [],
    loading: false,
    reviewsLoading: false,
    submitLoading: false,
    submitError: null,
    error: null,
  }),

  getters: {
    translation:
      (state) =>
      (lang = "ar") => {
        return (
          state.product?.translations?.find((t) => t.languageCode === lang) ||
          state.product?.translations?.[0] ||
          null
        );
      },

    // ✅ الألوان المتاحة (فريدة من الـ variants)
    availableColors: (state) => {
      if (!state.product?.variants) return [];
      const seen = new Set();
      return state.product.variants
        .filter((v) => {
          if (!v.color || seen.has(v.color.id)) return false;
          seen.add(v.color.id);
          return true;
        })
        .map((v) => ({
          id: v.color.id,
          hex: v.color.hexCode,
          translations: v.color.translations,
        }));
    },

    // ✅ المقاسات المتاحة (فريدة من الـ variants)
    availableSizes: (state) => {
      if (!state.product?.variants) return [];
      const seen = new Set();
      return state.product.variants
        .filter((v) => {
          if (!v.size || seen.has(v.size.id)) return false;
          seen.add(v.size.id);
          return true;
        })
        .map((v) => ({
          id: v.size.id,
          type: v.size.type,
          translations: v.size.translations,
        }));
    },

    // ✅ الخامات المتاحة (فريدة من الـ variants)
    availableMaterials: (state) => {
      if (!state.product?.variants) return [];
      const seen = new Set();
      return state.product.variants
        .filter((v) => {
          if (!v.material || seen.has(v.material.id)) return false;
          seen.add(v.material.id);
          return true;
        })
        .map((v) => ({
          id: v.material.id,
          translations: v.material.translations,
        }));
    },

    allImages: (state) => {
      if (!state.product) return [];
      const images = [];
      if (state.product.mainImage) images.push(state.product.mainImage);
      if (state.product.defaultGallery?.length) {
        images.push(...state.product.defaultGallery);
      }
      return images;
    },

    finalPrice: (state) => {
      return state.product?.baseDiscountPrice || state.product?.basePrice || 0;
    },

    discountPercent: (state) => {
      const base = parseFloat(state.product?.basePrice || 0);
      const discounted = parseFloat(state.product?.baseDiscountPrice || 0);
      if (!base || !discounted || discounted >= base) return null;
      return `-${Math.round(((base - discounted) / base) * 100)}%`;
    },

    // ✅ سعر الـ Variant حسب اللون + المقاس + الخامة
    variantPrice: (state) => (colorId, sizeId, materialId) => {
      if (!state.product?.variants) return null;
      const variant = state.product.variants.find((v) => {
        const matchColor = colorId ? v.color?.id === colorId : true;
        const matchSize = sizeId ? v.size?.id === sizeId : true;
        const matchMaterial = materialId ? v.material?.id === materialId : true;
        return matchColor && matchSize && matchMaterial;
      });
      if (variant) {
        const price = variant.discountPrice
          ? parseFloat(variant.discountPrice)
          : parseFloat(variant.price);
        return isNaN(price) ? null : price;
      }
      return null;
    },

    // ✅ هل الـ variant المختار متاح في المخزون؟
    variantStock: (state) => (colorId, sizeId, materialId) => {
      if (!state.product?.variants) return 0;
      const variant = state.product.variants.find((v) => {
        const matchColor = colorId ? v.color?.id === colorId : true;
        const matchSize = sizeId ? v.size?.id === sizeId : true;
        const matchMaterial = materialId ? v.material?.id === materialId : true;
        return matchColor && matchSize && matchMaterial;
      });
      return variant?.stock ?? 0;
    },

    // ✅ ID الـ variant المختار
    findVariantId: (state) => (colorId, sizeId, materialId) => {
      if (!state.product?.variants) return null;
      const variant = state.product.variants.find((v) => {
        const matchColor = colorId ? v.color?.id === colorId : true;
        const matchSize = sizeId ? v.size?.id === sizeId : true;
        const matchMaterial = materialId ? v.material?.id === materialId : true;
        return matchColor && matchSize && matchMaterial;
      });
      return variant?.id || null;
    },
  },

  actions: {
    async fetchProduct(slug) {
      this.loading = true;
      this.error = null;
      try {
        const nuxtApp = useNuxtApp();
        const config = useRuntimeConfig();
        const token =
          useCookie("auth_token").value ||
          nuxtApp.$pinia.state.value.auth?.token;

        const response = await $fetch(`/products/detail/${slug}`, {
          baseURL: config.public.apiBase,
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            "Accept-Language": nuxtApp.$i18n?.locale?.value || "ar",
            "Content-Type": "application/json",
          },
        });

        if (response.success) {
          this.product = response.data;
          return response.data;
        }
        return null;
      } catch (error) {
        console.error("Fetch Product Detail Error:", error);
        this.error = error?.message || "حدث خطأ أثناء جلب بيانات المنتج";
        return null;
      } finally {
        this.loading = false;
      }
    },

    async fetchReviews(productId) {
      this.reviewsLoading = true;
      try {
        const nuxtApp = useNuxtApp();
        const config = useRuntimeConfig();
        const token =
          useCookie("auth_token").value ||
          nuxtApp.$pinia.state.value.auth?.token;

        const response = await $fetch(`/reviews/product/${productId}`, {
          baseURL: config.public.apiBase,
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            "Accept-Language": nuxtApp.$i18n?.locale?.value || "ar",
          },
        });

        if (response.success) {
          this.reviews = response.data;
          return response.data;
        }
        return null;
      } catch (error) {
        console.error("Fetch Reviews Error:", error?.message);
        return null;
      } finally {
        this.reviewsLoading = false;
      }
    },

    async submitReview({ productId, rating, comment }) {
      this.submitLoading = true;
      this.submitError = null;
      try {
        const nuxtApp = useNuxtApp();
        const config = useRuntimeConfig();
        const token =
          useCookie("auth_token").value ||
          nuxtApp.$pinia.state.value.auth?.token;

        const response = await $fetch(`/reviews`, {
          baseURL: config.public.apiBase,
          method: "POST",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            "Accept-Language": nuxtApp.$i18n?.locale?.value || "ar",
            "Content-Type": "application/json",
          },
          body: { productId, rating, comment },
        });

        if (response.success) {
          await this.fetchReviews(productId);
          return { success: true };
        }
        return { success: false, error: "فشلت العملية" };
      } catch (error) {
        console.error("Submit Review Error:", error?.message);
        const status = error?.response?.status;
        if (status === 401)
          this.submitError = "يجب تسجيل الدخول أولاً لإضافة تقييم";
        else if (status === 400) this.submitError = "بيانات التقييم غير صحيحة";
        else this.submitError = error?.message || "فشل إرسال التقييم";
        return { success: false, error: this.submitError };
      } finally {
        this.submitLoading = false;
      }
    },

    resetState() {
      this.product = null;
      this.reviews = [];
      this.error = null;
      this.submitError = null;
    },
  },
});
