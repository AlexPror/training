<script setup>
import { computed, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import DayRing from '@/components/DayRing.vue'
import SessionTimer from '@/components/SessionTimer.vue'
import {
  WEEK_ORDER,
  WEEKDAY_SHORT,
  WEEKDAY_LONG,
  planForWeekday,
  calendarTodayIso,
  mondayOfIso,
  addDaysIso,
  weekdayFromIso,
  formatIsoShort,
} from '@/data/weekPlan'
import {
  loadHomeDay,
  saveHomeDay,
  planItemKey,
  starFillFromProgress,
} from '@/lib/homeDay'
import { trainRows, meta } from '@/data/alexander'

const SLUG = 'alexander'
const todayIso = calendarTodayIso()
const selectedIso = ref(todayIso)

const selectedWeekday = computed(() => weekdayFromIso(selectedIso.value))
const plan = computed(() => planForWeekday(selectedWeekday.value))
const isToday = computed(() => selectedIso.value === todayIso)

const weekCells = computed(() => {
  const mon = mondayOfIso(todayIso)
  return WEEK_ORDER.map((wd, i) => {
    const iso = addDaysIso(mon, i)
    const p = planForWeekday(wd)
    return {
      weekday: wd,
      iso,
      short: WEEKDAY_SHORT[wd],
      title: p.title,
      kind: p.kind,
      isToday: iso === todayIso,
      isSelected: iso === selectedIso.value,
      label: formatIsoShort(iso),
    }
  })
})

const checked = ref(new Set())
const stamp = ref(false)
const fill = ref(0)

function reloadDay() {
  const day = loadHomeDay(SLUG, selectedIso.value)
  checked.value = new Set(day.items)
  stamp.value = day.stamp
  syncFill()
}

function syncFill() {
  const keys = plan.value.items.map((it, i) => planItemKey(i, it.name))
  const done = keys.filter((k) => checked.value.has(k)).length
  fill.value = starFillFromProgress(done, keys.length, stamp.value)
}

function toggleItem(index, name) {
  if (!isToday.value) return
  const key = planItemKey(index, name)
  const next = new Set(checked.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  checked.value = next
  stamp.value = false
  saveHomeDay(SLUG, { items: [...next], stamp: false }, selectedIso.value)
  syncFill()
}

function isChecked(index, name) {
  return checked.value.has(planItemKey(index, name))
}

function onTimerProgress(p) {
  fill.value = p.fill
  if (p.stamp || p.items?.length) {
    checked.value = new Set(p.items || [])
    stamp.value = Boolean(p.stamp)
  }
}

watch(selectedIso, () => reloadDay(), { immediate: true })

const lastLog = computed(() => {
  const row = [...trainRows].reverse().find((t) => {
    // train dates DD.MM — compare short
    return t.date === formatIsoShort(selectedIso.value)
  })
  return row || null
})

const kindTone = {
  A: 'kind-a',
  B: 'kind-b',
  C: 'kind-c',
  easy: 'kind-easy',
  rest: 'kind-rest',
}
</script>

<template>
  <div class="athlete-page">
    <div class="gym-hero">
      <div>
        <p class="eyebrow">Сегодня · план v1.9</p>
        <h1 class="page-title">Сейчас</h1>
        <p class="page-sub">
          {{ WEEKDAY_LONG[selectedWeekday] }} {{ formatIsoShort(selectedIso) }}
          · {{ meta.name }}
        </p>
      </div>
      <DayRing :fill="fill" caption="день" :size="84" />
    </div>

    <div class="week-grid" role="tablist" aria-label="Неделя">
      <button
        v-for="c in weekCells"
        :key="c.iso"
        type="button"
        class="week-cell"
        :class="[kindTone[c.kind], { today: c.isToday, selected: c.isSelected }]"
        role="tab"
        :aria-selected="c.isSelected"
        @click="selectedIso = c.iso"
      >
        <span class="week-cell-d">{{ c.short }}</span>
        <span class="week-cell-n">{{ c.label }}</span>
        <span class="week-cell-t">{{ c.title }}</span>
      </button>
    </div>

    <div class="panel gym-panel group-gap" style="margin-top:1rem">
      <div class="section-label" style="margin:0 0 0.5rem">
        <h2>{{ plan.title }}</h2>
        <span class="hint">ходьба {{ plan.walk }}</span>
      </div>
      <p class="note" style="margin-top:0">{{ plan.blurb }}</p>

      <p v-if="lastLog" class="session-burn-line">
        В журнале: <strong>{{ lastLog.type }}</strong> · {{ lastLog.mark }}
        — {{ lastLog.body }}
      </p>
      <p v-else-if="isToday" class="hint-line">В журнале за сегодня пока пусто — отмечай план ниже.</p>
      <p v-else class="hint-line">Просмотр дня. Галочки пишутся только за сегодня.</p>

      <ul class="home-plan-list plan-check-row" style="margin:0.85rem 0 0;padding:0">
        <li v-for="(it, i) in plan.items" :key="i" class="plan-day-item">
          <label class="plan-check">
            <input
              type="checkbox"
              :checked="isChecked(i, it.name)"
              :disabled="!isToday"
              @change="toggleItem(i, it.name)"
            />
            <span>
              <strong>{{ it.name }}</strong>
              <span class="dose" style="margin-left:0.35rem">{{ it.dose }}</span>
            </span>
          </label>
        </li>
      </ul>
    </div>

    <SessionTimer
      v-if="isToday"
      :slug="SLUG"
      :plan-items="plan.items"
      :default-preset="plan.timerPreset"
      @progress="onTimerProgress"
    />

    <p class="note group-gap">
      <RouterLink to="/alexander">Журнал и графики →</RouterLink>
      ·
      <RouterLink to="/bju">БЖУ / еда →</RouterLink>
    </p>
  </div>
</template>
