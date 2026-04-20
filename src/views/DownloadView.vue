<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePhotoboothStore } from '../store'
import QRCode from 'qrcode'
import { Download, Share2, CheckCircle2, ArrowLeft, RefreshCw, Send, CornerRightUp } from 'lucide-vue-next'

const router = useRouter()
const store = usePhotoboothStore()
const qrImage = ref(null)

onMounted(async () => {
  if (store.finalImage) {
    try {
      // For now, let's use a dummy URL for QR code (the final image data url is too large for standard QR)
      // In a real app, this would be a link to a cloud storage (e.g. Firebase, S3)
      qrImage.value = await QRCode.toDataURL('https://damesnap.photobooth.com/results/' + Date.now())
    } catch (err) {
      console.error('QR Error:', err)
    }
  }
})

function downloadImage() {
  if (!store.finalImage) return
  
  const link = document.createElement('a')
  link.href = store.finalImage
  link.download = `dame-snap-${Date.now()}.png`
  link.click()
}

async function shareImage() {
  if (!store.finalImage) return
  
  try {
    const response = await fetch(store.finalImage)
    const blob = await response.blob()
    const file = new File([blob], `damesnap-${Date.now()}.png`, { type: 'image/png' })
    
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: 'My Dame-Snap Photobooth',
        text: 'Check out my awesome photobooth strip from Dame-Snap!',
      })
    } else if (navigator.share) {
       await navigator.share({
        title: 'My Dame-Snap Photobooth',
        text: 'Check out my photobooth strip! Create yours at Dame-Snap.',
        url: window.location.href
      })
    } else {
       // Fallback: Copy to clipboard or alert
       alert('Native sharing not supported. You can save the image and share manually!')
    }
  } catch (err) {
    console.error('Share Error:', err)
  }
}

function finish() {
  router.push({ name: 'finish' })
}

function handleRetry() {
  // We go back to elements for editing
  router.push({ name: 'elements' })
}
</script>

<template>
  <div class="w-full flex flex-col items-center gap-10">
    <!-- Success Badge -->
    <div class="flex flex-col items-center gap-6 text-center animate-bounce duration-1000">
       <div class="w-24 h-24 bg-green-500 text-white rounded-[32px] flex items-center justify-center shadow-2xl shadow-green-500/20 transform hover:scale-110 transition-transform">
          <CheckCircle2 class="w-14 h-14" />
       </div>
       <div class="space-y-2">
          <h2 class="text-5xl md:text-7xl font-black text-slate-800 tracking-tighter leading-none">It's <span class="text-primary italic">Yours!</span></h2>
          <p class="text-slate-400 font-bold uppercase tracking-[0.4em] text-xs">Ready for preservation and sharing</p>
       </div>
    </div>

    <div class="w-full flex flex-col lg:flex-row items-center lg:items-start justify-center gap-16 pt-12">
      <!-- Final Image Result -->
      <div class="relative group/final">
         <div class="absolute -inset-10 bg-primary/20 blur-[100px] opacity-0 group-hover/final:opacity-100 transition-all duration-1000 rotate-12"></div>
         <div class="relative transform transition-all duration-700 hover:scale-105 hover:rotate-1 z-10 border-[12px] border-white shadow-2xl overflow-hidden rounded-2xl bg-white group-hover/final:shadow-indigo-500/30">
            <img v-if="store.finalImage" :src="store.finalImage" class="max-w-[400px] w-full h-auto object-contain" />
         </div>
         
         <!-- Preview label -->
         <div class="absolute -bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 group-hover/final:translate-y-2 transition-transform duration-500 opacity-40 group-hover/final:opacity-100 italic">
            <CornerRightUp class="w-4 h-4 text-slate-300" />
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Personal Digital Copy</span>
         </div>
      </div>

      <!-- Interaction Panel -->
      <div class="flex flex-col gap-8 w-full max-w-sm shrink-0">
          <!-- Download Card -->
          <div class="bg-white p-10 rounded-[56px] shadow-2xl border-4 border-slate-50 flex flex-col gap-8 relative overflow-hidden group/actions transition-all hover:-translate-y-2">
             <div class="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full z-0 group-hover/actions:scale-150 transition-transform"></div>
             
             <div class="flex flex-col gap-6 relative z-10">
                <button 
                  @click="downloadImage"
                  class="group w-full flex items-center justify-between px-10 py-6 bg-slate-900 text-white rounded-[32px] font-black text-xl transition-all hover:bg-primary active:scale-95 shadow-2xl shadow-slate-900/20 overflow-hidden relative"
                >
                   <span class="relative z-10">SAVE PNG</span>
                   <Download class="w-8 h-8 group-hover:translate-x-2 transition-transform relative z-10" />
                </button>
             </div>

             <!-- Sharing & Actions -->
             <div class="flex flex-col items-center gap-6 relative z-10 pt-6 border-t-2 border-slate-50">
                <button 
                  @click="shareImage"
                  class="group w-full flex items-center justify-center gap-3 px-8 py-5 bg-secondary text-white rounded-[28px] font-black text-sm uppercase tracking-[0.2em] transition-all hover:bg-slate-900 active:scale-95 shadow-xl shadow-secondary/20 relative overflow-hidden"
                >
                   <div class="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-full transition-all duration-700 skew-x-[-20deg]"></div>
                   <Share2 class="w-5 h-5 animate-pulse" />
                   <span>Share Artwork</span>
                </button>

                <div class="flex flex-col items-center gap-2">
                   <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">External Link (QR)</p>
                   <div class="w-32 h-32 bg-slate-50 border-4 border-white shadow-inner rounded-2xl p-3 flex items-center justify-center transition-all hover:scale-110 hover:shadow-xl">
                      <img v-if="qrImage" :src="qrImage" class="w-full h-full object-contain grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all" />
                      <div v-else class="w-full h-full bg-slate-100 animate-pulse rounded-lg"></div>
                   </div>
                </div>
             </div>
          </div>

          <!-- Final Actions -->
          <div class="flex flex-col gap-4">
             <button 
                @click="finish"
                class="group w-full flex items-center justify-center gap-3 px-8 py-6 bg-primary text-white rounded-[32px] font-black text-xl transition-all hover:bg-slate-900 active:scale-95 shadow-2xl shadow-primary/20"
             >
                <span>FINISH EXPERIENCE</span>
                <CheckCircle2 class="w-6 h-6 animate-pulse group-hover:scale-125 transition-transform" />
             </button>

             <button 
                @click="handleRetry"
                class="w-full flex items-center justify-center gap-2 px-8 py-5 bg-white text-slate-400 rounded-[24px] font-black text-xs uppercase tracking-widest border-2 border-slate-100 hover:border-slate-200 transition-all active:scale-95"
             >
                <RefreshCw class="w-4 h-4" />
                <span>One More Adjustment?</span>
             </button>
          </div>
      </div>
    </div>
  </div>
</template>
