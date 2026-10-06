<script setup>
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()

const tabs = [
  { to: '/alexander', name: 'Сейчас', icon: 'now', exact: true },
  { to: '/alexander/diary', name: 'Дневник', icon: 'diary' },
  { to: '/alexander/food', name: 'Еда', icon: 'food' },
]

function active(tab) {
  const path = route.path.replace(/\/$/, '') || '/'
  if (tab.exact) return path === '/alexander'
  return path === tab.to || path.startsWith(`${tab.to}/`)
}
</script>

<template>
  <nav class="tabbar" aria-label="Кабинет Александра">
    <RouterLink
      v-for="tab in tabs"
      :key="tab.to"
      :to="tab.to"
      class="tab"
      :class="{ on: active(tab) }"
    >
      <span class="tab-ico" :data-icon="tab.icon" aria-hidden="true" />
      <span>{{ tab.name }}</span>
    </RouterLink>
  </nav>
</template>
