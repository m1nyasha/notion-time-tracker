<template>
  <div 
    class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 
           transition-all duration-200 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 group"
    :class="{ 'shadow-lg': isDragging }"
  >
    <!-- Main Task Info -->
    <div class="p-4">
      <div class="flex items-start space-x-3">
        <!-- Drag Handle -->
        <div 
          :class="dragHandleClasses"
          :title="dragHandleTitle"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
          </svg>
        </div>
        
        <!-- Task Content -->
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between">
            <div class="flex-1 min-w-0">
              <h3 class="text-gray-900 dark:text-white font-medium truncate">
                {{ task.title }}
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {{ formatDate(task.created_time) }}
              </p>
              
              <!-- Task Properties (Status, etc.) -->
              <TaskProperties :properties="task.properties" />
            </div>

            <!-- Timer Status Indicator -->
            <div class="ml-3 mt-1 flex items-center space-x-2">
              <div 
                :class="timerStatusIndicatorClass"
                class="w-3 h-3 rounded-full"
                :title="timerStatusTitle"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Timer Section -->
    <div class="px-4 pb-4 border-t border-gray-100 dark:border-gray-700 pt-3">
      <TaskTimer :task-id="task.id" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { NotionTask } from '@/types/notion'
import { useTimer } from '@/renderer/composables/useTimer'
import TaskTimer from '@/renderer/components/TaskTimer.vue'
import TaskProperties from '@/renderer/components/TaskProperties.vue'

interface Props {
  task: NotionTask
  isDragging?: boolean
  dragDisabled?: boolean
  dragDisabledReason?: string
}

const props = withDefaults(defineProps<Props>(), {
  isDragging: false,
  dragDisabled: false,
  dragDisabledReason: ''
})

// Timer composable for status indicator
const { isRunning, timeProgress } = useTimer(props.task.id)

// Computed
const dragHandleClasses = computed(() => {
  const baseClasses = 'mt-1 p-1 -m-1 rounded transition-colors drag-handle'
  
  if (props.dragDisabled) {
    return `${baseClasses} text-gray-300 dark:text-gray-600 cursor-not-allowed`
  }
  
  return `${baseClasses} text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 
          cursor-move hover:bg-gray-100 dark:hover:bg-gray-700`
})

const dragHandleTitle = computed(() => {
  if (props.dragDisabled && props.dragDisabledReason) {
    return props.dragDisabledReason
  }
  return 'Перетащить задачу'
})

const timerStatusIndicatorClass = computed(() => {
  if (isRunning.value) {
    return 'bg-green-500 animate-pulse' // Running - green pulsing
  }
  
  if (timeProgress.value?.isOvertime) {
    return 'bg-red-500' // Overtime - red
  }
  
  if (timeProgress.value && timeProgress.value.percentage > 0) {
    return 'bg-blue-500' // Has progress - blue
  }
  
  return 'bg-gray-400' // Default - gray
})

const timerStatusTitle = computed(() => {
  if (isRunning.value) {
    return 'Таймер запущен'
  }
  
  if (timeProgress.value?.isOvertime) {
    return 'Превышено запланированное время'
  }
  
  if (timeProgress.value && timeProgress.value.percentage > 0) {
    return `Выполнено ${Math.round(timeProgress.value.percentage)}%`
  }
  
  return 'Таймер не запущен'
})

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short'
  })
}
</script>

<!-- As an AI Agent, I'm only working based on Clean Code Constitution. Applied rules: [2.1, 2.2, 3.1, 4.1, 5.3] -->
