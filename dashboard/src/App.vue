<script setup>
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'

const route = useRoute()
const inAthleteCabinet = computed(() => route.path.startsWith('/alexander'))
</script>

<template>
  <div class="shell" :class="{ family: inAthleteCabinet, 'no-global-nav': inAthleteCabinet }">
    <header v-if="!inAthleteCabinet" class="topnav">
      <RouterLink class="brand" to="/">FORCE<span class="brand-sub">лог</span></RouterLink>
      <nav class="nav-links" aria-label="Разделы">
        <RouterLink to="/">Обзор</RouterLink>
        <RouterLink to="/now">Сейчас</RouterLink>
        <RouterLink to="/alexander">Александр</RouterLink>
        <RouterLink to="/anna">Анна</RouterLink>
        <RouterLink to="/bju">БЖУ</RouterLink>
      </nav>
    </header>
    <RouterView />
    <footer v-if="!inAthleteCabinet" class="site">
      FORCE · тонаж снаряда + индекс прибавки · данные через чат
    </footer>
  </div>
</template>
