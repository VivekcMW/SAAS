<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from 'vue'

interface Props {
  text: string
  appName?: string
  lang?: string
}

const props = withDefaults(defineProps<Props>(), {
  appName: '',
  lang: 'en-US'
})

const supported = computed(() => {
  if (globalThis.window === undefined) return false
  return 'speechSynthesis' in globalThis
})

const playing = ref(false)
const paused = ref(false)
let utterance: SpeechSynthesisUtterance | null = null

function play() {
  if (!supported.value) return
  if (paused.value && utterance) {
    globalThis.speechSynthesis.resume()
    paused.value = false
    playing.value = true
    return
  }
  globalThis.speechSynthesis.cancel()
  utterance = new SpeechSynthesisUtterance(props.text)
  utterance.lang = props.lang
  utterance.rate = 1
  utterance.pitch = 1
  utterance.onend = () => { playing.value = false; paused.value = false }
  utterance.onerror = () => { playing.value = false; paused.value = false }
  globalThis.speechSynthesis.speak(utterance)
  playing.value = true
}

function pause() {
  if (!supported.value || !playing.value) return
  globalThis.speechSynthesis.pause()
  paused.value = true
  playing.value = false
}

function stop() {
  if (!supported.value) return
  globalThis.speechSynthesis.cancel()
  playing.value = false
  paused.value = false
}

onBeforeUnmount(() => {
  if (globalThis.window !== undefined && supported.value) {
    globalThis.speechSynthesis.cancel()
  }
})
</script>

<template>
  <div v-if="supported" class="voice-overview">
    <button
      v-if="!playing && !paused"
      class="voice-btn"
      :title="`Listen to ${appName} overview`"
      @click="play"
    >
      <Icon name="heroicons:speaker-wave" />
      Listen
    </button>
    <template v-else>
      <button v-if="playing" class="voice-btn active" @click="pause">
        <Icon name="heroicons:pause" />
        Pause
      </button>
      <button v-else class="voice-btn active" @click="play">
        <Icon name="heroicons:play" />
        Resume
      </button>
      <button class="voice-btn ghost" @click="stop">
        <Icon name="heroicons:stop" />
        Stop
      </button>
      <span v-if="playing" class="voice-pulse" aria-hidden="true">
        <span></span><span></span><span></span>
      </span>
    </template>
  </div>
</template>

<style scoped>
.voice-overview {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.voice-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #ffffff;
  color: #374151;
  border: 0.5px solid #e5e7eb;
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 150ms ease, color 150ms ease, border-color 150ms ease;
}
.voice-btn:hover { border-color: #ff8838; color: #ff8838; }
.voice-btn.active {
  background: #fff3e6;
  color: #b45309;
  border-color: #fde68a;
}
.voice-btn.ghost {
  color: #6b7280;
  border: 0;
  padding: 6px 8px;
}
.voice-btn.ghost:hover { color: #dc2626; }
.voice-btn :deep(svg) { width: 12px; height: 12px; }

.voice-pulse {
  display: inline-flex;
  align-items: flex-end;
  gap: 2px;
  height: 14px;
  margin-left: 2px;
}
.voice-pulse span {
  display: block;
  width: 2px;
  background: #ff8838;
  border-radius: 1px;
  animation: bar 800ms ease-in-out infinite;
}
.voice-pulse span:nth-child(1) { height: 6px; animation-delay: 0ms; }
.voice-pulse span:nth-child(2) { height: 12px; animation-delay: 150ms; }
.voice-pulse span:nth-child(3) { height: 8px; animation-delay: 300ms; }

@keyframes bar {
  0%, 100% { transform: scaleY(0.5); }
  50% { transform: scaleY(1); }
}
</style>
