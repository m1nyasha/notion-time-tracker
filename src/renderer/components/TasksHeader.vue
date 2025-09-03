<template>
  <div class="flex items-center justify-between mb-6">
    <div>
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
        Ваши задачи
      </h2>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
        {{ tasksCount }} {{ getTasksLabel(tasksCount) }} 
        <span v-if="filteredCount !== totalCount">
          ({{ filteredCount }} {{ getTasksLabel(filteredCount) }} отфильтровано)
        </span>
        • {{ dragMessage }}
      </p>
    </div>

    <div class="flex space-x-2">
      <button
        @click="$emit('refresh')"
        :disabled="isLoading"
        class="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 
               disabled:bg-gray-400 text-white rounded-md transition-colors
               disabled:cursor-not-allowed"
      >
        <ArrowPathIcon 
          :class="['w-4 h-4', { 'animate-spin': isLoading }]" 
        />
        <span>{{ isLoading ? 'Загрузка...' : 'Обновить' }}</span>
      </button>

      <button
        @click="$emit('reset-order')"
        :disabled="isLoading"
        class="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 
               text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 
               rounded-md transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        title="Сбросить порядок к оригинальному из Notion"
      >
        <ArrowUturnLeftIcon class="w-4 h-4" />
        <span>Сбросить порядок</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ArrowPathIcon, ArrowUturnLeftIcon } from '@heroicons/vue/24/outline'

interface Props {
  tasksCount: number
  filteredCount: number
  totalCount: number
  isLoading: boolean
  dragDisabled?: boolean
  dragDisabledReason?: string
}

interface Emits {
  (e: 'refresh'): void
  (e: 'reset-order'): void
}

const props = withDefaults(defineProps<Props>(), {
  dragDisabled: false,
  dragDisabledReason: ''
})
defineEmits<Emits>()

// Computed
const dragMessage = computed(() => {
  if (props.dragDisabled && props.dragDisabledReason) {
    return props.dragDisabledReason
  }
  return 'Перетащите за иконку для изменения порядка'
})

// Helper function for Russian pluralization
const getTasksLabel = (count: number) => {
  const lastDigit = count % 10
  const lastTwoDigits = count % 100

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return 'задач'
  }

  switch (lastDigit) {
    case 1:
      return 'задача'
    case 2:
    case 3:
    case 4:
      return 'задачи'
    default:
      return 'задач'
  }
}
</script>

<!-- As an AI Agent, I'm only working based on Clean Code Constitution. Applied rules: [2.1, 2.2, 3.1, 4.1, 5.3] -->
