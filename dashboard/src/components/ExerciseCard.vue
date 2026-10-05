<script setup>
import { computed, ref } from 'vue'
import { LineChart } from './Charts'
import ProgressBadge from './ProgressBadge.vue'
import ChartSheet from './ChartSheet.vue'
import { byChrono } from '@/data/chrono'
import { deltaFromPoints } from '@/lib/progressDelta'

const props = defineProps({
  ex: { type: Object, required: true },
  tone: { type: String, default: '' },
})

const open = ref(false)

const pct = computed(() => {
  if (!props.ex.goal) return null
  return Math.min(100, Math.round((props.ex.current / props.ex.goal) * 100))
})

const sorted = computed(() => byChrono(props.ex.points || []))
const labels = computed(() => sorted.value.map((p) => p.label))
const datasets = computed(() => [{
  label: props.ex.unit,
  data: sorted.value.map((p) => p.v),
  borderColor: props.ex.color,
  backgroundColor: props.ex.color + '22',
  fill: true,
  tension: 0.35,
  pointRadius: 3,
  pointBackgroundColor: props.ex.color,
}])

const unitShort = computed(() => {
  const u = props.ex.unit || ''
  if (/кг/i.test(u)) return 'кг'
  if (/повт/i.test(u)) return ''
  if (/с/i.test(u) && !/сесс/i.test(u)) return 'с'
  return ''
})

const delta = computed(() => deltaFromPoints(sorted.value, unitShort.value))

const sheetHint = computed(() => {
  const parts = []
  if (props.ex.currentLabel) parts.push(props.ex.currentLabel)
  if (pct.value != null) parts.push(`${pct.value}% к цели ${props.ex.goal}`)
  if (delta.value.label && delta.value.abs) parts.push(`к прошлому: ${delta.value.label}`)
  return parts.join(' · ')
})
</script>

<template>
  <div class="ex-card gym-card" :class="tone">
    <div class="head">
      <span class="name">
        {{ ex.name }}
        <ProgressBadge v-if="delta.label && delta.abs" :label="delta.label" :tone="delta.tone" />
      </span>
      <span class="badge" :class="tone === 'anna-tone' ? 'anna' : ''">{{ ex.trend }}</span>
    </div>
    <div class="now">
      {{ ex.current }}
      <small style="font-size:0.7em;font-weight:600;color:var(--muted)">{{ ex.unit }}</small>
    </div>
    <div class="meta">
      {{ ex.currentLabel || '' }}
      <template v-if="pct != null"> · {{ pct }}% к цели {{ ex.goal }}</template>
    </div>
    <button
      v-if="sorted.length"
      type="button"
      class="chart-hit"
      aria-label="Открыть график крупнее"
      @click="open = true"
    >
      <div class="chart-box sm">
        <LineChart :labels="labels" :datasets="datasets" />
      </div>
      <span class="chart-hit-hint">нажми — крупнее</span>
    </button>

    <ChartSheet
      :open="open"
      :title="ex.name"
      :subtitle="ex.unit || ''"
      :labels="labels"
      :datasets="datasets"
      :hint="sheetHint"
      @close="open = false"
    />
  </div>
</template>
