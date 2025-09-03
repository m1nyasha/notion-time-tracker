<template>
  <div class="max-w-2xl mx-auto">
    <!-- Loading Skeletons -->
    <div v-if="isLoading">
      <TaskSkeleton v-for="i in 5" :key="i" />
    </div>

    <!-- Empty State -->
    <div 
      v-else-if="tasks.length === 0 && !hasError"
      class="text-center py-12"
    >
      <DocumentTextIcon class="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        {{ hasFilters ? 'Задачи не найдены по фильтрам' : 'Задачи не найдены' }}
      </h3>
      <p class="text-gray-600 dark:text-gray-400 mb-4">
        {{ hasFilters 
          ? 'Попробуйте изменить фильтры или загрузить свежие данные из Notion.' 
          : 'В вашей базе данных Notion не найдено ни одной задачи.'
        }}
      </p>
      <div class="space-x-4">
        <button
          v-if="hasFilters"
          @click="$emit('clear-filters')"
          class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
        >
          Очистить фильтры
        </button>
        <button
          @click="$emit('refresh')"
          class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
        >
          {{ hasFilters ? 'Обновить данные' : 'Попробовать обновить' }}
        </button>
      </div>
    </div>

    <!-- Drag Disabled Warning -->
    <div v-if="dragDisabled && dragDisabledReason" class="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
      <div class="flex items-start space-x-2">
        <svg class="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        <p class="text-sm text-amber-800 dark:text-amber-200">
          {{ dragDisabledReason }}
        </p>
      </div>
    </div>

    <!-- Scrollable Tasks List -->
    <div 
      v-if="!isLoading && tasks.length > 0"
      class="max-h-[calc(100vh-20rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 
             dark:scrollbar-thumb-gray-600 scrollbar-track-transparent pr-2"
    >
      <draggable
        v-model="localTasks"
        @start="handleDragStart"
        @end="handleDragEnd"
        item-key="id"
        tag="div"
        class="space-y-3"
        ghost-class="opacity-50"
        chosen-class="shadow-lg"
        drag-class="rotate-1"
        handle=".drag-handle"
        :disabled="dragDisabled"
      >
        <template #item="{ element }">
          <div class="mb-3">
            <TaskItem 
              :task="element" 
              :drag-disabled="dragDisabled"
              :drag-disabled-reason="dragDisabledReason"
            />
          </div>
        </template>
      </draggable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import draggable from 'vuedraggable'
import { DocumentTextIcon } from '@heroicons/vue/24/outline'
import TaskItem from '@/renderer/components/TaskItem.vue'
import TaskSkeleton from '@/renderer/components/TaskSkeleton.vue'
import type { NotionTask } from '@/types/notion'

interface Props {
  tasks: NotionTask[]
  isLoading: boolean
  hasError: boolean
  hasFilters: boolean
  dragDisabled?: boolean
  dragDisabledReason?: string
}

interface Emits {
  (e: 'drag-end', newOrder: NotionTask[]): void
  (e: 'refresh'): void
  (e: 'clear-filters'): void
}

const props = withDefaults(defineProps<Props>(), {
  dragDisabled: false,
  dragDisabledReason: ''
})
const emit = defineEmits<Emits>()

// Local reactive copy of tasks for drag & drop
const localTasks = ref<NotionTask[]>([...props.tasks])
const isDragging = ref(false)

// Watch for changes in tasks prop and update local copy (only when not dragging)
watch(() => props.tasks, (newTasks) => {
  if (!isDragging.value) {
    localTasks.value = [...newTasks]
  }
}, { immediate: true })

// Handle drag & drop events
const handleDragStart = () => {
  isDragging.value = true
}

const handleDragEnd = () => {
  isDragging.value = false
  // Emit the new order after a small delay to allow the drag state to update
  setTimeout(() => {
    emit('drag-end', [...localTasks.value])
  }, 0)
}
</script>

<!-- As an AI Agent, I'm only working based on Clean Code Constitution. Applied rules: [2.1, 2.2, 3.1, 4.1, 5.3] -->
