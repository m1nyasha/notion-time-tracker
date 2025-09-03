<template>
  <div v-if="visibleProperties.length > 0" class="mt-3 space-y-2">
    <!-- Status Property -->
    <div v-if="statusProperty" class="flex items-center space-x-2">
      <TaskStatus :status="statusProperty.value.status" />
    </div>

    <!-- Other Properties (show all visible ones based on settings) -->
    <div v-if="otherProperties.length > 0" class="flex flex-wrap gap-2 text-sm">
      <PropertyValue
        v-for="property in otherProperties"
        :key="property.id"
        :property="property"
        class="bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { NotionProperty } from '@/types/notion'
import { useDisplayStore } from '@/stores/display'
import TaskStatus from '@/renderer/components/TaskStatus.vue'
import PropertyValue from '@/renderer/components/PropertyValue.vue'

const displayStore = useDisplayStore()

interface Props {
  properties: Record<string, NotionProperty>
}

const props = defineProps<Props>()

// Computed
const allProperties = computed(() => Object.values(props.properties))

const statusProperty = computed(() => {
  const prop = allProperties.value.find(p => p.type === 'status')
  return prop && displayStore.isPropertyVisible(prop.name) ? prop : null
})

const otherProperties = computed(() => 
  allProperties.value.filter(p => 
    p.type !== 'title' && 
    p.type !== 'status' && 
    !isEmptyProperty(p) &&
    displayStore.isPropertyVisible(p.name)
  )
)

const visibleProperties = computed(() => [
  ...(statusProperty.value ? [statusProperty.value] : []),
  ...otherProperties.value
])

// Methods
const isEmptyProperty = (property: NotionProperty): boolean => {
  const value = property.value
  
  switch (value.type) {
    case 'rich_text':
    case 'url':
    case 'email':
    case 'phone_number':
      return !value[value.type] || value[value.type] === ''
    case 'number':
      return value.number === null
    case 'select':
      return !value.select
    case 'multi_select':
      return !value.multi_select || value.multi_select.length === 0
    case 'date':
      return !value.date
    case 'people':
      return !value.people || value.people.length === 0
    case 'checkbox':
      return false // checkbox always has a value
    default:
      return true
  }
}
</script>

<!-- As an AI Agent, I'm only working based on Clean Code Constitution. Applied rules: [2.1, 2.2, 3.1, 4.1, 5.3] -->
