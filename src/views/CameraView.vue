<script setup>
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import { usePhotoboothStore } from '../store'
import CameraCapture from '../components/CameraCapture.vue'
import PhotoFrame from '../components/PhotoFrame.vue'
import { CheckCircle2, ChevronRight } from 'lucide-vue-next'

const router = useRouter()
const store = usePhotoboothStore()

const numPhotosNeeded = computed(() => {
  return store.config.cols * store.config.rows
})

function handleCaptured(photo) {
  if (store.retakeIndex !== null) {
    store.capturedPhotos[store.retakeIndex] = photo
    setTimeout(() => {
       store.retakeIndex = null
       router.push({ name: 'preview' })
    }, 1000)
  } else {
    store.capturedPhotos.push(photo)
    if (store.capturedPhotos.length >= numPhotosNeeded.value) {
      setTimeout(() => {
         router.push({ name: 'elements' })
      }, 1000)
    }
  }
}

function handleRetry() {
  store.capturedPhotos = []
}

const dynamicScale = computed(() => {
  const cols = store.config.cols
  const rows = store.config.rows
  const maxWidth = typeof window !== 'undefined' ? Math.min(window.innerWidth * 0.9, 320) : 320
  const maxHeight = typeof window !== 'undefined' ? Math.min(window.innerHeight * 0.5, 450) : 450

  const fWidth = (store.cellWidth * cols) + (10 * (cols - 1)) + 32
  const fHeight = (store.cellHeight * rows) + (10 * (rows - 1)) + 32 + 100
  
  const scaleW = maxWidth / fWidth
  const scaleH = maxHeight / fHeight
  
  return {
    scale: Math.min(scaleW, scaleH, 1),
    width: fWidth,
    height: fHeight
  }
})
</script>

<template>
  <div class="w-full flex flex-col items-center justify-center gap-6 md:gap-12 pt-4 md:pt-8">
    <div class="w-full max-w-4xl flex flex-col lg:flex-row items-center justify-between gap-6 md:gap-12">
      <!-- Capture Section -->
      <div class="flex-1 flex flex-col items-center gap-8 w-full">
        <div class="text-center w-full space-y-3">
          <h2 class="text-2xl md:text-4xl lg:text-5xl font-black text-slate-800 tracking-tight leading-none">
            {{ store.retakeIndex !== null ? 'Foto Ulang' : 'Siap Untuk' }}
            <span class="text-primary italic">{{ store.retakeIndex !== null ? 'Sesi Ini?' : 'Berpose?' }}</span>
          </h2>
          <div class="flex flex-col items-center gap-2">
             <div class="px-5 py-1.5 bg-slate-900 text-white rounded-full font-bold text-xs uppercase tracking-widest shadow-xl">Atur Posisi</div>
             <p class="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] animate-pulse transition-opacity">Siapkan gaya terbaikmu!</p>
          </div>
        </div>

        <CameraCapture 
          :target-photos="store.retakeIndex !== null ? 1 : numPhotosNeeded" 
          @captured="handleCaptured"
          class="w-full max-w-[400px] shadow-primary/20"
        />
        
        <div class="w-full max-w-[400px] flex justify-between items-center p-6 bg-white rounded-[32px] shadow-2xl border-t-8 border-slate-50 relative overflow-hidden group">
           <!-- Glow Background Effect -->
           <div v-if="store.capturedPhotos.length >= numPhotosNeeded && store.retakeIndex === null" class="absolute inset-0 bg-primary/5 animate-pulse"></div>

           <div class="flex flex-col gap-1 relative z-10 w-full text-center">
              <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Status</span>
              <span class="text-lg font-black text-slate-800 tracking-tight transition-all" v-if="store.capturedPhotos.length < numPhotosNeeded || store.retakeIndex !== null">
                 {{ store.retakeIndex !== null ? 'Memotret Ulang...' : `Memotret (${store.capturedPhotos.length}/${numPhotosNeeded})` }}
              </span>
              <span class="text-lg font-black text-green-500 tracking-tight flex items-center justify-center gap-2" v-else>
                 <CheckCircle2 class="w-5 h-5 animate-bounce" /> 
                 Selesai Dipotret!
              </span>
              
              <div class="flex justify-center items-center gap-4 mt-3" v-if="store.capturedPhotos.length > 0 && store.retakeIndex === null">
                 <button 
                  @click="handleRetry"
                  v-if="store.capturedPhotos.length < numPhotosNeeded"
                  class="px-5 py-2 bg-slate-100 text-slate-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all transform active:scale-95"
                 >
                  Ulangi
                 </button>

                 <button 
                  v-if="store.capturedPhotos.length >= numPhotosNeeded"
                  @click="router.push({ name: 'elements' })"
                  class="group/btn w-full px-6 py-4 bg-primary text-white rounded-[20px] font-black text-xs uppercase tracking-[0.2em] shadow-[0_20px_40px_-10px_rgba(99,102,241,0.5)] hover:shadow-primary/40 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 overflow-hidden animate-in zoom-in duration-500"
                 >
                  <div class="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-full transition-all duration-700 skew-x-[-20deg]"></div>
                  <span>LANJUT EDIT</span>
                  <ChevronRight class="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                 </button>
              </div>
           </div>
        </div>
      </div>

      <!-- Live Preview Frame (Desktop Optional) -->
      <div class="hidden lg:flex flex-col items-center gap-6 shrink-0 group">
         <div class="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2 transition-transform group-hover:-translate-y-1">Preview Langsung</div>
         
         <!-- Scaling Wrapper for Responsive Preview -->
         <div 
          class="relative flex items-center justify-center shrink-0"
          :style="{ width: `${dynamicScale.width * dynamicScale.scale}px`, height: `${dynamicScale.height * dynamicScale.scale}px` }"
         >
           <div 
            class="absolute top-0 left-0 transition-all duration-700 ease-in-out"
            :style="{ 
              transform: `scale(${dynamicScale.scale})`,
              transformOrigin: 'top left'
            }"
           >
             <div class="absolute -inset-10 bg-primary/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
             <PhotoFrame :photos="store.capturedPhotos" class="relative z-10 shadow-2xl" />
           </div>
         </div>
      </div>
    </div>
  </div>
</template>
