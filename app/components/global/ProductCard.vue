<template>
  <div class="product-card">
    <NuxtLink :to="`/product/${product.slug}`">
      <div class="product-image">
        <div class="icon-wrapper" @click.stop.prevent="handleToggleWishlist">
          <Icon
            :name="
              wishlistStore.isInWishlist(product.id)
                ? 'ph:heart-fill'
                : 'ph:heart-light'
            "
            class="icon-md"
            :class="{ 'active-heart': wishlistStore.isInWishlist(product.id) }"
          />
        </div>

        <div class="gift">
          <Icon name="ph:gift-light" class="icon-md" />
          <span class="gift-text">اطلب هديتك</span>
        </div>

        <img :src="mainImage" :alt="productName" class="image" loading="lazy" />

        <span v-if="discountPercent" class="discount-badge">
          {{ discountPercent }}%
        </span>
      </div>
    </NuxtLink>

    <div class="product-info">
      <h3 class="title">{{ productName }}</h3>

      <div class="price-discount">
        <div class="price-section">
          <span class="new-price">{{ formatPrice(activePrice) }} ج.م</span>
          <span v-if="activeOldPrice" class="old-price">
            {{ formatPrice(activeOldPrice) }} ج.م
          </span>
        </div>
      </div>

      <div class="card-actions" @click.stop.prevent>
        <AddToCartButton
          :productId="product.id"
          :max="product.baseStock || 50"
          :initialQuantity="1"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useWishlistStore } from "@/stores/wishlist";
import AddToCartButton from "@/components/base/AddToCartButton.vue";

const props = defineProps({
  product: { type: Object, required: true },
});

const wishlistStore = useWishlistStore();
const { currentLang } = useLanguage();

// التبديل بين الإضافة والحذف
const handleToggleWishlist = async () => {
  await wishlistStore.toggleWishlist(props.product.id);
};

// اسم المنتج
const productName = computed(() => {
  if (props.product.translations?.length) {
    const trans = props.product.translations.find(
      (t) => t.languageCode === "ar",
    ); // أو استخدم currentLang
    return trans?.name || props.product.translations[0]?.name;
  }
  return props.product.name || "منتج أفنان";
});

// الصورة
const mainImage = computed(
  () => props.product.mainImage || "/images/products/placeholder.jpg",
);

// حساب الأسعار ديناميكياً من الـ API
const activePrice = computed(() => {
  return parseFloat(
    props.product.baseDiscountPrice || props.product.basePrice || 0,
  );
});

const activeOldPrice = computed(() => {
  return props.product.baseDiscountPrice
    ? parseFloat(props.product.basePrice)
    : null;
});

const discountPercent = computed(() => {
  if (!activeOldPrice.value || !activePrice.value) return null;
  return Math.round(
    ((activeOldPrice.value - activePrice.value) / activeOldPrice.value) * 100,
  );
});

const formatPrice = (price) => Number(price).toLocaleString("ar-EG");
</script>

<style scoped lang="scss">
.product-card {
  width: 100%;
  max-width: 400px;
  background: var(--color-green-white);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-3);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  }
}

.card-actions {
  padding: 0 16px 16px;
}

.product-image {
  height: 300px;
  overflow: hidden;
  background-color: var(--color-green-light);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  .icon-wrapper {
    position: absolute;
    top: 5px;
    left: 5px;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--color-green-white);
    border-radius: 10px;
    z-index: 1;

    span {
      color: var(--color-green-primary);
      font-size: 30px;
    }
  }

  .gift {
    position: absolute;
    top: 0;
    right: 0;
    background-color: var(--color-green-primary);
    color: var(--color-yellow-light);
    padding: 5px 8px;
    display: flex;
    align-items: center;
    gap: 5px;
    z-index: 1;
  }

  .gift-text {
    font-size: 12px;
    font-weight: 600;
  }

  .discount-badge {
    position: absolute;
    bottom: 10px;
    left: 10px;
    background: var(--color-yellow-secondary);
    color: var(--color-green-darker);
    font-size: 12px;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 4px;
    z-index: 1;
  }

  .image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}

.product-info {
  padding: 16px;
  text-align: right;
  direction: rtl;
}

.title {
  font-size: 16px;
  font-weight: 600;
  color: #222;
  margin: 0 0 8px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.price-discount {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.price-section {
  display: flex;
  align-items: center;
  gap: 8px;

  .new-price {
    font-size: 18px;
    font-weight: 700;
    color: var(--color-green-primary);
  }

  .old-price {
    font-size: 14px;
    color: #999;
    text-decoration: line-through;
    font-weight: 500;
  }
}
</style>
