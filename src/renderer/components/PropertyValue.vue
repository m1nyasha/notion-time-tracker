<template>
  <div class="inline-flex items-center text-sm">
    <!-- Property Name -->
    <span class="text-gray-600 dark:text-gray-400 text-xs font-medium mr-1">
      {{ property.name }}:
    </span>
    
    <!-- Property Value -->
    <div class="text-gray-900 dark:text-white">
      <!-- Status -->
      <TaskStatus 
        v-if="property.type === 'status' && property.value.status"
        :status="property.value.status"
        class="text-xs"
      />
      
      <!-- Rich Text / Title -->
      <span v-else-if="isTextType && getTextValue()">
        {{ truncateText(getTextValue(), 50) }}
      </span>
      
      <!-- Number -->
      <span v-else-if="property.type === 'number' && property.value.number !== null">
        {{ formatNumber(property.value.number) }}
      </span>
      
      <!-- Select -->
      <span 
        v-else-if="property.type === 'select' && property.value.select"
        class="inline-flex items-center"
      >
        <StatusDot :status="{ name: property.value.select.name, color: property.value.select.color }" class="mr-1" />
        {{ property.value.select.name }}
      </span>
      
      <!-- Multi Select -->
      <div v-else-if="property.type === 'multi_select' && property.value.multi_select?.length > 0" class="inline-flex flex-wrap gap-1">
        <span
          v-for="option in property.value.multi_select.slice(0, 2)"
          :key="option.name"
          class="inline-flex items-center text-xs"
        >
          <StatusDot :status="{ name: option.name, color: option.color }" class="mr-1" />
          {{ option.name }}
        </span>
        <span v-if="property.value.multi_select.length > 2" class="text-xs text-gray-500 dark:text-gray-400">
          +{{ property.value.multi_select.length - 2 }}
        </span>
      </div>
      
      <!-- Date -->
      <span v-else-if="property.type === 'date' && property.value.date">
        {{ formatDate(property.value.date.start) }}
        <span v-if="property.value.date.end" class="text-gray-500 dark:text-gray-400">
          - {{ formatDate(property.value.date.end) }}
        </span>
      </span>
      
      <!-- Checkbox -->
      <span 
        v-else-if="property.type === 'checkbox'"
        class="inline-flex items-center"
        :class="property.value.checkbox ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'"
      >
        {{ property.value.checkbox ? '✓' : '✗' }}
        <span class="ml-1 text-xs">
          {{ property.value.checkbox ? 'Да' : 'Нет' }}
        </span>
      </span>
      
      <!-- People -->
      <div v-else-if="property.type === 'people' && property.value.people?.length > 0" class="inline-flex items-center space-x-1">
        <span 
          v-for="(person, index) in property.value.people.slice(0, 2)"
          :key="person.name || person.id"
          class="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-1.5 py-0.5 rounded"
        >
          {{ person.name || 'Безымянный' }}
        </span>
        <span v-if="property.value.people.length > 2" class="text-xs text-gray-500 dark:text-gray-400">
          +{{ property.value.people.length - 2 }}
        </span>
      </div>
      
      <!-- URL -->
      <a 
        v-else-if="property.type === 'url' && property.value.url"
        :href="property.value.url"
        target="_blank"
        rel="noopener noreferrer"
        class="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline text-xs inline-flex items-center"
      >
        {{ truncateText(property.value.url, 30) }}
        <svg class="w-3 h-3 ml-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
        </svg>
      </a>
      
      <!-- Email -->
      <a 
        v-else-if="property.type === 'email' && property.value.email"
        :href="`mailto:${property.value.email}`"
        class="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline text-xs inline-flex items-center"
      >
        {{ property.value.email }}
        <svg class="w-3 h-3 ml-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
        </svg>
      </a>
      
      <!-- Phone Number -->
      <a 
        v-else-if="property.type === 'phone_number' && property.value.phone_number"
        :href="`tel:${property.value.phone_number}`"
        class="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline text-xs inline-flex items-center"
      >
        {{ property.value.phone_number }}
        <svg class="w-3 h-3 ml-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
        </svg>
      </a>
      
      <!-- Empty state -->
      <span v-else class="text-gray-400 dark:text-gray-500 text-xs italic">
        —
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { NotionProperty } from '@/types/notion'
import StatusDot from '@/renderer/components/StatusDot.vue'
import TaskStatus from '@/renderer/components/TaskStatus.vue'

interface Props {
  property: NotionProperty
}

const props = defineProps<Props>()

// Computed
const isTextType = computed(() => 
  ['title', 'rich_text'].includes(props.property.type)
)

// Methods
const getTextValue = (): string => {
  const value = props.property.value
  if (value.type === 'title') return value.title || ''
  if (value.type === 'rich_text') return value.rich_text || ''
  return ''
}

const truncateText = (text: string, maxLength: number): string => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('ru-RU').format(num)
}

const formatDate = (dateStr: string): string => {
  try {
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date)
  } catch (error) {
    return dateStr
  }
}
</script>

<!-- As an AI Agent, I'm only working based on Clean Code Constitution. Applied rules: [2.1, 2.2, 3.1, 4.3, 5.3] -->