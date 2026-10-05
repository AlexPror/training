<script setup>
import { computed } from 'vue'

const props = defineProps({
  fill: { type: Number, default: 0 },
  caption: { type: String, default: '' },
  size: { type: Number, default: 72 },
})

const shown = computed(() => Math.min(5, Math.max(0, props.fill)))
const label = computed(() => `${Math.round(shown.value * 10) / 10}/5`)
const r = 30
const c = 2 * Math.PI * r
const dash = computed(() => {
  const p = shown.value / 5
  return `${c * p} ${c}`
})
</script>

<template>
  <div class="day-ring" :style="{ width: size + 'px', height: size + 'px' }">
    <svg :width="size" :height="size" viewBox="0 0 72 72" aria-hidden="true">
      <circle class="day-ring-track" cx="36" cy="36" :r="r" />
      <circle
        class="day-ring-val"
        cx="36"
        cy="36"
        :r="r"
        :stroke-dasharray="dash"
        transform="rotate(-90 36 36)"
      />
    </svg>
    <div class="day-ring-label">
      <strong>{{ label }}</strong>
      <span v-if="caption">{{ caption }}</span>
    </div>
  </div>
</template>
