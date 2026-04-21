<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { usePhotoboothStore } from '../store'
import { Camera, CameraOff, RefreshCw, X, FlipHorizontal, Zap, SwitchCamera } from 'lucide-vue-next'

const store = usePhotoboothStore()

const props = defineProps({
  targetPhotos: {
    type: Number,
    default: 3
  }
})

const emit = defineEmits(['captured', 'error', 'complete'])

const videoRef = ref(null)
const canvasRef = ref(null)
const stream = ref(null)
const isCameraReady = ref(false)
const isCapturing = ref(false)
const isMirrored = ref(true)
const isFlashEnabled = ref(true)
const countdown = ref(0)
const capturedImages = ref([])
const facingMode = ref('user')

const cameraError = ref(null)

async function toggleFacingMode() {
  facingMode.value = facingMode.value === 'user' ? 'environment' : 'user'
  stopCamera()
  isCameraReady.value = false
  await new Promise(resolve => setTimeout(resolve, 300))
  await startCamera()
}

function toggleMirror() {
  isMirrored.value = !isMirrored.value
}

onMounted(async () => {
  await startCamera()
})

onUnmounted(() => {
  stopCamera()
})

async function startCamera(retryCount = 0) {
  cameraError.value = null
  try {
    const constraints = {
      video: retryCount === 0 ? {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: facingMode.value
      } : true
    }
    stream.value = await navigator.mediaDevices.getUserMedia(constraints)
    if (videoRef.value) {
      videoRef.value.srcObject = stream.value
      
      // Ensure video is playing before marking as ready
      await new Promise((resolve) => {
         videoRef.value.onloadedmetadata = () => {
             videoRef.value.play().then(resolve).catch(resolve)
         }
         // Fallback just in case event doesn't fire
         setTimeout(resolve, 1000)
      })
      isCameraReady.value = true
    }
  } catch (err) {
    console.error(`Error starting camera (Attempt ${retryCount}):`, err)
    
    // Strict constraints or device lock might fail. Retry basic.
    if (retryCount === 0) {
       console.log("Retrying with basic constraints...")
       await new Promise(r => setTimeout(r, 500))
       return startCamera(1)
    }

    cameraError.value = err.name || err.message || 'Unknown'
    emit('error', cameraError.value)
  }
}

function stopCamera() {
  if (stream.value) {
    stream.value.getTracks().forEach(track => track.stop())
  }
}

async function playBeep(type = 'beep') {
  const ctx = new (window.AudioContext || window.webkitAudioContext)()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  
  if (type === 'beep') {
    osc.frequency.setValueAtTime(880, ctx.currentTime)
    gain.gain.setValueAtTime(0.1, ctx.currentTime)
  } else {
    // Shutter sound (noise-like)
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(150, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1)
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
  }
  
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start()
  osc.stop(ctx.currentTime + 0.15)
}

async function takePhoto() {
  if (isCapturing.value || !isCameraReady.value) return

  isCapturing.value = true
  
  for (let i = 0; i < props.targetPhotos; i++) {
    countdown.value = 3
    while (countdown.value > 0) {
      playBeep('beep')
      await new Promise(resolve => setTimeout(resolve, 1000))
      countdown.value--
    }
    
    // ==========================================
    // HARDWARE FLASH (TORCH) DETECTION & TRIGGER
    // ==========================================
    let track = null
    let torchSupported = false

    if (stream.value && isFlashEnabled.value) {
      const tracks = stream.value.getVideoTracks()
      if (tracks.length > 0) {
        track = tracks[0]
        if (track.getCapabilities) {
          try {
            const caps = track.getCapabilities()
            torchSupported = !!caps.torch
          } catch(e) {}
        }
      }
    }

    if (torchSupported) {
      try {
        await track.applyConstraints({ advanced: [{ torch: true }] })
        // Wait 250ms for camera hardware auto-exposure to adjust to the new intense light
        await new Promise(r => setTimeout(r, 250))
      } catch (err) {
        // Fallback safely if applyConstraints is rejected by the OS
        torchSupported = false
      }
    }

    // ==========================================
    // VISUAL FLASH FALLBACK (ESTHETIC KEYFRAMES)
    // ==========================================
    if (isFlashEnabled.value && !torchSupported) {
      const flash = document.createElement('div')
      flash.className = 'fixed inset-0 bg-white z-[9999] pointer-events-none'
      document.body.appendChild(flash)
      
      // Native Web Animations API (WAAPI)
      // "meledak di awal (putih solid) dan memudar perlahan selama 1.8 detik menggunakan ease-out"
      flash.animate([
        { opacity: 1 },
        { opacity: 1, offset: 0.1 }, // Hold solid white for the first 10% (180ms)
        { opacity: 0 }
      ], {
        duration: 1800,
        easing: 'ease-out',
        fill: 'forwards'
      })
      setTimeout(() => flash.remove(), 1800)
    }

    // Play Shutter Sound
    playBeep('shutter')
    
    const video = videoRef.value
    if (!video || video.videoWidth === 0) break

    const vw = video.videoWidth
    const vh = video.videoHeight
    const canvas = canvasRef.value
    const context = canvas.getContext('2d')
    
    // STRICT CENTER-CROP LOGIC
    const tAspect = targetAspect.value
    let sw, sh, sx, sy
    
    const currentAspect = vw / vh
    
    if (currentAspect > tAspect) {
      // Source is wider than target (Horizontal Crop)
      sh = vh
      sw = vh * tAspect
      sx = (vw - sw) / 2
      sy = 0
    } else {
      // Source is taller than target (Vertical Crop)
      sw = vw
      sh = vw / tAspect
      sx = 0
      sy = (vh - sh) / 2
    }
    
    // High-resolution Master Capture (Symmetrical)
    const baseRes = 1200
    canvas.width = tAspect >= 1 ? baseRes : baseRes * tAspect
    canvas.height = tAspect >= 1 ? baseRes / tAspect : baseRes
    
    context.imageSmoothingEnabled = true
    context.imageSmoothingQuality = 'high'
    
    context.save()
    if (isMirrored.value) {
      context.translate(canvas.width, 0)
      context.scale(-1, 1)
    }
    
    // Surgical Center-Crop Draw
    context.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)
    context.restore()
    
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95)
    capturedImages.value.push(dataUrl)
    emit('captured', dataUrl)
    
    // Turn off Hardware torch if active
    if (torchSupported && track) {
      try {
        track.applyConstraints({ advanced: [{ torch: false }] })
      } catch (e) {}
    }
    
    if (i < props.targetPhotos - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
  
  isCapturing.value = false
  emit('complete', capturedImages.value)
}

function handleReset() {
  capturedImages.value = []
}

const targetAspect = computed(() => {
  return store.cellWidth / store.cellHeight
})

const cameraHeight = computed(() => 375 / targetAspect.value)
</script>

<template>
  <div 
    class="relative w-full max-w-[400px] mx-auto rounded-[48px] overflow-hidden shadow-2xl transition-all duration-700 ease-in-out border-8 border-white bg-slate-900"
    :style="{ aspectRatio: `${targetAspect}` }"
  >
    <!-- Viewfinder Area -->
    <div class="absolute inset-0 flex items-center justify-center overflow-hidden">
      <video 
        ref="videoRef" 
        class="w-full h-full object-cover"
        :style="{ transform: isMirrored ? 'scaleX(-1)' : 'none' }"
        autoplay 
        playsinline
      ></video>

      <!-- Visual Guides -->
      <div class="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <!-- Center Crosshair (+) -->
        <div class="w-6 h-[1px] bg-white/40"></div>
        <div class="absolute w-[1px] h-6 bg-white/40"></div>
        
        <!-- Framing Rectangle -->
        <div class="absolute inset-10 border border-white/10 rounded-[40px]"></div>
      </div>
    </div>
    
    <canvas ref="canvasRef" class="hidden"></canvas>
    
    <!-- Camera Overlays -->
    <div v-if="!isCameraReady" class="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-white/40 backdrop-blur-md z-20">
      <div class="w-16 h-16 bg-white/80 rounded-full flex items-center justify-center shadow-lg animate-bounce mb-4 border-2 border-slate-50">
        <Camera class="w-8 h-8 text-primary" />
      </div>
      <span class="text-sm font-black uppercase tracking-widest text-slate-500">
         {{ cameraError ? 'Kamera Bermasalah' : 'Memulai Studio...' }}
      </span>
      <p v-if="!cameraError" class="text-[10px] text-slate-400 font-bold mt-2 px-8 text-center border bg-white/50 backdrop-blur pb-2 pt-2 rounded-xl border-slate-200">Mohon izinkan akses kamera pada browser Anda.</p>
      <div v-else class="flex flex-col items-center gap-3 mt-4 px-8 text-center bg-white/70 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-red-100">
         <p class="text-xs text-red-500 font-bold">
            {{ cameraError === 'NotReadableError' ? 'Kamera sedang digunakan aplikasi/tab lain.' : 'Gagal mengakses kamera (' + cameraError + ')' }}
         </p>
         <button @click="startCamera(0)" class="px-5 py-2.5 bg-primary text-white rounded-xl text-[10px] font-black tracking-widest uppercase hover:bg-slate-800 active:scale-95 transition-all shadow-md">
            Coba Lagi
         </button>
      </div>
    </div>

    <!-- Countdown Overlay (Corner HUD) -->
    <div v-if="countdown > 0" class="absolute bottom-6 right-6 z-40 pointer-events-none">
      <div class="w-20 h-20 rounded-full flex items-center justify-center bg-black/50 backdrop-blur-xl border-4 border-white/20 shadow-2xl transition-all scale-100">
         <span class="text-5xl font-black text-white drop-shadow-lg animate-ping">{{ countdown }}</span>
      </div>
    </div>

    <!-- Capture Status (HUD) -->
    <div 
      v-if="isCapturing" 
      class="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-2 bg-black/60 backdrop-blur-md text-white rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl z-30 border border-white/10"
    >
      <div class="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
      SHOTTING {{ capturedImages.length + 1 }} / {{ props.targetPhotos }}
    </div>

    <!-- Interaction Controls -->
    <div v-if="isCameraReady && !isCapturing" class="absolute inset-x-0 bottom-0 h-1/2 flex flex-col justify-end p-8 z-30 bg-gradient-to-t from-black/40 to-transparent">
      <div class="flex justify-center items-center gap-8">
        <button 
          @click="toggleMirror"
          class="w-12 h-12 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-md text-white border border-white/30 hover:bg-white/40 transition-all transform active:scale-95"
          :class="{ 'bg-primary/40 border-primary/50 text-white': isMirrored }"
        >
          <FlipHorizontal class="w-5 h-5" />
        </button>

        <button 
          @click="isFlashEnabled = !isFlashEnabled"
          class="w-12 h-12 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-md text-white border border-white/30 hover:bg-white/40 transition-all transform active:scale-95"
          :class="{ 'bg-yellow-400/40 border-yellow-400/50 text-white': isFlashEnabled }"
        >
          <Zap class="w-5 h-5" />
        </button>

        <button 
          @click="takePhoto"
          class="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl transition-all transform hover:scale-110 active:scale-90 border-4 border-white ring-4 ring-primary/20"
        >
          <div class="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center">
              <Camera class="w-8 h-8" />
          </div>
        </button>
        
        <button 
          @click="toggleFacingMode"
          class="w-12 h-12 bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center border border-white/30 hover:bg-white/40 transition-all transform active:scale-95"
        >
          <SwitchCamera class="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mirror {
  transform: scaleX(-1);
}

@keyframes ping {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(2); opacity: 0; }
}
</style>
