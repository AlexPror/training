<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: { type: Number, required: true },
  max: { type: Number, required: true },
  label: String,
  sub: String,
})

const pct = computed(() => Math.min(100, Math.round((props.value / props.max) * 100)))
</script>

<template>
  <div class="ring-wrap">
    <div class="ring-box">
      <div class="ring" :style="{ '--p': pct }" />
      <span class="ring-label">{{ pct }}%</span>
    </div>
    <div>
      <div style="font-weight:800;font-size:1.1rem">{{ label }}</div>
      <div style="color:var(--muted);font-size:0.85rem">{{ value }} / {{ max }} · {{ sub }}</div>
    </div>
  </div>
</template>
