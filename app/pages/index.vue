<template>
  <div class="home">
    <div class="hero-section">
      <BannerSlider :banners="homeBanners" />
      <div class="box">
        <div class="image">
          <img loading="lazy" src="/images/slider1.png" alt="" />
        </div>
        <div class="image">
          <img loading="lazy" src="/images/slider2.png" alt="" />
        </div>
        <div class="image">
          <img loading="lazy" src="/images/slider3.png" alt="" />
        </div>
      </div>
    </div>
    <!-- ============ قسم الأقسام ============ -->
    <div class="categories-section">
      <h2 class="section-title">الأقسام</h2>
      <div class="categories-grid">
        <div
          v-for="(category, index) in categories"
          :key="index"
          class="category-item"
        >
          <div class="category-image">
            <img :src="category.image" :alt="category.title" loading="lazy" />
          </div>
          <p class="category-title">{{ category.title }}</p>
        </div>
      </div>
    </div>
    <div class="container">
      <div class="main-image">
        <img loading="lazy" src="/images/main-image2.jpg" alt="" />
      </div>
    </div>

    <MainSlider
      title="عروض مميزة"
      highlight="مشاهدة المزيد"
      :products="featuredProducts"
    />

    <div class="container">
      <div class="main-image">
        <img loading="lazy" src="/images/main-image1.jpg" alt="" />
      </div>
    </div>

    <MainSlider
      title="أحدث الانتريهات"
      highlight="مشاهدة المزيد"
      :products="featuredProducts"
    />

    <div class="container">
      <div class="main-image">
        <img loading="lazy" src="/images/main-image3.jpg" alt="" />
      </div>
    </div>

    <MainSlider
      title="أحدث الكراسي"
      highlight="مشاهدة المزيد"
      :products="featuredProducts"
    />

    <div class="full-image">
      <img loading="lazy" src="/images/full-image.png" alt="" />
    </div>

    <MainSlider
      title="عروض شهر الخير"
      highlight="مشاهدة المزيد"
      :products="featuredProducts"
    />
  </div>
</template>

<script setup>
// بيانات البنرات
const homeBanners = [
  {
    title: "افرش بيتك بالكامل من أثاث مصر",
    subtitle: "من أثاث ومفروشات وأضاعة وديكور",
    buttonText: "اكتشف المجموعة",
    image: "/images/slider1.png",
  },
  {
    title: "عروض حصرية على قطع محدودة",
    subtitle: "خصومات تصل إلى 60% لفترة محدودة",
    buttonText: "تسوّق الآن",
    image: "/images/slider2.png",
  },
  {
    title: "عروض حصرية على قطع محدودة",
    subtitle: "خصومات تصل إلى 60% لفترة محدودة",
    buttonText: "تسوّق الآن",
    image: "/images/slider3.png",
  },
];

// منتجات العروض
const featuredProducts = [
  {
    title: '* 36" 180 كونتر خشب قهوة ترابيزة',
    image: "/images/products/product1.jpg",
    price: "1,299",
    oldPrice: "2,599",
    discount: "-57%",
  },
  {
    title: '* 36" 180 كونتر خشب قهوة ترابيزة',
    image: "/images/products/product2.jpg",
    price: "1,299",
    oldPrice: "2,599",
    discount: "-57%",
  },
  {
    title: '* 36" 180 كونتر خشب قهوة ترابيزة',
    image: "/images/products/product3.jpg",
    price: "1,299",
    oldPrice: "2,599",
    discount: "-57%",
  },
  {
    title: '* 36" 180 كونتر خشب قهوة ترابيزة',
    image: "/images/products/product4.jpg",
    price: "1,299",
    oldPrice: "2,599",
    discount: "-57%",
  },
  {
    title: '* 36" 180 كونتر خشب قهوة ترابيزة',
    image: "/images/products/product5.jpg",
    price: "1,299",
    oldPrice: "2,599",
    discount: "-57%",
  },
  {
    title: '* 40" 200 كونتر خشب قهوة ترابيزة',
    image: "/images/products/product2.jpg",
    price: "1,499",
    oldPrice: "2,999",
    discount: "-50%",
  },
  {
    title: '* 32" 160 كونتر خشب قهوة ترابيزة',
    image: "/images/products/product3.jpg",
    price: "1,099",
    oldPrice: "2,199",
    discount: "-50%",
  },
  {
    title: '* 38" 190 كونتر خشب قهوة ترابيزة',
    image: "/images/products/product1.jpg",
    price: "1,399",
    oldPrice: "2,799",
    discount: "-50%",
  },
  {
    title: '* 34" 170 كونتر خشب قهوة ترابيزة',
    image: "/images/products/product5.jpg",
    price: "1,199",
    oldPrice: "2,399",
    discount: "-50%",
  },
];

// أقسام المتجر
const categories = [
  { title: "دولاب", image: "/images/categ1.png" },
  { title: "تسريحة", image: "/images/categ2.png" },
  { title: "مطبخ", image: "/images/categ3.png" },
  { title: "كراسي", image: "/images/categ4.png" },
  { title: "كنب", image: "/images/categ5.png" },
  { title: "سجاد", image: "/images/categ6.png" },
  { title: "اضاءات", image: "/images/categ1.png" },
  { title: "ستائر", image: "/images/categ3.png" },
  { title: "أثاث مكتبي", image: "/images/categ2.png" },
  { title: "سرير", image: "/images/categ5.png" },
];
</script>

<style scoped>
.home {
  min-height: 500px;
}

.hero-section .box {
  display: flex;
  align-items: center;
  gap: 5px;
}
.hero-section .box img {
  width: 100%;
}

.main-image {
  margin: 20px 0;
}
.main-image img {
  width: 100%;
  border-radius: 20px;
}

.full-image img {
  width: 100%;
  border-radius: 5px;
}

/* ============ قسم الأقسام ============ */
.categories-section {
  padding: 50px 20px;
  text-align: center;
}

.section-title {
  font-size: 28px;
  font-weight: 700;
  color: #5a4a2f;
  margin-bottom: 30px;
  letter-spacing: 1px;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: #faf8f5;
  border-radius: 16px;
  transition:
    transform 0.3s ease,
    box-shadow 0.2s ease;
  cursor: pointer;
}

.category-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.06);
}

.category-image {
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.category-image img {
  max-width: 80%;
  max-height: 80%;
  object-fit: contain;
}

.category-title {
  font-weight: 600;
  font-size: 16px;
  color: #333;
  margin: 0;
  line-height: 1.4;
}

/* استجابة للشاشات الصغيرة */
@media (max-width: 992px) {
  .categories-grid {
    grid-template-columns: repeat(5, 1fr);
    gap: 18px;
  }
}

@media (max-width: 768px) {
  .categories-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 480px) {
  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .section-title {
    font-size: 24px;
  }
}
</style>
