<script setup>
import { useRouter } from 'vue-router'
import { Sparkles, Camera } from 'lucide-vue-next'
import { usePhotoboothStore } from '../store'

const router = useRouter()
const store = usePhotoboothStore()

function start() {
  router.push({ name: 'layout' })
}
</script>

<template>
  <div class="w-full flex flex-col items-center justify-center min-h-[70vh] text-center gap-6 md:gap-12 group">
    <div class="relative flex flex-col items-center">
      <!-- Decorator elements -->
      <div class="absolute -top-12 -left-12 opacity-10 blur-2xl w-64 h-64 bg-primary/40 rounded-full animate-pulse"></div>
      <div class="absolute -bottom-16 -right-16 opacity-10 blur-2xl w-64 h-64 bg-secondary/40 rounded-full animate-pulse delay-700"></div>

      <div class="w-16 h-16 md:w-24 md:h-24 bg-primary text-white rounded-3xl flex items-center justify-center shadow-2xl mb-4 md:mb-8 transform transition-transform duration-700 hover:rotate-[15deg]">
        <Camera class="w-8 h-8 md:w-12 md:h-12" />
      </div>
      
      <div class="space-y-4 relative z-10">
        <h1 class="text-4xl md:text-6xl lg:text-8xl font-black tracking-tight leading-none" :style="{ color: 'var(--app-text)' }">
          Dame-<span class="text-primary">Snap</span>
        </h1>
        <p class="text-base md:text-2xl font-medium tracking-tight opacity-60" :style="{ color: 'var(--app-text)' }">
          {{ store.t.splashMsg }}
        </p>
      </div>
    </div>

    <div class="flex flex-col items-center gap-4 md:gap-6 mt-4 md:mt-12 w-full max-w-sm px-4">
      <button 
        @click="start"
        class="group relative w-full px-8 md:px-12 py-4 md:py-5 rounded-3xl bg-primary text-white text-base md:text-xl font-bold shadow-2xl shadow-primary/30 transition-all transform hover:-translate-y-1 hover:bg-primary-hover active:scale-95 overflow-hidden border-b-4 border-black/10"
      >
        <div class="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-full transition-all duration-700 skew-x-[-20deg]"></div>
        <div class="flex items-center justify-center gap-2 uppercase tracking-widest text-sm font-black">
          {{ store.t.start }}
          <Sparkles class="w-5 h-5 animate-pulse" />
        </div>
      </button>
      <!-- Removed redundant "Klik untuk memulai" text — button is self-explanatory -->
    </div>

    <!-- Features badge — closer to viewport center, higher contrast text -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mt-4 md:mt-12 w-full max-w-sm md:max-w-2xl opacity-65 group-hover:opacity-100 transition-opacity duration-500">
       <div 
         v-for="badge in (store.locale === 'id' ? ['Tangkap Cepat', 'HD Frames', 'Seni Bentuk', 'Salinan Digital'] : ['Quick Capture', 'HD Frames', 'Custom Art', 'Digital Copy'])"
         :key="badge"
         class="px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/20 shadow-sm"
         :style="{ backgroundColor: 'var(--sub-bg)', color: 'var(--app-text)', opacity: '0.85' }"
       >
         {{ badge }}
       </div>
    </div>
  </div>
</template>
