import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import NowView from './views/NowView.vue'
import AlexanderLayout from './views/AlexanderLayout.vue'
import AlexanderView from './views/AlexanderView.vue'
import AlexanderDiaryView from './views/AlexanderDiaryView.vue'
import AlexanderFoodView from './views/AlexanderFoodView.vue'
import AnnaView from './views/AnnaView.vue'
import BjuView from './views/BjuView.vue'

export default createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/now', name: 'now', component: NowView },
    {
      path: '/alexander',
      component: AlexanderLayout,
      children: [
        { path: '', name: 'alexander', component: AlexanderView },
        { path: 'diary', name: 'alexander-diary', component: AlexanderDiaryView },
        { path: 'food', name: 'alexander-food', component: AlexanderFoodView },
      ],
    },
    { path: '/anna', name: 'anna', component: AnnaView },
    { path: '/bju', name: 'bju', component: BjuView },
  ],
  scrollBehavior: () => ({ top: 0 }),
})
