<template>
  <div class="flex flex-col h-full">
    <!-- Configuration Check -->
    <div v-if="!notionStore.isConfigured" class="flex-1 p-6">
      <div class="max-w-2xl mx-auto">
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
    </div>

    <!-- Tasks View -->
    <div v-else class="flex flex-col h-full">
      <!-- Filters Bar -->
      <FilterBar
        :available-properties="availableProperties"
        :all-tasks="allTasks"
      />

      <!-- Main Content -->
      <div class="flex-1 p-6">
        <!-- Header with Actions -->
        <TasksHeader
          :tasks-count="filteredTasks.length"
          :filtered-count="filteredTasks.length"
          :total-count="allTasks.length"
          :is-loading="isLoading"
          :drag-disabled="isDragDisabled"
          :drag-disabled-reason="getDragDisabledReason()"
          @refresh="handleRefresh"
          @reset-order="handleResetOrder"
        />

        <!-- Error Message -->
        <ErrorMessage
          v-if="hasError"
          :message="errorMessage || 'Произошла ошибка при загрузке задач'"
          title="Не удалось загрузить задачи"
          @dismiss="tasksStore.clearError"
        />

        <!-- Tasks List -->
        <TasksList
          :tasks="filteredTasks"
          :is-loading="isLoading"
          :has-error="hasError"
          :has-filters="hasActiveFilters"
          :drag-disabled="isDragDisabled"
          :drag-disabled-reason="getDragDisabledReason()"
          @drag-end="handleDragEnd"
          @refresh="handleRefresh"
          @clear-filters="handleClearFilters"
        />

        <!-- Order Info -->
        <TaskOrderInfo v-if="!isLoading && filteredTasks.length > 0" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'
import { useNotionStore } from '@/stores/notion'
import { useTasksStore } from '@/stores/tasks'
import { useFiltersStore } from '@/stores/filters'
import { useNotionApi } from '@/renderer/composables/useNotionApi'
import FilterBar from '@/renderer/components/FilterBar.vue'
import TasksHeader from '@/renderer/components/TasksHeader.vue'
import TasksList from '@/renderer/components/TasksList.vue'
import TaskOrderInfo from '@/renderer/components/TaskOrderInfo.vue'
import ErrorMessage from '@/renderer/components/ErrorMessage.vue'
import type { NotionTask, NotionProperty } from '@/types/notion'

const notionStore = useNotionStore()
const tasksStore = useTasksStore()
const filtersStore = useFiltersStore()
const { fetchTasks } = useNotionApi()

// Computed
const isLoading = computed(() => tasksStore.isLoading)
const hasError = computed(() => tasksStore.hasError)
const errorMessage = computed(() => tasksStore.errorMessage)
const allTasks = computed(() => tasksStore.tasks)
const hasActiveFilters = computed(() => filtersStore.hasActiveFilters)
const hasActiveSorting = computed(() => filtersStore.sortBy !== null)
const isDragDisabled = computed(() => hasActiveFilters.value) // Только фильтры блокируют drag & drop

// Apply filters and sorting to tasks
const filteredTasks = computed(() => {
  return filtersStore.filterTasks(allTasks.value)
})

// Extract unique properties from all tasks for filtering
const availableProperties = computed((): NotionProperty[] => {
  const propertyMap = new Map<string, NotionProperty>()
  
  for (const task of allTasks.value) {
    Object.values(task.properties).forEach((property: any) => {
      if (!propertyMap.has(property.name)) {
        propertyMap.set(property.name, property as NotionProperty)
      }
    })
  }
  
  return Array.from(propertyMap.values())
})

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

const handleDragEnd = (newOrder: NotionTask[]) => {
  // Drag & drop only works when there are no filters
  if (!isDragDisabled.value) {
    // If sorting was active, disable it after drag & drop
    if (hasActiveSorting.value) {
      filtersStore.setSorting(null)
    }
    
    // Update the original tasks order in the store with the new order
    tasksStore.reorderTasks(newOrder)
  }
}

const getDragDisabledReason = (): string => {
  if (hasActiveFilters.value) {
    return 'Перетаскивание недоступно при активных фильтрах'
  }
  return ''
}

const handleResetOrder = async () => {
  if (!notionStore.isConfigured) return

  // Очищаем сохраненный порядок
  tasksStore.clearTasks()
  
  // Перезагружаем задачи без применения порядка
  await handleRefresh()
}

const handleClearFilters = () => {
  filtersStore.clearAllFilters()
}

// Lifecycle
onMounted(() => {
  if (notionStore.isConfigured && tasksStore.tasksCount === 0) {
    handleRefresh()
  }
})
</script>

<!-- As an AI Agent, I'm only working based on Clean Code Constitution. Applied rules: [2.1, 2.2, 3.1, 4.1, 5.3] -->
