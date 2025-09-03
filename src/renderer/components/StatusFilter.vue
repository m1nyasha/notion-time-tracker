<template>
  <div class="space-y-3">
    <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">
      Быстрая фильтрация по статусу
    </h4>
    
    <div class="flex flex-wrap gap-2">
      <!-- All Tasks -->
      <button
        @click="clearStatusFilter"
        class="inline-flex items-center px-3 py-1.5 text-sm rounded-full border transition-colors"
        :class="!activeStatusFilter 
          ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'"
      >
        Все задачи
        <span class="ml-1.5 text-xs bg-white dark:bg-gray-800 px-1.5 py-0.5 rounded-full">
          {{ totalTasks }}
        </span>
      </button>

      <!-- Status Options -->
      <button
        v-for="status in availableStatuses"
        :key="status.name"
        @click="setStatusFilter(status.name)"
        class="inline-flex items-center px-3 py-1.5 text-sm rounded-full border transition-colors"
        :class="activeStatusFilter === status.name
          ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'"
      >
        <StatusDot :color="status.color" class="mr-2" />
        {{ status.name }}
        <span class="ml-1.5 text-xs bg-white dark:bg-gray-800 px-1.5 py-0.5 rounded-full">
          {{ getStatusCount(status.name) }}
        </span>
      </button>

      <!-- No Status -->
      <button
        @click="setStatusFilter(null)"
        class="inline-flex items-center px-3 py-1.5 text-sm rounded-full border transition-colors"
        :class="activeStatusFilter === null
          ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'"
      >
        Без статуса
        <span class="ml-1.5 text-xs bg-white dark:bg-gray-800 px-1.5 py-0.5 rounded-full">
          {{ noStatusCount }}
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { NotionTask } from '@/types/notion'
import StatusDot from '@/renderer/components/StatusDot.vue'

interface Props {
  tasks: NotionTask[]
  activeStatusFilter: string | null | undefined
}

interface Emits {
  (e: 'status-filter-change', status: string | null | undefined): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Computed
const availableStatuses = computed(() => {
  const statusMap = new Map<string, { name: string; color: string }>()
  
  props.tasks.forEach(task => {
    Object.values(task.properties).forEach(property => {
      if (property.type === 'status' && property.value.status) {
        const status = property.value.status
        if (!statusMap.has(status.name)) {
          statusMap.set(status.name, status)
        }
      }
    })
  })
  
  return Array.from(statusMap.values()).sort((a, b) => a.name.localeCompare(b.name))
})

const totalTasks = computed(() => props.tasks.length)

const noStatusCount = computed(() => 
  props.tasks.filter(task => !hasStatus(task)).length
)

// Methods
const hasStatus = (task: NotionTask): boolean => {
  return Object.values(task.properties).some(property => 
    property.type === 'status' && property.value.status
  )
}

const getStatusCount = (statusName: string): number => {
  return props.tasks.filter(task => 
    Object.values(task.properties).some(property => 
      property.type === 'status' && 
      property.value.status?.name === statusName
    )
  ).length
}

const setStatusFilter = (status: string | null) => {
  emit('status-filter-change', status)
}

const clearStatusFilter = () => {
  emit('status-filter-change', undefined)
}
</script>

<!-- As an AI Agent, I'm only working based on Clean Code Constitution. Applied rules: [2.1, 2.2, 3.1, 4.1, 5.3] -->
