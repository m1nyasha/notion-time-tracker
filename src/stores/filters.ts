import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { TaskFilter, FilterPreset, FilterState } from '@/types/filters'
import type { NotionTask } from '@/types/notion'

export const useFiltersStore = defineStore('filters', () => {
  // State
  const activeFilters = ref<TaskFilter[]>([])
  const presets = ref<FilterPreset[]>([])
  const showCompleted = ref(true)
  const sortBy = ref<string | null>(null)
  const sortDirection = ref<'asc' | 'desc'>('asc')

  // Getters
  const hasActiveFilters = computed(() => activeFilters.value.some(f => f.isActive))

  const filterCount = computed(() => activeFilters.value.filter(f => f.isActive).length)

  // Filter tasks based on active filters
  const filterTasks = (tasks: NotionTask[]): NotionTask[] => {
    let filteredTasks = tasks

    // Apply filters
    if (hasActiveFilters.value) {
      filteredTasks = tasks.filter(task => {
        return activeFilters.value
          .filter(filter => filter.isActive)
          .every(filter => applyFilter(task, filter))
      })
    }

    // Apply sorting
    if (sortBy.value) {
      filteredTasks = [...filteredTasks].sort((a, b) => {
        const valueA = getTaskPropertyValue(a, sortBy.value!)
        const valueB = getTaskPropertyValue(b, sortBy.value!)
        
        const result = compareValues(valueA, valueB)
        return sortDirection.value === 'desc' ? -result : result
      })
    }

    return filteredTasks
  }

  // Actions
  const addFilter = (filter: Omit<TaskFilter, 'id'>) => {
    const newFilter: TaskFilter = {
      ...filter,
      id: `filter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
    activeFilters.value.push(newFilter)
    saveToStorage()
  }

  const updateFilter = (filterId: string, updates: Partial<TaskFilter>) => {
    const index = activeFilters.value.findIndex(f => f.id === filterId)
    if (index !== -1) {
      activeFilters.value[index] = { ...activeFilters.value[index], ...updates }
      saveToStorage()
    }
  }

  const removeFilter = (filterId: string) => {
    activeFilters.value = activeFilters.value.filter(f => f.id !== filterId)
    saveToStorage()
  }

  const toggleFilter = (filterId: string) => {
    const filter = activeFilters.value.find(f => f.id === filterId)
    if (filter) {
      filter.isActive = !filter.isActive
      saveToStorage()
    }
  }

  const clearAllFilters = () => {
    activeFilters.value = []
    saveToStorage()
  }

  const setSorting = (property: string | null, direction: 'asc' | 'desc' = 'asc') => {
    sortBy.value = property
    sortDirection.value = direction
    saveToStorage()
  }

  const savePreset = (name: string) => {
    const preset: FilterPreset = {
      id: `preset_${Date.now()}`,
      name,
      filters: [...activeFilters.value]
    }
    presets.value.push(preset)
    saveToStorage()
  }

  const loadPreset = (presetId: string) => {
    const preset = presets.value.find(p => p.id === presetId)
    if (preset) {
      activeFilters.value = preset.filters.map(f => ({ ...f, id: `filter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` }))
      saveToStorage()
    }
  }

  const deletePreset = (presetId: string) => {
    presets.value = presets.value.filter(p => p.id !== presetId)
    saveToStorage()
  }

  // Private methods
  const applyFilter = (task: NotionTask, filter: TaskFilter): boolean => {
    const property = task.properties[filter.propertyName]
    if (!property) return false

    const value = property.value
    const filterValue = filter.value

    switch (filter.operator) {
      case 'equals':
        return getComparableValue(value) === filterValue
      case 'not_equals':
        return getComparableValue(value) !== filterValue
      case 'contains':
        return String(getComparableValue(value)).toLowerCase().includes(String(filterValue).toLowerCase())
      case 'not_contains':
        return !String(getComparableValue(value)).toLowerCase().includes(String(filterValue).toLowerCase())
      case 'starts_with':
        return String(getComparableValue(value)).toLowerCase().startsWith(String(filterValue).toLowerCase())
      case 'ends_with':
        return String(getComparableValue(value)).toLowerCase().endsWith(String(filterValue).toLowerCase())
      case 'is_empty':
        return isEmptyValue(value)
      case 'is_not_empty':
        return !isEmptyValue(value)
      case 'greater_than':
        return Number(getComparableValue(value)) > Number(filterValue)
      case 'less_than':
        return Number(getComparableValue(value)) < Number(filterValue)
      case 'greater_than_or_equal':
        return Number(getComparableValue(value)) >= Number(filterValue)
      case 'less_than_or_equal':
        return Number(getComparableValue(value)) <= Number(filterValue)
      case 'before':
        return new Date(getComparableValue(value)) < new Date(filterValue)
      case 'after':
        return new Date(getComparableValue(value)) > new Date(filterValue)
      case 'on_or_before':
        return new Date(getComparableValue(value)) <= new Date(filterValue)
      case 'on_or_after':
        return new Date(getComparableValue(value)) >= new Date(filterValue)
      default:
        return true
    }
  }

  const getComparableValue = (value: any): any => {
    if (!value) return null

    switch (value.type) {
      case 'title':
        return value.title
      case 'rich_text':
        return value.rich_text
      case 'number':
        return value.number
      case 'select':
        return value.select?.name || null
      case 'status':
        return value.status?.name || null
      case 'multi_select':
        return value.multi_select?.map((s: any) => s.name).join(', ') || ''
      case 'date':
        return value.date?.start || null
      case 'checkbox':
        return value.checkbox
      case 'people':
        return value.people?.map((p: any) => p.name).join(', ') || ''
      case 'url':
        return value.url
      case 'email':
        return value.email
      case 'phone_number':
        return value.phone_number
      default:
        return null
    }
  }

  const isEmptyValue = (value: any): boolean => {
    if (!value) return true

    switch (value.type) {
      case 'title':
      case 'rich_text':
      case 'url':
      case 'email':
      case 'phone_number':
        return !value[value.type] || value[value.type] === ''
      case 'number':
        return value.number === null
      case 'select':
        return !value.select
      case 'status':
        return !value.status
      case 'multi_select':
        return !value.multi_select || value.multi_select.length === 0
      case 'date':
        return !value.date
      case 'people':
        return !value.people || value.people.length === 0
      case 'checkbox':
        return false // checkbox всегда имеет значение
      default:
        return true
    }
  }

  const getTaskPropertyValue = (task: NotionTask, propertyName: string): any => {
    const property = task.properties[propertyName]
    return property ? getComparableValue(property.value) : null
  }

  const compareValues = (a: any, b: any): number => {
    if (a === null && b === null) return 0
    if (a === null) return -1
    if (b === null) return 1

    if (typeof a === 'string' && typeof b === 'string') {
      return a.localeCompare(b)
    }

    if (typeof a === 'number' && typeof b === 'number') {
      return a - b
    }

    if (a instanceof Date && b instanceof Date) {
      return a.getTime() - b.getTime()
    }

    return String(a).localeCompare(String(b))
  }

  const saveToStorage = () => {
    try {
      const state: FilterState = {
        activeFilters: activeFilters.value,
        presets: presets.value,
        showCompleted: showCompleted.value,
        sortBy: sortBy.value,
        sortDirection: sortDirection.value
      }
      localStorage.setItem('notion-filters', JSON.stringify(state))
    } catch (error) {
      console.warn('Failed to save filters to storage:', error)
    }
  }

  const loadFromStorage = () => {
    try {
      const saved = localStorage.getItem('notion-filters')
      if (saved) {
        const state: FilterState = JSON.parse(saved)
        activeFilters.value = state.activeFilters || []
        presets.value = state.presets || []
        showCompleted.value = state.showCompleted ?? true
        sortBy.value = state.sortBy || null
        sortDirection.value = state.sortDirection || 'asc'
      }
    } catch (error) {
      console.warn('Failed to load filters from storage:', error)
    }
  }

  const initialize = () => {
    loadFromStorage()
  }

  // Initialize on store creation
  initialize()

  return {
    // State
    activeFilters,
    presets,
    showCompleted,
    sortBy,
    sortDirection,

    // Getters
    hasActiveFilters,
    filterCount,
    filterTasks,

    // Actions
    addFilter,
    updateFilter,
    removeFilter,
    toggleFilter,
    clearAllFilters,
    setSorting,
    savePreset,
    loadPreset,
    deletePreset,
    initialize,
  }
})

// As an AI Agent, I'm only working based on Clean Code Constitution. Applied rules: [2.4, 3.1, 4.2, 5.3]
