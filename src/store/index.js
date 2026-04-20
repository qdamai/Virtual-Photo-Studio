import { defineStore } from 'pinia'
import { reactive, ref, computed } from 'vue'

export const usePhotoboothStore = defineStore('photobooth', () => {
  const currentStep = ref(1)
  
  const config = reactive({
    cols: 1,
    rows: 3,
    size: 'strip', // strip, square, portrait, landscape
    layout: 'vertical3', // vertical2, vertical3, grid4, custom
    theme: 'polaroid', // polaroid, minimal, soft-pastel, event
    pattern: 'dots', // dots, stripes, grid, abstract
    color: '#6366f1',
    text: '',
    fontStyle: 'sans', // sans, handwritten, display
    textColor: '#1e293b',
    textGradient: null,
    filter: 'none',
    fontSize: 48,
    stickers: [], // { id, type, src, x, y, scale, rotation, color }
    selectedElementId: null,
  })

  const appTheme = ref('playful') // playful, light, dark
  const locale = ref('id') // id, en
  const capturedPhotos = ref([])
  const finalImage = ref(null)

  const translations = {
    en: {
      splashMsg: "Ready to capture your best moments?",
      start: "Let's Go!",
      size: "Choose Size",
      layout: "Pick Layout",
      pattern: "Frame Pattern",
      elements: "Elements Studio",
      preview: "Review Photo",
      choiceDimensions: "Choice of Dimensions",
      selectRatio: "Select your preferred frame ratio",
      styleMemory: "Style Your Memory",
      pickArrangement: "Choose your photo arrangement",
      next: "Next",
      back: "Back",
      photos: "Photos",
      shots: "Shots",
      font: "Font Style",
      fontSize: "Font Size",
      stickers: "Stickers",
      icons: "Icons",
      emojis: "Emojis",
      filter: "Filters",
      palette: "Color Palette"
    },
    id: {
      splashMsg: "Siap abadikan momen terbaikmu?",
      start: "Mulai!",
      size: "Pilih Ukuran",
      choiceDimensions: "Pilihan Dimensi",
      selectRatio: "Pilih rasio bingkai pilihan Anda",
      styleMemory: "Gaya Memori Anda",
      pickArrangement: "Pilih pengaturan foto Anda",
      layout: "Pilih Tata Letak",
      pattern: "Pola Bingkai",
      elements: "Studio Dekorasi",
      preview: "Lihat Hasil",
      next: "Lanjut",
      back: "Kembali",
      photos: "Foto",
      shots: "Jepretan",
      font: "Gaya Tulisan",
      fontSize: "Ukuran Teks",
      stickers: "Stiker",
      icons: "Ikon",
      emojis: "Emoji",
      filter: "Filter",
      palette: "Palet Warna"
    }
  }

  const t = computed(() => translations[locale.value])

  const steps = [
    { id: 1, name: 'Splash', route: 'splash' },
    { id: 2, name: 'Layout', route: 'layout' },
    { id: 3, name: 'Camera', route: 'camera' },
    { id: 4, name: 'Elements', route: 'elements' },
    { id: 5, name: 'Preview', route: 'preview' },
    { id: 6, name: 'Final', route: 'final' },
    { id: 7, name: 'Download', route: 'download' },
    { id: 8, name: 'Finish', route: 'finish' },
  ]

  const totalSteps = steps.length

  function nextStep() {
    if (currentStep.value < totalSteps) {
      currentStep.value++
    }
  }

  function prevStep() {
    if (currentStep.value > 1) {
      currentStep.value--
    }
  }

  function reset() {
    currentStep.value = 1
    capturedPhotos.value = []
    finalImage.value = null
    Object.assign(config, {
      size: 'strip',
      layout: 'strip3',
      theme: 'polaroid',
      pattern: 'dots',
      color: '#6366f1',
      text: '',
      fontStyle: 'sans',
      fontSize: 48,
      stickers: [],
    })
  }

  const cellWidth = computed(() => {
    if (config.size === 'landscape') return 400
    if (config.size === 'square') return 300
    return 300
  })

  const cellHeight = computed(() => {
    if (config.size === 'landscape') return 300
    if (config.size === 'square') return 300
    return 400
  })

  return {
    currentStep,
    config,
    appTheme,
    locale,
    translations,
    t,
    capturedPhotos,
    finalImage,
    steps,
    totalSteps,
    cellWidth,
    cellHeight,
    nextStep,
    prevStep,
    reset,
  }
})
