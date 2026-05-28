import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import SceneChapter1 from '../views/SceneChapter1.vue'
import SceneChapter2 from '../views/SceneChapter2.vue' 
import SceneChapter3 from '../views/SceneChapter3.vue' 
import SceneChapter4 from '../views/SceneChapter4.vue' 

const routes = [
  { path: '/', redirect: '/Home' },
  { path: '/Home', name: 'Home', component: Home },
  { path: '/chapter1', name: 'Chapter1', component: SceneChapter1 },
  { path: '/chapter2', name: 'Chapter2', component: SceneChapter2 },
  { path: '/chapter3', name: 'Chapter3', component: SceneChapter3 },
  { path: '/chapter4', name: 'Chapter4', component: SceneChapter4 }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router