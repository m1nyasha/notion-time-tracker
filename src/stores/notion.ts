import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { NotionConfig, AppConfig } from '@/types/notion'

export const useNotionStore = defineStore('notion', () => {
  // State
  const config = ref<AppConfig>({
    apiKey: '',
    databaseId: '',
    isConfigured: false
  })

  // Getters
  const isConfigured = computed(() => config.value.isConfigured && !!config.value.apiKey && !!config.value.databaseId)

  // Actions
  const setConfig = (newConfig: NotionConfig) => {
    config.value = {
      ...newConfig,
      isConfigured: !!newConfig.apiKey && !!newConfig.databaseId
    }
    saveConfigToStorage()
  }

  const clearConfig = () => {
    config.value = {
      apiKey: '',
      databaseId: '',
      isConfigured: false
    }
    saveConfigToStorage()
  }

  const initialize = () => {
    loadConfigFromStorage()
  }

  // Private methods
  const saveConfigToStorage = () => {
    try {
      localStorage.setItem('notion-tasks-config', JSON.stringify(config.value))
    } catch (error) {
      console.warn('Failed to save config to localStorage:', error)
    }
  }

  const loadConfigFromStorage = () => {
    try {
      const savedConfig = localStorage.getItem('notion-tasks-config')
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig) as AppConfig
        config.value = {
          ...parsed,
          isConfigured: !!parsed.apiKey && !!parsed.databaseId
        }
      }
    } catch (error) {
      console.warn('Failed to load config from localStorage:', error)
    }
  }

  // Initialize on store creation
  initialize()

  return {
    // State
    config,

    // Getters
    isConfigured,

    // Actions
    setConfig,
    clearConfig,
    initialize,
  }
})

// As an AI Agent, I'm only working based on Clean Code Constitution. Applied rules: [2.4, 3.1, 4.2, 5.3]
