<template>
  <div class="flex items-center space-x-2">
    <!-- Time Progress Bar -->
    <div v-if="showProgress" class="flex-1">
      <div class="flex items-center justify-between mb-1">
        <span class="text-xs font-medium" :class="textColorClass">
          {{ formatTime(timeProgress?.spent || 0) }}
        </span>
        <span class="text-xs text-gray-500 dark:text-gray-400">
          {{ formatTime(timeProgress?.planned || 0) }}
        </span>
      </div>
      
      <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
        <div 
          :class="progressColorClass"
          class="h-1.5 rounded-full transition-all duration-300"
          :style="{ width: progressWidth }"
        ></div>
      </div>
      
      <!-- Overtime indicator -->
      <div v-if="timeProgress?.isOvertime" class="flex items-center space-x-1 mt-1">
        <ExclamationTriangleIcon class="w-3 h-3 text-red-500" />
        <span class="text-xs text-red-600 dark:text-red-400">
          Превышение на {{ formatTime(timeProgress.spent - timeProgress.planned) }}
        </span>
      </div>
    </div>

    <!-- Just time display -->
    <div v-else class="flex items-center space-x-1">
      <ClockIcon class="w-4 h-4 text-gray-400" />
      <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
        {{ formatTime(timeProgress?.spent || 0) }}
      </span>
    </div>

    <!-- Running indicator -->
    <div v-if="isRunning" class="flex items-center">
      <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ClockIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/outline'
import type { TimeProgress } from '@/types/timer'

interface Props {
  timeProgress: TimeProgress | null
  isRunning: boolean
  showProgress?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showProgress: true
})

// Computed
const progressWidth = computed(() => {
  if (!props.timeProgress) return '0%'
  return `${Math.min(props.timeProgress.percentage, 100)}%`
})

const progressColorClass = computed(() => {
  if (!props.timeProgress) return 'bg-blue-500'
  
  const { percentage, isOvertime } = props.timeProgress
  
  if (isOvertime) return 'bg-red-500'
  if (percentage >= 90) return 'bg-orange-500'
  if (percentage >= 75) return 'bg-yellow-500'
  return 'bg-green-500'
})

const textColorClass = computed(() => {
  if (!props.timeProgress) return 'text-gray-700 dark:text-gray-300'
  
  const { isOvertime } = props.timeProgress
  
  if (isOvertime) return 'text-red-600 dark:text-red-400'
  return 'text-gray-700 dark:text-gray-300'
})

// Methods
const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = Math.floor(minutes % 60)
  const secs = Math.floor((minutes % 1) * 60)

  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
</script>

<!-- As an AI Agent, I'm only working based on Clean Code Constitution. Applied rules: [2.1, 2.2, 3.1, 4.1, 5.3] -->
