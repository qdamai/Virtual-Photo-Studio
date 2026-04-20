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
  store.capturedPhotos.push(photo)
  if (store.capturedPhotos.length >= numPhotosNeeded.value) {
    setTimeout(() => {
       router.push({ name: 'elements' })
    }, 1000)
  }
}

function handleRetry() {
  store.capturedPhotos = []
}

const dynamicScale = computed(() => {
  const cols = store.config.cols
  const rows = store.config.rows
  const frameWidth = (store.cellWidth * cols) + (10 * (cols - 1)) + 32
  const frameHeight = (store.cellHeight * rows) + (10 * (rows - 1)) + 32 + 100
  
  const scaleW = 320 / frameWidth
  const scaleH = 600 / frameHeight
  
  return Math.min(scaleW, scaleH)
})
</script>

<template>
  <div class="w-full flex flex-col md:flex-row items-start justify-center gap-12 pt-8">
    <div class="flex-1 flex flex-col items-center gap-8 w-full">
      <div class="text-left w-full space-y-4">
        <h2 class="text-5xl md:text-6xl font-black text-slate-800 tracking-tight leading-none">Ready for <span class="text-primary italic">Action?</span></h2>
        <div class="flex items-center gap-4">
           <div class="px-6 py-2 bg-slate-900 text-white rounded-full font-bold text-sm uppercase tracking-widest shadow-xl">Get in position</div>
           <p class="text-slate-400 font-bold uppercase text-xs tracking-[0.2em] animate-pulse transition-opacity">Don't forget to smile!</p>
        </div>
      </div>

      <CameraCapture 
        :target-photos="numPhotosNeeded" 
        @captured="handleCaptured"
        class="w-full max-w-2xl shadow-primary/20"
      />
      
      <div class="w-full flex justify-between items-center p-8 bg-white rounded-[40px] shadow-2xl border-t-8 border-slate-50 relative overflow-hidden group">
         <!-- Glow Background Effect -->
         <div v-if="store.capturedPhotos.length >= numPhotosNeeded" class="absolute inset-0 bg-primary/5 animate-pulse"></div>

         <div class="flex flex-col gap-1 relative z-10">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Booth Control</span>
            <span class="text-xl font-black text-slate-800 tracking-tight transition-all" v-if="store.capturedPhotos.length < numPhotosNeeded">
               Capturing ({{store.capturedPhotos.length}}/{{numPhotosNeeded}})
            </span>
            <span class="text-xl font-black text-green-500 tracking-tight flex items-center gap-2" v-else>
               <CheckCircle2 class="w-6 h-6 animate-bounce" /> 
               Captured Successfully!
            </span>
         </div>
         
         <div class="flex items-center gap-4 relative z-10">
            <button 
              @click="handleRetry"
              v-if="store.capturedPhotos.length > 0"
              class="px-6 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all transform active:scale-95"
            >
              Retry
            </button>

            <button 
              v-if="store.capturedPhotos.length >= numPhotosNeeded"
              @click="router.push({ name: 'elements' })"
              class="group/btn px-10 py-5 bg-primary text-white rounded-3xl font-black text-sm uppercase tracking-[0.2em] shadow-[0_20px_40px_-10px_rgba(99,102,241,0.5)] hover:shadow-primary/40 transition-all transform hover:-translate-y-2 active:scale-95 flex items-center gap-3 overflow-hidden animate-in zoom-in duration-500"
            >
              <div class="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-full transition-all duration-700 skew-x-[-20deg]"></div>
              <span>Edit Frame</span>
              <ChevronRight class="w-5 h-5 transition-transform group-hover/btn:translate-x-1" />
            </button>
         </div>
      </div>
    </div>

    <!-- Live Preview Frame -->
    <div class="hidden lg:flex flex-col items-center gap-6 shrink-0 group">
       <div class="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4 transition-transform group-hover:-translate-y-1">Live Feed Frame</div>
       
       <!-- Scaling Wrapper for Responsive Preview -->
       <div 
        class="relative flex items-start justify-center overflow-visible"
        :style="{ 
          width: '320px', 
          height: '600px' 
        }"
       >
         <div 
          class="relative transition-all duration-700 ease-in-out origin-top"
          :style="{ 
            transform: `scale(${dynamicScale})`,
          }"
         >
           <div class="absolute -inset-10 bg-primary/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
           <PhotoFrame :photos="store.capturedPhotos" class="relative z-10 shadow-2xl" />
         </div>
       </div>
    </div>
  </div>
</template>
