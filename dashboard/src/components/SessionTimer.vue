<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  calendarTodayIso,
  loadHomeDay,
  planItemKey,
  saveHomeDay,
  starFillFromProgress,
} from '@/lib/homeDay'

const props = defineProps({
  slug: { type: String, required: true },
  planItems: { type: Array, default: () => [] },
  /** id пресета по умолчанию из плана дня */
  defaultPreset: { type: String, default: 'strength80' },
})

const emit = defineEmits(['progress'])

const PRESETS = [
  { id: 'strength80', label: 'Сила 80 мин', seconds: 80 * 60 },
  { id: 'easy50', label: 'Лёгкий 50', seconds: 50 * 60 },
  { id: 'cond60', label: 'Кондиция 60', seconds: 60 * 60 },
  { id: 'walk20', label: 'Ходьба 20', seconds: 20 * 60 },
  { id: 'mob15', label: 'Мобилити 15', seconds: 15 * 60 },
]

const presetId = ref(props.defaultPreset)
const remaining = ref((PRESETS.find((p) => p.id === props.defaultPreset) || PRESETS[0]).seconds)
const running = ref(false)
const finished = ref(false)
const markedToday = ref(false)
let tickId = null

const activePreset = computed(() => PRESETS.find((p) => p.id === presetId.value) || PRESETS[0])

const startLabel = computed(() => {
  if (finished.value || remaining.value <= 0) return 'Ещё раз'
  if (remaining.value < activePreset.value.seconds) return 'Продолжить'
  return 'Старт'
})

const display = computed(() => {
  const s = Math.max(0, remaining.value)
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
})

function notifyProgress() {
  const day = loadHomeDay(props.slug)
  const keys = props.planItems.map((it, i) => planItemKey(i, it.name))
  const done = keys.filter((k) => day.items.includes(k)).length
  const fill = starFillFromProgress(done, keys.length, day.stamp)
  emit('progress', { items: day.items, stamp: day.stamp, done, total: keys.length, fill })
}

function refreshMark() {
  const day = loadHomeDay(props.slug)
  markedToday.value =
    day.stamp || (props.planItems.length > 0 && day.items.length >= props.planItems.length)
  notifyProgress()
}

function markHome() {
  const keys = props.planItems.map((it, i) => planItemKey(i, it.name))
  saveHomeDay(props.slug, { items: keys.length ? keys : [], stamp: true })
  markedToday.value = true
  notifyProgress()
}

function clearStamp() {
  saveHomeDay(props.slug, { items: [], stamp: false })
  markedToday.value = false
  notifyProgress()
}

function clearTick() {
  if (tickId != null) {
    clearInterval(tickId)
    tickId = null
  }
}

function applyPreset(id) {
  if (running.value) return
  presetId.value = id
  const p = PRESETS.find((x) => x.id === id) || PRESETS[0]
  remaining.value = p.seconds
  finished.value = false
}

function start() {
  if (remaining.value <= 0) remaining.value = activePreset.value.seconds
  finished.value = false
  running.value = true
  clearTick()
  tickId = setInterval(() => {
    if (remaining.value <= 1) {
      remaining.value = 0
      running.value = false
      finished.value = true
      clearTick()
      try {
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(200)
      } catch {
        /* ignore */
      }
      return
    }
    remaining.value -= 1
  }, 1000)
}

function pause() {
  running.value = false
  clearTick()
}

function stop() {
  pause()
  remaining.value = activePreset.value.seconds
  finished.value = false
}

watch(
  () => props.defaultPreset,
  (id) => {
    if (!running.value) applyPreset(id)
  },
)

watch(
  () => props.planItems,
  () => refreshMark(),
  { deep: true },
)

onMounted(() => {
  applyPreset(props.defaultPreset)
  refreshMark()
})

onBeforeUnmount(() => clearTick())

defineExpose({ refreshMark })
</script>

<template>
  <div class="panel gym-panel session-timer">
    <div class="section-label" style="margin:0 0 0.65rem">
      <h2 style="font-size:1.05rem;margin:0">Таймер</h2>
      <span class="hint">сессия дома</span>
    </div>

    <div class="timer-presets">
      <button
        v-for="p in PRESETS"
        :key="p.id"
        type="button"
        class="timer-preset"
        :class="{ on: presetId === p.id }"
        :disabled="running"
        @click="applyPreset(p.id)"
      >
        {{ p.label }}
      </button>
    </div>

    <div class="timer-face" :class="{ run: running, done: finished }">
      {{ display }}
    </div>

    <div class="timer-actions">
      <button v-if="!running" type="button" class="btn" @click="start">
        {{ startLabel }}
      </button>
      <button v-else type="button" class="btn ghost" @click="pause">Пауза</button>
      <button
        type="button"
        class="btn ghost"
        :disabled="running && remaining === activePreset.seconds"
        @click="stop"
      >
        Сброс
      </button>
    </div>

    <p v-if="finished" class="timer-done">Время — отметьте пункты плана или закройте день.</p>

    <div class="timer-mark">
      <button v-if="!markedToday" type="button" class="btn" @click="markHome">
        Весь план выполнен
      </button>
      <template v-else>
        <p class="timer-stamp">Сегодня план закрыт</p>
        <button type="button" class="btn ghost" style="margin-top:0.35rem" @click="clearStamp">
          Сбросить отметку
        </button>
      </template>
    </div>
  </div>
</template>
