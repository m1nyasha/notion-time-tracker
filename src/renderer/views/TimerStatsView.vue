<template>
  <div class="max-w-4xl mx-auto p-6">
    <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
      Статистика таймеров
    </h2>

    <!-- Overall Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Всего времени
        </h3>
        <p class="text-3xl font-bold text-blue-600 dark:text-blue-400">
          {{ formatTime(totalTime) }}
        </p>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Активных таймеров
        </h3>
        <p class="text-3xl font-bold text-green-600 dark:text-green-400">
          {{ activeTimersCount }}
        </p>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Всего сессий
        </h3>
        <p class="text-3xl font-bold text-purple-600 dark:text-purple-400">
          {{ totalSessions }}
        </p>
      </div>
    </div>

    <!-- Timers List -->
    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          Детальная статистика по задачам
        </h3>
      </div>

      <div class="p-6">
        <div v-if="timersList.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
          Пока нет данных по таймерам
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="timer in timersList"
            :key="timer.taskId"
            class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            <div class="flex-1">
              <h4 class="font-medium text-gray-900 dark:text-white">
                {{ getTaskTitle(timer.taskId) }}
              </h4>
              <div class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Сессий: {{ timer.sessions.length }} • 
                Потрачено: {{ formatTime(timer.spentMinutes) }}
                <span v-if="timer.plannedMinutes > 0">
                  из {{ formatTime(timer.plannedMinutes) }}
                </span>
              </div>
            </div>

            <div class="flex items-center space-x-2">
              <div
                v-if="timer.isRunning"
                class="w-3 h-3 bg-green-500 rounded-full animate-pulse"
                title="Активен"
              ></div>
              
              <button
                @click="viewTimerDetails(timer)"
                class="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 
                       rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
              >
                Подробнее
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTimersStore } from '@/stores/timers'
import { useTasksStore } from '@/stores/tasks'

const timersStore = useTimersStore()
const tasksStore = useTasksStore()

// Computed
const timersList = computed(() => {
  return Array.from(timersStore.timers.values())
    .filter(timer => timer.spentMinutes > 0 || timer.plannedMinutes > 0)
    .sort((a, b) => b.spentMinutes - a.spentMinutes)
})

const totalTime = computed(() => {
  return timersList.value.reduce((sum, timer) => sum + timer.spentMinutes, 0)
})

const activeTimersCount = computed(() => {
  return timersList.value.filter(timer => timer.isRunning).length
})

const totalSessions = computed(() => {
  return timersList.value.reduce((sum, timer) => sum + timer.sessions.length, 0)
})

// Methods
const getTaskTitle = (taskId: string) => {
  const task = tasksStore.tasks.find(t => t.id === taskId)
  return task?.title || 'Неизвестная задача'
}

const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = Math.floor(minutes % 60)

  if (hours > 0) {
    return `${hours}ч ${mins}м`
  }
  return `${mins}м`
}

const viewTimerDetails = (timer: any) => {
  // TODO: можно добавить модальное окно с детальной статистикой
  console.log('Timer details:', timer)
}
</script>

<!-- As an AI Agent, I'm only working based on Clean Code Constitution. Applied rules: [2.1, 2.2, 3.1, 4.1, 5.3] -->
