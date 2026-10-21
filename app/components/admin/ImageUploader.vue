<script setup lang="ts">
import type { UploadFolder } from '~/services/admin.service';
import type { UploadedFile } from '~/types/models';

/**
 * Single (`v-model: string | null`) or multiple (`v-model: string[]`) image
 * field: drag & drop upload, pick from the media library, reorder, remove.
 */
const model = defineModel<string | string[] | null>({ default: null });
const props = withDefaults(
  defineProps<{
    folder: UploadFolder;
    multiple?: boolean;
    max?: number;
    label?: string;
    hint?: string;
    error?: string;
    required?: boolean;
  }>(),
  { max: 10 },
);

const admin = useAdminService();
const toast = useToast();
const uploading = ref(false);
const dragging = ref(false);
const libraryOpen = ref(false);
const library = ref<UploadedFile[]>([]);
const libraryLoading = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const MAX_MB = 5;

const images = computed<string[]>(() =>
  Array.isArray(model.value) ? model.value : model.value ? [model.value] : [],
);
const canAdd = computed(() => (props.multiple ? images.value.length < props.max : images.value.length === 0));

function setImages(next: string[]) {
  model.value = props.multiple ? next : (next[0] ?? null);
}

async function upload(fileList: FileList | File[] | null) {
  const files = [...(fileList ?? [])].filter((file) => {
    if (!file.type.startsWith('image/')) {
      toast.error(`«${file.name}» ليس صورة`);
      return false;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      toast.error(`«${file.name}» أكبر من ${MAX_MB} ميجابايت`);
      return false;
    }
    return true;
  });
  const room = props.multiple ? props.max - images.value.length : 1;
  const batch = files.slice(0, Math.max(0, room));
  if (!batch.length) return;

  uploading.value = true;
  try {
    const uploaded = await admin.media.upload(props.folder, batch);
    const urls = uploaded.map((file) => file.url);
    setImages(props.multiple ? [...images.value, ...urls] : urls);
  } catch (error) {
    toast.fromError(error);
  } finally {
    uploading.value = false;
    if (fileInput.value) fileInput.value.value = '';
  }
}

function onDrop(event: DragEvent) {
  dragging.value = false;
  upload(event.dataTransfer?.files ?? null);
}

function remove(index: number) {
  setImages(images.value.filter((_, i) => i !== index));
}

function move(index: number, delta: -1 | 1) {
  const next = [...images.value];
  const target = index + delta;
  if (target < 0 || target >= next.length) return;
  [next[index], next[target]] = [next[target]!, next[index]!];
  setImages(next);
}

async function openLibrary() {
  libraryOpen.value = true;
  libraryLoading.value = true;
  try {
    library.value = await admin.media.list(props.folder);
  } catch (error) {
    toast.fromError(error);
  } finally {
    libraryLoading.value = false;
  }
}

function pick(file: UploadedFile) {
  if (images.value.includes(file.url)) return;
  setImages(props.multiple ? [...images.value, file.url].slice(0, props.max) : [file.url]);
  if (!props.multiple) libraryOpen.value = false;
}
</script>

<template>
  <div class="uploader" :class="{ 'has-error': error }">
    <p v-if="label" class="uploader__label">
      {{ label }}<span v-if="required" class="uploader__required">*</span>
      <span v-if="multiple" class="uploader__count">{{ images.length }} / {{ max }}</span>
    </p>

    <div class="uploader__grid" :class="{ 'uploader__grid--single': !multiple }">
      <TransitionGroup name="scale">
        <figure v-for="(image, index) in images" :key="image" class="uploader__item">
          <BaseImage :src="image" alt="" :width="240" :height="240" ratio="1" fit="contain" />
          <span v-if="multiple && index === 0" class="uploader__main">الرئيسية</span>
          <div class="uploader__tools">
            <template v-if="multiple && images.length > 1">
              <button type="button" :disabled="index === 0" aria-label="تقديم" @click="move(index, -1)">
                <Icon name="ph:caret-right" />
              </button>
              <button type="button" :disabled="index === images.length - 1" aria-label="تأخير" @click="move(index, 1)">
                <Icon name="ph:caret-left" />
              </button>
            </template>
            <button type="button" class="uploader__remove" aria-label="حذف الصورة" @click="remove(index)">
              <Icon name="ph:trash" />
            </button>
          </div>
        </figure>
      </TransitionGroup>

      <label
        v-if="canAdd"
        class="uploader__drop"
        :class="{ 'is-dragging': dragging, 'is-busy': uploading }"
        @dragover.prevent="dragging = true"
        @dragleave="dragging = false"
        @drop.prevent="onDrop"
      >
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          :multiple="multiple"
          class="visually-hidden"
          :disabled="uploading"
          @change="upload(($event.target as HTMLInputElement).files)"
        />
        <BaseSpinner v-if="uploading" />
        <template v-else>
          <Icon name="ph:cloud-arrow-up" class="uploader__drop-icon" aria-hidden="true" />
          <span>اسحب الصور هنا أو <u>اختر من جهازك</u></span>
          <small>PNG، JPG، WEBP حتى {{ MAX_MB }} ميجا</small>
        </template>
      </label>
    </div>

    <div class="uploader__foot">
      <button v-if="canAdd" type="button" class="uploader__library" @click="openLibrary">
        <Icon name="ph:images" aria-hidden="true" />اختيار من مكتبة الصور
      </button>
      <p v-if="error" class="uploader__error" role="alert">{{ error }}</p>
      <p v-else-if="hint" class="uploader__hint">{{ hint }}</p>
    </div>

    <BaseModal v-model="libraryOpen" title="مكتبة الصور" size="xl">
      <div v-if="libraryLoading" class="library">
        <div v-for="n in 8" :key="n" class="skeleton" style="aspect-ratio: 1" />
      </div>
      <BaseEmptyState v-else-if="!library.length" compact icon="ph:images" title="لا توجد صور مرفوعة في هذا القسم" />
      <div v-else class="library">
        <button
          v-for="file in library"
          :key="file.filename"
          type="button"
          class="library__item"
          :class="{ 'is-picked': images.includes(file.url) }"
          @click="pick(file)"
        >
          <BaseImage :src="file.url" alt="" :width="200" :height="200" ratio="1" />
          <Icon v-if="images.includes(file.url)" name="ph:check-circle-fill" class="library__check" />
        </button>
      </div>
      <template v-if="multiple" #footer>
        <BaseButton @click="libraryOpen = false">تم</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<style scoped>
.uploader {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.uploader__label {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
}
.uploader__required {
  color: var(--color-danger);
}
.uploader__count {
  margin-inline-start: auto;
  font-size: var(--text-xs);
  color: var(--color-text-subtle);
}
.uploader__grid {
  display: grid;
  gap: var(--space-3);
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
}
.uploader__grid--single {
  grid-template-columns: minmax(0, 220px);
}
.uploader__item {
  position: relative;
  margin: 0;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  overflow: hidden;
  background: var(--color-surface);
}
.uploader__main {
  position: absolute;
  inset-block-start: var(--space-1);
  inset-inline-start: var(--space-1);
  padding: 0.1rem 0.5rem;
  border-radius: var(--radius-full);
  background: var(--color-primary);
  color: #fff;
  font-size: var(--text-2xs);
  font-weight: var(--weight-bold);
}
.uploader__tools {
  position: absolute;
  inset-inline: 0;
  inset-block-end: 0;
  display: flex;
  justify-content: center;
  gap: var(--space-1);
  padding: var(--space-1);
  background: linear-gradient(to top, rgb(0 0 0 / 0.55), transparent);
  opacity: 0;
  transition: opacity var(--duration-fast) ease;
}
.uploader__item:hover .uploader__tools,
.uploader__item:focus-within .uploader__tools {
  opacity: 1;
}
@media (hover: none) {
  .uploader__tools {
    opacity: 1;
  }
}
.uploader__tools button {
  display: grid;
  place-items: center;
  inline-size: 1.9rem;
  block-size: 1.9rem;
  border-radius: 50%;
  background: rgb(255 255 255 / 0.92);
  font-size: 0.95rem;
}
.uploader__tools button:disabled {
  opacity: 0.4;
}
.uploader__remove {
  color: var(--color-danger);
}
.uploader__drop {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  min-block-size: 110px;
  aspect-ratio: 1;
  padding: var(--space-3);
  border-radius: var(--radius-md);
  border: 2px dashed var(--color-border-strong);
  background: var(--color-surface-muted);
  font-size: var(--text-xs);
  text-align: center;
  color: var(--color-text-muted);
  cursor: pointer;
  transition:
    border-color var(--duration-fast) ease,
    background-color var(--duration-fast) ease;
}
.uploader__drop:hover,
.uploader__drop.is-dragging {
  border-color: var(--color-primary);
  background: var(--color-primary-softer);
}
.uploader__drop.is-busy {
  pointer-events: none;
}
.uploader__drop small {
  color: var(--color-text-subtle);
}
.uploader__drop-icon {
  font-size: 1.75rem;
  color: var(--color-primary);
}
.has-error .uploader__drop {
  border-color: var(--color-danger);
}
.uploader__foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
}
.uploader__library {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  font-weight: var(--weight-bold);
  color: var(--color-primary);
}
.uploader__error {
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  color: var(--color-danger);
}
.uploader__hint {
  font-size: var(--text-xs);
  color: var(--color-text-subtle);
}
.library {
  display: grid;
  gap: var(--space-3);
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
}
.library__item {
  position: relative;
  border-radius: var(--radius-md);
  border: 2px solid transparent;
  overflow: hidden;
  transition: border-color var(--duration-fast) ease;
}
.library__item:hover,
.library__item.is-picked {
  border-color: var(--color-primary);
}
.library__check {
  position: absolute;
  inset-block-start: var(--space-1);
  inset-inline-end: var(--space-1);
  font-size: 1.4rem;
  color: var(--color-primary);
  background: #fff;
  border-radius: 50%;
}
</style>
