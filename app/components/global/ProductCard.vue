<template>
  <div class="product-card">
    <!-- الصورة -->
    <div class="product-image">
      <div class="icon-wrapper">
        <!-- ✅ تغيير الأيقونة حسب السياق -->
        <Icon
          :name="inWishlist ? 'ph:heart-fill' : 'ph:heart-light'"
          class="icon-md"
        />
      </div>
      <div class="gift">
        <Icon name="ph:gift-light" class="icon-md" />
        <span class="gift-text">اطلب هديتك</span>
      </div>
      <img
        :src="product.image || '/images/products/product1.jpg'"
        :alt="product.title || 'منتج'"
        class="image"
        loading="lazy"
      />
    </div>

    <!-- المحتوى النصي -->
    <div class="product-info">
      <h3 class="title">{{ product.title || "عنوان المنتج" }}</h3>

      <!-- السعر -->
      <div class="price-discount">
        <div class="price-section">
          <span class="new-price">{{ product.price }}ج.م</span>
          <span class="old-price">{{ product.oldPrice }}ج.م</span>
        </div>

        <!-- شارة الخصم -->
        <span class="discount-badge">{{ product.discount }}</span>
      </div>

      <!-- ✅ استخدام المكون الجديد -->
      <AddToCartButton
        v-model:quantity="cartQuantity"
        @added="handleAddToCart"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import AddToCartButton from "@/components/base/AddToCartButton.vue";

const props = defineProps({
  product: {
    type: Object,
    required: true,
    default: () => ({
      title: "ترابيزة قهوة خشب كونتر 180 *36 * 30 سم",
      image: "/images/products/product1.jpg",
      price: "1,299",
      oldPrice: "2,599",
      discount: "-57%",
    }),
  },
  // ✅ prop جديد لتحديد إذا كان في المفضلة
  inWishlist: {
    type: Boolean,
    default: false,
  },
});

const cartQuantity = ref(1);

const handleAddToCart = (quantity) => {
  console.log(`تمت إضافة ${quantity} من المنتج إلى السلة`);
  // TODO: إرسال إلى سلة التسوق
};
</script>

<style scoped lang="scss">
/* ... نفس الـ CSS السابق بدون تغيير ... */
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

/* الصورة */
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
  }

  .gift-text {
    font-size: 12px;
    font-weight: 600;
  }

  .gift .icon-md {
    font-size: 18px;
  }

  .image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}

/* المحتوى */
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
}

/* قسم السعر */
.price-section {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.price-discount {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .old-price {
    font-size: 14px;
    color: #999;
    text-decoration: line-through;
    font-weight: 500;
  }

  .new-price {
    font-size: 18px;
    font-weight: 700;
    color: var(--color-green-primary);
  }

  .discount-badge {
    display: inline-block;
    background: var(--color-yellow-secondary);
    color: var(--color-green-darker);
    font-size: 12px;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 4px;
    margin-bottom: 16px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
}
</style>
