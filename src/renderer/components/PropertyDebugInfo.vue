<template>
  <div class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-3 text-xs">
    <h4 class="font-semibold text-gray-700 dark:text-gray-300 mb-2">
      Debug: Property Display Settings
    </h4>
    
    <div class="space-y-1">
      <div>
        <strong>Available Properties:</strong> {{ displayStore.totalPropertiesCount }}
      </div>
      <div>
        <strong>Visible Properties:</strong> {{ displayStore.visiblePropertiesCount }}
      </div>
      
      <div class="mt-2">
        <strong>Settings:</strong>
        <div class="mt-1 space-y-0.5 max-h-32 overflow-y-auto">
          <div 
            v-for="[name, visible] in Object.entries(displayStore.settings)" 
            :key="name"
            class="flex justify-between items-center"
          >
            <span class="truncate mr-2">{{ name }}</span>
            <span :class="visible ? 'text-green-600' : 'text-red-600'">
              {{ visible ? '✓' : '✗' }}
            </span>
          </div>
        </div>
      </div>
      
      <div class="mt-2">
        <strong>localStorage key:</strong> 
        <code class="text-blue-600 dark:text-blue-400">notion-tasks-timer:property-display-settings</code>
      </div>
      
      <div class="mt-2">
        <button 
          @click="logToConsole"
          class="text-blue-600 dark:text-blue-400 hover:underline text-xs"
        >
          Log to Console
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDisplayStore } from '@/stores/display'

const displayStore = useDisplayStore()

const logToConsole = () => {
  console.group('🔧 Property Display Settings Debug')
  console.log('Available Properties:', displayStore.availableProperties)
  console.log('Settings:', displayStore.settings)
  console.log('localStorage:', localStorage.getItem('notion-tasks-timer:property-display-settings'))
  console.groupEnd()
}
</script>

<!-- As an AI Agent, I'm only working based on Clean Code Constitution. Applied rules: [2.1, 2.2, 3.1, 5.3] -->
