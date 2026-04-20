<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePhotoboothStore } from '../store'
import PhotoFrame from '../components/PhotoFrame.vue'
import html2canvas from 'html2canvas'
import { Sparkles, Download, ArrowRight, CornerRightDown } from 'lucide-vue-next'

const router = useRouter()
const store = usePhotoboothStore()
const frameRef = ref(null)
const isGenerating = ref(false)

const dynamicScale = computed(() => {
  const cols = store.config.cols
  const rows = store.config.rows
  const maxWidth = typeof window !== 'undefined' ? Math.min(window.innerWidth * 0.9, 450) : 400
  const maxHeight = typeof window !== 'undefined' ? Math.min(window.innerHeight * 0.7, 700) : 700

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

async function generateFinal() {
  if (!frameRef.value || isGenerating.value) return
  
  isGenerating.value = true
  
  try {
    // We render at high scale for Ultra-HD quality, but capped at 2 to prevent mobile memory crashes
    const canvas = await html2canvas(frameRef.value.$el, {
      scale: 2, 
      backgroundColor: null,
      useCORS: true,
      logging: false,
      allowTaint: true,
      onclone: (clonedDoc) => {
        // Find the cloned frame container and force natural scale for correct capture
        const clonedContainer = clonedDoc.getElementById('scaling-wrapper')
        if (clonedContainer) {
          clonedContainer.style.transform = 'none'
          clonedContainer.style.width = 'auto'
          clonedContainer.style.height = 'auto'
        }

        // CRITICAL FIX: html2canvas 1.4.1 crashes on OKLCH/OKLAB colors (used by Tailwind v4)
        const style = clonedDoc.createElement('style')
        style.innerText = `
          *, ::before, ::after {
            --tw-shadow: 0 0 #0000 !important;
            --tw-ring-color: transparent !important;
            --tw-ring-shadow: 0 0 #0000 !important;
            --tw-shadow-color: transparent !important;
            --tw-inset-shadow: 0 0 #0000 !important;
            --tw-ring-inset:  !important;
            --tw-ring-offset-width: 0px !important;
            --tw-ring-offset-color: transparent !important;
          }
        `
        clonedDoc.head.appendChild(style)
      }
    })
    
    store.finalImage = canvas.toDataURL('image/png')
    
    // Quick delay for UX
    setTimeout(() => {
      isGenerating.value = false
      router.push({ name: 'download' })
    }, 1200)
    
  } catch (err) {
    console.error('Error generating image:', err)
    isGenerating.value = false
  }
}
</script>

<template>
  <div class="w-full flex flex-col items-center gap-10">
    <div class="text-center space-y-4">
      <h2 class="text-4xl md:text-5xl font-black text-slate-800 tracking-tight leading-none transition-all hover:scale-105">
        Simpan Hasil <span class="text-primary tracking-tighter italic underline decoration-secondary/30">Foto</span>
      </h2>
      <p class="text-slate-500 font-medium tracking-tight px-6 leading-relaxed max-w-2xl mx-auto">
        Yeay! Foto kamu sudah jadi. Pastikan semuanya sudah sesuai sebelum kami proses ke resolusi tinggi (<span class="text-primary font-bold">Ultra-HD</span>).
      </p>
    </div>

    <!-- Desktop: items-center ensures both columns are vertically centered -->
    <div class="w-full flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-24 pt-8">
      
      <!-- High-Res Mockup -->
      <div 
        class="relative flex items-center justify-center shrink-0"
        :style="{ width: `${dynamicScale.width * dynamicScale.scale}px`, height: `${dynamicScale.height * dynamicScale.scale}px` }"
      >
         <!-- Aura -->
         <div class="absolute -inset-10 bg-gradient-to-tr from-primary/10 via-secondary/10 to-transparent blur-[80px] opacity-0 group-hover/mockup:opacity-100 transition-all duration-1000"></div>
         
        <div 
          id="scaling-wrapper"
          class="relative transition-all duration-700 hover:scale-[1.02] z-10"
          :style="{ transform: `scale(${dynamicScale.scale})`, transformOrigin: 'top left' }"
        >
          <PhotoFrame 
            ref="frameRef" 
            :photos="store.capturedPhotos" 
            class="relative z-10" 
            :style="{ boxShadow: '0 25px 50px -12px rgba(99, 102, 241, 0.2)' }"
          />
            
            <!-- Generate Status Overlay -->
            <transition name="fade">
              <div v-if="isGenerating" class="absolute inset-0 bg-slate-900/80 backdrop-blur-xl rounded-[16px] flex flex-col items-center justify-center p-8 text-center z-50 text-white">
                 <div class="w-20 h-20 relative mb-4">
                    <div class="absolute inset-0 border-8 border-white/20 rounded-full"></div>
                    <div class="absolute inset-0 border-8 border-primary rounded-full animate-spin border-t-transparent"></div>
                    <div class="absolute inset-0 flex items-center justify-center">
                       <Sparkles class="w-8 h-8 animate-pulse text-primary" />
                    </div>
                 </div>
                 <h3 class="text-xl font-black tracking-tight mb-2 uppercase italic">Memproses...</h3>
                 <p class="text-slate-400 font-bold uppercase tracking-widest text-[10px] animate-pulse">Mohon tunggu sebentar.</p>
              </div>
            </transition>
         </div>
      </div>

      <!-- Action Panel -->
      <div class="flex flex-col gap-6 w-full max-w-sm shrink-0">
          <div class="bg-white p-8 md:p-10 rounded-[48px] shadow-2xl border-4 border-slate-50 flex flex-col gap-8 relative overflow-hidden group/panel transition-all hover:bg-slate-50/50">
             <div class="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full group-hover/panel:scale-150 transition-transform"></div>
             
             <div class="space-y-3 relative z-10 transition-transform duration-500 group-hover/panel:translate-x-1 text-center md:text-left">
                <h3 class="text-2xl font-black text-slate-800 tracking-tight leading-tight">Siap Untuk <br><span class="text-secondary tracking-tighter uppercase italic">Disimpan?</span></h3>
                <p class="text-slate-400 font-bold text-xs leading-relaxed tracking-wide">Jika sudah pas, klik tombol di bawah untuk mengunduh fotomu.</p>
             </div>

             <div class="flex flex-col gap-4 relative z-10">
                <button 
                  @click="generateFinal"
                  :disabled="isGenerating"
                  class="group w-full flex items-center justify-between px-8 py-5 bg-primary text-white rounded-[24px] font-black text-lg transition-all hover:bg-slate-900 active:scale-95 shadow-xl shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden relative"
                >
                   <div class="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-full transition-all duration-1000 skew-x-[-20deg]"></div>
                   <span class="relative z-10 text-sm tracking-widest uppercase">UNDUH FOTO</span>
                   <Download class="w-6 h-6 group-hover:translate-x-1 transition-transform relative z-10" />
                </button>
             </div>
          </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
