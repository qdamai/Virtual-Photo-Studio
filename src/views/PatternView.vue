<script setup>
import { computed } from 'vue'
import { usePhotoboothStore } from '../store'
import { CheckCircle2, Palette } from 'lucide-vue-next'

const store = usePhotoboothStore()

const pickerColor = computed({
  get: () => {
    return store.config.color.startsWith('linear') ? '#6366f1' : store.config.color
  },
  set: (val) => {
    store.config.color = val
  }
})

const patterns = [
  { id: 'dots', name: 'Dots', class: 'pattern-dots' },
  { id: 'stripes', name: 'Stripes', class: 'pattern-stripes' },
  { id: 'grid', name: 'Grid', class: 'pattern-grid' },
  { id: 'abstract', name: 'Abstract', class: 'pattern-abstract' },
  { id: 'checkered-sm', name: 'Check-S', class: 'pattern-checkered-sm' },
  { id: 'checkered-lg', name: 'Check-L', class: 'pattern-checkered-lg' },
  { id: 'gingham', name: 'Gingham', class: 'pattern-gingham' },
  { id: 'dots-lg', name: 'Dots-L', class: 'pattern-dots-lg' },
  { id: 'dots-tiny', name: 'Micro', class: 'pattern-dots-tiny' },
  { id: 'v-stripes', name: 'V-Bar', class: 'pattern-v-stripes' },
  { id: 'h-stripes', name: 'H-Bar', class: 'pattern-h-stripes' },
  { id: 'diagonal-thin', name: 'Slash', class: 'pattern-diagonal-thin' },
  { id: 'diagonal-bold', name: 'Bold', class: 'pattern-diagonal-bold' },
  { id: 'zigzag', name: 'Zigzag', class: 'pattern-zigzag' },
  { id: 'waves', name: 'Waves', class: 'pattern-waves' },
  { id: 'hearts-sm', name: 'Love-S', class: 'pattern-hearts-sm' },
  { id: 'hearts-lg', name: 'Love-L', class: 'pattern-hearts-lg' },
  { id: 'sparkles', name: 'Star', class: 'pattern-sparkles' },
  { id: 'smileys', name: 'Smiley', class: 'pattern-smileys' },
  { id: 'flowers', name: 'Flora', class: 'pattern-flowers' },
  { id: 'cherries', name: 'Cherry', class: 'pattern-cherries' },
  { id: 'strawberries', name: 'Berry', class: 'pattern-strawberries' },
  { id: 'bows', name: 'Bows', class: 'pattern-bows' },
  { id: 'clouds', name: 'Cloudy', class: 'pattern-clouds' },
  { id: 'bubbles', name: 'Bubbles', class: 'pattern-bubbles' },
  { id: 'hexagon', name: 'Hex', class: 'pattern-hexagon' },
  { id: 'diamonds', name: 'Diamo', class: 'pattern-diamonds' },
  { id: 'crosses', name: 'Plus', class: 'pattern-crosses' },
]

const colors = [
  { id: 'pastel-indigo', name: 'Indigo', value: '#6366f1' },
  { id: 'monochrome', name: 'Slate', value: '#1e293b' },
  { id: 'lavender', name: 'Violet', value: '#8b5cf6' },
  { id: 'rose', name: 'Rose', value: '#1e293b' },
  { id: 'emerald', name: 'Emerald', value: '#10b981' },
  { id: 'white', name: 'White', value: '#ffffff' },
]

const gradients = [
  { id: 'sunset', name: 'Morning', value: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' },
  { id: 'sakura', name: 'Sakura', value: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)' },
  { id: 'peach', name: 'Peach', value: 'linear-gradient(135deg, #fda085 0%, #f6d365 100%)' },
  { id: 'sky', name: 'Sea', value: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)' },
  { id: 'mint', name: 'Mint', value: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)' },
  { id: 'lavender', name: 'Lavender', value: 'linear-gradient(135deg, #cfd9df 0%, #e2ebf0 100%)' },
  { id: 'midnight', name: 'Night', value: 'linear-gradient(135deg, #2b5876 0%, #4e4376 100%)' },
  { id: 'deep-sea', name: 'Deep', value: 'linear-gradient(135deg, #00c6fb 0%, #005bea 100%)' },
  { id: 'lemon', name: 'Lemon', value: 'linear-gradient(135deg, #fbef80 0%, #f8d07a 100%)' },
  { id: 'marshmallow', name: 'Candy', value: 'linear-gradient(135deg, #cd9cf2 0%, #f6f3ff 100%)' },
  { id: 'honey', name: 'Honey', value: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' },
  { id: 'emerald-city', name: 'City', value: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)' },
  { id: 'berry', name: 'Berry', value: 'linear-gradient(135deg, #f43f5e 0%, #fb7185 100%)' },
  { id: 'royal', name: 'Royal', value: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' },
  { id: 'forest', name: 'Forest', value: 'linear-gradient(135deg, #059669 0%, #064e3b 100%)' },
  { id: 'carbon', name: 'Carbon', value: 'linear-gradient(135deg, #374151 0%, #111827 100%)' },
  { id: 'neon', name: 'Neon', value: 'linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%)' },
  { id: 'gold', name: 'Gold', value: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)' },
  { id: 'rose-gold', name: 'Rose Gold', value: 'linear-gradient(135deg, #fca5a5 0%, #f87171 100%)' },
  { id: 'silver', name: 'Silver', value: 'linear-gradient(135deg, #e5e7eb 0%, #9ca3af 100%)' },
]

function selectPattern(id) {
  store.config.pattern = id
}

function selectColor(value) {
  store.config.color = value
}
</script>

<template>
  <div class="w-full flex flex-col items-center gap-12 max-w-7xl mx-auto px-4">
    <div class="text-center space-y-3">
      <h2 class="text-4xl md:text-5xl font-black tracking-tighter" :style="{ color: 'var(--app-text)' }">Frame <span class="text-primary italic">Patterns</span></h2>
      <p class="font-bold opacity-30 uppercase tracking-[0.4em] text-[10px]" :style="{ color: 'var(--app-text)' }">Personalize your memory's atmosphere</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-start">
      
      <!-- Left: Background Selection (Col 3) -->
      <div class="lg:col-span-3">
         <div class="p-8 rounded-[48px] shadow-2xl border-2 border-white/20 space-y-8 sticky top-36" :style="{ backgroundColor: 'var(--card-bg)', backdropFilter: 'blur(60px)' }">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner">
                <Palette class="w-5 h-5 text-primary" />
              </div>
              <h3 class="text-2xl font-black tracking-tight" :style="{ color: 'var(--app-text)' }">Tones</h3>
            </div>

            <!-- Gradients Grid -->
            <div class="space-y-4">
               <label class="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">Atmospheric Blends</label>
               <div class="grid grid-cols-5 gap-2.5">
                  <div 
                    v-for="grad in gradients" 
                    :key="grad.id"
                    @click="selectColor(grad.value)"
                    class="aspect-square rounded-xl cursor-pointer transition-all transform hover:scale-125 hover:rotate-3 border-2 shadow-sm"
                    :class="store.config.color === grad.value ? 'border-primary ring-4 ring-primary/20 scale-110 z-10' : 'border-white/10'"
                    :style="{ background: grad.value }"
                  ></div>
               </div>
            </div>

            <!-- Solids -->
            <div class="space-y-4">
               <label class="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">Solid Palette</label>
               <div class="flex flex-wrap gap-2.5">
                  <div 
                    v-for="color in colors" 
                    :key="color.id"
                    @click="selectColor(color.value)"
                    class="w-8 h-8 rounded-full cursor-pointer transition-all transform hover:scale-125 border-2 shadow-sm"
                    :class="store.config.color === color.value ? 'border-primary ring-4 ring-primary/20 scale-110 z-10' : 'border-white/10'"
                    :style="{ backgroundColor: color.value }"
                  ></div>
               </div>
            </div>
         </div>
      </div>

      <!-- Center: Patterns Selection (Col 5) - High Density Grid -->
      <div class="lg:col-span-5 px-2">
        <label class="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-4 inline-block mb-4">Pattern Library</label>
        <div class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 bg-white/5 p-4 rounded-[48px] backdrop-blur-md">
          <div 
            v-for="pattern in patterns" 
            :key="pattern.id"
            @click="selectPattern(pattern.id)"
            class="group relative aspect-square rounded-[28px] border-2 transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer overflow-hidden p-1 shadow-sm border-white/10"
            :style="{ backgroundColor: 'var(--sub-bg)' }"
            :class="store.config.pattern === pattern.id ? 'border-primary ring-8 ring-primary/5 shadow-2xl scale-[1.05] z-10' : 'hover:shadow-lg'"
          >
            <!-- Pattern Preview using Mask -->
            <div 
                class="absolute inset-0 transition-opacity" 
                :class="[pattern.class, store.config.pattern === pattern.id ? 'opacity-100' : 'opacity-20 group-hover:opacity-40']"
                :style="{ background: store.config.color }"
            ></div>
            
            <div class="absolute inset-x-0 bottom-1 flex justify-center z-10">
              <span 
                class="text-[7px] font-black uppercase tracking-widest bg-white/90 text-slate-800 px-2 py-1 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0"
              >
                {{ pattern.name }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Live Frame Preview (Col 4) -->
      <div class="lg:col-span-4 lg:pl-4">
         <div class="sticky top-36 space-y-4">
            <div class="flex items-center justify-between px-4">
               <label class="text-[10px] font-black uppercase tracking-widest text-slate-400">Live Preview</label>
               <span class="text-[10px] font-black text-primary animate-pulse">Reactive • WYSIWYG</span>
            </div>
            
            <div class="relative w-full aspect-[3/4.5] p-3 rounded-[40px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] transition-all duration-700 overflow-hidden ring-1 ring-white/20 border-8 border-white/5 bg-white">
               <!-- Frame Background & Pattern -->
               <div 
                 class="absolute inset-0 transition-all duration-500"
                 :class="store.config.pattern !== 'none' ? patterns.find(p => p.id === store.config.pattern)?.class : ''"
                 :style="{ background: store.config.color }"
               ></div>

               <!-- Photo Skeleton Slots (Simulating Layout) -->
               <div class="relative z-10 w-full h-full flex flex-col gap-3 p-4">
                  <div v-for="i in 3" :key="i" class="flex-1 rounded-xl bg-slate-900/10 dark:bg-slate-100/10 backdrop-blur-xl border border-white/30 flex items-center justify-center overflow-hidden group">
                     <div class="absolute inset-0 bg-white/5 translate-x-[-100%] group-hover:translate-x-full transition-all duration-1000 skew-x-[-20deg] animate-shimmer"></div>
                     <span class="text-white/20 font-black text-4xl italic">PHOTO {{ i }}</span>
                  </div>
                  
                  <div class="h-12 w-full flex items-center justify-center opacity-40">
                    <span class="text-white text-[10px] font-black tracking-[0.3em] uppercase">Dame-Snap • {{ store.locale === 'id' ? 'Memori' : 'Memory' }}</span>
                  </div>
               </div>
            </div>

            <p class="text-[10px] text-center opacity-40 italic font-medium" :style="{ color: 'var(--app-text)' }">Frame above updates in real-time based on your selection</p>
         </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
