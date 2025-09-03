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

    <!-- Info about drag behavior with sorting -->
    <div v-if="hasSorting" class="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
      <div class="flex items-start space-x-2">
        <svg class="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
        </svg>
        <p class="text-sm text-blue-800 dark:text-blue-200">
          При перетаскивании сортировка будет автоматически отключена
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
        :disabled="false"
      >
        <template #item="{ element }">
          <div class="mb-3">
            <TaskItem 
              :task="element"
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
  hasSorting?: boolean
}

interface Emits {
  (e: 'drag-end', newOrder: NotionTask[]): void
  (e: 'refresh'): void
  (e: 'clear-filters'): void
}

const props = withDefaults(defineProps<Props>(), {
  hasSorting: false
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
