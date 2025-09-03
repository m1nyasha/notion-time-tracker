<template>
  <div class="flex items-center space-x-1">
    <!-- Play/Pause button -->
    <button
      v-if="!isRunning"
      @click="$emit('start')"
      :disabled="!hasPlannedTime"
      class="p-1.5 rounded-full transition-colors"
      :class="hasPlannedTime 
        ? 'text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/20' 
        : 'text-gray-400 cursor-not-allowed'"
      title="Запустить таймер"
    >
      <PlayIcon class="w-4 h-4" />
    </button>

    <button
      v-else
      @click="$emit('pause')"
      class="p-1.5 text-orange-600 dark:text-orange-400 hover:bg-orange-100 
             dark:hover:bg-orange-900/20 rounded-full transition-colors"
      title="Остановить таймер"
    >
      <PauseIcon class="w-4 h-4" />
    </button>

    <!-- Reset button -->
    <button
      v-if="hasSpentTime"
      @click="$emit('reset')"
      :disabled="isRunning"
      class="p-1.5 rounded-full transition-colors"
      :class="isRunning 
        ? 'text-gray-400 cursor-not-allowed' 
        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'"
      title="Сбросить потраченное время"
    >
      <ArrowPathIcon class="w-4 h-4" />
    </button>

    <!-- Settings button -->
    <button
      @click="toggleSettings"
      class="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 
             dark:hover:bg-gray-700 rounded-full transition-colors"
      :title="showSettings ? 'Скрыть настройки' : 'Настройки времени'"
    >
      <Cog6ToothIcon class="w-4 h-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { 
  PlayIcon, 
  PauseIcon, 
  ArrowPathIcon,
  Cog6ToothIcon
} from '@heroicons/vue/24/solid'

interface Props {
  isRunning: boolean
  hasPlannedTime: boolean
  hasSpentTime: boolean
}

interface Emits {
  (e: 'start'): void
  (e: 'pause'): void
  (e: 'reset'): void
  (e: 'toggle-settings'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const showSettings = ref(false)

const toggleSettings = () => {
  showSettings.value = !showSettings.value
  emit('toggle-settings')
}
</script>

<!-- As an AI Agent, I'm only working based on Clean Code Constitution. Applied rules: [2.1, 2.2, 3.1, 4.1, 5.3] -->
