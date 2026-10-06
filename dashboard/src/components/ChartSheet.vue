<script setup>
import { onMounted, onUnmounted } from 'vue'
import { LineChart, BarChart } from '@/components/Charts'

const props = defineProps({
  open: Boolean,
  title: { type: String, default: 'График' },
  subtitle: { type: String, default: '' },
  labels: { type: Array, default: () => [] },
  datasets: { type: Array, default: () => [] },
  suggestedMax: Number,
  suggestedMin: Number,
  hint: { type: String, default: '' },
  /** 'line' | 'bar' */
  chartType: { type: String, default: 'line' },
  valueFormat: Function,
  yTickFormat: Function,
  showValues: { type: Boolean, default: true },
})

const emit = defineEmits(['close'])

function onBackdrop(e) {
  if (e.target === e.currentTarget) emit('close')
}

function onKey(e) {
  if (e.key === 'Escape' && props.open) emit('close')
}

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="chart-sheet-backdrop"
      role="presentation"
      @click="onBackdrop"
    >
      <div
        class="chart-sheet"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
      >
        <header class="chart-sheet-head">
          <div>
            <p v-if="subtitle" class="eyebrow" style="margin:0">{{ subtitle }}</p>
            <h2 class="chart-sheet-title">{{ title }}</h2>
          </div>
          <button
            type="button"
            class="chart-sheet-close"
            aria-label="Закрыть"
            @click="emit('close')"
          >
            ×
          </button>
        </header>
        <div class="chart-sheet-body">
          <div class="chart-box chart-box-lg">
            <BarChart
              v-if="chartType === 'bar'"
              :labels="labels"
              :datasets="datasets"
            />
            <LineChart
              v-else
              :labels="labels"
              :datasets="datasets"
              :suggested-max="suggestedMax"
              :suggested-min="suggestedMin"
              :value-format="valueFormat"
              :y-tick-format="yTickFormat"
              :show-values="showValues"
            />
          </div>
          <p v-if="hint" class="hint-line" style="margin:0.75rem 0 0">{{ hint }}</p>
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>
