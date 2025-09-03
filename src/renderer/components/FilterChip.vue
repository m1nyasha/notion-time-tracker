<template>
  <div 
    class="inline-flex items-center rounded-full border transition-colors"
    :class="[chipClasses, compact ? 'space-x-1 px-2 py-0.5 text-xs' : 'space-x-2 px-3 py-1 text-sm']"
  >
    <!-- Toggle button -->
    <button
      @click="$emit('toggle', filter.id)"
      class="flex items-center space-x-1"
    >
      <span class="font-medium">{{ compact ? filter.propertyName.slice(0, 8) + (filter.propertyName.length > 8 ? '...' : '') : filter.propertyName }}</span>
      <span v-if="!compact" class="text-xs opacity-75">{{ operatorLabel }}</span>
      <span v-if="!isEmptyOperator && !compact" class="font-medium">{{ displayValue }}</span>
    </button>

    <!-- Edit button (only in full mode) -->
    <button
      v-if="!compact"
      @click="$emit('edit', filter.id)"
      class="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
      title="Редактировать фильтр"
    >
      <PencilIcon class="w-3 h-3" />
    </button>

    <!-- Remove button -->
    <button
      @click="$emit('remove', filter.id)"
      :class="compact 
        ? 'p-0.5 hover:bg-red-200 dark:hover:bg-red-800 rounded transition-colors' 
        : 'p-0.5 hover:bg-red-200 dark:hover:bg-red-800 rounded transition-colors'"
      title="Удалить фильтр"
    >
      <XMarkIcon :class="compact ? 'w-2.5 h-2.5' : 'w-3 h-3'" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { PencilIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import type { TaskFilter } from '@/types/filters'
import { OPERATOR_LABELS } from '@/types/filters'

interface Props {
  filter: TaskFilter
  compact?: boolean
}

interface Emits {
  (e: 'toggle', filterId: string): void
  (e: 'edit', filterId: string): void
  (e: 'remove', filterId: string): void
}

const props = withDefaults(defineProps<Props>(), {
  compact: false
})
defineEmits<Emits>()

// Computed
const chipClasses = computed(() => {
  if (props.filter.isActive) {
    return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700'
  }
  return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600'
})

const operatorLabel = computed(() => {
  return OPERATOR_LABELS[props.filter.operator] || props.filter.operator
})

const isEmptyOperator = computed(() => {
  return props.filter.operator === 'is_empty' || props.filter.operator === 'is_not_empty'
})

const displayValue = computed(() => {
  const value = props.filter.value
  
  if (value === null || value === undefined) return ''
  
  if (typeof value === 'boolean') {
    return value ? 'да' : 'нет'
  }
  
  if (Array.isArray(value)) {
    return value.join(', ')
  }
  
  return String(value)
})
</script>

<!-- As an AI Agent, I'm only working based on Clean Code Constitution. Applied rules: [2.1, 2.2, 3.1, 4.1, 5.3] -->
