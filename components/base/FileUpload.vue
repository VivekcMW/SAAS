<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  modelValue?: File | File[] | null
  accept?: string
  multiple?: boolean
  maxSize?: number
  hint?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  accept: '',
  multiple: false,
  maxSize: 0,
  hint: '',
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [File | File[] | null]
  error: [string]
}>()

const dragging = ref(false)
const inputRef = ref<HTMLInputElement>()

const validate = (files: File[]): File[] => {
  if (!props.maxSize) return files
  const ok = files.filter(f => f.size <= props.maxSize)
  if (ok.length !== files.length) {
    emit('error', `File exceeds max size of ${Math.round(props.maxSize / 1024)}KB`)
  }
  return ok
}

const onFiles = (fileList: FileList | null) => {
  if (!fileList || fileList.length === 0) return
  const files = validate(Array.from(fileList))
  if (!files.length) return
  emit('update:modelValue', props.multiple ? files : files[0])
}

const onDrop = (e: DragEvent) => {
  dragging.value = false
  if (props.disabled) return
  onFiles(e.dataTransfer?.files || null)
}

const onChange = (e: Event) => onFiles((e.target as HTMLInputElement).files)

const trigger = () => {
  if (!props.disabled) inputRef.value?.click()
}

const clear = () => {
  emit('update:modelValue', props.multiple ? [] : null)
  if (inputRef.value) inputRef.value.value = ''
}

const fileList = () => {
  if (!props.modelValue) return []
  return Array.isArray(props.modelValue) ? props.modelValue : [props.modelValue]
}
</script>

<template>
  <div
    :class="['upload', { dragging, 'is-disabled': disabled }]"
    @click="trigger"
    @dragover.prevent="dragging = true"
    @dragleave.prevent="dragging = false"
    @drop.prevent="onDrop"
  >
    <input
      ref="inputRef"
      type="file"
      :accept="accept"
      :multiple="multiple"
      :disabled="disabled"
      class="upload-input"
      @change="onChange"
    >
    <svg class="upload-icon" viewBox="0 0 24 24" fill="none" width="28" height="28">
      <path d="M12 15V3m0 0l-4 4m4-4l4 4M3 15v4a2 2 0 002 2h14a2 2 0 002-2v-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
    <p class="upload-primary">
      <span class="upload-link">Click to upload</span> or drag & drop
    </p>
    <p v-if="hint" class="upload-hint">{{ hint }}</p>
    <ul v-if="fileList().length" class="upload-files" @click.stop>
      <li v-for="(f, i) in fileList()" :key="i" class="upload-file">
        <span class="upload-file-name">{{ f.name }}</span>
        <button type="button" class="upload-file-remove" aria-label="Remove" @click="clear">
          <svg viewBox="0 0 20 20" fill="none" width="12" height="12">
            <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  background: var(--mm-s2);
  border: 1px dashed var(--b2);
  border-radius: var(--r-md);
  cursor: pointer;
  color: var(--mm-slate);
  transition: background-color 150ms ease, border-color 150ms ease;
}
.upload:hover:not(.is-disabled) { background: var(--mm-s3); border-color: var(--mm-gold); }
.upload.dragging { background: var(--mm-gold-soft); border-color: var(--mm-gold); }
.upload.is-disabled { opacity: 0.6; cursor: not-allowed; }

.upload-input { display: none; }

.upload-icon { color: var(--mm-slate); margin-bottom: 8px; }
.upload-primary { margin: 0; font-size: var(--t-sm); color: var(--mm-silver); }
.upload-link { color: var(--mm-gold); font-weight: 500; }
.upload-hint { margin: 4px 0 0; font-size: var(--t-xs); color: var(--mm-slate); }

.upload-files { list-style: none; margin: 12px 0 0; padding: 0; width: 100%; display: flex; flex-direction: column; gap: 4px; }
.upload-file {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 8px;
  background: var(--mm-s3);
  border-radius: var(--r-sm);
  font-size: var(--t-xs);
  color: var(--mm-silver);
}
.upload-file-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }
.upload-file-remove {
  background: transparent;
  border: none;
  color: var(--mm-slate);
  cursor: pointer;
  padding: 2px;
  display: flex;
}
.upload-file-remove:hover { color: #dc2626; }
</style>
