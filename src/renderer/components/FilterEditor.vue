<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Property Selection -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Свойство
        </label>
        <select
          v-model="selectedProperty"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Выберите свойство</option>
          <option
            v-for="property in availableProperties"
            :key="property.id"
            :value="property"
          >
            {{ property.name }} ({{ getPropertyTypeLabel(property.type) }})
          </option>
        </select>
      </div>

      <!-- Operator Selection -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Условие
        </label>
        <select
          v-model="selectedOperator"
          :disabled="!selectedProperty"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                 focus:outline-none focus:ring-2 focus:ring-blue-500
                 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
        >
          <option value="">Выберите условие</option>
          <option
            v-for="operator in availableOperators"
            :key="operator"
            :value="operator"
          >
            {{ OPERATOR_LABELS[operator] }}
          </option>
        </select>
      </div>

      <!-- Value Input -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Значение
        </label>
        <FilterValueInput
          v-model="filterValue"
          :property-type="selectedProperty?.type"
          :operator="selectedOperator"
          :disabled="!selectedProperty || needsNoValue"
          :available-options="getSelectOptions()"
        />
      </div>
    </div>

    <!-- Actions -->
    <div class="flex items-center justify-end space-x-3">
      <button
        @click="$emit('cancel')"
        class="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600
               text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 
               dark:hover:bg-gray-600 transition-colors"
      >
        Отмена
      </button>
      
      <button
        @click="handleSave"
        :disabled="!isValid"
        class="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400
               text-white rounded-md transition-colors disabled:cursor-not-allowed"
      >
        Добавить фильтр
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { NotionProperty } from '@/types/notion'
import type { TaskFilter, FilterOperator } from '@/types/filters'
import { FILTER_OPERATORS, OPERATOR_LABELS } from '@/types/filters'
import FilterValueInput from '@/renderer/components/FilterValueInput.vue'

interface Props {
  availableProperties: NotionProperty[]
  editFilter?: TaskFilter // Для редактирования существующего фильтра
}

interface Emits {
  (e: 'save', filter: Omit<TaskFilter, 'id'>): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Local state
const selectedProperty = ref<NotionProperty | null>(null)
const selectedOperator = ref<FilterOperator | ''>('')
const filterValue = ref<any>(null)

// Computed
const availableOperators = computed(() => {
  if (!selectedProperty.value) return []
  const config = FILTER_OPERATORS[selectedProperty.value.type]
  return config?.operators || []
})

const needsNoValue = computed(() => {
  return selectedOperator.value === 'is_empty' || selectedOperator.value === 'is_not_empty'
})

const isValid = computed(() => {
  return selectedProperty.value && 
         selectedOperator.value && 
         (needsNoValue.value || filterValue.value !== null && filterValue.value !== '')
})

// Methods
const getPropertyTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    title: 'Заголовок',
    rich_text: 'Текст',
    number: 'Число',
    select: 'Выбор',
    multi_select: 'Множественный выбор',
    date: 'Дата',
    people: 'Люди',
    checkbox: 'Флажок',
    url: 'URL',
    email: 'Email',
    phone_number: 'Телефон'
  }
  return labels[type] || type
}

const getSelectOptions = () => {
  if (!selectedProperty.value) return []
  
  // For select properties, we would need to get options from the database schema
  // For now, return empty array
  return []
}

const handleSave = () => {
  if (!isValid.value || !selectedProperty.value || !selectedOperator.value) return

  const filter: Omit<TaskFilter, 'id'> = {
    propertyName: selectedProperty.value.name,
    propertyType: selectedProperty.value.type,
    operator: selectedOperator.value as FilterOperator,
    value: needsNoValue.value ? null : filterValue.value,
    isActive: true
  }

  emit('save', filter)
  resetForm()
}

const resetForm = () => {
  selectedProperty.value = null
  selectedOperator.value = ''
  filterValue.value = null
}

// Watch for property changes to reset operator and value
watch(selectedProperty, () => {
  selectedOperator.value = ''
  filterValue.value = null
})

// Watch for operator changes to reset value if needed
watch(selectedOperator, () => {
  if (needsNoValue.value) {
    filterValue.value = null
  }
})

// Initialize with edit data if provided
if (props.editFilter) {
  // Find the property by name
  const property = props.availableProperties.find(p => p.name === props.editFilter!.propertyName)
  if (property) {
    selectedProperty.value = property
    selectedOperator.value = props.editFilter.operator
    filterValue.value = props.editFilter.value
  }
}
</script>

<!-- As an AI Agent, I'm only working based on Clean Code Constitution. Applied rules: [2.1, 2.2, 3.1, 4.1, 5.3] -->
