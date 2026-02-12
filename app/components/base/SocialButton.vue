<template>
  <button
    type="button"
    class="social-button"
    :class="platform"
    @click="$emit('click')"
  >
    <Icon :name="icon" class="social-icon" />
    <span>{{ label }}</span>
  </button>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  platform: {
    type: String,
    required: true, // 'google' | 'apple'
  },
  label: {
    type: String,
    required: true,
  },
});

const icon = computed(() => {
  return props.platform === "google" ? "ph:google-logo" : "ph:facebook-logo";
});

defineEmits(["click"]);
</script>

<style scoped lang="scss">
.social-button {
  flex: 1;
  padding: 14px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-main);
  cursor: pointer;
  transition: all 0.3s ease;

  .social-icon {
    font-size: 22px;
  }

  &:hover {
    border-color: var(--color-green-primary);
    background: var(--color-green-light);
  }
}

.social-button.google {
  .social-icon {
    color: #4285f4;
  }
}

.social-button.apple {
  .social-icon {
    color: #000;
  }
}
</style>
