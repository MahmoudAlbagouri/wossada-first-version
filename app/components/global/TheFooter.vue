<template>
  <footer class="footer" dir="rtl">
    <!-- Social Icons -->
    <div class="box-social">
      <h3 class="label">تابعنا</h3>
      <div class="social-icons">
        <img src="/images/logos_facebook.png" alt="" srcset="" />
        <img src="/images/mage_snapchat.png" alt="" srcset="" />
        <img src="/images/mage_tiktok-circle.png" alt="" srcset="" />
        <img src="/images/skill-icons_instagram.png" alt="" srcset="" />
      </div>
    </div>

    <div class="container">
      <div class="footer-grid">
        <!-- Column 1: المواقع -->
        <div class="footer-col">
          <h4>الشركة</h4>
          <ul>
            <li><a href="#">معلومات عنا</a></li>
            <li><a href="#">الشروط والاحكام</a></li>
            <li><a href="#">وظائف</a></li>
          </ul>
        </div>
        <!-- Column 3: روابط مهمة -->
        <div class="footer-col">
          <h4>روابط مهمة</h4>
          <ul>
            <li><a href="#">سياسة الاسترجاع</a></li>
            <li><a href="#">سياسة الخصوصية</a></li>
            <li><a href="#">أركان للشركات</a></li>
            <li><a href="#">الضمان</a></li>
          </ul>
        </div>

        <!--2: تried مساعدة؟ -->
        <div class="footer-col">
          <h4>تريد مساعدة؟</h4>
          <ul>
            <li><a href="#">تواصل معنا</a></li>
            <li><a href="#">مركز المساعدة</a></li>
            <li><a href="#">example@example.com</a></li>
            <li><a href="#">رقم الدعم: 25642</a></li>
          </ul>
        </div>

        <!-- Column 4: الشركة -->

        <div class="footer-col">
          <h4>المواقع</h4>
          <ul>
            <li><a href="#">التجمع الخامس</a></li>
            <li><a href="#">مدينة نصر</a></li>
            <li><a href="#">زهراء المعادي</a></li>
            <li><a href="#">اكتوبر</a></li>
            <li><a href="#">الاسكندرية</a></li>
          </ul>
        </div>
      </div>

      <!-- App & Payment Logos -->
      <div class="app-payment-section">
        <div class="payments">
          <h5>ادفع على</h5>
          <div class="payment-logos">
            <a href="#"
              ><img src="/images/visa.jpg" alt="Visa" class="payment-logo"
            /></a>
            <a href="#"
              ><img
                src="/images/mastercard.png"
                alt="MasterCard"
                class="payment-logo"
            /></a>
            <a href="#"
              ><img
                src="/images/vodafone.jpg"
                alt="PayPal"
                class="payment-logo"
            /></a>
          </div>
        </div>
        <div class="apps">
          <h5>تحميل تطبيقاتنا</h5>
          <div class="app-logos">
            <a href="#"><img src="/images/app-store.png" alt="App Store" /></a>
            <a href="#"
              ><img src="/images/app-gallery.png" alt="AppGallery"
            /></a>
            <a href="#"
              ><img src="/images/google-play.png" alt="Play Store"
            /></a>
          </div>
        </div>
      </div>

      <!-- Copyright -->
      <div class="copyright">© {{ currentYear }} محفوظة الحقوق جميع</div>
    </div>
  </footer>
</template>

<script setup>
import { ref } from "vue";

const currentYear = ref(new Date().getFullYear());
</script>

<style scoped>
.footer {
  background-color: var(--color-green-primary);
  color: var(--color-green-white);
  padding-bottom: 30px;
  margin-top: 120px;
}

.box-social {
  background-color: var(--color-green-active);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  gap: 20px;
  margin-bottom: 10px;
}
.social-icons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.social-icons img {
  width: 32px;
  height: 32px;
}

.footer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 30px;
  margin-bottom: 30px;
  justify-content: center;
}
.footer-col {
  justify-self: center;
}
@media (max-width: 576px) {
  .footer-col {
    justify-self: start;
  }
}
.footer-col h4 {
  font-weight: 700;
  margin-bottom: 16px;
  font-size: 1.1rem;
}

.footer-col ul {
  list-style: none;
}

.footer-col ul li {
  margin-bottom: 12px;
}

.footer-col a {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  transition: color 0.3s;
}

.footer-col a:hover {
  color: var(--color-green-white);
}

.app-payment-section {
  display: flex;
  gap: 25px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

@media (min-width: 768px) {
  .app-payment-section {
    justify-content: space-between;
    align-items: flex-start;
  }
}

.apps,
.payments {
  display: flex;
  flex-direction: column;
}

.apps h5,
.payments h5 {
  font-weight: 600;
  margin-bottom: 12px;
  font-size: 0.95rem;
}

.app-logos,
.payment-logos {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.app-logos img,
.payment-logos img {
  height: 40px;
  border-radius: 5px;
}

.copyright {
  text-align: center;
  font-size: 0.875rem;
  opacity: 0.85;
}
</style>
