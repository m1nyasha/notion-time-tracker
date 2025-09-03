<template>
  <div
    v-if="notificationsStore.isOvertimeNotificationVisible && taskTitle"
    class="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-50 dark:bg-red-900/20 
           border-2 border-red-200 dark:border-red-800 rounded-lg shadow-xl p-6 max-w-md animate-pulse"
  >
    <div class="flex items-start space-x-4">
      <!-- Warning Icon -->
      <div class="flex-shrink-0">
        <ExclamationTriangleIcon class="w-8 h-8 text-red-600 dark:text-red-400" />
      </div>
      
      <div class="flex-1 min-w-0">
        <!-- Header -->
        <div class="flex items-center space-x-2 mb-2">
          <h3 class="text-lg font-bold text-red-800 dark:text-red-200">
            ⏰ Овертайм!
          </h3>
          <div class="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
        </div>
        
        <!-- Task Title -->
        <p class="text-sm font-medium text-red-700 dark:text-red-300 mb-1">
          {{ taskTitle }}
        </p>
        
        <!-- Overtime Info -->
        <p class="text-xs text-red-600 dark:text-red-400 mb-3">
          Превышено запланированное время на {{ formatOvertime(overtimeMinutes) }}
        </p>
        
        <!-- Current Time -->
        <div v-if="timeProgress" class="mb-4">
          <TimerDisplay
            :time-progress="timeProgress"
            :is-running="true"
            :show-progress="true"
            class="text-red-600 dark:text-red-400"
          />
        </div>
        
        <!-- Action Buttons -->
        <div class="flex flex-wrap gap-2">
          <!-- Mute Sound Button -->
          <button
            v-if="notificationsStore.settings.enableOvertimeSound"
            @click="toggleSound"
            class="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md
                   transition-colors"
            :class="isSoundMuted 
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800/40'"
          >
            <component :is="isSoundMuted ? SpeakerXMarkIcon : SpeakerWaveIcon" class="w-4 h-4 mr-1" />
            {{ isSoundMuted ? 'Включить звук' : 'Выключить звук' }}
          </button>
          
          <!-- Snooze Button -->
          <button
            @click="snoozeNotification"
            class="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md
                   bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 
                   hover:bg-yellow-200 dark:hover:bg-yellow-800/40 transition-colors"
          >
            <ClockIcon class="w-4 h-4 mr-1" />
            Напомнить через 5 мин
          </button>
          
          <!-- Stop Timer Button -->
          <button
            @click="stopTimer"
            class="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md
                   bg-red-600 hover:bg-red-700 text-white transition-colors"
          >
            <StopIcon class="w-4 h-4 mr-1" />
            Остановить таймер
          </button>
        </div>
      </div>
      
      <!-- Close Button -->
      <button
        @click="dismissNotification"
        class="flex-shrink-0 p-1 text-red-400 hover:text-red-600 dark:hover:text-red-300 
               transition-colors"
        title="Скрыть уведомление"
      >
        <XMarkIcon class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  ExclamationTriangleIcon,
  XMarkIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ClockIcon,
  StopIcon
} from '@heroicons/vue/24/outline'
import { useNotificationsStore } from '@/stores/notifications'
import { useTimersStore } from '@/stores/timers'
import { useTasksStore } from '@/stores/tasks'
import TimerDisplay from '@/renderer/components/TimerDisplay.vue'

const notificationsStore = useNotificationsStore()
const timersStore = useTimersStore()
const tasksStore = useTasksStore()

// State
const isSoundMuted = ref(false)

// Computed
const taskTitle = computed(() => {
  const taskId = notificationsStore.currentOvertimeTaskId
  if (!taskId) return ''
  
  const task = tasksStore.tasks.find(t => t.id === taskId)
  return task?.title || 'Неизвестная задача'
})

const timeProgress = computed(() => {
  const taskId = notificationsStore.currentOvertimeTaskId
  if (!taskId) return null
  
  return timersStore.getTimeProgress(taskId)
})

const overtimeMinutes = computed(() => {
  const taskId = notificationsStore.currentOvertimeTaskId
  if (!taskId) return 0
  
  const timer = timersStore.getTimerByTaskId(taskId)
  if (!timer) return 0
  
  // Вычисляем общее потраченное время (включая активную сессию)
  let totalSpentMinutes = timer.spentMinutes
  if (timer.isRunning && timer.startedAt) {
    const currentSessionTime = (Date.now() - timer.startedAt) / (1000 * 60)
    totalSpentMinutes += currentSessionTime
  }
  
  const plannedMinutes = timer.plannedMinutes
  return Math.max(0, totalSpentMinutes - plannedMinutes)
})

// Methods
const formatOvertime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = Math.floor(minutes % 60)
  
  if (hours > 0) {
    return `${hours}ч ${mins}м`
  }
  return `${mins}м`
}

const toggleSound = (): void => {
  const taskId = notificationsStore.currentOvertimeTaskId
  if (!taskId) return
  
  if (isSoundMuted.value) {
    notificationsStore.startOvertimeSound(taskId)
    isSoundMuted.value = false
  } else {
    notificationsStore.stopOvertimeSound(taskId)
    isSoundMuted.value = true
  }
}

const snoozeNotification = (): void => {
  notificationsStore.hideOvertimeNotification()
  
  // Show notification again after 5 minutes
  setTimeout(() => {
    const taskId = notificationsStore.currentOvertimeTaskId
    if (taskId && timersStore.getTimerByTaskId(taskId)?.isRunning) {
      const timer = timersStore.getTimerByTaskId(taskId)
      if (timer) {
        let totalSpentMinutes = timer.spentMinutes
        if (timer.isRunning && timer.startedAt) {
          const currentSessionTime = (Date.now() - timer.startedAt) / (1000 * 60)
          totalSpentMinutes += currentSessionTime
        }
        
        if (totalSpentMinutes > timer.plannedMinutes) {
          notificationsStore.showOvertimeNotification(taskId)
        }
      }
    }
  }, 5 * 60 * 1000) // 5 minutes
}

const stopTimer = (): void => {
  const taskId = notificationsStore.currentOvertimeTaskId
  if (taskId) {
    timersStore.stopTimer(taskId)
    notificationsStore.hideOvertimeNotification()
  }
}

const dismissNotification = (): void => {
  notificationsStore.hideOvertimeNotification()
}
</script>

<!-- As an AI Agent, I'm only working based on Clean Code Constitution. Applied rules: [2.1, 2.2, 3.1, 4.1, 5.3] -->
