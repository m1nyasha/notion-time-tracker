export type FilterOperator = 
  | 'equals'
  | 'not_equals' 
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'is_empty'
  | 'is_not_empty'
  | 'greater_than'
  | 'less_than'
  | 'greater_than_or_equal'
  | 'less_than_or_equal'
  | 'before'
  | 'after'
  | 'on_or_before'
  | 'on_or_after'

export interface TaskFilter {
  id: string
  propertyName: string
  propertyType: string
  operator: FilterOperator
  value: any
  isActive: boolean
}

export interface FilterPreset {
  id: string
  name: string
  filters: TaskFilter[]
  isDefault?: boolean
}

export interface FilterState {
  activeFilters: TaskFilter[]
  presets: FilterPreset[]
  showCompleted: boolean
  sortBy: string | null
  sortDirection: 'asc' | 'desc'
}

// Filter options for different property types
export const FILTER_OPERATORS: Record<string, { label: string; operators: FilterOperator[] }> = {
  title: {
    label: 'Заголовок',
    operators: ['contains', 'not_contains', 'starts_with', 'ends_with', 'is_empty', 'is_not_empty']
  },
  rich_text: {
    label: 'Текст', 
    operators: ['contains', 'not_contains', 'starts_with', 'ends_with', 'is_empty', 'is_not_empty']
  },
  number: {
    label: 'Число',
    operators: ['equals', 'not_equals', 'greater_than', 'less_than', 'greater_than_or_equal', 'less_than_or_equal', 'is_empty', 'is_not_empty']
  },
  select: {
    label: 'Выбор',
    operators: ['equals', 'not_equals', 'is_empty', 'is_not_empty']
  },
  status: {
    label: 'Статус',
    operators: ['equals', 'not_equals', 'is_empty', 'is_not_empty']
  },
  multi_select: {
    label: 'Множественный выбор',
    operators: ['contains', 'not_contains', 'is_empty', 'is_not_empty']
  },
  date: {
    label: 'Дата',
    operators: ['equals', 'before', 'after', 'on_or_before', 'on_or_after', 'is_empty', 'is_not_empty']
  },
  checkbox: {
    label: 'Флажок',
    operators: ['equals', 'not_equals']
  },
  people: {
    label: 'Люди',
    operators: ['contains', 'not_contains', 'is_empty', 'is_not_empty']
  }
}

export const OPERATOR_LABELS: Record<FilterOperator, string> = {
  equals: 'равно',
  not_equals: 'не равно',
  contains: 'содержит',
  not_contains: 'не содержит', 
  starts_with: 'начинается с',
  ends_with: 'заканчивается на',
  is_empty: 'пустое',
  is_not_empty: 'не пустое',
  greater_than: 'больше',
  less_than: 'меньше',
  greater_than_or_equal: 'больше или равно',
  less_than_or_equal: 'меньше или равно',
  before: 'до',
  after: 'после',
  on_or_before: 'до или в',
  on_or_after: 'после или в'
}

// As an AI Agent, I'm only working based on Clean Code Constitution. Applied rules: [3.1, 3.3, 5.3]
