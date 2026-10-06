<script setup>
import { RouterLink, RouterView } from 'vue-router'
import AthleteTabBar from '@/components/AthleteTabBar.vue'
import { meta } from '@/data/alexander'
</script>

<template>
  <div class="athlete-cabinet">
    <header class="topnav athlete-top">
      <RouterLink class="brand" to="/">FORCE<span class="brand-sub">лог</span></RouterLink>
      <nav class="nav-links" aria-label="Кабинет">
        <span class="athlete-name">{{ meta.name }}</span>
        <RouterLink to="/">Обзор</RouterLink>
      </nav>
    </header>
    <RouterView />
    <AthleteTabBar />
  </div>
</template>
