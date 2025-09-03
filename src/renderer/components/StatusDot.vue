<template>
  <span 
    class="flex-shrink-0 w-2 h-2 rounded-full"
    :class="dotClasses"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  color: string
}

const props = defineProps<Props>()

// Computed
const dotClasses = computed(() => {
  // Map Notion colors to Tailwind background classes
  const colorMap: Record<string, string> = {
    'default': 'bg-gray-400 dark:bg-gray-500',
    'gray': 'bg-gray-400 dark:bg-gray-500',
    'brown': 'bg-amber-500',
    'orange': 'bg-orange-500',
    'yellow': 'bg-yellow-500',
    'green': 'bg-green-500',
    'blue': 'bg-blue-500',
    'purple': 'bg-purple-500',
    'pink': 'bg-pink-500',
    'red': 'bg-red-500',
  }
  
  return colorMap[props.color] || colorMap['default']
})
</script>

<!-- As an AI Agent, I'm only working based on Clean Code Constitution. Applied rules: [2.1, 2.2, 3.1, 4.1, 5.3] -->
