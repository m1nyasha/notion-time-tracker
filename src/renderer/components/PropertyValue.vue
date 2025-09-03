<template>
  <div class="inline-flex items-center text-sm">
    <!-- Property Name -->
    <span class="text-gray-600 dark:text-gray-400 text-xs font-medium mr-1">
      {{ property.name }}:
    </span>
    
    <!-- Property Value -->
    <span class="text-gray-900 dark:text-white">
      <!-- Rich Text / Title -->
      <span v-if="isTextType">
        {{ getTextValue() }}
      </span>
      
      <!-- Number -->
      <span v-else-if="property.type === 'number'">
        {{ formatNumber(property.value.number) }}
      </span>
      
      <!-- Select -->
      <span 
        v-else-if="property.type === 'select' && property.value.select"
        class="inline-flex items-center"
      >
        <StatusDot :color="property.value.select.color" class="mr-1" />
        {{ property.value.select.name }}
      </span>
      
      <!-- Multi Select -->
      <div v-else-if="property.type === 'multi_select'" class="inline-flex flex-wrap gap-1">
        <span
          v-for="option in property.value.multi_select.slice(0, 2)"
          :key="option.name"
          class="inline-flex items-center text-xs"
        >
          <StatusDot :color="option.color" class="mr-1" />
          {{ option.name }}
        </span>
        <span v-if="property.value.multi_select.length > 2" class="text-xs text-gray-500">
          +{{ property.value.multi_select.length - 2 }}
        </span>
      </div>
      
      <!-- Date -->
      <span v-else-if="property.type === 'date' && property.value.date">
        {{ formatDate(property.value.date.start) }}
        <span v-if="property.value.date.end">
          - {{ formatDate(property.value.date.end) }}
        </span>
      </span>
      
      <!-- Checkbox -->
      <span v-else-if="property.type === 'checkbox'">
        {{ property.value.checkbox ? '✓' : '✗' }}
      </span>
      
      <!-- People -->
      <span v-else-if="property.type === 'people'" class="inline-flex items-center space-x-1">
        <span 
          v-for="person in property.value.people.slice(0, 2)"
          :key="person.name"
          class="text-xs"
        >
          {{ person.name }}
        </span>
        <span v-if="property.value.people.length > 2" class="text-xs text-gray-500">
          +{{ property.value.people.length - 2 }}
        </span>
      </span>
      
      <!-- URL / Email / Phone -->
      <span v-else-if="isContactType">
        {{ getContactValue() }}
      </span>
      
      <!-- Fallback -->
      <span v-else class="text-gray-500 dark:text-gray-400 text-xs">
        —
      </span>
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { NotionProperty } from '@/types/notion'
import StatusDot from '@/renderer/components/StatusDot.vue'

interface Props {
  property: NotionProperty
}

const props = defineProps<Props>()

// Computed
const isTextType = computed(() => 
  ['title', 'rich_text'].includes(props.property.type)
)

const isContactType = computed(() => 
  ['url', 'email', 'phone_number'].includes(props.property.type)
)

// Methods
const getTextValue = (): string => {
  const value = props.property.value
  if (value.type === 'title') return value.title
  if (value.type === 'rich_text') return value.rich_text
  return ''
}

const getContactValue = (): string => {
  const value = props.property.value
  if (value.type === 'url') return value.url || ''
  if (value.type === 'email') return value.email || ''
  if (value.type === 'phone_number') return value.phone_number || ''
  return ''
}

const formatNumber = (num: number | null): string => {
  if (num === null) return '—'
  return new Intl.NumberFormat('ru-RU').format(num)
}

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date)
}
</script>

<!-- As an AI Agent, I'm only working based on Clean Code Constitution. Applied rules: [2.1, 2.2, 3.1, 4.1, 5.3] -->
