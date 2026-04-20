<script setup>
import { usePhotoboothStore } from '../store'
import { CheckCircle2 } from 'lucide-vue-next'

const store = usePhotoboothStore()

const sizes = [
  { id: 'strip', name: 'Strip', description: 'Classic (1:3)', aspectClass: 'aspect-[1/3] h-48', slots: 4 },
  { id: 'square', name: 'Square', description: 'Insta style (1:1)', aspectClass: 'aspect-square w-32', slots: 1 },
  { id: 'portrait', name: 'Portrait', description: 'Vertical (3:4)', aspectClass: 'aspect-[3/4] h-40', slots: 3 },
  { id: 'landscape', name: 'Landscape', description: 'Wide View (4:3)', aspectClass: 'aspect-[4/3] w-48', slots: 2 },
]

function selectSize(id) {
  store.config.size = id
}
</script>

<template>
  <div class="w-full flex flex-col items-center gap-12 max-w-7xl mx-auto px-4">
    <!-- Clean Header -->
    <div class="text-center space-y-3">
      <h2 class="text-4xl md:text-5xl font-black tracking-tight font-display" :style="{ color: 'var(--app-text)' }">
        {{ store.t.choiceDimensions }}
      </h2>
      <p class="font-medium tracking-tight opacity-60" :style="{ color: 'var(--app-text)' }">
        {{ store.t.selectRatio }}
      </p>
    </div>

    <!-- Size Cards Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
      <div 
        v-for="size in sizes" 
        :key="size.id"
        @click="selectSize(size.id)"
        class="group relative backdrop-blur-xl p-8 rounded-[48px] border-2 transition-all duration-500 transform hover:-translate-y-3 cursor-pointer flex flex-col items-center gap-6 text-center"
        :class="store.config.size === size.id ? 'border-primary ring-12 ring-primary/5 shadow-2xl scale-[1.05]' : 'border-white/20 hover:border-white/40 shadow-lg hover:shadow-2xl'"
        :style="{ backgroundColor: 'var(--card-bg)' }"
      >
        <!-- Selection Badge -->
        <div 
          v-if="store.config.size === size.id" 
          class="absolute -top-4 -right-4 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center shadow-xl transform scale-110 z-20 border-4 border-white"
        >
          <CheckCircle2 class="w-7 h-7" />
        </div>

        <!-- Visual representation: High-Fidelity Silhouette Mockup -->
        <div class="flex items-center justify-center p-8 rounded-3xl w-full aspect-square mb-2 group-hover:bg-primary/5 transition-all duration-500 relative" :style="{ backgroundColor: 'var(--sub-bg)' }">
            <div 
               class="relative shadow-xl transition-all duration-700 ring-1 ring-black/5 group-hover:shadow-2xl group-hover:ring-primary/20 flex flex-col gap-1 overflow-hidden"
               :style="{ 
                  backgroundColor: store.appTheme === 'dark' ? '#1e293b' : '#ffffff',
                  padding: size.id === 'strip' ? '6px 6px 20px 6px' : '8px 8px 24px 8px',
                  borderRadius: '6px'
               }"
               :class="size.aspectClass"
            >
              <!-- Skeleton Photo Slots -->
              <div 
                v-for="i in (size.id === 'strip' ? 4 : size.slots)" 
                :key="i"
                class="flex-1 bg-slate-100 dark:bg-slate-900 border border-black/5 rounded-[2px] transition-colors relative"
              >
                <!-- Camera Lens Icon Hint -->
                <div class="absolute inset-0 flex items-center justify-center opacity-10">
                   <div class="w-4 h-4 rounded-full border border-current"></div>
                </div>
              </div>

              <!-- Polaroid Branding Bar -->
              <div class="absolute bottom-1 left-0 right-0 h-4 flex items-center justify-center overflow-hidden">
                 <div class="w-1/2 h-0.5 bg-slate-400/20 rounded-full"></div>
              </div>
            </div>
        </div>
        
        <div class="space-y-2">
          <h3 class="text-2xl font-black text-text tracking-tight" :style="{ color: 'var(--app-text)' }">{{ size.name }}</h3>
          <p class="opacity-40 text-[10px] font-black uppercase tracking-widest leading-relaxed" :style="{ color: 'var(--app-text)' }">{{ size.description }}</p>
        </div>

        <!-- Hover Indicator Dot -->
        <div class="w-2 h-2 rounded-full transition-all duration-300 transform scale-0 group-hover:scale-100 bg-primary/40"></div>
      </div>
    </div>
  </div>
</template>
