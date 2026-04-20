<script setup>
import { useRouter } from 'vue-router'
import { usePhotoboothStore } from '../store'
import { Heart, Camera, Sparkles, RefreshCcw, Home } from 'lucide-vue-next'

const router = useRouter()
const store = usePhotoboothStore()

function restart() {
  store.reset()
  router.push({ name: 'splash' })
}

function takeMore() {
  store.capturedPhotos = []
  store.finalImage = null
  router.push({ name: 'camera' })
}
</script>

<template>
  <div class="w-full flex flex-col items-center justify-center min-h-[70vh] text-center gap-12 group">
    <div class="relative flex flex-col items-center">
      <!-- Decorator elements -->
      <div class="absolute -top-12 -left-12 opacity-10 blur-2xl w-64 h-64 bg-primary/40 rounded-full animate-pulse"></div>
      <div class="absolute -bottom-16 -right-16 opacity-10 blur-2xl w-64 h-64 bg-secondary/40 rounded-full animate-pulse delay-700"></div>

      <div class="w-32 h-32 bg-slate-900 border-[12px] border-white text-white rounded-[48px] flex items-center justify-center shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] mb-12 transform transition-transform duration-700 hover:rotate-[15deg] group-hover:scale-110">
        <Heart class="w-16 h-16 text-primary fill-primary animate-pulse" />
      </div>
      
      <div class="space-y-6 relative z-10">
        <h1 class="text-6xl md:text-8xl font-black text-slate-800 tracking-tighter leading-none animate-bounce duration-1000">
          Stay <span class="text-primary tracking-tighter italic">Iconic.</span>
        </h1>
        <div class="flex items-center justify-center gap-4">
           <div class="w-12 h-px bg-slate-200"></div>
           <p class="text-xl md:text-2xl text-slate-400 font-black uppercase tracking-[0.2em] transition-all group-hover:tracking-[0.4em]">Thank you for using Dame-Snap</p>
           <div class="w-12 h-px bg-slate-200"></div>
        </div>
      </div>
    </div>

    <!-- Final Selection Panel -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mt-12">
       <!-- Take more button -->
       <button 
          @click="takeMore"
          class="group/btn relative bg-white border-2 border-slate-100 p-12 rounded-[56px] shadow-2xl transition-all transform hover:-translate-y-2 hover:border-primary/20 cursor-pointer flex flex-col items-center gap-6 text-center overflow-hidden"
       >
          <div class="w-20 h-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center group-hover/btn:scale-110 transition-transform duration-500 shadow-inner">
             <Camera class="w-10 h-10" />
          </div>
          <div class="space-y-2 relative z-10 transition-transform duration-500 group-hover/btn:translate-x-1">
             <h3 class="text-3xl font-black text-slate-800 tracking-tight leading-none uppercase italic">Capture <br><span class="text-primary italic">Again?</span></h3>
             <p class="text-slate-400 font-bold text-xs leading-relaxed uppercase tracking-widest px-4">Ready for another session? Your settings are saved.</p>
          </div>
          <div class="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary/50 animate-pulse mt-4">
             <RefreshCcw class="w-4 h-4" />
             <span>NEW SESSION</span>
          </div>
       </button>

       <!-- Back to home -->
       <button 
          @click="restart"
          class="group/btn relative bg-slate-900 border-2 border-slate-800 p-12 rounded-[56px] shadow-2xl transition-all transform hover:-translate-y-2 hover:bg-slate-800 cursor-pointer flex flex-col items-center gap-6 text-center shadow-slate-900/50"
       >
          <div class="w-20 h-20 bg-white/10 text-slate-400 rounded-3xl flex items-center justify-center group-hover/btn:scale-110 transition-transform duration-500 shadow-inner">
             <Home class="w-10 h-10" />
          </div>
          <div class="space-y-2 relative z-10 transition-transform duration-500 group-hover/btn:translate-x-1">
             <h3 class="text-3xl font-black text-white tracking-tight leading-none uppercase italic">Home <br><span class="text-primary tracking-tighter italic">Screen</span></h3>
             <p class="text-slate-500 font-bold text-xs leading-relaxed uppercase tracking-widest px-4">Go back to the beginning to reset all preferences.</p>
          </div>
          <div class="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400/50 mt-4 group-hover/btn:text-white/50 transition-colors">
             <Sparkles class="w-4 h-4" />
             <span>RESET ALL</span>
          </div>
       </button>
    </div>

    <!-- Socials / Credits -->
    <div class="mt-20 flex flex-col gap-6 opacity-30 hover:opacity-100 transition-opacity">
       <div class="flex items-center gap-8">
          <div class="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">Minimal Design</div>
          <div class="w-1.5 h-1.5 bg-slate-300 rounded-full"></div>
          <div class="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">Fast Render</div>
          <div class="w-1.5 h-1.5 bg-slate-300 rounded-full"></div>
          <div class="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">HD Export</div>
       </div>
    </div>
  </div>
</template>
