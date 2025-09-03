<template>
  <div class="p-6">
    <!-- Configuration Check -->
    <div v-if="!notionStore.isConfigured" class="max-w-2xl mx-auto">
      <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
        <div class="flex items-start space-x-3">
          <ExclamationTriangleIcon class="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
          <div>
                      <h3 class="text-lg font-medium text-yellow-800 dark:text-yellow-200 mb-2">
            Notion не настроен
          </h3>
          <p class="text-yellow-700 dark:text-yellow-300 mb-4">
            Пожалуйста, настройте параметры Notion API для начала синхронизации задач.
          </p>
          <router-link
            to="/settings"
            class="inline-block bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Перейти к настройкам
          </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Tasks List -->
    <div v-else>
      <!-- Header with Actions -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            Ваши задачи
          </h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {{ tasksCount }} {{ getTasksLabel(tasksCount) }} • Перетащите для изменения порядка
          </p>
        </div>

        <div class="flex space-x-2">
          <button
            @click="handleRefresh"
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
            @click="handleResetOrder"
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

      <!-- Error Message -->
              <ErrorMessage
        v-if="hasError"
        :message="errorMessage || 'Произошла ошибка при загрузке задач'"
        title="Не удалось загрузить задачи"
        @dismiss="tasksStore.clearError"
      />

      <!-- Tasks Container with Scroll -->
      <div class="max-w-2xl mx-auto">
        <!-- Loading Skeletons -->
        <div v-if="isLoading">
          <TaskSkeleton v-for="i in 5" :key="i" />
        </div>

        <!-- Empty State -->
        <div 
          v-else-if="tasksCount === 0 && !hasError"
          class="text-center py-12"
        >
          <DocumentTextIcon class="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Задачи не найдены
          </h3>
          <p class="text-gray-600 dark:text-gray-400 mb-4">
            В вашей базе данных Notion не найдено ни одной задачи.
          </p>
          <button
            @click="handleRefresh"
            class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
          >
            Попробовать обновить
          </button>
        </div>

        <!-- Scrollable Tasks List -->
        <div 
          v-else
          class="max-h-[calc(100vh-16rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 
                 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent pr-2"
        >
          <draggable
            v-model="localTasks"
            @end="handleDragEnd"
            item-key="id"
            tag="div"
            class="space-y-3"
            ghost-class="opacity-50"
            chosen-class="shadow-lg"
            drag-class="rotate-1"
            handle=".drag-handle"
          >
            <template #item="{ element }">
              <div class="mb-3">
                <TaskItem :task="element" />
              </div>
            </template>
          </draggable>
        </div>
      </div>

      <!-- Order Info -->
      <TaskOrderInfo v-if="!isLoading && tasksCount > 0" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import draggable from 'vuedraggable'

import { useNotionStore } from '@/stores/notion'
import { useTasksStore } from '@/stores/tasks'
import { useNotionApi } from '@/renderer/composables/useNotionApi'
import TaskItem from '@/renderer/components/TaskItem.vue'
import TaskSkeleton from '@/renderer/components/TaskSkeleton.vue'
import ErrorMessage from '@/renderer/components/ErrorMessage.vue'
import TaskOrderInfo from '@/renderer/components/TaskOrderInfo.vue'
import { 
  ExclamationTriangleIcon, 
  ArrowPathIcon, 
  DocumentTextIcon,
  ArrowUturnLeftIcon
} from '@heroicons/vue/24/outline'
import type { NotionTask } from '@/types/notion'


const notionStore = useNotionStore()
const tasksStore = useTasksStore()
const { fetchTasks } = useNotionApi()

// Local reactive copy of tasks for drag & drop
const localTasks = ref<NotionTask[]>([])

// Computed
const isLoading = computed(() => tasksStore.isLoading)
const hasError = computed(() => tasksStore.hasError)
const errorMessage = computed(() => tasksStore.errorMessage)
const tasksCount = computed(() => tasksStore.tasksCount)

// Watch for changes in the store and update local copy
watch(() => tasksStore.tasks, (newTasks) => {
  localTasks.value = [...newTasks]
}, { immediate: true })

// Methods
const handleRefresh = async () => {
  if (!notionStore.isConfigured) return

  tasksStore.setLoading(true)

  try {
    const tasks = await fetchTasks(
      notionStore.config.apiKey,
      notionStore.config.databaseId
    )
    tasksStore.setTasks(tasks)
  } catch (error) {
    tasksStore.setError(
      error instanceof Error ? error.message : 'Не удалось загрузить задачи'
    )
  } finally {
    tasksStore.setLoading(false)
  }
}

const handleDragEnd = () => {
  // Update store with new order (but don't sync to Notion)
  tasksStore.reorderTasks([...localTasks.value])
}

const handleResetOrder = async () => {
  if (!notionStore.isConfigured) return

  // Очищаем сохраненный порядок
  tasksStore.clearTasks()
  
  // Перезагружаем задачи без применения порядка
  await handleRefresh()
}

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

// Lifecycle
onMounted(() => {
  if (notionStore.isConfigured && tasksStore.tasksCount === 0) {
    handleRefresh()
  }
})
</script>

<!-- As an AI Agent, I'm only working based on Clean Code Constitution. Applied rules: [2.1, 2.2, 3.1, 4.1, 5.3] -->
