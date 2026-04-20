<script setup>
import { useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'
import { usePhotoboothStore } from '../store'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const store = usePhotoboothStore()

const currentIndex = computed(() => {
  return store.steps.findIndex(s => s.route === route.name)
})

const canGoBack = computed(() => currentIndex.value > 0)
const canGoNext = computed(() => {
  // Add validation logic here for each step if needed
  return currentIndex.value < store.totalSteps - 1
})

function handleBack() {
  if (canGoBack.value) {
    const prevRoute = store.steps[currentIndex.value - 1].route
    router.push({ name: prevRoute })
  }
}

function handleNext() {
  if (canGoNext.value) {
    const nextRoute = store.steps[currentIndex.value + 1].route
    router.push({ name: nextRoute })
  }
}
</script>

<template>
  <div 
    class="fixed bottom-0 left-0 w-full p-4 md:p-8 pt-8 md:pt-16 z-40 bg-gradient-to-t transition-colors duration-500"
    :class="{
       'from-slate-50 via-slate-50/80 to-transparent': store.appTheme === 'light',
       'from-slate-950 via-slate-950/80 to-transparent': store.appTheme === 'dark',
       'from-background via-background/80 to-transparent': store.appTheme === 'playful'
    }"
  >
    <div class="max-w-5xl mx-auto flex items-center justify-between">
      <button 
        v-if="canGoBack"
        @click="handleBack"
        class="group flex items-center gap-2 font-black px-6 md:px-10 py-3 md:py-4 rounded-3xl transition-all border border-white/20 shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95"
        :style="{ backgroundColor: 'var(--sub-bg)', color: 'var(--app-text)' }"
      >
        <ChevronLeft class="w-5 h-5 transition-transform group-hover:-translate-x-1 opacity-60" />
        <span class="uppercase tracking-widest text-xs">{{ store.t.back }}</span>
      </button>
      <div v-else></div>

      <button 
        v-if="canGoNext"
        @click="handleNext"
        class="group flex items-center gap-2 font-black px-8 md:px-12 py-3 md:py-5 rounded-3xl bg-primary text-white hover:bg-primary-hover shadow-2xl shadow-primary/30 transition-all transform hover:-translate-y-1 active:scale-95 overflow-hidden relative border-b-4 border-black/10"
      >
        <div class="absolute inset-0 bg-white/20 translate-x-[-150%] group-hover:translate-x-full transition-all duration-1000 skew-x-[-25deg]"></div>
        <span class="relative z-10 uppercase tracking-widest text-xs">{{ store.t.next }}</span>
        <ChevronRight class="w-5 h-5 relative z-10 transition-transform group-hover:translate-x-1" />
      </button>
    </div>
  </div>
</template>
