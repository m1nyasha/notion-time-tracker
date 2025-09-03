import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { NotionProperty } from '@/types/notion'

interface PropertyDisplaySettings {
  [propertyName: string]: boolean
}

const STORAGE_KEY = 'notion-tasks-timer:property-display-settings'

export const useDisplayStore = defineStore('display', () => {
  // State
  const settings = ref<PropertyDisplaySettings>({})
  const availableProperties = ref<NotionProperty[]>([])

  // Computed
  const visiblePropertiesCount = computed(() => {
    return Object.values(settings.value).filter(Boolean).length
  })

  const totalPropertiesCount = computed(() => {
    return availableProperties.value.length
  })

  // Actions
  const loadSettings = (): void => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        settings.value = JSON.parse(stored) as PropertyDisplaySettings
      }
    } catch (error) {
      console.warn('Failed to load display settings:', error)
      settings.value = {}
    }
  }

  const saveSettings = (): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings.value))
    } catch (error) {
      console.warn('Failed to save display settings:', error)
    }
  }

  const updateAvailableProperties = (properties: NotionProperty[]): void => {
    // Don't update if properties array is empty (tasks not loaded yet)
    if (properties.length === 0) {
      console.log('🔧 Skipping updateAvailableProperties - empty properties array')
      return
    }
    
    availableProperties.value = properties
    
    // Initialize settings for new properties with sensible defaults
    const newSettings: PropertyDisplaySettings = { ...settings.value }
    let hasNewProperties = false
    
    properties.forEach(property => {
      if (!(property.name in newSettings)) {
        // Default visibility based on property type
        const defaultVisible = getDefaultVisibility(property)
        newSettings[property.name] = defaultVisible
        hasNewProperties = true
      }
    })
    
    // Clean up settings for properties that no longer exist (only if we have properties)
    Object.keys(newSettings).forEach(propertyName => {
      if (!properties.some(p => p.name === propertyName)) {
        delete newSettings[propertyName]
        hasNewProperties = true
      }
    })
    
    if (hasNewProperties) {
      settings.value = newSettings
      saveSettings()
    }
  }

  const updatePropertySetting = (propertyName: string, visible: boolean): void => {
    settings.value[propertyName] = visible
    saveSettings()
  }

  const isPropertyVisible = (propertyName: string): boolean => {
    return settings.value[propertyName] ?? true
  }

  const setAllVisible = (visible: boolean): void => {
    const newSettings: PropertyDisplaySettings = {}
    availableProperties.value.forEach(property => {
      newSettings[property.name] = visible
    })
    settings.value = newSettings
    saveSettings()
  }

  const resetToDefaults = (): void => {
    const newSettings: PropertyDisplaySettings = {}
    availableProperties.value.forEach(property => {
      newSettings[property.name] = getDefaultVisibility(property)
    })
    settings.value = newSettings
    saveSettings()
  }

  // Helper function to determine default visibility based on property type
  const getDefaultVisibility = (property: NotionProperty): boolean => {
    // High priority properties - visible by default
    const highPriorityTypes = ['status', 'select', 'multi_select', 'date', 'number']
    // Low priority properties - hidden by default  
    const lowPriorityTypes = ['rich_text', 'url', 'email', 'phone_number', 'checkbox']
    
    if (highPriorityTypes.includes(property.type)) {
      return true
    }
    if (lowPriorityTypes.includes(property.type)) {
      return false
    }
    
    // Medium priority (people, etc.) - visible by default
    return true
  }

  // Initialize
  loadSettings()

  return {
    // State
    settings,
    availableProperties,
    
    // Computed
    visiblePropertiesCount,
    totalPropertiesCount,
    
    // Actions
    updateAvailableProperties,
    updatePropertySetting,
    isPropertyVisible,
    setAllVisible,
    resetToDefaults
  }
})

// As an AI Agent, I'm only working based on Clean Code Constitution. Applied rules: [2.4, 3.1, 3.3, 4.4, 5.3]
