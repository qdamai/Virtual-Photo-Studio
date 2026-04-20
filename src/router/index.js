import { createRouter, createWebHistory } from 'vue-router'
import SplashView from '../views/SplashView.vue'
import LayoutView from '../views/LayoutView.vue'
import CameraView from '../views/CameraView.vue'
import ElementsView from '../views/ElementsView.vue'
import PreviewView from '../views/PreviewView.vue'
import FinalView from '../views/FinalView.vue'
import DownloadView from '../views/DownloadView.vue'
import FinishView from '../views/FinishView.vue'
import { usePhotoboothStore } from '../store'

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

// Routes that require captured photos to exist
const routesRequiringPhotos = ['elements', 'preview', 'final', 'download', 'finish']

router.beforeEach((to) => {
  // Lazily get the store (must be after pinia is initialized)
  try {
    const store = usePhotoboothStore()
    // If navigating to a photo-dependent route but no photos exist (e.g. after page reload), redirect home
    if (routesRequiringPhotos.includes(to.name) && store.capturedPhotos.length === 0) {
      return { name: 'splash' }
    }
    // If on download page but no final image, go back to final
    if (to.name === 'download' && !store.finalImage) {
      if (store.capturedPhotos.length > 0) return { name: 'final' }
      return { name: 'splash' }
    }
  } catch (e) {
    // Store not ready yet, allow navigation
  }
})

export default router
