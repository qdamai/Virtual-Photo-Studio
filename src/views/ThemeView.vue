<script setup>
import { usePhotoboothStore } from '../store'
import { CheckCircle2 } from 'lucide-vue-next'

const store = usePhotoboothStore()

const themes = [
  { id: 'polaroid', name: 'Polaroid Classic', description: 'Clean white border with traditional shadow', color: '#ffffff' },
  { id: 'minimal', name: 'Minimal Clean', description: 'Light stroke and subtle focus on photos', color: '#f8fafc' },
  { id: 'soft-pastel', name: 'Soft Pastel', description: 'Extra rounded corners and organic feel', color: '#fef2f2' },
  { id: 'event', name: 'Event / Themed', description: 'Side accents and unique decorative elements', color: '#eff6ff' },
]

function selectTheme(id) {
  store.config.theme = id
}
</script>

<template>
  <div class="w-full flex flex-col items-center gap-10">
    <div class="text-center space-y-2">
      <h2 class="text-4xl md:text-5xl font-black text-slate-800 tracking-tight">Pick a <span class="text-accent">Theme</span></h2>
      <p class="text-slate-500 font-medium tracking-tight">Set the overall style and mood of your frame</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
      <div 
        v-for="theme in themes" 
        :key="theme.id"
        @click="selectTheme(theme.id)"
        class="group relative bg-white p-8 rounded-[48px] border-4 transition-all duration-300 transform hover:-translate-y-2 cursor-pointer flex items-center gap-8 text-left"
        :class="store.config.theme === theme.id ? 'border-accent ring-12 ring-accent/5 shadow-2xl scale-[1.02]' : 'border-transparent hover:border-slate-100 hover:shadow-xl'"
      >
        <!-- Selection Badge -->
        <div 
          v-if="store.config.theme === theme.id" 
          class="absolute -top-3 -right-3 w-12 h-12 bg-accent text-white rounded-full flex items-center justify-center shadow-lg transform scale-110 z-20"
        >
          <CheckCircle2 class="w-7 h-7" />
        </div>

        <!-- Preview Mockup -->
        <div class="w-32 h-44 shrink-0 overflow-hidden relative border-4 border-slate-50 transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl rounded-2xl group-hover:border-accent/10" :style="{ backgroundColor: theme.color }">
           <div class="absolute inset-2 bg-slate-100/30 rounded-lg flex flex-col items-center justify-center p-2 gap-2">
              <div class="w-full h-8 bg-slate-200/50 rounded-md"></div>
              <div class="w-full h-8 bg-slate-200/50 rounded-md"></div>
              <div class="w-full h-8 bg-slate-200/50 rounded-md"></div>
           </div>
        </div>
        
        <div class="space-y-2">
          <h3 class="text-2xl font-black text-slate-800 leading-tight">{{ theme.name }}</h3>
          <p class="text-slate-500 font-medium text-sm">{{ theme.description }}</p>
          <div v-if="store.config.theme === theme.id" class="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-accent mt-2 animate-bounce">
              Selected Theme
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
