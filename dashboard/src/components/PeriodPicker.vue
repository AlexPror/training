<script setup>
import { computed, ref, watch } from 'vue'
import {
  PERIOD_PRESETS,
  readPeriodSelection,
  writePeriodSelection,
  resolvePeriod,
  calendarToday,
} from '@/lib/period'

const props = defineProps({
  slug: { type: String, required: true },
  /** ISO или DD.MM даты журнала */
  dates: { type: Array, default: () => [] },
  trackFrom: { type: String, default: '2026-08-11' },
})

const emit = defineEmits(['update:period'])

const selection = ref(readPeriodSelection(props.slug))
const customFrom = ref(selection.value.from || props.trackFrom || '2026-08-11')
const customTo = ref(selection.value.to || calendarToday())
const open = ref(false)

const primaryIds = ['weeks4', 'all']
const primary = PERIOD_PRESETS.filter((p) => primaryIds.includes(p.id))
const more = PERIOD_PRESETS.filter((p) => !primaryIds.includes(p.id))

const ctx = computed(() => ({
  dates: props.dates,
  trackFrom: props.trackFrom,
}))

const period = computed(() => {
  const sel =
    selection.value.mode === 'custom'
      ? { mode: 'custom', from: customFrom.value, to: customTo.value }
      : selection.value
  return resolvePeriod(ctx.value, sel)
})

const activeLabel = computed(() => {
  const id = selection.value.mode || 'weeks4'
  return PERIOD_PRESETS.find((p) => p.id === id)?.label || 'Период'
})

watch(period, (p) => emit('update:period', p), { immediate: true })

watch(
  () => props.slug,
  (slug) => {
    selection.value = readPeriodSelection(slug)
    if (selection.value.from) customFrom.value = selection.value.from
    if (selection.value.to) customTo.value = selection.value.to
    open.value = false
  },
)

function persist() {
  writePeriodSelection(props.slug, selection.value)
}

function pick(id) {
  if (id === 'custom') {
    selection.value = { mode: 'custom', from: customFrom.value, to: customTo.value }
  } else {
    selection.value = { mode: id }
  }
  persist()
  if (id !== 'custom') open.value = false
}

function onCustom() {
  selection.value = { mode: 'custom', from: customFrom.value, to: customTo.value }
  persist()
}
</script>

<template>
  <div class="period-picker">
    <div class="period-primary">
      <button
        v-for="p in primary"
        :key="p.id"
        type="button"
        class="session-chip"
        :data-active="(selection.mode || 'weeks4') === p.id ? '1' : null"
        @click="pick(p.id)"
      >
        {{ p.label }}
      </button>
      <button
        type="button"
        class="session-chip"
        :data-active="!primaryIds.includes(selection.mode || 'weeks4') ? '1' : null"
        @click="open = !open"
      >
        {{ open ? 'Скрыть' : activeLabel }} ▾
      </button>
    </div>
    <p class="hint-line" style="margin:0.35rem 0 0">{{ period.label }}</p>

    <div v-if="open" class="period-more">
      <button
        v-for="p in more"
        :key="p.id"
        type="button"
        class="session-chip"
        :data-active="selection.mode === p.id ? '1' : null"
        @click="pick(p.id)"
      >
        {{ p.label }}
      </button>
      <div v-if="selection.mode === 'custom'" class="period-custom">
        <label>
          с
          <input v-model="customFrom" type="date" @change="onCustom" />
        </label>
        <label>
          по
          <input v-model="customTo" type="date" @change="onCustom" />
        </label>
      </div>
    </div>
  </div>
</template>
