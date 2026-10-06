<script setup>
import { computed, ref, watch } from 'vue'
import TonnageStrip from '@/components/TonnageStrip.vue'
import ProgressBadge from '@/components/ProgressBadge.vue'
import PeriodPicker from '@/components/PeriodPicker.vue'
import { meta, trainRows, foodRows, weightRows, summary } from '@/data/alexander'
import { rowTonnage, formatTonnageKg } from '@/lib/tonnage'
import { annotateSessionExercises } from '@/lib/progressDelta'
import { estimateRowBurn } from '@/lib/activityBurn'
import { inPeriod } from '@/lib/period'

const s = summary()
const period = ref(null)
const sessionSearch = ref('')
const sessionFilter = ref('all')

const journalDates = [
  ...trainRows.map((t) => t.date),
  ...foodRows.map((f) => f.date),
  ...weightRows.map((w) => w.date || w.label),
]

const trainInPeriod = computed(() => {
  if (!period.value) return trainRows
  return trainRows.filter((t) => inPeriod(t.date, period.value))
})

const kindOrder = ['A', 'B', 'C', 'easy', 'rest']
const kindLabels = { A: 'Сила A', B: 'Сила B', C: 'Сила C', easy: 'Лёгкий', rest: 'Отдых' }

const kindsInPeriod = computed(() =>
  trainInPeriod.value.reduce((acc, t) => {
    acc[t.kind] = (acc[t.kind] || 0) + 1
    return acc
  }, {}),
)

const filterChips = computed(() => {
  const counts = kindsInPeriod.value
  const n = trainInPeriod.value.length
  return [
    { id: 'all', label: 'Все', count: n },
    ...kindOrder
      .filter((k) => counts[k])
      .map((k) => ({ id: k, label: kindLabels[k], count: counts[k] })),
  ]
})

function sessionKey(t) {
  return `${t.date}::${t.type}`
}

const sessions = computed(() => {
  const all = [...trainInPeriod.value].reverse()
  let filtered = sessionFilter.value === 'all'
    ? all
    : all.filter((t) => t.kind === sessionFilter.value)
  const q = sessionSearch.value.trim().toLowerCase()
  if (q) {
    filtered = filtered.filter(
      (t) =>
        t.body.toLowerCase().includes(q) ||
        t.type.toLowerCase().includes(q) ||
        t.mark.toLowerCase().includes(q),
    )
  }
  return filtered.map((t) => {
    const tonnage = rowTonnage(t)
    const annotated = annotateSessionExercises(t, trainRows)
    const burn = estimateRowBurn(t, s.lastKg)
    return { ...t, tonnage, annotated, burn, key: sessionKey(t) }
  })
})

const openSession = ref(null)
watch(
  sessions,
  (list) => {
    if (!list.length) {
      openSession.value = null
      return
    }
    if (!list.some((t) => t.key === openSession.value)) {
      openSession.value = list[0].key
    }
  },
  { immediate: true },
)

watch(sessionFilter, () => {
  openSession.value = sessions.value[0]?.key || null
})

function toggleSession(key) {
  openSession.value = openSession.value === key ? null : key
}
</script>

<template>
  <div class="athlete-page">
    <h1 class="page-title">Дневник</h1>
    <p class="page-sub">Сессии {{ meta.name }} · тонаж снаряда · расход</p>

    <PeriodPicker
      slug="alexander-diary"
      :dates="journalDates"
      track-from="2026-08-11"
      @update:period="period = $event"
    />

    <div class="group-gap">
      <div class="section-label">
        <h2>Сессии</h2>
        <span class="hint">{{ sessions.length }} · одна открыта</span>
      </div>
      <div class="session-filters" role="tablist" aria-label="Фильтр сессий">
        <button
          v-for="chip in filterChips"
          :key="chip.id"
          type="button"
          class="session-chip"
          role="tab"
          :aria-selected="sessionFilter === chip.id"
          :data-active="sessionFilter === chip.id ? '1' : null"
          @click="sessionFilter = chip.id"
        >
          {{ chip.label }}
          <span class="session-chip-n">{{ chip.count }}</span>
        </button>
      </div>
      <input
        v-model="sessionSearch"
        type="search"
        class="session-search"
        placeholder="Поиск: farmer, лесенка, мост…"
        aria-label="Поиск по сессиям"
      />
      <div class="session-cards">
        <article
          v-for="t in sessions"
          :key="t.key"
          class="session-card"
          :data-open="openSession === t.key ? '1' : null"
        >
          <button
            type="button"
            class="session-card-toggle"
            :aria-expanded="openSession === t.key"
            @click="toggleSession(t.key)"
          >
            <div class="session-card-head">
              <div>
                <span class="session-date">{{ t.date }}</span>
                <span class="session-type">{{ t.type }}</span>
              </div>
              <div class="session-card-end">
                <span v-if="t.burn.total" class="session-ton-mini" title="оценка расхода">≈{{ t.burn.total }} ккал</span>
                <span v-if="t.tonnage.totalKg" class="session-ton-mini">{{ formatTonnageKg(t.tonnage.totalKg) }}</span>
                <span class="session-mark">{{ t.mark }}</span>
                <span class="session-chevron" aria-hidden="true">{{ openSession === t.key ? '▾' : '▸' }}</span>
              </div>
            </div>
            <p v-if="openSession !== t.key" class="session-preview">{{ t.body }}</p>
          </button>
          <div v-show="openSession === t.key" class="session-panel">
            <p class="session-body">{{ t.body }}</p>
            <p v-if="t.burn.total" class="session-burn-line">
              Расход ≈ <strong>{{ t.burn.total }} ккал</strong>
              <template v-if="t.burn.min"> · тренировка {{ t.burn.min }} мин</template>
              <template v-if="t.burn.walkMin"> · прогулка {{ t.burn.walkMin }} мин (≈{{ t.burn.walk }})</template>
            </p>
            <TonnageStrip v-if="t.tonnage.totalKg" :tonnage="t.tonnage" />
            <ul v-if="t.annotated.length" class="session-ex">
              <li v-for="(e, i) in t.annotated" :key="i">
                <span>{{ e.name }}</span>
                <span class="dose">{{ e.dose }}</span>
                <ProgressBadge
                  v-if="e.delta"
                  :label="e.delta.label"
                  :tone="e.delta.tone"
                />
              </li>
            </ul>
          </div>
        </article>
        <p v-if="!sessions.length" class="hint-line">
          {{ sessionSearch || sessionFilter !== 'all' ? 'Ничего не найдено — сбрось фильтр или поиск.' : 'Нет сессий в этом периоде.' }}
        </p>
      </div>
    </div>
  </div>
</template>
