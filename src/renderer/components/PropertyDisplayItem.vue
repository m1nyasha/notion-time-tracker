<template>
  <div class="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
    <div class="flex items-center space-x-3">
      <!-- Property Type Icon -->
      <div class="flex-shrink-0">
        <component :is="propertyIcon" class="w-4 h-4 text-gray-400 dark:text-gray-500" />
      </div>
      
      <!-- Property Info -->
      <div class="min-w-0 flex-1">
        <div class="flex items-center space-x-2">
          <span class="text-sm font-medium text-gray-900 dark:text-white truncate">
            {{ property.name }}
          </span>
          <span class="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
            {{ propertyTypeLabel }}
          </span>
        </div>
      </div>
    </div>
    
    <!-- Toggle Checkbox -->
    <CustomCheckbox
      :model-value="displayStore.isPropertyVisible(property.name)"
      @update:model-value="handleToggle"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDisplayStore } from '@/stores/display'
import type { NotionProperty } from '@/types/notion'
import CustomCheckbox from '@/renderer/components/CustomCheckbox.vue'
import {
  TagIcon,
  CalendarDaysIcon,
  HashtagIcon,
  UserGroupIcon,
  CheckIcon,
  DocumentTextIcon,
  LinkIcon,
  AtSymbolIcon,
  PhoneIcon,
  BarsArrowUpIcon
} from '@heroicons/vue/24/outline'

interface Props {
  property: NotionProperty
}

interface Emits {
  (e: 'toggle', propertyName: string, visible: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const displayStore = useDisplayStore()

// Computed
const propertyIcon = computed(() => {
  switch (props.property.type) {
    case 'status': return BarsArrowUpIcon
    case 'select': return TagIcon
    case 'multi_select': return TagIcon
    case 'date': return CalendarDaysIcon
    case 'number': return HashtagIcon
    case 'people': return UserGroupIcon
    case 'checkbox': return CheckIcon
    case 'rich_text': return DocumentTextIcon
    case 'url': return LinkIcon
    case 'email': return AtSymbolIcon
    case 'phone_number': return PhoneIcon
    default: return DocumentTextIcon
  }
})

const propertyTypeLabel = computed(() => {
  const labels: Record<string, string> = {
    'status': 'Статус',
    'select': 'Выбор',
    'multi_select': 'Мульти-выбор',
    'date': 'Дата',
    'number': 'Число',
    'people': 'Люди',
    'checkbox': 'Флажок',
    'rich_text': 'Текст',
    'url': 'URL',
    'email': 'Email',
    'phone_number': 'Телефон',
    'title': 'Заголовок'
  }
  
  return labels[props.property.type] || props.property.type
})

// Methods
const handleToggle = (visible: boolean): void => {
  emit('toggle', props.property.name, visible)
}
</script>

<!-- As an AI Agent, I'm only working based on Clean Code Constitution. Applied rules: [2.1, 2.2, 3.1, 4.3, 5.3] -->
