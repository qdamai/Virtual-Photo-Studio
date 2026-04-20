<script setup>
import { computed, watch, onMounted } from 'vue'
import { usePhotoboothStore } from '../store'
import * as LucideIcons from 'lucide-vue-next'

const store = usePhotoboothStore()

const props = defineProps({
  photos: {
    type: Array,
    default: () => []
  },
  showPlaceholder: {
    type: Boolean,
    default: true
  },
  editable: {
    type: Boolean,
    default: false
  }
})

// Auto-Decorate Feature

function handleStickerDrag(e, sticker) {
  if (!props.editable) return
  e.preventDefault()
  
  const isTouch = e.type.startsWith('touch')
  const startX = isTouch ? e.touches[0].clientX : e.clientX
  const startY = isTouch ? e.touches[0].clientY : e.clientY
  const initialX = sticker.x
  const initialY = sticker.y
  
  // Calculate current scale from DOM to adjust movement correctly
  const container = e.currentTarget.closest('[style*="scale"]') || e.currentTarget
  const rect = container.getBoundingClientRect()
  const offsetWidth = container.offsetWidth || 1
  const scale = rect.width / offsetWidth || 1

  const move = (moveEvent) => {
    const curX = isTouch ? moveEvent.touches[0].clientX : moveEvent.clientX
    const curY = isTouch ? moveEvent.touches[0].clientY : moveEvent.clientY
    
    // Adjust movement by scale factor
    sticker.x = initialX + (curX - startX) / scale
    sticker.y = initialY + (curY - startY) / scale
  }
  
  const up = () => {
    window.removeEventListener(isTouch ? 'touchmove' : 'mousemove', move)
    window.removeEventListener(isTouch ? 'touchend' : 'mouseup', up)
  }
  
  window.addEventListener(isTouch ? 'touchmove' : 'mousemove', move, { passive: false })
  window.addEventListener(isTouch ? 'touchend' : 'mouseup', up)
}

function handleStickerRotate(e, sticker) {
  if (!props.editable) return
  e.stopPropagation()
  e.preventDefault()
  
  const isTouch = e.type.startsWith('touch')
  const startX = isTouch ? e.touches[0].clientX : e.clientX
  const initialRotation = sticker.rotation || 0
  
  const move = (moveEvent) => {
    const curX = isTouch ? moveEvent.touches[0].clientX : moveEvent.clientX
    sticker.rotation = initialRotation + (curX - startX) * 0.5
  }
  
  const up = () => {
    window.removeEventListener(isTouch ? 'touchmove' : 'mousemove', move)
    window.removeEventListener(isTouch ? 'touchend' : 'mouseup', up)
  }
  
  window.addEventListener(isTouch ? 'touchmove' : 'mousemove', move)
  window.addEventListener(isTouch ? 'touchend' : 'mouseup', up)
}

function handleStickerScale(e, sticker) {
  if (!props.editable) return
  e.stopPropagation()
  e.preventDefault()
  
  const isTouch = e.type.startsWith('touch')
  const startY = isTouch ? e.touches[0].clientY : e.clientY
  const initialScale = sticker.scale || 1
  
  const move = (moveEvent) => {
    const curY = isTouch ? moveEvent.touches[0].clientY : moveEvent.clientY
    const delta = (curY - startY) * 0.01
    sticker.scale = Math.max(0.1, Math.min(5, initialScale + delta))
  }
  
  const up = () => {
    window.removeEventListener(isTouch ? 'touchmove' : 'mousemove', move)
    window.removeEventListener(isTouch ? 'touchend' : 'mouseup', up)
  }
  
  window.addEventListener(isTouch ? 'touchmove' : 'mousemove', move)
  window.addEventListener(isTouch ? 'touchend' : 'mouseup', up)
}

function removeSticker(stickerId) {
  store.config.stickers = store.config.stickers.filter(s => s.id !== stickerId)
}

const frameWidth = 320
const frameHeight = 840

const frameStyle = computed(() => {
  const base = {
    background: store.config.color,
    padding: '16px', 
    borderRadius: '16px',
    boxShadow: '0 40px 100px rgba(0,0,0,0.2)',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column', // Dynamic grids are mostly column-based buckets
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
    border: '1px solid rgba(255,255,255,0.1)'
  }

  const gap = 10
  const cols = store.config.cols
  const rows = store.config.rows
  const pad = 16 * 2

  // Width is based on columns
  base.width = `${(store.cellWidth * cols) + (gap * (cols - 1)) + pad}px`
  // Height is based on rows + footer (100px)
  base.height = `${(store.cellHeight * rows) + (gap * (rows - 1)) + pad + 100}px` 
  // CRITICAL FIX: explicitly define color so unsupported 'oklab' is NOT inherited
  base.color = '#000000'

  return base
})

const layoutStyle = computed(() => {
  return {
    display: 'grid',
    gridTemplateColumns: `repeat(${store.config.cols}, 1fr)`,
    gridTemplateRows: `repeat(${store.config.rows}, 1fr)`,
    gap: '10px',
    width: '100%',
    justifyItems: 'center'
  }
})

const numSlots = computed(() => {
  return store.config.cols * store.config.rows
})

const photoSlots = computed(() => {
  const slots = []
  for (let i = 0; i < numSlots.value; i++) {
    slots.push(props.photos[i] || null)
  }
  return slots
})

const themeClass = computed(() => {
  switch (store.config.theme) {
    case 'polaroid': return 'bg-white shadow-md'
    case 'minimal': return 'bg-transparent border-2 border-white/50 ring-4 ring-white/20'
    case 'soft-pastel': return 'rounded-[40px]'
    case 'event': return 'border-x-8 border-white/40'
    default: return ''
  }
})

const fontClass = computed(() => {
  if (!store.config.fontStyle) return 'font-sans'
  return `font-${store.config.fontStyle}`
})

const photoFilterStyle = computed(() => {
  switch (store.config.filter) {
    case 'vintage': return 'sepia(0.5) contrast(1.1) brightness(0.9) saturate(0.8)'
    case 'retro': return 'sepia(0.3) saturate(1.4) contrast(1.2) hue-rotate(-10deg)'
    case 'mono': return 'grayscale(1) contrast(1.2) brightness(1.1)'
    case 'sepia': return 'sepia(0.8) contrast(1.05)'
    case 'warm': return 'saturate(1.3) sepia(0.2) brightness(1.05)'
    case 'cool': return 'hue-rotate(30deg) saturate(1.1) brightness(1.05)'
    case 'bright': return 'brightness(1.25) contrast(1.05) saturate(1.1)'
    case 'soft': return 'blur(0.5px) brightness(1.1) contrast(0.95) saturate(0.9)'
    case 'matte': return 'contrast(0.85) brightness(1.1) saturate(0.9) sepia(0.1)'
    case 'pastel': return 'brightness(1.15) saturate(0.7) contrast(0.9) hue-rotate(10deg)'
    case 'peachy': return 'sepia(0.2) hue-rotate(-20deg) saturate(1.5) brightness(1.1)'
    case 'golden': return 'sepia(0.4) saturate(1.6) brightness(1.1) contrast(1.1)'
    case 'sunset': return 'sepia(0.5) hue-rotate(-30deg) saturate(1.8) brightness(1.05)'
    case 'cinematic': return 'contrast(1.3) saturate(0.8) brightness(0.9) hue-rotate(-5deg)'
    case 'dreamy': return 'blur(1px) brightness(1.2) saturate(1.2) opacity(0.9)'
    case 'grainy': return 'contrast(1.1) saturate(1.1)' // Combined with CSS overlay
    case 'fade': return 'brightness(1.1) contrast(0.9) saturate(0.7) sepia(0.2)'
    case 'cool-blue': return 'hue-rotate(180deg) saturate(1.2) contrast(1.1) brightness(1.1)'
    case 'high-contrast': return 'contrast(1.6) saturate(1.2) brightness(1.05)'
    default: return 'none'
  }
})

</script>

<template>
  <div :style="frameStyle" class="transition-all duration-500 overflow-hidden flex flex-col items-center">
    <!-- Pattern Background on Frame -->
    <div 
      class="absolute inset-0 pointer-events-none transition-all duration-700"
      :class="`pattern-${store.config.pattern}`"
      :style="{ 
        backgroundColor: store.config.color.includes('ffffff') || store.config.color.includes('#fff') ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.15)',
        mixBlendMode: 'overlay'
      }"
    ></div>

    <!-- Photo Grid -->
    <div class="grid relative z-10 w-full" :style="layoutStyle">
      <div 
        v-for="(photo, index) in photoSlots" 
        :key="index"
        class="overflow-hidden relative group flex items-center justify-center p-0 rounded-xs transition-all duration-500"
        :style="{ 
          backgroundColor: '#000000', 
          border: '1px solid rgba(255,255,255,0.05)',
          width: `${store.cellWidth}px`,
          height: `${store.cellHeight}px`,
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
        }"
      >
        <div v-if="photo" class="w-full h-full relative overflow-hidden">
           <img 
              :src="photo" 
              class="w-full h-full object-cover object-center relative z-0" 
              :style="{ 
                filter: photoFilterStyle,
                imageRendering: 'auto'
              }"
           />
           <!-- Grain Overlay -->
           <div v-if="store.config.filter === 'grainy'" class="absolute inset-0 pointer-events-none opacity-20 mix-blend-multiply grainy-bg z-10"></div>
        </div>
        <div v-else-if="props.showPlaceholder" class="w-full h-full flex items-center justify-center" :style="{ color: '#cbd5e1' }">
           <component :is="LucideIcons['Camera']" class="w-12 h-12 opacity-50" />
        </div>
      </div>
    </div>

    <!-- Sticker Layer -->
    <div class="absolute inset-0 z-30 pointer-events-none w-full h-full">
       <div 
         v-for="sticker in store.config.stickers" 
         :key="sticker.id"
         class="absolute pointer-events-auto cursor-move select-none group/sticker transition-shadow duration-300"
         :style="{ 
           left: `${sticker.x}px`,
           top: `${sticker.y}px`,
           transform: `translate(-50%, -50%) rotate(${sticker.rotation || 0}deg) scale(${sticker.scale || 1})`,
           zIndex: store.config.selectedElementId === sticker.id ? 100 : 10
         }"
         @mousedown="handleStickerDrag($event, sticker); store.config.selectedElementId = sticker.id"
         @touchstart="handleStickerDrag($event, sticker); store.config.selectedElementId = sticker.id"
       >
         <!-- Selection Boundary (High-Fidelity Focused State) -->
         <template v-if="store.config.selectedElementId === sticker.id && props.editable">
            <div class="absolute -inset-5 border-[1px] border-primary/50 rounded-2xl shadow-[0_0_15px_rgba(99,102,241,0.2)] z-0 pointer-events-none ring-1 ring-white/20"></div>
            
            <!-- Delete (Top Left) -->
            <button 
              @mousedown.stop="removeSticker(sticker.id)"
              @touchstart.stop="removeSticker(sticker.id)"
              class="absolute -top-6 -left-6 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm shadow-lg z-50 hover:scale-125 transition-transform"
            >✕</button>

            <!-- Rotate (Top Right) -->
            <div 
              @mousedown.stop="handleStickerRotate($event, sticker)"
              @touchstart.stop="handleStickerRotate($event, sticker)"
              class="absolute -top-6 -right-6 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg z-50 cursor-alias hover:scale-125 transition-transform"
            >
               <component :is="LucideIcons['RotateCcw']" class="w-4 h-4 text-white" />
            </div>

            <!-- Scale (Bottom Right) -->
            <div 
              @mousedown.stop="handleStickerScale($event, sticker)"
              @touchstart.stop="handleStickerScale($event, sticker)"
              class="absolute -bottom-6 -right-6 w-8 h-8 bg-secondary text-white rounded-full flex items-center justify-center shadow-lg z-50 cursor-s-resize hover:scale-125 transition-transform"
            >
               <component :is="LucideIcons['Maximize2']" class="w-4 h-4 text-white" />
            </div>
         </template>

         <div 
           v-if="sticker.type === 'icon'" 
           class="text-4xl relative z-10" 
           :style="{ color: sticker.color || store.config.textColor, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))' }"
         >
            <component :is="LucideIcons[sticker.src]" />
         </div>
         <div 
           v-else-if="sticker.type === 'image'" 
           class="w-32 h-32 relative z-10 flex items-center justify-center p-2"
           :style="{ filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.12))' }"
         >
            <img :src="sticker.src" class="max-w-full max-h-full object-contain pointer-events-none" />
         </div>
         <div v-else class="text-4xl relative z-10" :style="{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))' }">{{ sticker.src }}</div>
       </div>
    </div>

    <!-- Bottom Ornament / Text -->
    <div 
      class="mt-auto pt-8 pb-4 flex flex-col items-center gap-2 z-20 min-h-[80px] w-full px-6 overflow-hidden cursor-pointer relative"
      :class="{ 'ring-4 ring-primary ring-inset bg-primary/5 rounded-b-2xl': store.config.selectedElementId === 'text-main' }"
      @mousedown.stop="store.config.selectedElementId = 'text-main'"
    >
      <h2 
        class="font-black transition-all duration-300 text-center w-full min-h-[1.5em]" 
        :class="[fontClass, store.config.text ? 'opacity-100 scale-100' : 'opacity-0 scale-95']"
        :style="{ 
          color: store.config.textGradient ? 'transparent' : store.config.textColor, 
          backgroundImage: store.config.textGradient, 
          backgroundClip: store.config.textGradient ? 'text' : 'none',
          '-webkit-background-clip': store.config.textGradient ? 'text' : 'none',
          fontSize: `${store.config.fontSize}px`
        }"
      >
        {{ store.config.text || ' ' }}
      </h2>
      <div 
        class="text-[9px] tracking-[0.4em] font-black uppercase opacity-40"
        :style="{ color: store.config.theme === 'polaroid' ? '#64748b' : 'white' }"
      >
        Dame-Snap Photobooth
      </div>
    </div>
  </div>
</template>

<style scoped>
.grainy-bg {
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
}
</style>
