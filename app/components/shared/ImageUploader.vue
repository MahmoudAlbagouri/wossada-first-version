<template>
  <div class="image-uploader" dir="rtl">
    <!-- ===== Preview المحدد ===== -->
    <div class="selected-preview" v-if="modelValue">
      <img
        :src="previewUrl(modelValue)"
        class="selected-img"
        @error="handleImgError"
      />
      <div class="selected-info">
        <span class="selected-path">{{ modelValue }}</span>
        <button
          type="button"
          class="btn-clear"
          @click="$emit('update:modelValue', '')"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          إزالة
        </button>
      </div>
    </div>

    <!-- ===== منطقة الرفع ===== -->
    <div
      class="upload-zone"
      :class="{ dragging: isDragging, uploading: uploading }"
      @dragover.prevent="isDragging = true"
      @dragleave="isDragging = false"
      @drop.prevent="handleDrop"
      @click="triggerFileInput"
    >
      <input
        ref="fileInputRef"
        type="file"
        accept="image/*"
        class="hidden-input"
        :multiple="multiple"
        @change="handleFileChange"
      />

      <div v-if="uploading" class="upload-progress">
        <div class="spinner"></div>
        <span>جاري الرفع...</span>
      </div>

      <div v-else class="upload-prompt">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#987226"
          stroke-width="1.5"
        >
          <polyline points="16 16 12 12 8 16" />
          <line x1="12" y1="12" x2="12" y2="21" />
          <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
        </svg>
        <p class="upload-text">
          اسحب صورة هنا أو <span class="upload-link">اختر من جهازك</span>
        </p>
        <p class="upload-hint">PNG, JPG, WEBP — حد أقصى 5MB</p>
      </div>
    </div>

    <!-- ===== زر فتح مكتبة الصور ===== -->
    <button type="button" class="btn-library" @click="openLibrary">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
      اختر من المكتبة
    </button>

    <!-- ===== Library Modal ===== -->
    <Teleport to="body">
      <div
        v-if="showLibrary"
        class="lib-overlay"
        @click.self="showLibrary = false"
      >
        <div class="lib-box">
          <div class="lib-header">
            <h3 class="lib-title">مكتبة الصور — {{ folder }}</h3>
            <button class="lib-close" @click="showLibrary = false">✕</button>
          </div>

          <div v-if="loadingLib" class="lib-loading">
            <div class="spinner"></div>
            <span>جاري تحميل الصور...</span>
          </div>

          <div v-else-if="!libraryFiles.length" class="lib-empty">
            لا توجد صور في هذا المجلد بعد
          </div>

          <div v-else class="lib-grid">
            <div
              v-for="file in libraryFiles"
              :key="file.filename"
              class="lib-item"
              :class="{ selected: file.filename === modelValue }"
              @click="selectFromLibrary(file)"
            >
              <img
                :src="file.url"
                :alt="file.filename"
                class="lib-img"
                @error="handleImgError"
              />
              <span class="lib-check" v-if="file.filename === modelValue"
                >✓</span
              >
              <p class="lib-name">{{ shortName(file.filename) }}</p>
            </div>
          </div>

          <div class="lib-footer">
            <button
              type="button"
              class="btn-lib-upload"
              @click="triggerLibraryUpload"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              رفع صورة جديدة
            </button>
            <input
              ref="libFileInputRef"
              type="file"
              accept="image/*"
              class="hidden-input"
              @change="handleLibraryUpload"
            />
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useMediaUpload } from "@/composables/useMediaUpload.js";

const props = defineProps({
  modelValue: { type: String, default: "" },
  folder: { type: String, default: "products" },
  multiple: { type: Boolean, default: false },
  baseUploadUrl: { type: String, default: "" },
});

const emit = defineEmits(["update:modelValue", "uploaded"]);

const { uploadImages, listImages } = useMediaUpload();

const config = useRuntimeConfig();
const BASE =
  config.public.apiBase?.replace(/\/api\/?$/, "") || "http://localhost:4000";

const fileInputRef = ref(null);
const libFileInputRef = ref(null);
const isDragging = ref(false);
const uploading = ref(false);
const showLibrary = ref(false);
const loadingLib = ref(false);
const libraryFiles = ref([]);

// ===== بناء رابط المعاينة =====
const previewUrl = (filename) => {
  if (!filename) return "";
  if (filename.startsWith("http")) return filename;
  return `${BASE}/uploads/${filename}`;
};

const handleImgError = (e) => {
  e.target.src = "/images/placeholder.jpg";
};

// ===== رفع ملف =====
const doUpload = async (file) => {
  uploading.value = true;
  try {
    const result = await uploadImages(file, props.folder);
    if (result.success && result.files.length) {
      const uploaded = result.files[0];
      emit("update:modelValue", uploaded.filename);
      emit("uploaded", result.files);
      // تحديث المكتبة
      if (showLibrary.value) await fetchLibrary();
    }
  } finally {
    uploading.value = false;
  }
};

const triggerFileInput = () => fileInputRef.value?.click();
const handleFileChange = (e) => {
  const file = e.target.files?.[0];
  if (file) doUpload(file);
  e.target.value = "";
};

const handleDrop = (e) => {
  isDragging.value = false;
  const file = e.dataTransfer.files?.[0];
  if (file) doUpload(file);
};

// ===== المكتبة =====
const fetchLibrary = async () => {
  loadingLib.value = true;
  const result = await listImages(props.folder);
  if (result.success) libraryFiles.value = result.files;
  loadingLib.value = false;
};

const openLibrary = async () => {
  showLibrary.value = true;
  if (!libraryFiles.value.length) await fetchLibrary();
};

const selectFromLibrary = (file) => {
  emit("update:modelValue", file.filename);
  showLibrary.value = false;
};

const triggerLibraryUpload = () => libFileInputRef.value?.click();
const handleLibraryUpload = async (e) => {
  const file = e.target.files?.[0];
  if (file) await doUpload(file);
  e.target.value = "";
};

const shortName = (filename) => filename.split("/").pop();
</script>

<style scoped>
.image-uploader {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* ===== Preview ===== */
.selected-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background: #faf6ee;
  border: 1.5px solid #e8d8a0;
  border-radius: 10px;
}
.selected-img {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
  border: 1px solid #e0d0a0;
}
.selected-info {
  flex: 1;
  min-width: 0;
}
.selected-path {
  display: block;
  font-size: 12px;
  color: #666;
  font-family: monospace;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 6px;
}
.btn-clear {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: #ffebee;
  color: #c62828;
  border: none;
  border-radius: 6px;
  font-family: "Cairo", sans-serif;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}
.btn-clear:hover {
  background: #ffcdd2;
}

/* ===== Upload Zone ===== */
.upload-zone {
  border: 2px dashed #d4be82;
  border-radius: 10px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: #fdfaf4;
}
.upload-zone:hover,
.upload-zone.dragging {
  border-color: #987226;
  background: #faf2dc;
}
.upload-zone.uploading {
  cursor: not-allowed;
  opacity: 0.7;
}

.upload-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.upload-text {
  font-size: 14px;
  color: #555;
  margin: 0;
}
.upload-link {
  color: #987226;
  font-weight: 700;
}
.upload-hint {
  font-size: 12px;
  color: #aaa;
  margin: 0;
}

.upload-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #987226;
  font-weight: 600;
}

.hidden-input {
  display: none;
}

/* ===== Library Button ===== */
.btn-library {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  background: #fff;
  color: #987226;
  border: 1.5px solid #d4be82;
  border-radius: 8px;
  font-family: "Cairo", sans-serif;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  align-self: flex-start;
  transition: all 0.2s;
}
.btn-library:hover {
  background: #faf2dc;
  border-color: #987226;
}

/* ===== Spinner ===== */
.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #f0e8d0;
  border-top-color: #987226;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ===== Library Modal ===== */
.lib-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 1100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.lib-box {
  background: #fff;
  border-radius: 18px;
  width: 100%;
  max-width: 700px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  direction: rtl;
}
.lib-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px 14px;
  border-bottom: 1.5px solid #f0e8d0;
  flex-shrink: 0;
}
.lib-title {
  font-size: 18px;
  font-weight: 800;
  color: #987226;
  margin: 0;
}
.lib-close {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #888;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.lib-close:hover {
  background: #f5f0e8;
}

.lib-loading,
.lib-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 48px;
  color: #aaa;
  font-size: 15px;
  flex: 1;
}

.lib-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 10px;
  padding: 16px 20px;
  overflow-y: auto;
  flex: 1;
}
.lib-item {
  position: relative;
  cursor: pointer;
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid transparent;
  transition: border-color 0.2s;
  background: #f5f0e8;
}
.lib-item:hover {
  border-color: #987226;
}
.lib-item.selected {
  border-color: #987226;
}

.lib-img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  display: block;
}
.lib-check {
  position: absolute;
  top: 5px;
  right: 5px;
  background: #987226;
  color: #fff;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  font-size: 11px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}
.lib-name {
  font-size: 10px;
  color: #888;
  padding: 4px 6px;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background: #fff;
}

.lib-footer {
  padding: 12px 20px;
  border-top: 1.5px solid #f0e8d0;
  flex-shrink: 0;
}
.btn-lib-upload {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #987226;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-family: "Cairo", sans-serif;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-lib-upload:hover {
  background: #7a5b1e;
}
</style>
