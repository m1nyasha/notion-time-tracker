<template>
  <div class="space-y-2">
    <label class="block text-xs font-medium text-gray-700 dark:text-gray-300">
      {{ label }}
    </label>
    
    <div class="flex items-center space-x-2">
      <!-- Hours -->
      <div class="flex items-center space-x-1">
        <input
          v-model.number="hours"
          @input="updateTime"
          type="number"
          min="0"
          :max="maxHours"
          class="w-12 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 
                 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
        <span class="text-xs text-gray-500 dark:text-gray-400">ч</span>
      </div>

      <!-- Minutes -->
      <div class="flex items-center space-x-1">
        <input
          v-model.number="minutes"
          @input="updateTime"
          type="number"
          min="0"
          max="59"
          class="w-12 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 
                 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
        <span class="text-xs text-gray-500 dark:text-gray-400">м</span>
      </div>

      <!-- Quick preset buttons -->
      <div class="flex space-x-1 ml-2">
        <button
          v-for="preset in presets"
          :key="preset.minutes"
          @click="setPreset(preset.minutes)"
          class="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-600 
                 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 
                 dark:hover:bg-gray-500 transition-colors"
          :title="preset.label"
        >
          {{ preset.short }}
        </button>
      </div>
    </div>

    <!-- Current value display -->
    <div v-if="totalMinutes > 0" class="text-xs text-gray-500 dark:text-gray-400">
      Всего: {{ formatTime(totalMinutes) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Props {
  modelValue: number // время в минутах
  label?: string
  maxHours?: number
}

interface Emits {
  (e: 'update:modelValue', value: number): void
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Время',
  maxHours: 8
})

const emit = defineEmits<Emits>()

// Local state
const hours = ref(0)
const minutes = ref(0)

// Presets
const presets = [
  { minutes: 30, label: '30 минут', short: '30м' },
  { minutes: 60, label: '1 час', short: '1ч' },
  { minutes: 120, label: '2 часа', short: '2ч' },
  { minutes: 240, label: '4 часа', short: '4ч' },
]

// Computed
const totalMinutes = computed(() => hours.value * 60 + minutes.value)

// Methods
const updateTime = () => {
  // Ограничиваем значения
  hours.value = Math.min(Math.max(hours.value || 0, 0), props.maxHours)
  minutes.value = Math.min(Math.max(minutes.value || 0, 0), 59)
  
  emit('update:modelValue', totalMinutes.value)
}

const setPreset = (presetMinutes: number) => {
  hours.value = Math.floor(presetMinutes / 60)
  minutes.value = presetMinutes % 60
  updateTime()
}

const formatTime = (totalMinutes: number): string => {
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  
  if (h > 0) {
    return `${h}ч ${m}м`
  }
  return `${m}м`
}

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  hours.value = Math.floor(newValue / 60)
  minutes.value = newValue % 60
}, { immediate: true })
</script>

<!-- As an AI Agent, I'm only working based on Clean Code Constitution. Applied rules: [2.1, 2.2, 3.1, 4.1, 5.3] -->
