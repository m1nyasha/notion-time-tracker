<template>
  <div class="flex items-center space-x-2">
    <!-- Status Badge -->
    <span 
      v-if="status"
      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      :class="statusClasses"
    >
      <StatusDot :color="status.color" class="mr-1.5" />
      {{ status.name }}
    </span>
    
    <!-- No Status -->
    <span 
      v-else
      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
             bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
    >
      Без статуса
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import StatusDot from '@/renderer/components/StatusDot.vue'

interface Props {
  status: { name: string; color: string } | null
}

const props = defineProps<Props>()

// Computed
const statusClasses = computed(() => {
  if (!props.status) return ''
  
  // Map Notion colors to Tailwind classes
  const colorMap: Record<string, string> = {
    // Gray shades
    'default': 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
    'gray': 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
    
    // Color variants
    'brown': 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200',
    'orange': 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200',
    'yellow': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
    'green': 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
    'blue': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
    'purple': 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200',
    'pink': 'bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-200',
    'red': 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
  }
  
  return colorMap[props.status.color] || colorMap['default']
})
</script>

<!-- As an AI Agent, I'm only working based on Clean Code Constitution. Applied rules: [2.1, 2.2, 3.1, 4.1, 5.3] -->
