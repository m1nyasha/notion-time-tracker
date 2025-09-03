<template>
  <div class="space-y-3">
    <!-- Timer Display and Controls -->
    <div class="flex items-center justify-between">
      <div class="flex-1 mr-3">
        <!-- Show timer display if has planned time -->
        <TimerDisplay
          v-if="hasPlannedTime"
          :time-progress="timeProgress"
          :is-running="isRunning"
        />
        
        <!-- Show placeholder if no planned time -->
        <div v-else class="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
          <ClockIcon class="w-4 h-4" />
          <span class="text-sm">Время не задано</span>
        </div>
      </div>

      <!-- Timer Controls -->
      <TimerControls
        :is-running="isRunning"
        :has-planned-time="hasPlannedTime"
        :has-spent-time="(timer?.spentMinutes || 0) > 0"
        @start="start"
        @pause="stop"
        @reset="handleReset"
        @toggle-settings="showSettings = !showSettings"
      />
    </div>

    <!-- Settings Panel -->
    <div v-if="showSettings" class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
      <div class="space-y-3">
        <TimeInput
          v-model="plannedMinutes"
          label="Запланированное время"
          :max-hours="8"
        />

        <div class="flex justify-between items-center">
          <button
            @click="applyPlannedTime"
            :disabled="plannedMinutes === (timer?.plannedMinutes || 0)"
            class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 
                   text-white text-sm rounded transition-colors disabled:cursor-not-allowed"
          >
            Применить
          </button>

          <button
            @click="showSettings = false"
            class="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 
                   dark:hover:text-gray-200 transition-colors"
          >
            Закрыть
          </button>
        </div>

        <!-- Timer Statistics -->
        <div v-if="timer?.sessions.length" class="pt-2 border-t border-gray-200 dark:border-gray-600">
          <div class="text-xs text-gray-600 dark:text-gray-400 mb-2">
            Статистика:
          </div>
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span class="text-gray-500">Сессий:</span>
              <span class="ml-1 font-medium">{{ timer.sessions.length }}</span>
            </div>
            <div>
              <span class="text-gray-500">Потрачено:</span>
              <span class="ml-1 font-medium">{{ formatTimeShort(timer.spentMinutes) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions (when settings are hidden) -->
    <div v-if="!showSettings && !hasPlannedTime" class="flex space-x-1">
      <button
        v-for="preset in quickPresets"
        :key="preset.minutes"
        @click="setQuickTime(preset.minutes)"
        class="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/20 
               text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 
               dark:hover:bg-blue-900/40 transition-colors"
      >
        {{ preset.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ClockIcon } from '@heroicons/vue/24/outline'
import { useTimer } from '@/renderer/composables/useTimer'
import TimerDisplay from '@/renderer/components/TimerDisplay.vue'
import TimerControls from '@/renderer/components/TimerControls.vue'
import TimeInput from '@/renderer/components/TimeInput.vue'

interface Props {
  taskId: string
}

const props = defineProps<Props>()

// Timer composable
const {
  timer,
  timeProgress,
  isRunning,
  hasPlannedTime,
  setPlannedTime,
  start,
  stop,
  reset,
  formatTimeShort
} = useTimer(props.taskId)

// Local state
const showSettings = ref(false)
const plannedMinutes = ref(0)

// Quick presets
const quickPresets = [
  { minutes: 30, label: '30м' },
  { minutes: 60, label: '1ч' },
  { minutes: 120, label: '2ч' },
  { minutes: 240, label: '4ч' },
]

// Methods
const applyPlannedTime = () => {
  setPlannedTime(plannedMinutes.value)
  showSettings.value = false
}

const setQuickTime = (minutes: number) => {
  setPlannedTime(minutes)
}

const handleReset = () => {
  if (confirm('Сбросить все потраченное время для этой задачи?')) {
    reset()
  }
}

// Watch for timer changes and sync local state
watch(() => timer.value?.plannedMinutes, (newValue) => {
  plannedMinutes.value = newValue || 0
}, { immediate: true })
</script>

<!-- As an AI Agent, I'm only working based on Clean Code Constitution. Applied rules: [2.1, 2.2, 3.1, 4.1, 5.3] -->
