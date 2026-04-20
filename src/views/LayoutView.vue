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

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 w-full items-start pt-4">
      <!-- Left: Iconic Presets -->
      <div class="lg:col-span-4 flex flex-col gap-5">
        <div class="flex items-center gap-4 mb-2">
           <div class="h-px flex-1 bg-slate-200"></div>
           <span class="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Pilihan Cepat</span>
           <div class="h-px flex-1 bg-slate-200"></div>
        </div>
        
        <div 
          v-for="layout in layouts" 
          :key="layout.id"
          @click="selectLayout(layout)"
          class="group relative backdrop-blur-xl p-3 md:p-5 rounded-xl md:rounded-2xl border transition-all duration-500 transform hover:-translate-y-1 cursor-pointer flex items-center gap-4 align-middle"
          :style="{ 
             backgroundColor: 'var(--card-bg)', 
             borderColor: currentLayoutId === layout.id ? 'var(--secondary)' : 'var(--ui-muted)'
          }"
          :class="currentLayoutId === layout.id ? 'shadow-xl scale-[1.02] z-10' : 'hover:shadow-md opacity-80 hover:opacity-100'"
        >
          <div class="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden shadow-inner font-black border border-slate-200 dark:border-slate-700" :style="{ color: 'var(--app-text)' }">
             {{ layout.cols }}x{{ layout.rows }}
          </div>
          <div class="text-left flex-1">
             <h3 class="text-base md:text-lg font-black tracking-tight" :style="{ color: 'var(--app-text)' }">{{ layout.name }}</h3>
             <p class="text-[8px] md:text-[9px] font-bold uppercase tracking-widest" :style="{ color: 'var(--app-text-muted)' }">{{ layout.description }}</p>
          </div>
          <CheckCircle2 v-if="currentLayoutId === layout.id" class="ml-auto w-6 h-6 text-secondary" />
        </div>
      </div>

      <!-- Right: Custom Grid Builder -->
      <div 
        class="lg:col-span-8 p-4 md:p-6 lg:p-10 rounded-2xl md:rounded-3xl shadow-xl border-b-[4px] relative group/builder"
        :style="{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--ui-muted)' }"
      >
        <!-- Decoration Background -->
        <div class="absolute inset-0 bg-primary/5 opacity-0 group-hover/builder:opacity-100 transition-opacity duration-1000 -z-10 rounded-[48px]"></div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-center">
           <!-- Sliders -->
           <div class="space-y-6 md:space-y-8">
              <div class="space-y-2 md:space-y-3">
                 <div class="flex justify-between items-end">
                    <label class="text-[9px] md:text-[10px] font-black uppercase tracking-widest" :style="{ color: 'var(--app-text-muted)' }">Kolom (Kanan-Kiri)</label>
                    <span class="text-3xl md:text-4xl font-black text-primary">{{ store.config.cols }}</span>
                 </div>
                 <input 
                   type="range" min="1" max="8" step="1" 
                   v-model.number="store.config.cols"
                   @input="store.config.layout = 'custom'"
                   class="w-full h-3 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary" 
                 />
              </div>

              <div class="space-y-2 md:space-y-3">
                 <div class="flex justify-between items-end">
                    <label class="text-[9px] md:text-[10px] font-black uppercase tracking-widest" :style="{ color: 'var(--app-text-muted)' }">Baris (Atas-Bawah)</label>
                    <span class="text-3xl md:text-4xl font-black text-secondary">{{ store.config.rows }}</span>
                 </div>
                 <input 
                   type="range" min="1" max="8" step="1" 
                   v-model.number="store.config.rows"
                   @input="store.config.layout = 'custom'"
                   class="w-full h-3 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-secondary" 
                 />
              </div>

              <div 
                 class="p-4 rounded-xl border flex flex-col gap-1.5"
                 :style="{ backgroundColor: 'var(--sub-bg)', borderColor: 'var(--ui-muted)' }"
              >
                 <div class="flex justify-between items-center">
                    <span class="text-xs font-black uppercase tracking-widest" :style="{ color: 'var(--app-text-muted)' }">Total Sesi Foto</span>
                    <span class="px-2.5 py-0.5 bg-primary text-white rounded-lg text-[9px] font-black tracking-widest shadow-sm">{{ totalPhotosSelection }} KALI</span>
                 </div>
                 <p class="text-[10px] font-bold italic" :style="{ color: 'var(--app-text-muted)' }">"Buat kerangka sekreatif mungkin sesukamu!"</p>
              </div>
           </div>

           <!-- Blueprint Preview -->
           <div class="flex flex-col items-center gap-4 md:gap-6">
              <span class="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em]" :style="{ color: 'var(--app-text-muted)' }">Blueprint Preview</span>
               <div 
                 class="w-full aspect-square rounded-xl p-4 md:p-5 shadow-inner border border-black/5 dark:border-white/5 flex items-center justify-center transition-all overflow-hidden"
                 :style="{ backgroundColor: 'var(--sub-bg)' }"
               >
                 <div class="w-full h-full flex items-center justify-center p-2">
                   <div 
                     class="grid gap-2 transition-all duration-700 max-w-full max-h-full"
                     :style="{ 
                        gridTemplateColumns: `repeat(${store.config.cols}, 1fr)`,
                        gridTemplateRows: `repeat(${store.config.rows}, 1fr)`,
                        width: (store.config.cols * store.cellWidth) > (store.config.rows * store.cellHeight) ? '100%' : 'auto',
                        height: (store.config.rows * store.cellHeight) >= (store.config.cols * store.cellWidth) ? '100%' : 'auto',
                        aspectRatio: `${store.config.cols * store.cellWidth} / ${store.config.rows * store.cellHeight}`,
                        borderRadius: '12px'
                     }"
                   >
                      <div 
                        v-for="i in Math.min(totalPhotosSelection, 64)" :key="i"
                        class="bg-slate-900 shadow-sm border border-primary/50 rounded-[4px] relative animate-in zoom-in duration-300"
                        :style="{ aspectRatio: `${store.cellWidth} / ${store.cellHeight}` }"
                      >
                         <div class="absolute inset-0 flex items-center justify-center opacity-10">
                            <div class="w-2 h-2 rounded-full border border-current"></div>
                         </div>
                      </div>
                   </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  </div>
</template>
