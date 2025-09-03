<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          Отображение полей задач
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Настройте видимость полей из вашей Notion базы данных
        </p>
      </div>
      
      <!-- Actions -->
      <div class="flex items-center space-x-2">
        <button
          @click="displayStore.setAllVisible(true)"
          class="text-xs text-green-600 dark:text-green-400 hover:text-green-700 
                 dark:hover:text-green-300 transition-colors px-2 py-1 rounded hover:bg-green-50 
                 dark:hover:bg-green-900/20"
        >
          Показать все
        </button>
        <button
          @click="displayStore.setAllVisible(false)"
          class="text-xs text-red-600 dark:text-red-400 hover:text-red-700 
                 dark:hover:text-red-300 transition-colors px-2 py-1 rounded hover:bg-red-50 
                 dark:hover:bg-red-900/20"
        >
          Скрыть все
        </button>
        <button
          @click="displayStore.resetToDefaults"
          class="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 
                 dark:hover:text-blue-300 transition-colors px-2 py-1 rounded hover:bg-blue-50 
                 dark:hover:bg-blue-900/20"
        >
          По умолчанию
        </button>
      </div>
    </div>

    <!-- Status Summary -->
    <div v-if="displayStore.totalPropertiesCount > 0" class="mb-4 text-sm text-gray-600 dark:text-gray-400">
      Показывается {{ displayStore.visiblePropertiesCount }} из {{ displayStore.totalPropertiesCount }} полей
    </div>

    <!-- No Properties Available -->
    <div v-if="displayStore.availableProperties.length === 0" class="text-center py-8">
      <div class="text-gray-500 dark:text-gray-400">
        <svg class="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p class="text-sm mb-2">Поля недоступны</p>
        <p class="text-xs">
          Загрузите задачи для настройки отображения полей
        </p>
      </div>
    </div>

    <!-- Properties List -->
    <div v-else class="space-y-4">
      <!-- Group by priority -->
      <div v-if="highPriorityProperties.length > 0">
        <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
          <span class="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
          Важные поля
        </h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 ml-4">
          <PropertyDisplayItem
            v-for="property in highPriorityProperties"
            :key="property.name"
            :property="property"
            @toggle="handleToggle"
          />
        </div>
      </div>

      <div v-if="mediumPriorityProperties.length > 0">
        <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
          <span class="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
          Дополнительные поля
        </h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 ml-4">
          <PropertyDisplayItem
            v-for="property in mediumPriorityProperties"
            :key="property.name"
            :property="property"
            @toggle="handleToggle"
          />
        </div>
      </div>

      <div v-if="lowPriorityProperties.length > 0">
        <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
          <span class="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
          Редко используемые поля
        </h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 ml-4">
          <PropertyDisplayItem
            v-for="property in lowPriorityProperties"
            :key="property.name"
            :property="property"
            @toggle="handleToggle"
          />
        </div>
      </div>
    </div>

    <!-- Info Note -->
    <div class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
      <div class="flex items-start space-x-2">
        <svg class="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
        </svg>
        <p class="text-sm text-blue-800 dark:text-blue-200">
          Поля с пустыми значениями не отображаются независимо от настроек. 
          Изменения сохраняются автоматически и применяются ко всем задачам.
        </p>
      </div>
    </div>

    <!-- Debug Info (only in development) -->
    <div v-if="isDevelopment" class="mt-4">
      <PropertyDebugInfo />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDisplayStore } from '@/stores/display'
import type { NotionProperty } from '@/types/notion'
import PropertyDisplayItem from '@/renderer/components/PropertyDisplayItem.vue'
import PropertyDebugInfo from '@/renderer/components/PropertyDebugInfo.vue'

const displayStore = useDisplayStore()

// Show debug info in development
const isDevelopment = computed(() => 
  import.meta.env.DEV || import.meta.env.NODE_ENV === 'development'
)

// Computed - group properties by priority/type
const highPriorityProperties = computed(() =>
  displayStore.availableProperties.filter(p => 
    ['status', 'select', 'multi_select', 'date'].includes(p.type)
  ).sort((a, b) => a.name.localeCompare(b.name))
)

const mediumPriorityProperties = computed(() =>
  displayStore.availableProperties.filter(p => 
    ['people', 'number'].includes(p.type)
  ).sort((a, b) => a.name.localeCompare(b.name))
)

const lowPriorityProperties = computed(() =>
  displayStore.availableProperties.filter(p => 
    ['checkbox', 'rich_text', 'url', 'email', 'phone_number'].includes(p.type)
  ).sort((a, b) => a.name.localeCompare(b.name))
)

// Methods
const handleToggle = (propertyName: string, visible: boolean): void => {
  displayStore.updatePropertySetting(propertyName, visible)
}
</script>

<!-- As an AI Agent, I'm only working based on Clean Code Constitution. Applied rules: [2.1, 2.2, 3.1, 4.1, 5.3] -->
