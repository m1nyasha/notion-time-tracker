<template>
  <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
    <div class="flex items-center justify-between">
      <!-- Title -->
      <div>
        <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
          Notion Tasks Timer
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ currentScreenTitle }}
        </p>
      </div>

      <!-- Navigation & Actions -->
      <div class="flex items-center space-x-4">
        <!-- Navigation Buttons -->
        <nav class="flex space-x-1">
          <router-link
            to="/tasks"
            :class="[
              'px-3 py-2 rounded-md text-sm font-medium transition-colors',
              $route.name === 'tasks'
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            ]"
          >
            Задачи
          </router-link>
          <router-link
            to="/settings"
            :class="[
              'px-3 py-2 rounded-md text-sm font-medium transition-colors',
              $route.name === 'settings'
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            ]"
          >
            Настройки
          </router-link>
          <router-link
            to="/stats"
            :class="[
              'px-3 py-2 rounded-md text-sm font-medium transition-colors',
              $route.name === 'stats'
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            ]"
          >
            Статистика
          </router-link>
        </nav>

        <!-- Theme Toggle -->
        <button
          @click="toggleTheme"
          class="p-2 rounded-md text-gray-500 dark:text-gray-400 
                 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          :title="themeButtonTitle"
        >
          <component :is="themeIcon" class="w-5 h-5" />
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/vue/24/outline'

const route = useRoute()
const appStore = useAppStore()

// Computed
const theme = computed(() => appStore.theme)

const currentScreenTitle = computed(() => {
  switch (route.name) {
    case 'tasks':
      return 'Ваши задачи из Notion'
    case 'settings':
      return 'Настройка Notion API'
    case 'stats':
      return 'Статистика времени'
    default:
      return ''
  }
})

const themeIcon = computed(() => {
  switch (theme.value) {
    case 'light':
      return SunIcon
    case 'dark':
      return MoonIcon
    case 'system':
      return ComputerDesktopIcon
    default:
      return SunIcon
  }
})

const themeButtonTitle = computed(() => {
  switch (theme.value) {
    case 'light':
      return 'Переключить на тёмную тему'
    case 'dark':
      return 'Переключить на системную тему'
    case 'system':
      return 'Переключить на светлую тему'
    default:
      return 'Переключить тему'
  }
})

// Actions
const toggleTheme = appStore.toggleTheme
</script>

<!-- As an AI Agent, I'm only working based on Clean Code Constitution. Applied rules: [2.1, 2.2, 3.1, 4.1, 5.3] -->
