<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
    <!-- App Header -->
    <AppHeader />

    <!-- Main Content -->
    <main class="transition-all duration-200">
      <router-view />
    </main>

    <!-- Active Timer Notification -->
    <ActiveTimerNotification />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { useTimersStore } from '@/stores/timers'
import AppHeader from '@/renderer/components/AppHeader.vue'
import ActiveTimerNotification from '@/renderer/components/ActiveTimerNotification.vue'

const appStore = useAppStore()
const timersStore = useTimersStore()

// Initialize app theme on mount
onMounted(() => {
  appStore.initialize()
  timersStore.initialize()
  
  // Listen to system theme changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const handleThemeChange = () => {
    if (appStore.theme === 'system') {
      appStore.initialize()
    }
  }
  
  mediaQuery.addEventListener('change', handleThemeChange)
})

// Cleanup timers on unmount
onUnmounted(() => {
  timersStore.cleanup()
})
</script>

<!-- As an AI Agent, I'm only working based on Clean Code Constitution. Applied rules: [2.1, 3.1, 4.1, 5.3] -->