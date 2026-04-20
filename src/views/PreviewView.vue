<script setup>
import { useRouter } from 'vue-router'
import { usePhotoboothStore } from '../store'
import PhotoFrame from '../components/PhotoFrame.vue'
import { Camera, RefreshCcw, ArrowRight } from 'lucide-vue-next'

import { computed } from 'vue'

const router = useRouter()
const store = usePhotoboothStore()

const dynamicScale = computed(() => {
  const cols = store.config.cols
  const rows = store.config.rows
  const maxWidth = typeof window !== 'undefined' ? Math.min(window.innerWidth * 0.9, 500) : 400
  const maxHeight = typeof window !== 'undefined' ? Math.min(window.innerHeight * 0.6, 600) : 600

  const frameWidth = (store.cellWidth * cols) + (10 * (cols - 1)) + 32
  const frameHeight = (store.cellHeight * rows) + (10 * (rows - 1)) + 32 + 100
  
  const scaleW = maxWidth / frameWidth
  const scaleH = maxHeight / frameHeight
  
  return Math.min(scaleW, scaleH, 1) // Do not upscale unnecessarily
})

function handleRetry() {
  store.capturedPhotos = []
  router.push({ name: 'camera' })
}

function handleContinue() {
  router.push({ name: 'final' })
}

function handleEdit() {
  router.push({ name: 'elements' })
}
</script>

<template>
  <div class="w-full flex flex-col items-center gap-10">
    <div class="text-center space-y-2">
      <h2 class="text-4xl md:text-5xl font-black text-slate-800 tracking-tight leading-loose">Hasil <span class="text-primary italic">Foto!</span></h2>
      <p class="text-slate-500 font-medium tracking-tight px-4">Bagaimana hasilnya? Cek dulu sebelum lanjut ya.</p>
    </div>

    <div class="w-full flex flex-col lg:flex-row items-center justify-center gap-12 pt-8">
      <!-- Main Result Frame -->
      <div 
         class="relative flex items-center justify-center shrink-0"
         :style="{ width: '100%', maxWidth: '500px', minHeight: '600px' }"
      >
         <div class="absolute -inset-10 bg-primary/10 blur-[100px] opacity-0 group-hover:opacity-100 transition-all duration-1000 animate-pulse"></div>
         <div 
            class="transform transition-all duration-700 hover:scale-105 hover:-rotate-1 z-10 relative origin-center"
            :style="{ transform: `scale(${dynamicScale})` }"
         >
            <PhotoFrame :photos="store.capturedPhotos" class="shadow-2xl shadow-primary/20" />
         </div>
      </div>

      <!-- Action Box -->
      <div class="flex flex-col gap-6 w-full max-w-sm shrink-0">
         <div class="bg-white p-8 md:p-10 rounded-[48px] shadow-2xl border-4 border-slate-50 space-y-8 relative overflow-hidden group/box transition-all hover:border-primary/20 text-center md:text-left">
            <div class="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-x-1/2 translate-y-[-50%] group-hover/box:scale-150 transition-all"></div>
            
            <div class="space-y-2 relative z-10">
               <h3 class="text-2xl font-black text-slate-800 tracking-tight">Sudah Sesuai?</h3>
               <p class="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Tentukan pilihanmu...</p>
            </div>

            <div class="flex flex-col gap-4 relative z-10">
               <button 
                  @click="handleContinue"
                  class="group w-full flex items-center justify-between px-8 py-5 bg-primary text-white rounded-[24px] font-black text-lg transition-all hover:bg-slate-900 active:scale-95 shadow-xl shadow-primary/20"
               >
                  <span class="text-sm tracking-widest">SUDAH PAS!</span>
                  <ArrowRight class="w-6 h-6 group-hover:translate-x-2 transition-transform" />
               </button>

               <button 
                  @click="handleEdit"
                  class="w-full flex items-center justify-center px-8 py-4 bg-slate-50 text-slate-700 rounded-[24px] font-black text-xs uppercase tracking-widest border-2 border-transparent hover:border-slate-200 transition-all active:scale-95"
               >
                  <span>Edit Teks & Stiker</span>
               </button>

               <button 
                  @click="handleRetry"
                  class="w-full flex items-center justify-center px-8 py-4 bg-white text-slate-400 rounded-[24px] font-black text-xs uppercase tracking-widest border-2 border-slate-100 hover:text-red-500 hover:border-red-100 transition-all active:scale-95 gap-2"
               >
                  <RefreshCcw class="w-4 h-4" />
                  <span>Foto Ulang</span>
               </button>
            </div>
         </div>
         
         <!-- Tip -->
         <div class="flex items-start gap-4 p-6 bg-slate-50 rounded-[32px] opacity-60 hover:opacity-100 transition-opacity">
            <div class="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform hover:scale-110">💡</div>
            <p class="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-widest pt-2">Kamu juga bisa ubah tema/warna kerangka di tombol Edit Teks!</p>
         </div>
      </div>
    </div>
  </div>
</template>
