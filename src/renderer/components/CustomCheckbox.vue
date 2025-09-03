<template>
  <label 
    class="inline-flex items-center cursor-pointer group"
    :class="{ 'opacity-50 cursor-not-allowed': disabled }"
  >
    <div class="relative">
      <!-- Hidden native input -->
      <input
        :checked="modelValue"
        :disabled="disabled"
        type="checkbox"
        class="sr-only"
        @change="handleChange"
      />
      
      <!-- Custom checkbox -->
      <div 
        class="w-5 h-5 rounded border-2 transition-all duration-200 ease-in-out"
        :class="checkboxClasses"
      >
        <!-- Checkmark -->
        <svg
          class="w-3 h-3 text-white transition-opacity duration-200 ease-in-out absolute inset-0.5"
          :class="modelValue ? 'opacity-100' : 'opacity-0'"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
        </svg>
      </div>
    </div>
    
    <!-- Label -->
    <span 
      v-if="label"
      class="ml-3 text-sm font-medium transition-colors duration-200"
      :class="labelClasses"
    >
      {{ label }}
    </span>
  </label>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: boolean
  label?: string
  disabled?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

const emit = defineEmits<Emits>()

// Computed
const checkboxClasses = computed(() => ({
  // Base styles
  'flex items-center justify-center': true,
  
  // States
  'bg-blue-600 border-blue-600': props.modelValue && !props.disabled,
  'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600': !props.modelValue && !props.disabled,
  'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600': props.disabled,
  
  // Hover & focus
  'group-hover:border-blue-400 dark:group-hover:border-blue-500': !props.disabled && !props.modelValue,
  'group-hover:bg-blue-700 group-hover:border-blue-700': !props.disabled && props.modelValue,
  
  // Transitions
  'transform transition-transform duration-200': true,
  'group-active:scale-95': !props.disabled
}))

const labelClasses = computed(() => ({
  'text-gray-900 dark:text-white': !props.disabled,
  'text-gray-500 dark:text-gray-400': props.disabled,
  'group-hover:text-gray-700 dark:group-hover:text-gray-200': !props.disabled
}))

// Methods  
const handleChange = (event: Event): void => {
  if (props.disabled) return
  
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.checked)
}
</script>

<!-- As an AI Agent, I'm only working based on Clean Code Constitution. Applied rules: [2.1, 2.2, 3.1, 4.3, 5.1, 7.5] -->
