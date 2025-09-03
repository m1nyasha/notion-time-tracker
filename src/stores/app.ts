import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Theme } from '@/types/app'

export const useAppStore = defineStore('app', () => {
  // State
  const theme = ref<Theme>('system')
  const initialized = ref(false)

  // Getters
  const isDarkTheme = computed(() => {
    if (theme.value === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return theme.value === 'dark'
  })
  const isLightTheme = computed(() => !isDarkTheme.value)

  // Actions
  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme
    updateDocumentTheme()
    saveThemeToStorage()
  }

  const toggleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'system']
    const currentIndex = themes.indexOf(theme.value)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }



  const initialize = () => {
    loadThemeFromStorage()
    updateDocumentTheme()
    initialized.value = true
  }

  // Private methods
  const updateDocumentTheme = () => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', isDarkTheme.value)
    }
  }

  const saveThemeToStorage = () => {
    try {
      localStorage.setItem('planme-theme', theme.value)
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error)
    }
  }

  const loadThemeFromStorage = () => {
    try {
      const savedTheme = localStorage.getItem('planme-theme') as Theme
      if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
        theme.value = savedTheme
      }
    } catch (error) {
      console.warn('Failed to load theme from localStorage:', error)
    }
  }

  // Initialize on store creation
  initialize()

  return {
    // State
    theme,
    initialized,

    // Getters
    isDarkTheme,
    isLightTheme,

    // Actions
    setTheme,
    toggleTheme,
    initialize,
  }
})

// As an AI Agent, I'm only working based on Clean Code Constitution. Applied rules: [2.4, 3.1, 4.2, 5.3]
