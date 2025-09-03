<template>
  <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
    <!-- Header with Collapse Toggle -->
    <div class="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
      <div class="flex items-center space-x-3">
        <!-- Collapse Toggle -->
        <button
          @click="toggleCollapsed"
          class="flex items-center space-x-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 
                 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 
                 rounded-md transition-colors"
        >
          <component 
            :is="isCollapsed ? ChevronRightIcon : ChevronDownIcon" 
            class="w-4 h-4 transition-transform duration-200"
          />
          <span class="font-medium">Фильтры</span>
          <span v-if="filterCount > 0" class="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
            {{ filterCount }}
          </span>
        </button>

        <!-- Compact Filter Summary (when collapsed) -->
        <div v-if="isCollapsed && hasActiveFilters" class="flex items-center space-x-2">
          <span class="text-xs text-gray-500 dark:text-gray-400">|</span>
          <div class="flex space-x-1">
            <FilterChip
              v-for="filter in activeFilters.slice(0, 2)"
              :key="filter.id"
              :filter="filter"
              :compact="true"
              @toggle="toggleFilter"
              @edit="editFilter"
              @remove="removeFilter"
            />
            <span v-if="activeFilters.length > 2" class="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
              +{{ activeFilters.length - 2 }}
            </span>
          </div>
        </div>
      </div>

      <!-- Quick Actions (always visible) -->
      <div class="flex items-center space-x-2">
        <button
          v-if="hasActiveFilters"
          @click="clearAllFilters"
          class="text-xs text-red-600 dark:text-red-400 hover:text-red-800 
                 dark:hover:text-red-300 px-2 py-1 hover:bg-red-50 dark:hover:bg-red-900/20 
                 rounded transition-colors"
        >
          Очистить все
        </button>
        
        <SortingSelector 
          :sort-by="sortBy"
          :sort-direction="sortDirection"
          :available-properties="availableProperties"
          @update-sorting="handleSortingUpdate"
        />
      </div>
    </div>

    <!-- Collapsible Content -->
    <div 
      v-show="!isCollapsed"
      class="transition-all duration-300 ease-in-out overflow-hidden"
      :class="{ 'opacity-0 max-h-0': isCollapsed, 'opacity-100 max-h-screen': !isCollapsed }"
    >
      <div class="p-4">
        <div class="flex items-center justify-between mb-4">
          <!-- Left side - Filters -->
          <div class="flex items-center space-x-4">
        <!-- Add Filter Button -->
        <button
          @click="showAddFilter = !showAddFilter"
          class="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-100 dark:bg-blue-900 
                 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 
                 dark:hover:bg-blue-800 transition-colors"
        >
          <PlusIcon class="w-4 h-4" />
          <span>Добавить фильтр</span>
        </button>

        <!-- Active Filters Count -->
        <div v-if="filterCount > 0" class="flex items-center space-x-2">
          <span class="text-sm text-gray-600 dark:text-gray-400">
            Фильтров: {{ filterCount }}
          </span>
          <button
            @click="clearAllFilters"
            class="text-xs text-red-600 dark:text-red-400 hover:text-red-800 
                   dark:hover:text-red-300 transition-colors"
          >
            Очистить все
          </button>
        </div>

            <!-- Quick Presets -->
            <div v-if="presets.length > 0" class="flex items-center space-x-2">
              <span class="text-sm text-gray-500 dark:text-gray-400">|</span>
              <select
                @change="handlePresetChange"
                class="text-sm border-0 bg-transparent text-gray-600 dark:text-gray-400 
                       focus:ring-0 cursor-pointer"
              >
                <option value="">Пресеты</option>
                <option v-for="preset in presets" :key="preset.id" :value="preset.id">
                  {{ preset.name }}
                </option>
              </select>
            </div>
          </div>

          <!-- Right side - Actions -->
          <div class="flex items-center space-x-2">
            <button
              @click="showSavePreset = !showSavePreset"
              :disabled="filterCount === 0"
              class="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 
                     dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors"
              title="Сохранить текущие фильтры как пресет"
            >
              <BookmarkIcon class="w-4 h-4" />
            </button>
          </div>
        </div>

    <!-- Add Filter Form -->
    <div v-if="showAddFilter" class="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <FilterEditor
        :available-properties="availableProperties"
        @save="handleFilterSave"
        @cancel="showAddFilter = false"
      />
    </div>

    <!-- Save Preset Form -->
    <div v-if="showSavePreset" class="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div class="flex items-center space-x-3">
        <input
          v-model="presetName"
          placeholder="Название пресета"
          class="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 
                 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                 focus:outline-none focus:ring-2 focus:ring-blue-500"
          @keyup.enter="handlePresetSave"
        />
        <button
          @click="handlePresetSave"
          :disabled="!presetName.trim()"
          class="px-3 py-2 text-sm bg-green-600 hover:bg-green-700 disabled:bg-gray-400
                 text-white rounded-md transition-colors disabled:cursor-not-allowed"
        >
          Сохранить
        </button>
        <button
          @click="showSavePreset = false; presetName = ''"
          class="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600
                 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 
                 dark:hover:bg-gray-600 transition-colors"
        >
          Отмена
        </button>
      </div>
    </div>

        <!-- Quick Status Filter -->
        <div v-if="availableProperties.some(p => p.type === 'status')" class="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <StatusFilter 
            :tasks="allTasks"
            :active-status-filter="statusFilter"
            @status-filter-change="handleStatusFilterChange"
          />
        </div>

        <!-- Active Filters -->
        <div v-if="activeFilters.length > 0" class="mt-4">
          <div class="flex flex-wrap gap-2">
            <FilterChip
              v-for="filter in activeFilters"
              :key="filter.id"
              :filter="filter"
              @toggle="toggleFilter"
              @edit="editFilter"
              @remove="removeFilter"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { PlusIcon, BookmarkIcon, ChevronDownIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import { useFiltersStore } from '@/stores/filters'
import type { NotionProperty, NotionTask } from '@/types/notion'
import type { TaskFilter } from '@/types/filters'
import FilterEditor from '@/renderer/components/FilterEditor.vue'
import FilterChip from '@/renderer/components/FilterChip.vue'
import SortingSelector from '@/renderer/components/SortingSelector.vue'
import StatusFilter from '@/renderer/components/StatusFilter.vue'

interface Props {
  availableProperties: NotionProperty[]
  allTasks: NotionTask[]
}

const props = defineProps<Props>()

const filtersStore = useFiltersStore()

// Local state
const showAddFilter = ref(false)
const showSavePreset = ref(false)
const presetName = ref('')
const statusFilter = ref<string | null | undefined>(undefined)
const isCollapsed = ref(false)

// Computed
const activeFilters = computed(() => filtersStore.activeFilters)
const presets = computed(() => filtersStore.presets)
const filterCount = computed(() => filtersStore.filterCount)
const sortBy = computed(() => filtersStore.sortBy)
const sortDirection = computed(() => filtersStore.sortDirection)
const hasActiveFilters = computed(() => filtersStore.hasActiveFilters)

// Methods
const handleFilterSave = (filter: Omit<TaskFilter, 'id'>) => {
  filtersStore.addFilter(filter)
  showAddFilter.value = false
}

const toggleFilter = (filterId: string) => {
  filtersStore.toggleFilter(filterId)
}

const editFilter = (filterId: string) => {
  // TODO: Implement edit functionality
  console.log('Edit filter:', filterId)
}

const removeFilter = (filterId: string) => {
  filtersStore.removeFilter(filterId)
}

const clearAllFilters = () => {
  filtersStore.clearAllFilters()
}

const handlePresetChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  if (target.value) {
    filtersStore.loadPreset(target.value)
    target.value = '' // Reset selection
  }
}

const handlePresetSave = () => {
  if (presetName.value.trim()) {
    filtersStore.savePreset(presetName.value.trim())
    showSavePreset.value = false
    presetName.value = ''
  }
}

const handleSortingUpdate = (property: string | null, direction: 'asc' | 'desc') => {
  filtersStore.setSorting(property, direction)
}

const handleStatusFilterChange = (status: string | null | undefined) => {
  statusFilter.value = status
  
  // Remove existing status filters
  const statusFilters = filtersStore.activeFilters.filter(f => 
    f.propertyType === 'status'
  )
  statusFilters.forEach(filter => {
    filtersStore.removeFilter(filter.id)
  })
  
  // Add new status filter if needed
  if (status !== undefined) {
    const statusProperty = props.availableProperties.find(p => p.type === 'status')
    if (statusProperty) {
      filtersStore.addFilter({
        propertyName: statusProperty.name,
        propertyType: 'status',
        operator: status === null ? 'is_empty' : 'equals',
        value: status,
        isActive: true
      })
    }
  }
}

const toggleCollapsed = () => {
  isCollapsed.value = !isCollapsed.value
  saveCollapsedState()
}

const saveCollapsedState = () => {
  try {
    localStorage.setItem('filters-collapsed', JSON.stringify(isCollapsed.value))
  } catch (error) {
    console.warn('Failed to save collapsed state:', error)
  }
}

const loadCollapsedState = () => {
  try {
    const saved = localStorage.getItem('filters-collapsed')
    if (saved !== null) {
      isCollapsed.value = JSON.parse(saved)
    }
  } catch (error) {
    console.warn('Failed to load collapsed state:', error)
  }
}

// Lifecycle
onMounted(() => {
  loadCollapsedState()
})
</script>

<!-- As an AI Agent, I'm only working based on Clean Code Constitution. Applied rules: [2.1, 2.2, 3.1, 4.1, 5.3] -->
