<script setup>
import { ref, computed } from 'vue'
import { usePhotoboothStore } from '../store'
import { Type, Smile, Sparkles, Heart, Palette, Wand2, Ghost, Rocket, Star, Camera, Moon, Sun, Music, Coffee, Pizza, Gift, Cloud } from 'lucide-vue-next'
import * as LucideIcons from 'lucide-vue-next'
import PhotoFrame from '../components/PhotoFrame.vue'

const store = usePhotoboothStore()

const dynamicScale = computed(() => {
  const cols = store.config.cols
  const rows = store.config.rows
  // Use container-based logic or roughly viewport info for preview container
  const maxWidth = typeof window !== 'undefined' ? window.innerWidth < 1024 ? window.innerWidth * 0.9 : 400 : 400
  const maxHeight = 600

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

const activeMainType = ref('stickers') // 'stickers' or 'elements'
const activeCategory = ref('pastel')

const stickerManifest = {
  cool: Array.from({length: 28}, (_, i) => `COOL (${i + 1}).png`),
  pastel: [
    'PASTEL (1).png',
    ...Array.from({length: 21}, (_, i) => `PASTEL (${i + 15}).png`),
    'Shape Pink 2.png'
  ],
  scribble: Array.from({length: 38}, (_, i) => `SCRIBBLE (${i + 1}).png`),
}

const patterns = [
  { id: 'dots', name: 'Dots', class: 'pattern-dots' },
  { id: 'stripes', name: 'Stripes', class: 'pattern-stripes' },
  { id: 'grid', name: 'Grid', class: 'pattern-grid' },
  { id: 'abstract', name: 'Abstract', class: 'pattern-abstract' },
  { id: 'checkered-sm', name: 'Check-S', class: 'pattern-checkered-sm' },
  { id: 'gingham', name: 'Gingham', class: 'pattern-gingham' },
  { id: 'dots-lg', name: 'Dots-L', class: 'pattern-dots-lg' },
  { id: 'v-stripes', name: 'V-Bar', class: 'pattern-v-stripes' },
  { id: 'h-stripes', name: 'H-Bar', class: 'pattern-h-stripes' },
  { id: 'diagonal-thin', name: 'Slash', class: 'pattern-diagonal-thin' },
  { id: 'zigzag', name: 'Zigzag', class: 'pattern-zigzag' },
  { id: 'waves', name: 'Waves', class: 'pattern-waves' },
  { id: 'hearts-sm', name: 'Love', class: 'pattern-hearts-sm' },
  { id: 'sparkles', name: 'Star', class: 'pattern-sparkles' },
  { id: 'smileys', name: 'Miley', class: 'pattern-smileys' },
  { id: 'flowers', name: 'Flora', class: 'pattern-flowers' },
  { id: 'cherries', name: 'Cherry', class: 'pattern-cherries' },
  { id: 'clouds', name: 'Cloud', class: 'pattern-clouds' },
  { id: 'hexagon', name: 'Hex', class: 'pattern-hexagon' },
  { id: 'crosses', name: 'Plus', class: 'pattern-crosses' },
]

const gradients = [
  { value: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' },
  { value: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)' },
  { value: 'linear-gradient(135deg, #fda085 0%, #f6d365 100%)' },
  { value: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)' },
  { value: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)' },
  { value: 'linear-gradient(135deg, #2b5876 0%, #4e4376 100%)' },
  { value: 'linear-gradient(135deg, #fbef80 0%, #f8d07a 100%)' },
  { value: 'linear-gradient(135deg, #cd9cf2 0%, #f6f3ff 100%)' },
  { value: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)' },
  { value: 'linear-gradient(135deg, #f43f5e 0%, #fb7185 100%)' },
  { value: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' }
]

const lucideElements = [
  'Heart', 'Star', 'Sparkles', 'Smile', 'Cloud', 'Sun', 'Moon', 'Music', 'Rocket', 'Ghost', 'Camera', 'Gift', 'Pizza',
  'Coffee', 'Leaf', 'Flower', 'Anchor', 'Flag', 'Bell', 'Bike', 'Bus', 'Crown', 'Diamond', 'Gem', 'Globe', 'Headphones',
  'Mic', 'MoonStar', 'Palmtree', 'PawPrint', 'Rainbow', 'Tent', 'Ticket', 'Umbrella', 'Wind'
]

const cuteEmojis = [
  '❤️', '✨', '⭐', '🌈', '🍭', '🦋', '🧸', '🎀', '🌸', '🐱', '🐾', '☁️', '☀️', '🌕', '🌊', '🍃', '🔥', '🎨', '📸', '🎵',
  '🧁', '🍓', '🍑', '🍕', '🍔', '🍦', '🍩', '🍫', '🍿', '🥤', '🎈', '🎉', '🎁', '💌', '💎', '🦄', '🦖', '🐼', '🐰', '🐥'
]

function selectFont(id) {
  store.config.fontStyle = id
}

function selectPattern(id) {
  store.config.pattern = id
}

function addImageSticker(category, filename) {
  store.config.stickers.push({
    id: Date.now(),
    type: 'image',
    src: `/assets/stickers/${category}/${filename}`, // Must use public/ path for production builds
    x: 150,
    y: 150,
    scale: 0.5,
    rotation: 0
  })
}

function addIconSticker(iconName) {
  store.config.stickers.push({
    id: Date.now(),
    type: 'icon',
    src: iconName,
    x: 100 + Math.random() * 100,
    y: 100 + Math.random() * 100,
    scale: 1,
    rotation: Math.random() * 20 - 10,
    color: store.config.textColor 
  })
}

function addEmojiSticker(emoji) {
  store.config.stickers.push({
    id: Date.now(),
    type: 'emoji',
    src: emoji,
    x: 150,
    y: 150,
    scale: 2,
    rotation: 0
  })
}

function selectColor(color) {
  if (store.config.selectedElementId) {
    if (store.config.selectedElementId === 'text-main') {
      store.config.textColor = color
      store.config.textGradient = null
    } else {
      const sticker = store.config.stickers.find(s => s.id === store.config.selectedElementId)
      if (sticker) {
         sticker.color = color
      }
    }
  } else {
    // Top-level color change (either text or frame depending on tab)
    if (activeMainType.value === 'frame') {
       store.config.color = color
    } else {
       store.config.textColor = color
       store.config.textGradient = null
    }
  }
}

const fontStyles = [
  { id: 'poppins', name: 'Poppins', class: 'font-poppins' },
  { id: 'playfair', name: 'Playfair', class: 'font-playfair' },
  { id: 'pacifico', name: 'Pacifico', class: 'font-pacifico' },
  { id: 'fredoka', name: 'Fredoka', class: 'font-fredoka' },
  { id: 'baloo', name: 'Baloo 2', class: 'font-baloo' },
  { id: 'anton', name: 'Anton', class: 'font-anton' },
]
</script>

<template>
  <div class="w-full flex flex-col items-center gap-4 md:gap-8 max-w-7xl mx-auto px-2 md:px-4 pb-16 md:pb-20" @mousedown.self="store.config.selectedElementId = null">
    <div class="w-full flex flex-col lg:flex-row items-center justify-center gap-5 md:gap-8 lg:gap-16 mt-2 md:mt-4">
      <!-- Edit Panel (Uniform Grid and Tabs) -->
      <div 
        class="flex-1 w-full max-w-xl p-4 md:p-8 rounded-[28px] md:rounded-[40px] shadow-xl border border-white/20 flex flex-col gap-4 md:gap-6 transition-all duration-500 overflow-visible"
        :style="{ backgroundColor: 'var(--card-bg)', backdropFilter: 'blur(40px)', color: 'var(--app-text)' }"
        @mousedown.stop
      >
          <!-- 1. Custom Text (Live) -->
          <div class="space-y-4">
             <div class="relative group">
                <input 
                  id="frame-text"
                  name="frameText"
                  v-model="store.config.text"
                  @focus="store.config.selectedElementId = 'text-main'"
                  type="text" 
                  placeholder="Type your message..."
                  class="w-full px-5 md:px-8 py-3 md:py-5 rounded-[24px] md:rounded-[32px] border-2 border-transparent focus:border-primary text-base md:text-xl font-black outline-none transition-all placeholder:opacity-20 shadow-inner"
                  :style="{ backgroundColor: 'var(--sub-bg)', color: 'var(--app-text)' }"
                />
                <div class="absolute right-6 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary group-focus-within:animate-ping"></div>
             </div>
          </div>

         <!-- 2. Decoration Tabs -->
         <div class="space-y-4">
            <!-- Main Tabs -->
            <div class="flex gap-4 border-b-2 border-white/5 mb-2 overflow-x-auto hide-scrollbar">
              <button 
                v-for="type in ['frame', 'stickers', 'icons', 'emojis']"
                :key="type"
                @click="activeMainType = type; store.config.selectedElementId = null"
                class="pb-3 text-[10px] font-black uppercase tracking-widest transition-all relative shrink-0"
                :class="activeMainType === type ? 'text-primary' : 'opacity-40'"
              >
                {{ type === 'frame' ? 'Background' : store.t[type] }}
                <div v-if="activeMainType === type" class="absolute bottom-0 inset-x-0 h-1 bg-primary rounded-full"></div>
              </button>
            </div>
            
            <!-- Frame Tab Content (NEW) -->
            <div v-if="activeMainType === 'frame'" class="space-y-6">
               <div class="p-4 rounded-3xl" :style="{ backgroundColor: 'var(--sub-bg)' }">
                  <label class="text-[9px] font-black uppercase tracking-widest opacity-40 mb-3 block">Color Atmosphere</label>
                  <div class="grid grid-cols-6 gap-2">
                     <div 
                        v-for="grad in gradients" 
                        :key="grad.value"
                        @click="store.config.color = grad.value"
                        class="aspect-square rounded-xl cursor-pointer hover:scale-110 transition-transform border-2"
                        :style="{ background: grad.value, borderColor: store.config.color === grad.value ? 'var(--primary)' : 'transparent' }"
                     ></div>
                  </div>
               </div>

               <div class="p-4 rounded-3xl" :style="{ backgroundColor: 'var(--sub-bg)' }">
                  <label class="text-[9px] font-black uppercase tracking-widest opacity-40 mb-3 block">Frame Pattern</label>
                  <div class="grid grid-cols-5 gap-2 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                     <button 
                       @click="selectPattern('none')"
                       class="aspect-square rounded-xl border-2 transition-all flex items-center justify-center text-[8px] font-black uppercase tracking-tighter"
                       :style="{ borderColor: store.config.pattern === 'none' ? 'var(--primary)' : 'rgba(0,0,0,0.1)', backgroundColor: 'var(--card-bg)' }"
                     >
                        None
                     </button>
                     <div 
                        v-for="pattern in patterns" 
                        :key="pattern.id"
                        @click="selectPattern(pattern.id)"
                        class="aspect-square relative rounded-xl border-2 cursor-pointer hover:scale-105 transition-all overflow-hidden"
                        :style="{ borderColor: store.config.pattern === pattern.id ? 'var(--primary)' : 'transparent' }"
                     >
                        <div class="absolute inset-0 z-0 opacity-20" :style="{ backgroundColor: 'var(--app-text)' }"></div>
                        <div class="absolute inset-0 z-10" :class="pattern.class" :style="{ background: store.config.color }"></div>
                     </div>
                  </div>
               </div>
            </div>

            <!-- Sticker Tab Content -->
            <div v-if="activeMainType === 'stickers'" class="space-y-4">
              <div class="flex gap-2 p-1 rounded-2xl w-fit" :style="{ backgroundColor: 'var(--sub-bg)' }">
                <button 
                  v-for="cat in ['pastel', 'scribble', 'cool']" 
                  :key="cat"
                  @click="activeCategory = cat"
                  class="px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                  :style="{ backgroundColor: activeCategory === cat ? 'var(--card-bg)' : 'transparent', color: activeCategory === cat ? 'var(--primary)' : 'inherit' }"
                  :class="activeCategory === cat ? 'shadow-sm' : 'opacity-40'"
                >
                  {{ cat }}
                </button>
              </div>

              <!-- Sticker Grid -->
              <div class="grid grid-cols-4 gap-3 p-4 rounded-3xl border border-white/10 max-h-[220px] overflow-y-auto hide-scrollbar" :style="{ backgroundColor: 'var(--sub-bg)' }">
                <button 
                  v-for="sticker in stickerManifest[activeCategory]" 
                  :key="sticker"
                  @click="addImageSticker(activeCategory, sticker)"
                  class="group w-full aspect-square rounded-2xl flex items-center justify-center hover:shadow-lg hover:scale-105 active:scale-95 transition-all overflow-hidden p-2 border border-white/5"
                  :style="{ backgroundColor: 'var(--card-bg)' }"
                >
                  <img 
                    :src="`/assets/stickers/${activeCategory}/${sticker}`" 
                    class="max-w-full max-h-full object-contain"
                  />
                </button>
              </div>
            </div>

            <!-- Icons (Lucide) Tab Content -->
            <div v-else-if="activeMainType === 'icons' || activeMainType === 'elements'" class="grid grid-cols-5 gap-3 max-h-[300px] overflow-y-auto hide-scrollbar p-4 rounded-[32px]" :style="{ backgroundColor: 'var(--sub-bg)' }">
              <button 
                v-for="icon in lucideElements" 
                :key="icon"
                @click="addIconSticker(icon)"
                class="group w-14 h-14 rounded-2xl flex items-center justify-center hover:shadow-lg hover:scale-110 active:scale-95 transition-all border border-white/10 p-4"
                :style="{ backgroundColor: 'var(--card-bg)' }"
              >
                <component 
                  :is="LucideIcons[icon]" 
                  class="w-full h-full opacity-60 group-hover:opacity-100 group-hover:text-primary transition-all"
                  :style="{ color: 'var(--app-text)' }"
                />
              </button>
            </div>

            <!-- Emojis Tab Content -->
            <div v-else class="grid grid-cols-5 gap-3 max-h-[300px] overflow-y-auto hide-scrollbar p-4 rounded-[32px]" :style="{ backgroundColor: 'var(--sub-bg)' }">
               <button 
                v-for="emoji in cuteEmojis" 
                :key="emoji"
                @click="addEmojiSticker(emoji)"
                class="group w-14 h-14 rounded-2xl flex items-center justify-center text-3xl hover:shadow-lg hover:scale-110 active:scale-95 transition-all border border-white/10"
                :style="{ backgroundColor: 'var(--card-bg)' }"
              >
                <span class="group-hover:rotate-12 transition-transform">{{ emoji }}</span>
              </button>
            </div>
         </div>

         <!-- 3. Contextual Coloring -->
         <div class="space-y-4 p-6 rounded-[32px] border border-white/10" :style="{ backgroundColor: 'var(--sub-bg)' }">
            <div class="flex items-center justify-between">
               <label class="text-[10px] font-black uppercase tracking-widest opacity-40 font-display">Color Palette</label>
               <div v-if="store.config.selectedElementId" class="flex items-center gap-1">
                  <div class="w-1.5 h-1.5 bg-primary rounded-full animate-ping"></div>
                  <span class="text-[9px] font-black text-primary uppercase">Painting Selected Item</span>
               </div>
            </div>
            <div class="flex flex-wrap gap-2.5 items-center">
              <button 
                v-for="color in ['#ffffff', '#000000', '#1e293b', '#64748b', '#cbd5e1', '#6366f1', '#4f46e5', '#3b82f6', '#0ea5e9', '#06b6d4', '#10b981', '#22c55e', '#84cc16', '#eab308', '#f59e0b', '#f97316', '#ef4444', '#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#8b5cf6']" 
                :key="color"
                @click="selectColor(color)"
                class="w-8 h-8 rounded-full border-2 border-white/50 shadow-sm hover:scale-125 transition-transform"
                :style="{ backgroundColor: color }"
              ></button>
              
              <!-- Solid Color Master Picker -->
              <label 
                for="solid-picker" 
                class="w-8 h-8 rounded-full border-2 border-primary/30 flex items-center justify-center cursor-pointer hover:bg-primary/10 transition-colors shadow-sm relative overflow-hidden group"
              >
                <input 
                  type="color" 
                  id="solid-picker" 
                  @input="selectColor($event.target.value)"
                  class="opacity-0 absolute inset-0 w-full h-full cursor-pointer" 
                />
                <Palette class="w-4 h-4 text-primary" />
              </label>
            </div>
         </div>

          <!-- 4. Aesthetic Filters (Gallery) -->
          <div class="space-y-4">
             <label class="text-[10px] font-black uppercase tracking-widest opacity-40 font-display px-1">Aesthetic Filters</label>
             <div 
              class="grid grid-cols-5 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar p-1 rounded-3xl hide-scrollbar"
              :style="{ backgroundColor: 'var(--sub-bg)' }"
             >
                <button 
                  v-for="f in [
                    { id: 'none', icon: '✨', name: 'Original' },
                    { id: 'vintage', icon: '🎞️', name: 'Vintage' },
                    { id: 'retro', icon: '📼', name: 'Retro' },
                    { id: 'mono', icon: '🏁', name: 'B&W' },
                    { id: 'sepia', icon: '📜', name: 'Sepia' },
                    { id: 'warm', icon: '☀️', name: 'Warm' },
                    { id: 'cool', icon: '❄️', name: 'Cool' },
                    { id: 'bright', icon: '💡', name: 'Bright' },
                    { id: 'soft', icon: '🕯️', name: 'Soft' },
                    { id: 'matte', icon: '🌫️', name: 'Matte' },
                    { id: 'pastel', icon: '🍭', name: 'Pastel' },
                    { id: 'peachy', icon: '🍑', name: 'Peachy' },
                    { id: 'golden', icon: '🌅', name: 'Golden' },
                    { id: 'sunset', icon: '🌇', name: 'Sunset' },
                    { id: 'cinematic', icon: '🎬', name: 'Cine' },
                    { id: 'dreamy', icon: '☁️', name: 'Dreamy' },
                    { id: 'grainy', icon: '📺', name: 'Grain' },
                    { id: 'fade', icon: '📸', name: 'Fade' },
                    { id: 'cool-blue', icon: '🐬', name: 'Blue' },
                    { id: 'high-contrast', icon: '⚡', name: 'Sharp' }
                  ]" 
                  :key="f.id"
                  @click="store.config.filter = f.id"
                  class="flex flex-col items-center gap-1.5 group/f"
                >
                  <div 
                    class="w-10 h-10 rounded-xl flex items-center justify-center text-lg border-2 transition-all shadow-sm"
                    :class="store.config.filter === f.id ? 'border-primary bg-primary/10 scale-105 shadow-md' : 'border-white/10 bg-white/5 hover:border-white/30'"
                  >
                    {{ f.icon }}
                  </div>
                  <span class="text-[7px] font-black uppercase tracking-wider opacity-40" :class="{ 'text-primary opacity-100': store.config.filter === f.id }">{{ f.name }}</span>
                </button>
             </div>
          </div>

          <!-- 5. Typography Selection -->
          <div class="space-y-4">
             <label class="text-[10px] font-black uppercase tracking-widest opacity-40 font-display px-1">Typography</label>
             <div class="grid grid-cols-3 gap-3">
                <button 
                  v-for="font in fontStyles" 
                  :key="font.id"
                  @click="selectFont(font.id)"
                  class="h-14 rounded-2xl border-2 transition-all flex items-center justify-center font-black relative overflow-hidden group"
                  :style="{ backgroundColor: store.config.fontStyle === font.id ? 'var(--card-bg)' : 'var(--sub-bg)', borderColor: store.config.fontStyle === font.id ? 'var(--primary)' : 'transparent' }"
                  :class="[font.class, store.config.fontStyle === font.id ? 'text-primary shadow-inner' : 'opacity-40']"
                >
                  <span class="text-lg relative z-10">Aa</span>
                  <div class="text-[8px] absolute bottom-1 uppercase tracking-tighter opacity-60">{{ font.name }}</div>
                </button>
             </div>

             <!-- Font Size Slider -->
             <div class="pt-4 space-y-3">
                <div class="flex justify-between items-center">
                   <label class="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">Font Size</label>
                   <span class="text-[10px] font-bold text-primary">{{ store.config.fontSize }}px</span>
                </div>
                <input 
                  type="range" 
                  min="12" 
                  max="120" 
                  v-model="store.config.fontSize"
                  class="w-full h-2 bg-slate-200/50 rounded-lg appearance-none cursor-pointer accent-primary"
                  :style="{ background: `linear-gradient(to right, var(--primary) ${((store.config.fontSize - 12) / (120 - 12)) * 100}%, var(--sub-bg) 0%)` }"
                />
             </div>
          </div>
      </div>

      <!-- Preview Section -->
      <div 
         class="relative flex items-center justify-center shrink-0 w-full lg:sticky lg:top-8 h-fit lg:w-fit p-4 md:p-8 lg:p-12 rounded-[40px] md:rounded-[64px] border-4 border-white/20 shadow-sm transition-colors duration-500 overflow-hidden"
        :style="{ 
          backgroundColor: 'var(--card-bg)',
          backdropFilter: 'blur(20px)'
        }"
      >
         <!-- Scaled bounding box -->
         <div :style="{ width: `${dynamicScale.width * dynamicScale.scale}px`, height: `${dynamicScale.height * dynamicScale.scale}px` }" class="relative flex items-center justify-center">
            <div 
             class="absolute top-0 left-0 transition-all duration-1000"
             :style="{ 
               transform: `scale(${dynamicScale.scale})`,
               transformOrigin: 'top left'
             }"
            >
               <PhotoFrame 
                 :photos="store.capturedPhotos" 
                 :editable="true"
                 class="shadow-[0_48px_100px_rgba(0,0,0,0.15)] relative z-10" 
               />
               
               <div class="mt-20 text-center opacity-40">
                  <div class="text-[10px] font-black uppercase tracking-[0.6em] text-slate-800 dark:text-white">Geser Posisi Stiker & Teks</div>
               </div>
            </div>
         </div>
      </div>
    </div>
  </div>
</template>
