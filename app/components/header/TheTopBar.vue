<template>
  <div class="top-bar">
    <div class="container">
      <div class="bar-content">
        <div class="social-links">
          <Icon name="ph:whatsapp-logo" />
          <Icon name="ph:youtube-logo" />
          <Icon name="ph:snapchat-logo" />
          <Icon name="ph:linkedin-logo" />
          <Icon name="ph:instagram-logo" />
          <Icon name="ph:facebook-logo" />
          <Icon name="ph:x-logo" />
        </div>
        <p class="promo-text">توصيل مجاني للطلبات فوق 20000 في مافوق</p>
        <div class="language-selector">
          <Icon name="ph:caret-down" class="icon-xs" />
          <span class="lang-text">العربية</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
/* الشريط العلوي */
.top-bar {
  background-color: var(--color-green-primary);
  color: white;
  padding: 5px 0;
  font-size: 14px;
}
.bar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.language-selector {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
}

.social-links {
  display: flex;
  gap: 15px;
  font-size: 20px;
  @media (max-width: 768px) {
    display: none;
  }
}

.social-links svg {
  cursor: pointer;
  transition: opacity 0.3s;
}

.social-links svg:hover {
  opacity: 0.8;
}
</style>
