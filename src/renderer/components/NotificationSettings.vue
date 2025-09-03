<template>
  <div class="space-y-6">
    <!-- Section Header -->
    <div>
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-1">
        Уведомления
      </h3>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Настройка уведомлений о превышении запланированного времени
      </p>
    </div>

    <!-- Settings Grid -->
    <div class="space-y-4">
      <!-- Enable Overtime Notifications -->
      <div class="flex items-center justify-between">
        <div>
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
            Уведомления об овертайме
          </label>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Показывать уведомление при превышении запланированного времени
          </p>
        </div>
        <CustomCheckbox
          :model-value="notificationsStore.settings.enableOvertimeNotifications"
          @update:model-value="updateSetting('enableOvertimeNotifications', $event)"
        />
      </div>

      <!-- Enable Sound Notifications -->
      <div class="flex items-center justify-between">
        <div>
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
            Звуковые уведомления
          </label>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Проигрывать звук при овертайме
          </p>
        </div>
        <CustomCheckbox
          :model-value="notificationsStore.settings.enableOvertimeSound"
          @update:model-value="updateSetting('enableOvertimeSound', $event)"
          :disabled="!notificationsStore.settings.enableOvertimeNotifications"
        />
      </div>

      <!-- Sound Volume -->
      <div 
        v-if="notificationsStore.settings.enableOvertimeSound && notificationsStore.settings.enableOvertimeNotifications"
        class="space-y-2"
      >
        <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
          Громкость звука
        </label>
        <div class="flex items-center space-x-3">
          <SpeakerXMarkIcon class="w-4 h-4 text-gray-400" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            :value="notificationsStore.settings.soundVolume"
            @input="updateSetting('soundVolume', parseFloat($event.target.value))"
            class="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none 
                   cursor-pointer slider"
          />
          <SpeakerWaveIcon class="w-4 h-4 text-gray-600 dark:text-gray-300" />
          <span class="text-xs font-mono text-gray-500 dark:text-gray-400 w-8">
            {{ Math.round(notificationsStore.settings.soundVolume * 100) }}%
          </span>
        </div>
      </div>

      <!-- Enable System Notifications -->
      <div class="flex items-center justify-between">
        <div>
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
            Системные уведомления
          </label>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Показывать уведомления операционной системы
          </p>
        </div>
        <CustomCheckbox
          :model-value="notificationsStore.settings.enableSystemNotifications"
          @update:model-value="updateSetting('enableSystemNotifications', $event)"
          :disabled="!notificationsStore.settings.enableOvertimeNotifications"
        />
      </div>
    </div>

    <!-- Test Notification Button -->
    <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
      <button
        @click="testNotification"
        :disabled="!notificationsStore.settings.enableOvertimeNotifications"
        class="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg
               transition-colors"
        :class="notificationsStore.settings.enableOvertimeNotifications 
          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
          : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'"
      >
        <BellIcon class="w-4 h-4 mr-2" />
        Тест уведомления
      </button>
    </div>

    <!-- Reset to Defaults -->
    <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
      <button
        @click="resetToDefaults"
        class="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg
               bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 
               hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        <ArrowPathIcon class="w-4 h-4 mr-2" />
        Сбросить настройки
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  BellIcon,
  ArrowPathIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon
} from '@heroicons/vue/24/outline'
import { useNotificationsStore } from '@/stores/notifications'
import CustomCheckbox from '@/renderer/components/CustomCheckbox.vue'

const notificationsStore = useNotificationsStore()

// Methods
const updateSetting = <K extends keyof typeof notificationsStore.settings>(
  key: K,
  value: typeof notificationsStore.settings[K]
) => {
  notificationsStore.updateSetting(key, value)
}

const testNotification = () => {
  if (notificationsStore.settings.enableOvertimeNotifications) {
    // Show test notification
    notificationsStore.showOvertimeNotification('test-task-id')
    
    // Hide it after 3 seconds
    setTimeout(() => {
      notificationsStore.hideOvertimeNotification()
    }, 3000)
  }
}

const resetToDefaults = () => {
  if (confirm('Сбросить все настройки уведомлений на значения по умолчанию?')) {
    notificationsStore.resetToDefaults()
  }
}
</script>

<style scoped>
/* Custom range slider styling */
.slider::-webkit-slider-thumb {
  @apply appearance-none w-4 h-4 bg-blue-600 rounded-full cursor-pointer;
}

.slider::-moz-range-thumb {
  @apply w-4 h-4 bg-blue-600 rounded-full cursor-pointer border-0;
}
</style>

<!-- As an AI Agent, I'm only working based on Clean Code Constitution. Applied rules: [2.1, 2.2, 3.1, 4.1, 5.3] -->
