<template>
  <div 
    v-if="visible"
    class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 
           rounded-lg p-4 mb-4 animate-in fade-in duration-300"
  >
    <div class="flex items-start space-x-3">
      <ExclamationTriangleIcon class="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
      
      <div class="flex-1 min-w-0">
        <h3 class="text-sm font-medium text-red-800 dark:text-red-200">
          {{ title || 'Ошибка' }}
        </h3>
        <p class="mt-1 text-sm text-red-700 dark:text-red-300">
          {{ message }}
        </p>
      </div>

      <button
        v-if="dismissible"
        @click="dismiss"
        class="text-red-400 dark:text-red-500 hover:text-red-600 dark:hover:text-red-300 
               transition-colors p-1 -m-1"
      >
        <XMarkIcon class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/vue/24/outline'

interface Props {
  title?: string
  message: string
  dismissible?: boolean
  autoHide?: boolean
  autoHideDelay?: number
}

interface Emits {
  (e: 'dismiss'): void
}

const props = withDefaults(defineProps<Props>(), {
  dismissible: true,
  autoHide: false,
  autoHideDelay: 5000
})

const emit = defineEmits<Emits>()

const visible = ref(true)

const dismiss = () => {
  visible.value = false
  emit('dismiss')
}

// Auto-hide functionality
if (props.autoHide) {
  setTimeout(() => {
    dismiss()
  }, props.autoHideDelay)
}
</script>

<!-- As an AI Agent, I'm only working based on Clean Code Constitution. Applied rules: [2.1, 2.2, 3.1, 4.1, 5.3] -->
