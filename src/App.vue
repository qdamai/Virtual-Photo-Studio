<script setup>
import { useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'
import PatternBackground from './components/PatternBackground.vue'
import StepNavigation from './components/StepNavigation.vue'
import { usePhotoboothStore } from './store'
import * as LucideIcons from 'lucide-vue-next'

const { Sparkles, Sun, Moon } = LucideIcons

const route = useRoute()
const router = useRouter()
const store = usePhotoboothStore()

const showNavigation = computed(() => {
  const hiddenRoutes = ['splash', 'finish', 'preview', 'final', 'download', 'camera']
  return !hiddenRoutes.includes(route.name)
})

const currentStepIndex = computed(() => {
  return store.steps.findIndex(s => s.route === route.name) + 1
})
</script>

<template>
  <div 
    class="relative h-screen overflow-x-hidden overflow-y-auto transition-all duration-500"
    :class="{
       'bg-slate-50 text-slate-900': store.appTheme === 'light',
       'bg-slate-950 text-slate-100': store.appTheme === 'dark',
       'bg-background text-text': store.appTheme === 'playful'
    }"
    :style="{
       '--card-bg': store.appTheme === 'light' ? '#ffffff' : store.appTheme === 'dark' ? '#0f172a' : 'rgba(255,255,255,0.7)',
       '--sub-bg': store.appTheme === 'light' ? '#f1f5f9' : store.appTheme === 'dark' ? '#1e293b' : 'rgba(248,250,252,0.5)',
       '--app-text': store.appTheme === 'light' ? '#0f172a' : store.appTheme === 'dark' ? '#f8fafc' : '#1e293b',
       '--primary': store.appTheme === 'light' ? '#0ea5e9' : store.appTheme === 'dark' ? '#fb7185' : '#6366f1',
       '--primary-hover': store.appTheme === 'light' ? '#0284c7' : store.appTheme === 'dark' ? '#f43f5e' : '#4f46e5',
       '--secondary': store.appTheme === 'light' ? '#10b981' : store.appTheme === 'dark' ? '#e11d48' : '#a855f7',
       '--ui-muted': store.appTheme === 'light' ? 'rgba(15,23,42,0.4)' : store.appTheme === 'dark' ? 'rgba(248,250,252,0.4)' : 'rgba(30,41,59,0.4)'
    }"
  >
    <!-- Main Pattern Background -->
    <PatternBackground 
      v-if="store.appTheme === 'playful'"
      :pattern="store.config.pattern" 
      :color="store.config.color" 
      class="opacity-10 pointer-events-none"
    />

    <!-- Header / Logo -->
    <!-- Header / Logo -->
    <header class="fixed top-0 left-0 w-full px-4 py-3 md:px-6 md:py-5 flex flex-row justify-between items-center z-50">
      <!-- Logo Container -->
      <div 
        class="flex items-center gap-3 cursor-pointer group shrink-0"
        @click="store.reset(); router.push('/')"
      >
        <div class="w-8 h-8 md:w-10 md:h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform shrink-0">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 md:w-6 md:h-6">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
            <circle cx="12" cy="13" r="4"></circle>
          </svg>
        </div>
        <span class="hidden md:inline text-base md:text-xl font-bold tracking-tight">Dame-Snap</span>
      </div>

      <!-- Right Side Controls (Switchers & Progress) -->
      <div class="flex items-center gap-3 md:gap-6 shrink-0">
        <!-- Compact Controls Container -->
        <div class="flex items-center gap-2">
          <!-- Language Switcher -->
          <div class="flex gap-1 p-1 bg-black/5 dark:bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-sm">
             <button 
               v-for="lang in ['id', 'en']" 
               :key="lang"
               @click="store.locale = lang"
               class="w-6 h-6 md:w-8 md:h-8 rounded-lg text-[9px] md:text-[10px] font-black uppercase transition-all duration-300 flex items-center justify-center shrink-0"
               :class="store.locale === lang ? 'bg-white dark:bg-primary text-primary dark:text-white shadow-md' : 'text-slate-500 opacity-60 hover:opacity-100'"
             >
               {{ lang }}
             </button>
          </div>

          <!-- Theme Switcher -->
          <div class="flex gap-1 p-1 bg-black/5 dark:bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-sm">
             <button 
               v-for="[theme, icon] in [['playful', 'sparkles'], ['light', 'sun'], ['dark', 'moon']]"
               :key="theme"
               @click="store.appTheme = theme"
               class="w-6 h-6 md:w-8 md:h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300 active:scale-90"
               :class="store.appTheme === theme ? 'bg-primary text-white shadow-md' : 'text-slate-400 opacity-60 hover:opacity-100'"
             >
               <Sparkles v-if="theme === 'playful'" class="w-3.5 h-3.5 md:w-4 md:h-4" :class="{ 'animate-pulse': store.appTheme === 'playful' }" />
               <Sun      v-else-if="theme === 'light'" class="w-3.5 h-3.5 md:w-4 md:h-4" :class="{ 'rotate-12': store.appTheme === 'light' }" />
               <Moon     v-else                        class="w-3.5 h-3.5 md:w-4 md:h-4" :class="{ 'rotate-[-12deg]': store.appTheme === 'dark' }" />
             </button>
          </div>
        </div>

        <!-- Progress Bar (Desktop Only) -->
        <div v-if="showNavigation" class="hidden lg:flex flex-col items-end">
          <span class="text-xs uppercase tracking-widest opacity-40 font-semibold mb-1">Progress</span>
          <div class="w-32 h-1.5 bg-slate-200/50 rounded-full overflow-hidden">
            <div 
              class="h-full bg-primary transition-all duration-500 ease-out"
              :style="{ width: `${(currentStepIndex / store.totalSteps) * 100}%` }"
            ></div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="relative z-10 pt-16 pb-20 md:pt-32 md:pb-40 px-3 md:px-4 max-w-7xl mx-auto min-h-screen flex flex-col items-center">
      <router-view v-slot="{ Component }">
        <transition name="step-transition" mode="out-in">
          <component :is="Component" :key="route.name" />
        </transition>
      </router-view>
    </main>

    <!-- Navigation Controls -->
    <StepNavigation v-if="showNavigation" />
  </div>
</template>

<style>
.step-transition-enter-active,
.step-transition-leave-active {
  transition: all 0.4s ease-out;
}

.step-transition-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.step-transition-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
