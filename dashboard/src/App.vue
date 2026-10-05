<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="shell">
    <header class="topnav">
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
    <footer class="site">
      FORCE · тонаж снаряда + индекс прибавки · данные через чат
    </footer>
  </div>
</template>
