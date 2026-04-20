<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePhotoboothStore } from '../store'
import PhotoFrame from '../components/PhotoFrame.vue'
import { Sparkles, Download } from 'lucide-vue-next'

const router = useRouter()
const store = usePhotoboothStore()
const frameRef = ref(null)
const isGenerating = ref(false)
const errorMsg = ref(null)

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

// Load an image from a src and return a promise
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => {
      // retry without crossOrigin for data URLs
      const img2 = new Image()
      img2.onload = () => resolve(img2)
      img2.onerror = reject
      img2.src = src
    }
    img.src = src
  })
}

// Apply CSS filter string to canvas context using CanvasFilter (Chrome 92+) or skip gracefully
function applyFilter(ctx, filterStr) {
  try {
    if (filterStr && filterStr !== 'none') {
      ctx.filter = filterStr
    }
  } catch(e) { /* ignore if unsupported */ }
}

async function generateFinal() {
  if (isGenerating.value) return
  isGenerating.value = true
  errorMsg.value = null

  try {
    const gap = 10
    const pad = 16
    const cols = store.config.cols
    const rows = store.config.rows
    const cw = store.cellWidth
    const ch = store.cellHeight
    const footerH = 100

    const frameW = (cw * cols) + (gap * (cols - 1)) + (pad * 2)
    const frameH = (ch * rows) + (gap * (rows - 1)) + (pad * 2) + footerH

    const scale = 2 // output resolution multiplier
    const canvas = document.createElement('canvas')
    canvas.width = frameW * scale
    canvas.height = frameH * scale
    const ctx = canvas.getContext('2d')
    ctx.scale(scale, scale)

    // --- 1. Draw background (handle solid colors AND gradients) ---
    ctx.save()
    ctx.beginPath()
    ctx.roundRect(0, 0, frameW, frameH, 16)
    ctx.clip()

    const colorVal = store.config.color || '#ffffff'
    if (colorVal.includes('gradient')) {
      // Parse linear-gradient to CanvasGradient
      // e.g. "linear-gradient(135deg, #f5d0fe, #c4b5fd)"
      const stops = colorVal.match(/#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)/g) || ['#ffffff', '#eeeeee']
      const angleMatch = colorVal.match(/(\d+)deg/)
      const angle = angleMatch ? parseInt(angleMatch[1]) : 135
      const rad = (angle * Math.PI) / 180
      const x1 = frameW / 2 - Math.cos(rad) * frameW / 2
      const y1 = frameH / 2 - Math.sin(rad) * frameH / 2
      const x2 = frameW / 2 + Math.cos(rad) * frameW / 2
      const y2 = frameH / 2 + Math.sin(rad) * frameH / 2
      const grad = ctx.createLinearGradient(x1, y1, x2, y2)
      stops.forEach((stop, i) => {
        grad.addColorStop(i / (stops.length - 1), stop)
      })
      ctx.fillStyle = grad
    } else {
      ctx.fillStyle = colorVal
    }
    ctx.fillRect(0, 0, frameW, frameH)
    ctx.restore()

    // --- 1b. Draw subtle pattern overlay (stripes) ---
    if (store.config.pattern === 'stripes') {
      ctx.save()
      ctx.globalAlpha = 0.07
      ctx.beginPath()
      ctx.roundRect(0, 0, frameW, frameH, 16)
      ctx.clip()
      for (let xi = 0; xi < frameW; xi += 12) {
        ctx.fillStyle = 'rgba(255,255,255,0.5)'
        ctx.fillRect(xi, 0, 6, frameH)
      }
      ctx.restore()
    } else if (store.config.pattern === 'dots') {
      ctx.save()
      ctx.globalAlpha = 0.07
      ctx.beginPath()
      ctx.roundRect(0, 0, frameW, frameH, 16)
      ctx.clip()
      for (let dy = 10; dy < frameH; dy += 20) {
        for (let dx = 10; dx < frameW; dx += 20) {
          ctx.beginPath()
          ctx.arc(dx, dy, 2, 0, Math.PI * 2)
          ctx.fillStyle = 'white'
          ctx.fill()
        }
      }
      ctx.restore()
    }

    // --- 2. Draw photos grid ---
    const photos = store.capturedPhotos
    let photoIdx = 0
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = pad + c * (cw + gap)
        const y = pad + r * (ch + gap)

        // Black cell background
        ctx.fillStyle = '#000000'
        ctx.fillRect(x, y, cw, ch)

        const src = photos[photoIdx]
        if (src) {
          try {
            const img = await loadImage(src)
            // Filter support
            const filterStr = getFilterStyle(store.config.filter)
            applyFilter(ctx, filterStr)
            
            // Center-crop the photo into the cell
            const imgAspect = img.naturalWidth / img.naturalHeight
            const cellAspect = cw / ch
            let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight
            if (imgAspect > cellAspect) {
              sw = img.naturalHeight * cellAspect
              sx = (img.naturalWidth - sw) / 2
            } else {
              sh = img.naturalWidth / cellAspect
              sy = (img.naturalHeight - sh) / 2
            }

            ctx.save()
            ctx.beginPath()
            ctx.rect(x, y, cw, ch)
            ctx.clip()
            ctx.drawImage(img, sx, sy, sw, sh, x, y, cw, ch)
            ctx.restore()
            ctx.filter = 'none'
          } catch(e) {
            console.warn('Could not draw photo', e)
          }
        }
        photoIdx++
      }
    }

    // --- 3. Draw stickers ---
    for (const sticker of (store.config.stickers || [])) {
      if (sticker.type === 'image' && sticker.src) {
        try {
          const img = await loadImage(sticker.src)
          ctx.save()
          ctx.translate(sticker.x, sticker.y)
          ctx.rotate(((sticker.rotation || 0) * Math.PI) / 180)
          ctx.scale(sticker.scale || 1, sticker.scale || 1)
          const sw = 128, sh = 128
          ctx.drawImage(img, -sw / 2, -sh / 2, sw, sh)
          ctx.restore()
        } catch(e) { /* skip unloadable stickers */ }
      } else if (sticker.type === 'emoji' || (!sticker.type && typeof sticker.src === 'string' && sticker.src.length <= 4)) {
        ctx.save()
        ctx.translate(sticker.x, sticker.y)
        ctx.rotate(((sticker.rotation || 0) * Math.PI) / 180)
        ctx.scale(sticker.scale || 1, sticker.scale || 1)
        ctx.font = '48px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(sticker.src, 0, 0)
        ctx.restore()
      }
    }

    // --- 4. Draw footer text ---
    const footerY = pad + rows * ch + (rows - 1) * gap
    if (store.config.text) {
      const fontSize = store.config.fontSize || 48
      ctx.font = `900 ${fontSize}px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      if (store.config.textGradient && store.config.textGradient.includes('gradient')) {
        // Parse text gradient same way as background
        const stops = store.config.textGradient.match(/#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)/g) || [store.config.textColor || '#000']
        const txtGrad = ctx.createLinearGradient(0, footerY + 16, frameW, footerY + 16 + fontSize)
        stops.forEach((stop, i) => {
          txtGrad.addColorStop(i / Math.max(stops.length - 1, 1), stop)
        })
        ctx.fillStyle = txtGrad
      } else {
        ctx.fillStyle = store.config.textColor || '#000000'
      }
      ctx.fillText(store.config.text, frameW / 2, footerY + (footerH * 0.38))
    }

    // ─── WATERMARK (PERMANENT — BAKED INTO PNG) ───────────────────────
    // Double-layer: dark shadow + light text → visible on ANY background
    const wmText = 'dame-snap.vercel.app'
    const wmY = footerY + (footerH * 0.78)

    ctx.save()
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = '700 11px sans-serif'

    // Layer 1 — dark shadow (readable on light bg)
    ctx.fillStyle = 'rgba(0,0,0,0.35)'
    ctx.fillText(wmText, frameW / 2 + 0.5, wmY + 0.5)

    // Layer 2 — white text (readable on dark bg)
    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.fillText(wmText, frameW / 2, wmY)

    ctx.restore()
    // ──────────────────────────────────────────────────────────────────

    // --- 5. Export ---
    store.finalImage = canvas.toDataURL('image/png')

    setTimeout(() => {
      isGenerating.value = false
      router.push({ name: 'download' })
    }, 800)

  } catch (err) {
    console.error('Canvas generation error:', err)
    errorMsg.value = 'Gagal memproses foto. Coba lagi.'
    isGenerating.value = false
  }
}

function getFilterStyle(filter) {
  const filters = {
    vintage: 'sepia(0.5) contrast(1.1) brightness(0.9) saturate(0.8)',
    retro: 'sepia(0.3) saturate(1.4) contrast(1.2)',
    mono: 'grayscale(1) contrast(1.2) brightness(1.1)',
    sepia: 'sepia(0.8) contrast(1.05)',
    warm: 'saturate(1.3) sepia(0.2) brightness(1.05)',
    cool: 'hue-rotate(30deg) saturate(1.1) brightness(1.05)',
    bright: 'brightness(1.25) contrast(1.05) saturate(1.1)',
    matte: 'contrast(0.85) brightness(1.1) saturate(0.9)',
    pastel: 'brightness(1.15) saturate(0.7) contrast(0.9)',
    cinematic: 'contrast(1.3) saturate(0.8) brightness(0.9)',
  }
  return filters[filter] || 'none'
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
          class="absolute top-0 left-0 transition-all duration-700 z-10"
          :style="{ transform: `scale(${dynamicScale.scale})`, transformOrigin: 'top left' }"
        >
          <PhotoFrame 
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
                <!-- Error Message -->
              <p v-if="errorMsg" class="text-red-500 font-bold text-xs text-center">{{ errorMsg }}</p>

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
