import { createRouter, createWebHistory } from 'vue-router'
import SplashView from '../views/SplashView.vue'
import LayoutView from '../views/LayoutView.vue'
import CameraView from '../views/CameraView.vue'
import ElementsView from '../views/ElementsView.vue'
import PreviewView from '../views/PreviewView.vue'
import FinalView from '../views/FinalView.vue'
import DownloadView from '../views/DownloadView.vue'
import FinishView from '../views/FinishView.vue'

const routes = [
  { path: '/', name: 'splash', component: SplashView },
  { path: '/layout', name: 'layout', component: LayoutView },
  { path: '/camera', name: 'camera', component: CameraView },
  { path: '/elements', name: 'elements', component: ElementsView },
  { path: '/preview', name: 'preview', component: PreviewView },
  { path: '/final', name: 'final', component: FinalView },
  { path: '/download', name: 'download', component: DownloadView },
  { path: '/finish', name: 'finish', component: FinishView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
