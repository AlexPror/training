<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { summary as alexSummary, meta as alexMeta, trainRows } from '@/data/alexander'
import { meta as annaMeta, exercises as annaEx, trainRows as annaTrain } from '@/data/anna'
import { tonnageSeries, formatTonnageKg } from '@/lib/tonnage'

const s = alexSummary()
const lastAnna = annaEx[0]
const lastAlex = trainRows[trainRows.length - 1]
const lastAnnaSession = annaTrain[annaTrain.length - 1]
const lastTon = computed(() => tonnageSeries(trainRows).at(-1)?.totalKg || 0)
</script>

<template>
  <div>
    <div class="home-lead">
      <p class="eyebrow">Семья · FORCE</p>
      <h1 class="page-title">Прогресс</h1>
      <p class="page-sub">
        Тренажёрный лог домашнего зала · тонаж · БЖУ. Обновлено {{ alexMeta.updated }}.
      </p>
    </div>

    <div class="gym-hero-kpis home-kpis">
      <div class="gym-kpi">
        <span class="lbl">Вес</span>
        <strong>{{ s.lastKg }}</strong>
        <span class="hint delta-down">{{ s.delta }} кг</span>
      </div>
      <div class="gym-kpi accent">
        <span class="lbl">Тонаж</span>
        <strong>{{ formatTonnageKg(lastTon) }}</strong>
        <span class="hint">снаряд</span>
      </div>
      <div class="gym-kpi">
        <span class="lbl">Белок</span>
        <strong>{{ s.avgProtein }}</strong>
        <span class="hint">цель {{ alexMeta.targetProtein.join('–') }}</span>
      </div>
      <div class="gym-kpi">
        <span class="lbl">Подтяг</span>
        <strong>{{ s.pullLatest }}</strong>
        <span class="hint">→ {{ alexMeta.pullGoal }}×1</span>
      </div>
    </div>

    <div class="section-label">
      <h2>Куда перейти</h2>
      <span class="hint">разделы</span>
    </div>

    <div class="list dest-list">
      <RouterLink class="list-row" to="/now">
        <div>
          <h2>Сейчас</h2>
          <p>План дня · чеклист · таймер сессии</p>
        </div>
        <span class="chev" aria-hidden="true">→</span>
      </RouterLink>

      <RouterLink class="list-row" to="/alexander">
        <div>
          <h2>Александр</h2>
          <p>
            {{ s.lastKg }} кг · тонаж {{ formatTonnageKg(lastTon) }} · {{ lastAlex?.type }} ·
            белок ~{{ s.avgProtein }} г
          </p>
        </div>
        <span class="chev" aria-hidden="true">→</span>
      </RouterLink>

      <RouterLink class="list-row anna" to="/anna">
        <div>
          <h2>Анна</h2>
          <p>
            МТД + силовые · goblet/мост {{ lastAnna.current }} кг ·
            {{ lastAnnaSession?.date }} {{ lastAnnaSession?.mark }} · {{ annaMeta.updated }}
          </p>
        </div>
        <span class="chev" aria-hidden="true">→</span>
      </RouterLink>

      <RouterLink class="list-row" to="/bju">
        <div>
          <h2>БЖУ</h2>
          <p>Дневник еды · калькулятор · 160–180 белка · 1900–2200 ккал</p>
        </div>
        <span class="chev" aria-hidden="true">→</span>
      </RouterLink>
    </div>
  </div>
</template>
