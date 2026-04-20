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

  const frameWidth = (store.cellWidth * cols) + (10 * (cols - 1)) + 32
  const frameHeight = (store.cellHeight * rows) + (10 * (rows - 1)) + 32 + 100
  
  const scaleW = maxWidth / frameWidth
  const scaleH = maxHeight / frameHeight
  
  return Math.min(scaleW, scaleH, 1)
})

async function generateFinal() {
  if (!frameRef.value || isGenerating.value) return
  
  isGenerating.value = true
  
  try {
    // We render at high scale for Ultra-HD quality
    const canvas = await html2canvas(frameRef.value.$el, {
      scale: 3, 
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
      <h2 class="text-5xl md:text-6xl font-black text-slate-800 tracking-tight leading-none transition-all hover:scale-105">Final <span class="text-primary tracking-tighter italic underline decoration-secondary/30">Configuration</span></h2>
      <p class="text-slate-500 font-medium tracking-tight px-12 leading-relaxed max-w-2xl mx-auto">One last check! We are about to render your photobooth strip in <span class="text-primary font-bold">Ultra-HD</span>. Ready for the magic?</p>
    </div>

    <div class="w-full flex flex-col lg:flex-row items-center lg:items-start justify-center gap-16 pt-12">
      <!-- High-Res Mockup -->
      <div 
        class="relative group/mockup flex items-center justify-center shrink-0"
        :style="{ width: '100%', maxWidth: '500px', minHeight: '600px' }"
      >
         <!-- Aura -->
         <div class="absolute -inset-20 bg-gradient-to-tr from-primary/10 via-secondary/10 to-transparent blur-[120px] opacity-0 group-hover/mockup:opacity-100 transition-all duration-1000"></div>
         
        <div 
          id="scaling-wrapper"
          class="relative transform transition-all duration-700 hover:scale-[1.02] z-10 origin-center"
          :style="{ transform: `scale(${dynamicScale})` }"
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
                 <div class="w-24 h-24 relative mb-6">
                    <div class="absolute inset-0 border-8 border-white/20 rounded-full"></div>
                    <div class="absolute inset-0 border-8 border-primary rounded-full animate-spin border-t-transparent"></div>
                    <div class="absolute inset-0 flex items-center justify-center">
                       <Sparkles class="w-10 h-10 animate-pulse text-primary" />
                    </div>
                 </div>
                 <h3 class="text-2xl font-black tracking-tight mb-2 uppercase italic">Rendering...</h3>
                 <p class="text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse transition-opacity">Magic in progress. Please wait.</p>
              </div>
            </transition>
         </div>
         
         <!-- Preview label -->
         <div class="absolute -top-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 group-hover/mockup:-translate-y-2 transition-transform duration-500 opacity-40 group-hover/mockup:opacity-100 italic">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Final Digital Preview</span>
            <CornerRightDown class="w-4 h-4 text-slate-300" />
         </div>
      </div>

          <!-- Action Panel -->
          <div class="flex flex-col gap-8 w-full max-w-sm shrink-0">
              <div class="bg-white p-12 rounded-[56px] shadow-2xl border-4 border-slate-50 flex flex-col gap-10 relative overflow-hidden group/panel transition-all hover:bg-slate-50/50">
                 <div class="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full group-hover/panel:scale-150 transition-transform"></div>
                 
                 <div class="space-y-4 relative z-10 transition-transform duration-500 group-hover/panel:translate-x-1">
                    <h3 class="text-3xl font-black text-slate-800 tracking-tight leading-none">Ready to <br><span class="text-secondary tracking-tighter uppercase italic">Download?</span></h3>
                    <p class="text-slate-400 font-bold text-sm leading-relaxed uppercase tracking-widest">Everything looks perfect. Proceed to get your digital link and high-res file.</p>
                 </div>
    
                 <div class="flex flex-col gap-4 relative z-10">
                    <button 
                      @click="generateFinal"
                      :disabled="isGenerating"
                      class="group w-full flex items-center justify-between px-10 py-6 bg-primary text-white rounded-[32px] font-black text-xl transition-all hover:bg-slate-900 active:scale-95 shadow-2xl shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden relative"
                    >
                       <div class="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-full transition-all duration-1000 skew-x-[-20deg]"></div>
                       <span class="relative z-10">RENDER FILE</span>
                       <Download class="w-8 h-8 group-hover:translate-x-2 transition-transform relative z-10" />
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
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
