import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import NowView from './views/NowView.vue'
import AlexanderView from './views/AlexanderView.vue'
import AnnaView from './views/AnnaView.vue'
import BjuView from './views/BjuView.vue'

export default createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/now', name: 'now', component: NowView },
    { path: '/alexander', name: 'alexander', component: AlexanderView },
    { path: '/anna', name: 'anna', component: AnnaView },
    { path: '/bju', name: 'bju', component: BjuView },
  ],
  scrollBehavior: () => ({ top: 0 }),
})
