<template>
  <div
    v-if="activeTimer && !isMinimized"
    class="fixed top-4 right-4 z-50 bg-white dark:bg-gray-800 border border-gray-200 
           dark:border-gray-600 rounded-lg shadow-lg p-4 max-w-sm"
  >
    <div class="flex items-start space-x-3">
      <!-- Running indicator -->
      <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse mt-1"></div>
      
      <div class="flex-1 min-w-0">
        <h4 class="text-sm font-medium text-gray-900 dark:text-white truncate">
          {{ taskTitle }}
        </h4>
        
        <div class="mt-1 text-xs text-gray-600 dark:text-gray-400">
          Активный таймер
        </div>
        
        <div class="mt-2">
          <TimerDisplay
            :time-progress="timeProgress"
            :is-running="true"
            :show-progress="false"
          />
        </div>
      </div>

      <!-- Minimize button (doesn't stop timer) -->
      <button
        @click="minimizeNotification"
        class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 
               transition-colors"
        title="Скрыть уведомление"
      >
        <XMarkIcon class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { useTimersStore } from '@/stores/timers'
import { useTasksStore } from '@/stores/tasks'
import TimerDisplay from '@/renderer/components/TimerDisplay.vue'

const timersStore = useTimersStore()
const tasksStore = useTasksStore()

// State
const isMinimized = ref(false)

// Computed
const activeTimer = computed(() => timersStore.getActiveTimer)

const taskTitle = computed(() => {
  if (!activeTimer.value) return ''
  
  const task = tasksStore.tasks.find(t => t.id === activeTimer.value?.taskId)
  return task?.title || 'Неизвестная задача'
})

const timeProgress = computed(() => {
  if (!activeTimer.value) return null
  return timersStore.getTimeProgress(activeTimer.value.taskId)
})

// Methods
const minimizeNotification = () => {
  isMinimized.value = true
}

// Reset minimization when timer changes
watch(() => activeTimer.value?.taskId, () => {
  isMinimized.value = false
})
</script>

<!-- As an AI Agent, I'm only working based on Clean Code Constitution. Applied rules: [2.1, 2.2, 3.1, 4.1, 5.3] -->
