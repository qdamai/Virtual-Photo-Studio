<script setup>
import { computed } from 'vue'

const props = defineProps({
  pattern: {
    type: String,
    default: 'dots' // dots, stripes, grid, abstract
  },
  color: {
    type: String,
    default: '#6366f1'
  }
})

const patternClass = computed(() => {
  return `pattern-${props.pattern}`
})

const style = computed(() => ({
  background: props.color
}))
</script>

<template>
  <div 
    class="absolute inset-0 w-full h-full transition-all duration-700"
    :class="patternClass"
    :style="style"
  ></div>
</template>

<style scoped>
.pattern-dots {
  mask-image: radial-gradient(circle, #000 1px, transparent 1px);
  mask-size: 24px 24px;
}

.pattern-grid {
  mask-image: linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px);
  mask-size: 40px 40px;
}

.pattern-stripes {
  mask-image: repeating-linear-gradient(45deg, #000, #000 2px, transparent 2px, transparent 15px);
}

.pattern-abstract {
  mask-image: radial-gradient(circle at 10% 20%, #000 0%, transparent 40%),
              radial-gradient(circle at 90% 80%, #000 0%, transparent 40%),
              radial-gradient(circle at 50% 50%, #000 0%, transparent 20%);
  mask-size: 200px 200px;
}
</style>
