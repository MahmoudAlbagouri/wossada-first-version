<template>
  <div class="container">
    <div class="account-layout">
      <!-- الشريط الجانبي -->
      <aside class="sidebar">
        <AccountSidebar />
      </aside>

      <!-- المحتوى الرئيسي -->
      <main class="main-content">
        <div class="account-card">
          <h1 class="card-title">المفضلة</h1>

          <div class="wishlist-grid">
            <ProductCard
              v-for="item in wishlistItems"
              :key="item.id"
              :product="item"
              :in-wishlist="true"
            />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import ProductCard from "@/components/global/ProductCard.vue";
import AccountSidebar from "@/components/base/AccountSidebar.vue";

const wishlistItems = ref([
  {
    id: 1,
    title: '* 36" 180 كونتر خشب قهوة ترابيزة',
    image: "/images/products/product1.jpg",
    price: "1,299",
    oldPrice: "2,599",
    discount: "-57%",
  },
  {
    id: 2,
    title: '* 40" 200 كونتر خشب قهوة ترابيزة',
    image: "/images/products/product1.jpg",
    price: "1,499",
    oldPrice: "2,999",
    discount: "-50%",
  },
  {
    id: 3,
    title: '* 32" 160 كونتر خشب قهوة ترابيزة',
    image: "/images/products/product1.jpg",
    price: "1,099",
    oldPrice: "2,199",
    discount: "-50%",
  },
  {
    id: 4,
    title: '* 38" 190 كونتر خشب قهوة ترابيزة',
    image: "/images/products/product1.jpg",
    price: "1,399",
    oldPrice: "2,799",
    discount: "-50%",
  },
  {
    id: 5,
    title: '* 34" 170 كونتر خشب قهوة ترابيزة',
    image: "/images/products/product1.jpg",
    price: "1,199",
    oldPrice: "2,399",
    discount: "-50%",
  },
  {
    id: 6,
    title: '* 30" 150 كونتر خشب قهوة ترابيزة',
    image: "/images/products/product1.jpg",
    price: "999",
    oldPrice: "1,999",
    discount: "-50%",
  },
]);
</script>

<style scoped lang="scss">
.account-layout {
  min-height: 100vh;
  display: flex;
  background-color: var(--bg-body);
  padding: 20px;
  gap: 24px;
  padding-top: 50px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
}

.main-content {
  flex: 1;
}

.account-card {
  background: var(--color-green-white);
  border-radius: 16px;
  box-shadow: var(--shadow-3);
  padding: 60px 40px 40px;
  position: relative;
  @media (max-width: 768px) {
    padding: 40px 20px 20px;
  }
}

.card-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-green-primary);
  text-align: center;
  position: absolute;
  top: -20px;
  background: var(--color-green-light);
  width: 80%;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 12px;
}

.wishlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
}
</style>
