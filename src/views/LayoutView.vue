<script setup>
import { ref, computed } from 'vue'
import { usePhotoboothStore } from '../store'
import { CheckCircle2, Layout, Film, LayoutDashboard } from 'lucide-vue-next'

const store = usePhotoboothStore()

const numPhotoOptions = [2, 3, 4]
const activePhotoCount = ref(
  store.config.layout === 'vertical2' ? 2 : (store.config.layout === 'grid4' ? 4 : 3)
)

const layouts = [
  { id: 'strip3', name: 'Iconic Strip', size: 'strip', layout: 'vertical3', cols: 1, rows: 3, description: 'Classic 3-photo vertical strap', aspectClass: 'aspect-[1/3] h-48' },
  { id: 'portrait2', name: 'Portrait Duo', size: 'portrait', layout: 'vertical2', cols: 1, rows: 2, description: 'Clean 2-frame vertical story', aspectClass: 'aspect-[3/5] h-40' },
  { id: 'grid4', name: 'Insta Grid', size: 'square', layout: 'grid4', cols: 2, rows: 2, description: 'Popular 2x2 grid (4 photos)', aspectClass: 'aspect-square w-32' },
  { id: 'single_1_1', name: 'Square 1:1', size: '1:1', layout: 'single', cols: 1, rows: 1, description: 'Sempurna untuk Feeds Instagram', aspectClass: 'aspect-square w-32' },
  { id: 'single_4_5', name: 'Portrait 4:5', size: '4:5', layout: 'single', cols: 1, rows: 1, description: 'Format foto ideal estetika', aspectClass: 'aspect-[4/5] w-32' },
  { id: 'single_9_16', name: 'Story 9:16', size: '9:16', layout: 'single', cols: 1, rows: 1, description: 'Resolusi Instastory / Tiktok', aspectClass: 'aspect-[9/16] w-32' },
  { id: 'single_16_9', name: 'Wide 16:9', size: '16:9', layout: 'single', cols: 1, rows: 1, description: 'Format kamera layar memanjang', aspectClass: 'aspect-[16/9] w-32' },
]

function selectLayout(layout) {
  store.config.size = layout.size
  store.config.layout = layout.layout
  store.config.cols = layout.cols
  store.config.rows = layout.rows
}

const currentLayoutId = computed(() => {
  const found = layouts.find(l => l.cols === store.config.cols && l.rows === store.config.rows && l.layout === store.config.layout)
  return found ? found.id : 'custom'
})

const totalPhotosSelection = computed(() => store.config.cols * store.config.rows)
const activeTab = ref(store.config.layout === 'custom' ? 'custom' : 'preset')
</script>

<template>
  <div class="w-full flex flex-col items-center gap-6 md:gap-10 max-w-7xl mx-auto px-3 md:px-4 mt-4 md:mt-10">
    <!-- Header -->
    <div class="text-center space-y-4">
      <h2 class="text-2xl md:text-4xl lg:text-5xl font-black tracking-tighter" :style="{ color: 'var(--app-text)' }">
        Susunan <span class="text-secondary italic">Bingkai</span>
      </h2>
      <p class="font-bold opacity-50 uppercase tracking-[0.2em] text-xs" :style="{ color: 'var(--app-text)' }">
        Pilih Preset atau Buat Kustom Sendiri
      </p>
    </div>

    <!-- Horizontal Tab Navigation -->
    <div class="flex gap-4 border-b-2 border-slate-200/50 dark:border-white/10 mb-4 w-full justify-center">
      <button 
        @click="activeTab = 'preset'"
        class="pb-3 text-xs md:text-sm font-black uppercase tracking-widest transition-all relative shrink-0"
        :class="activeTab === 'preset' ? 'text-primary' : 'opacity-40 hover:opacity-100'"
        :style="{ color: activeTab === 'preset' ? 'var(--primary)' : 'var(--app-text)' }"
      >
        Preset Populer
        <div v-if="activeTab === 'preset'" class="absolute bottom-[-2px] inset-x-0 h-1 bg-primary rounded-full"></div>
      </button>

      <button 
        @click="activeTab = 'custom'"
        class="pb-3 text-xs md:text-sm font-black uppercase tracking-widest transition-all relative shrink-0"
        :class="activeTab === 'custom' ? 'text-primary' : 'opacity-40 hover:opacity-100'"
        :style="{ color: activeTab === 'custom' ? 'var(--primary)' : 'var(--app-text)' }"
      >
        Buat Kustom
        <div v-if="activeTab === 'custom'" class="absolute bottom-[-2px] inset-x-0 h-1 bg-primary rounded-full"></div>
      </button>
    </div>

    <!-- Main Content Area -->
    <div class="w-full flex-1 transition-all duration-500">
      
      <!-- TAB 1: PRESETS -->
      <transition name="fade" mode="out-in">
        <div v-if="activeTab === 'preset'" class="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 w-full pb-10">
          <div 
            v-for="layout in layouts" 
            :key="layout.id"
            @click="selectLayout(layout); activeTab = 'preset'"
            class="group relative p-4 md:p-6 rounded-[24px] border transition-all duration-300 transform hover:-translate-y-1 cursor-pointer flex items-center gap-4 align-middle"
            :style="{ 
               backgroundColor: 'var(--card-bg)', 
               borderColor: currentLayoutId === layout.id ? 'var(--primary)' : 'transparent',
               boxShadow: currentLayoutId === layout.id ? '0 20px 40px -15px var(--primary)' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
            }"
            :class="currentLayoutId === layout.id ? 'scale-[1.02] z-10 ring-4 ring-primary/20' : 'hover:shadow-xl opacity-90 hover:opacity-100'"
          >
            <div class="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden shadow-inner font-black border border-slate-200 dark:border-slate-700" :style="{ color: 'var(--app-text)' }">
               {{ layout.cols }}x{{ layout.rows }}
            </div>
            <div class="text-left flex-1">
               <h3 class="text-lg md:text-xl font-black tracking-tight" :style="{ color: 'var(--app-text)' }">{{ layout.name }}</h3>
               <p class="text-[10px] md:text-xs font-bold opacity-60 mt-0.5 leading-tight" :style="{ color: 'var(--app-text-muted)' }">{{ layout.description }}</p>
            </div>
            <CheckCircle2 v-if="currentLayoutId === layout.id" class="ml-2 w-8 h-8 text-primary shrink-0" />
          </div>
        </div>

        <!-- TAB 2: CUSTOM BUILDER -->
        <div v-else class="w-full max-w-4xl mx-auto p-6 md:p-10 rounded-[32px] md:rounded-[40px] shadow-2xl relative group/builder border border-white/20"
          :style="{ backgroundColor: 'var(--card-bg)', backdropFilter: 'blur(40px)' }"
        >
          <div class="absolute inset-0 bg-primary/5 opacity-0 group-hover/builder:opacity-100 transition-opacity duration-1000 -z-10 rounded-[40px]"></div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14 items-center">
             <!-- Sliders -->
             <div class="space-y-8 md:space-y-10">
                <!-- Aspect Ratio Selector -->
                <div class="space-y-3">
                   <label class="text-[10px] md:text-xs font-black uppercase tracking-widest block" :style="{ color: 'var(--app-text-muted)' }">Ukuran Kamera (Aspect Ratio)</label>
                   <div class="grid grid-cols-4 gap-2">
                     <button 
                       v-for="ratio in ['1:1', '4:5', '9:16', '16:9']" 
                       :key="ratio"
                       @click="store.config.size = ratio"
                       class="py-2.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all border-2"
                       :class="store.config.size === ratio ? 'border-primary bg-primary/10 text-primary shadow-sm scale-105' : 'border-transparent bg-slate-100 dark:bg-white/5 opacity-60 hover:opacity-100'"
                       :style="store.config.size === ratio ? { borderColor: 'var(--primary)', color: 'var(--primary)' } : { color: 'var(--app-text-muted)' }"
                     >
                       {{ ratio }}
                     </button>
                   </div>
                   <p class="text-[9px] md:text-[10px] font-semibold italic mt-1" :style="{ color: 'var(--app-text-muted)' }">
                     *Pilih rasio untuk mensinkronkan bentuk kamera & bingkai.
                   </p>
                </div>

                <div class="space-y-3">
                   <div class="flex justify-between items-end">
                      <label class="text-[10px] md:text-xs font-black uppercase tracking-widest" :style="{ color: 'var(--app-text-muted)' }">Kolom (Kanan-Kiri)</label>
                      <span class="text-4xl md:text-5xl font-black text-primary">{{ store.config.cols }}</span>
                   </div>
                   <input 
                     type="range" min="1" max="8" step="1" 
                     v-model.number="store.config.cols"
                     @input="store.config.layout = 'custom'"
                     class="w-full h-4 rounded-lg appearance-none cursor-pointer accent-primary border border-slate-200" 
                     :style="{ backgroundColor: 'var(--sub-bg)' }"
                   />
                </div>

                <div class="space-y-3">
                   <div class="flex justify-between items-end">
                      <label class="text-[10px] md:text-xs font-black uppercase tracking-widest" :style="{ color: 'var(--app-text-muted)' }">Baris (Atas-Bawah)</label>
                      <span class="text-4xl md:text-5xl font-black text-secondary">{{ store.config.rows }}</span>
                   </div>
                   <input 
                     type="range" min="1" max="8" step="1" 
                     v-model.number="store.config.rows"
                     @input="store.config.layout = 'custom'"
                     class="w-full h-4 rounded-lg appearance-none cursor-pointer accent-secondary border border-slate-200" 
                     :style="{ backgroundColor: 'var(--sub-bg)' }"
                   />
                </div>

                <div class="p-5 rounded-2xl border-2 flex flex-col gap-2" :style="{ backgroundColor: 'var(--sub-bg)', borderColor: 'var(--primary)' }">
                   <div class="flex justify-between items-center">
                      <span class="text-sm font-black uppercase tracking-widest" :style="{ color: 'var(--app-text)' }">Total Sesi Foto</span>
                      <span class="px-3 py-1 bg-primary text-white rounded-xl text-xs font-black tracking-widest shadow-md">{{ totalPhotosSelection }} KALI</span>
                   </div>
                   <p class="text-xs font-bold italic" :style="{ color: 'var(--app-text-muted)' }">"Geser slider untuk menciptakan kerangka yang paling unik dan sesuai kreasi kamu."</p>
                </div>
             </div>

             <!-- Blueprint Preview -->
             <div class="flex flex-col items-center gap-5">
                <span class="text-[10px] md:text-xs font-black uppercase tracking-[0.4em]" :style="{ color: 'var(--app-text-muted)' }">Blueprint Preview</span>
                 <div 
                   class="rounded-[32px] p-3 md:p-5 shadow-inner border-[3px] flex items-center justify-center transition-all overflow-hidden mx-auto duration-700"
                   :style="{ 
                      backgroundColor: 'var(--sub-bg)', 
                      borderColor: 'var(--primary)',
                      aspectRatio: `${store.config.cols * store.cellWidth} / ${store.config.rows * store.cellHeight}`,
                      width: (store.config.cols * store.cellWidth) >= (store.config.rows * store.cellHeight) ? '100%' : 'auto',
                      height: (store.config.cols * store.cellWidth) < (store.config.rows * store.cellHeight) ? '100%' : 'auto',
                      maxHeight: '400px',
                      maxWidth: '100%'
                   }"
                 >
                   <div class="w-full h-full flex items-center justify-center p-1">
                     <div 
                       class="grid gap-2 transition-all duration-700 w-full h-full"
                       :style="{ 
                          gridTemplateColumns: `repeat(${store.config.cols}, 1fr)`,
                          gridTemplateRows: `repeat(${store.config.rows}, 1fr)`
                       }"
                     >
                        <div 
                          v-for="i in Math.min(totalPhotosSelection, 64)" :key="i"
                          class="bg-slate-900 shadow-md border-2 border-primary/40 rounded-lg relative animate-in zoom-in duration-300 hover:scale-105 transition-transform"
                          :style="{ aspectRatio: `${store.cellWidth} / ${store.cellHeight}` }"
                        >
                           <div class="absolute inset-0 flex items-center justify-center opacity-20">
                              <div class="w-2 h-2 rounded-full bg-white"></div>
                           </div>
                        </div>
                     </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.98);
}
</style>
