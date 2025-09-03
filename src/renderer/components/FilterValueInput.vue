<template>
  <div>
    <!-- Text inputs -->
    <input
      v-if="isTextType"
      v-model="localValue"
      type="text"
      :placeholder="getPlaceholder()"
      :disabled="disabled"
      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
             rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white
             placeholder-gray-500 dark:placeholder-gray-400
             focus:outline-none focus:ring-2 focus:ring-blue-500
             disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
    />

    <!-- Number input -->
    <input
      v-else-if="propertyType === 'number'"
      v-model.number="localValue"
      type="number"
      :placeholder="getPlaceholder()"
      :disabled="disabled"
      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
             rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white
             placeholder-gray-500 dark:placeholder-gray-400
             focus:outline-none focus:ring-2 focus:ring-blue-500
             disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
    />

    <!-- Date input -->
    <input
      v-else-if="propertyType === 'date'"
      v-model="localValue"
      type="date"
      :disabled="disabled"
      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
             rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white
             focus:outline-none focus:ring-2 focus:ring-blue-500
             disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
    />

    <!-- Checkbox input -->
    <select
      v-else-if="propertyType === 'checkbox'"
      v-model="localValue"
      :disabled="disabled"
      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
             rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white
             focus:outline-none focus:ring-2 focus:ring-blue-500
             disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
    >
      <option value="">Выберите значение</option>
      <option :value="true">Да</option>
      <option :value="false">Нет</option>
    </select>

    <!-- Select input with predefined options -->
    <select
      v-else-if="propertyType === 'select' && availableOptions.length > 0"
      v-model="localValue"
      :disabled="disabled"
      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
             rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white
             focus:outline-none focus:ring-2 focus:ring-blue-500
             disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
    >
      <option value="">Выберите значение</option>
      <option
        v-for="option in availableOptions"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>

    <!-- Fallback text input -->
    <input
      v-else
      v-model="localValue"
      type="text"
      :placeholder="getPlaceholder()"
      :disabled="disabled"
      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
             rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white
             placeholder-gray-500 dark:placeholder-gray-400
             focus:outline-none focus:ring-2 focus:ring-blue-500
             disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
    />

    <!-- Disabled state message -->
    <div 
      v-if="disabled && needsNoValueMessage"
      class="mt-1 text-xs text-gray-500 dark:text-gray-400"
    >
      Это условие не требует значения
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { FilterOperator } from '@/types/filters'

interface Props {
  modelValue: any
  propertyType?: string
  operator?: FilterOperator | ''
  disabled?: boolean
  availableOptions?: { label: string; value: any }[]
}

interface Emits {
  (e: 'update:modelValue', value: any): void
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  availableOptions: () => []
})

const emit = defineEmits<Emits>()

// Local state
const localValue = ref(props.modelValue)

// Computed
const isTextType = computed(() => {
  return ['title', 'rich_text', 'url', 'email', 'phone_number', 'people'].includes(props.propertyType || '')
})

const needsNoValueMessage = computed(() => {
  return props.operator === 'is_empty' || props.operator === 'is_not_empty'
})

// Methods
const getPlaceholder = (): string => {
  if (props.disabled) return ''
  
  const placeholders: Record<string, string> = {
    title: 'Введите текст заголовка...',
    rich_text: 'Введите текст...',
    url: 'Введите URL...',
    email: 'Введите email...',
    phone_number: 'Введите номер телефона...',
    people: 'Введите имя...',
    select: 'Введите значение...',
    multi_select: 'Введите значения через запятую...'
  }
  
  return placeholders[props.propertyType || ''] || 'Введите значение...'
}

// Watch for local value changes
watch(localValue, (newValue) => {
  emit('update:modelValue', newValue)
})

// Watch for external value changes
watch(() => props.modelValue, (newValue) => {
  localValue.value = newValue
})
</script>

<!-- As an AI Agent, I'm only working based on Clean Code Constitution. Applied rules: [2.1, 2.2, 3.1, 4.1, 5.3] -->
