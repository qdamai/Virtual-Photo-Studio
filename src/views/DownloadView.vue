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
  
  try {
    // Convert base64 to Blob to prevent mobile browser crashing from massive data URIs on anchors
    const byteString = atob(store.finalImage.split(',')[1])
    const mimeString = store.finalImage.split(',')[0].split(':')[1].split(';')[0]
    const ab = new ArrayBuffer(byteString.length)
    const ia = new Uint8Array(ab)
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i)
    }
    const blob = new Blob([ab], { type: mimeString })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `dame-snap-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Clean up
    setTimeout(() => {
       URL.revokeObjectURL(url)
    }, 1000)
  } catch (err) {
    console.error('Download failed:', err)
    alert('Maaf, memori perangkat tidak cukup untuk mengunduh. Coba gunakan fitur Bagikan/Share.')
  }
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
    <div class="flex flex-col items-center gap-6 text-center">
       <div class="w-20 h-20 bg-green-500 text-white rounded-[32px] flex items-center justify-center shadow-2xl shadow-green-500/20 transform hover:scale-110 transition-transform">
          <CheckCircle2 class="w-10 h-10" />
       </div>
       <div class="space-y-3">
          <h2 class="text-4xl md:text-6xl font-black text-slate-800 tracking-tighter leading-none">Berhasil!</h2>
          <p class="text-slate-400 font-bold uppercase tracking-[0.4em] text-[10px] md:text-xs">Foto siap disimpan dan dibagikan</p>
       </div>
    </div>

    <!-- Centered Layout for Desktop -->
    <div class="w-full flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-16 pt-8 pb-12">
      
      <!-- Final Image Result -->
      <div class="relative group/final shrink-0 flex items-center justify-center">
         <div class="absolute -inset-10 bg-primary/20 blur-[80px] opacity-0 group-hover/final:opacity-100 transition-all duration-1000 rotate-12"></div>
         <div class="relative transform transition-all duration-700 hover:scale-[1.02] hover:-rotate-1 z-10 border-[6px] lg:border-8 border-white shadow-2xl overflow-hidden rounded-xl lg:rounded-2xl bg-white group-hover/final:shadow-indigo-500/30 flex items-center justify-center">
            <img 
               v-if="store.finalImage" 
               :src="store.finalImage" 
               class="max-h-[60vh] lg:max-h-[70vh] w-auto max-w-[90vw] object-contain block" 
            />
         </div>
      </div>

      <!-- Interaction Panel -->
      <div class="flex flex-col gap-6 w-full max-w-xs md:max-w-sm shrink-0">
          <!-- Download Card -->
          <div class="bg-white p-8 md:p-10 rounded-[48px] shadow-2xl border-4 border-slate-50 flex flex-col gap-8 relative overflow-hidden group/actions transition-all hover:-translate-y-2">
             <div class="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full z-0 group-hover/actions:scale-150 transition-transform"></div>
             
             <div class="flex flex-col gap-4 relative z-10">
                <button 
                  @click="downloadImage"
                  class="group w-full flex items-center justify-between px-8 py-5 bg-slate-900 text-white rounded-[24px] font-black text-lg transition-all hover:bg-primary active:scale-95 shadow-2xl shadow-slate-900/20 overflow-hidden relative"
                >
                   <span class="relative z-10 text-sm tracking-widest uppercase">Simpan ke HP</span>
                   <Download class="w-6 h-6 group-hover:translate-y-1 transition-transform relative z-10" />
                </button>
             </div>

             <!-- Sharing & Actions -->
             <div class="flex flex-col items-center gap-6 relative z-10 pt-6 border-t-2 border-slate-50">
                <button 
                  @click="shareImage"
                  class="group w-full flex items-center justify-center gap-3 px-8 py-4 bg-secondary text-white rounded-[24px] font-black text-xs uppercase tracking-widest transition-all hover:bg-slate-900 active:scale-95 shadow-xl shadow-secondary/20 relative overflow-hidden"
                >
                   <div class="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-full transition-all duration-700 skew-x-[-20deg]"></div>
                   <Share2 class="w-4 h-4 animate-pulse" />
                   <span>Bagikan (Share)</span>
                </button>
             </div>
          </div>

          <!-- Final Actions -->
          <div class="flex flex-col gap-4">
             <button 
                @click="finish"
                class="group w-full flex items-center justify-center gap-3 px-8 py-5 bg-primary text-white rounded-[28px] font-black text-lg transition-all hover:bg-slate-900 active:scale-95 shadow-xl shadow-primary/20"
             >
                <span class="text-sm tracking-widest">SELESAI</span>
                <CheckCircle2 class="w-5 h-5 animate-pulse group-hover:scale-125 transition-transform" />
             </button>

             <button 
                @click="handleRetry"
                class="w-full flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-400 rounded-[24px] font-black text-xs uppercase tracking-widest border-2 border-slate-100 hover:border-slate-300 transition-all active:scale-95"
             >
                <RefreshCw class="w-4 h-4" />
                <span>Mau Edit Lagi?</span>
             </button>
          </div>
      </div>
    </div>
  </div>
</template>
