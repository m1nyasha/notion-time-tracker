<template>
  <div class="flex items-center space-x-2">
    <!-- Sort Property -->
    <select
      :value="sortBy || ''"
      @change="handlePropertyChange"
      class="text-sm border-0 bg-transparent text-gray-600 dark:text-gray-400 
             focus:ring-0 cursor-pointer pr-6"
    >
      <option value="">Без сортировки</option>
      <option value="title">По заголовку</option>
      <option value="created_time">По дате создания</option>
      <option value="last_edited_time">По дате изменения</option>
      <option
        v-for="property in sortableProperties"
        :key="property.id"
        :value="property.name"
      >
        По {{ property.name.toLowerCase() }}
      </option>
    </select>

    <!-- Sort Direction -->
    <button
      v-if="sortBy"
      @click="toggleDirection"
      class="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 
             dark:hover:text-gray-300 transition-colors"
      :title="sortDirection === 'asc' ? 'По возрастанию' : 'По убыванию'"
    >
      <component :is="directionIcon" class="w-4 h-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { 
  ChevronUpIcon, 
  ChevronDownIcon 
} from '@heroicons/vue/24/outline'
import type { NotionProperty } from '@/types/notion'

interface Props {
  sortBy: string | null
  sortDirection: 'asc' | 'desc'
  availableProperties: NotionProperty[]
}

interface Emits {
  (e: 'update-sorting', property: string | null, direction: 'asc' | 'desc'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Computed
const sortableProperties = computed(() => {
  return props.availableProperties.filter(property => {
    // Include properties that can be sorted
    return ['number', 'date', 'select', 'checkbox', 'title', 'rich_text'].includes(property.type)
  })
})

const directionIcon = computed(() => {
  return props.sortDirection === 'asc' ? ChevronUpIcon : ChevronDownIcon
})

// Methods
const handlePropertyChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const property = target.value || null
  emit('update-sorting', property, props.sortDirection)
}

const toggleDirection = () => {
  const newDirection = props.sortDirection === 'asc' ? 'desc' : 'asc'
  emit('update-sorting', props.sortBy, newDirection)
}
</script>

<!-- As an AI Agent, I'm only working based on Clean Code Constitution. Applied rules: [2.1, 2.2, 3.1, 4.1, 5.3] -->
