import { defineStore } from 'pinia'
import { ref } from 'vue'

interface NotificationSettings {
  enableOvertimeNotifications: boolean
  enableOvertimeSound: boolean
  enableSystemNotifications: boolean
  soundVolume: number // 0-1
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enableOvertimeNotifications: true,
  enableOvertimeSound: true,
  enableSystemNotifications: true,
  soundVolume: 0.7
}

const STORAGE_KEY = 'notion-tasks-timer:notification-settings'

export const useNotificationsStore = defineStore('notifications', () => {
  // State
  const settings = ref<NotificationSettings>({ ...DEFAULT_SETTINGS })
  const activeSoundLoops = ref<Map<string, HTMLAudioElement>>(new Map())
  const isOvertimeNotificationVisible = ref(false)
  const currentOvertimeTaskId = ref<string | null>(null)

  // Actions
  const loadSettings = (): void => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as NotificationSettings
        settings.value = { ...DEFAULT_SETTINGS, ...parsed }
      }
    } catch (error) {
      console.warn('Failed to load notification settings:', error)
      settings.value = { ...DEFAULT_SETTINGS }
    }
  }

  const saveSettings = (): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings.value))
    } catch (error) {
      console.warn('Failed to save notification settings:', error)
    }
  }

  const updateSetting = <K extends keyof NotificationSettings>(
    key: K,
    value: NotificationSettings[K]
  ): void => {
    settings.value[key] = value
    saveSettings()
  }

  const startOvertimeSound = (taskId: string): void => {
    if (!settings.value.enableOvertimeSound) return
    
    // Stop any existing sound for this task
    stopOvertimeSound(taskId)
    
    try {
      const audio = new Audio(new URL('../renderer/assets/time_is_up.mp3', import.meta.url).href)
      audio.volume = settings.value.soundVolume
      audio.loop = true
      
      audio.play().catch(error => {
        console.warn('Failed to play overtime sound:', error)
      })
      
      activeSoundLoops.value.set(taskId, audio)
    } catch (error) {
      console.warn('Failed to create overtime sound:', error)
    }
  }

  const stopOvertimeSound = (taskId: string): void => {
    const audio = activeSoundLoops.value.get(taskId)
    if (audio) {
      audio.pause()
      audio.currentTime = 0
      activeSoundLoops.value.delete(taskId)
    }
  }

  const stopAllSounds = (): void => {
    activeSoundLoops.value.forEach((audio, taskId) => {
      stopOvertimeSound(taskId)
    })
  }

  const showOvertimeNotification = (taskId: string): void => {
    currentOvertimeTaskId.value = taskId
    isOvertimeNotificationVisible.value = true
    
    // Start sound notification
    if (settings.value.enableOvertimeSound) {
      startOvertimeSound(taskId)
    }
    
    // Show system notification
    if (settings.value.enableSystemNotifications) {
      showSystemNotification(taskId)
    }
  }

  const hideOvertimeNotification = (): void => {
    if (currentOvertimeTaskId.value) {
      stopOvertimeSound(currentOvertimeTaskId.value)
    }
    isOvertimeNotificationVisible.value = false
    currentOvertimeTaskId.value = null
  }

  const showSystemNotification = async (taskId: string): Promise<void> => {
    try {
      if (window.electronAPI?.showNotification) {
        await window.electronAPI.showNotification({
          title: 'Овертайм!',
          body: 'Превышено запланированное время выполнения задачи',
          silent: false
        })
      } else {
        // Browser fallback
        if ('Notification' in window) {
          if (Notification.permission === 'granted') {
            new Notification('Овертайм!', {
              body: 'Превышено запланированное время выполнения задачи',
              icon: '/favicon.ico'
            })
          } else if (Notification.permission === 'default') {
            const permission = await Notification.requestPermission()
            if (permission === 'granted') {
              new Notification('Овертайм!', {
                body: 'Превышено запланированное время выполнения задачи',
                icon: '/favicon.ico'
              })
            }
          }
        }
      }
    } catch (error) {
      console.warn('Failed to show system notification:', error)
    }
  }

  const resetToDefaults = (): void => {
    settings.value = { ...DEFAULT_SETTINGS }
    saveSettings()
  }

  // Initialize
  loadSettings()

  return {
    // State
    settings,
    activeSoundLoops,
    isOvertimeNotificationVisible,
    currentOvertimeTaskId,
    
    // Actions
    updateSetting,
    resetToDefaults,
    startOvertimeSound,
    stopOvertimeSound,
    stopAllSounds,
    showOvertimeNotification,
    hideOvertimeNotification,
    showSystemNotification
  }
})

// As an AI Agent, I'm only working based on Clean Code Constitution. Applied rules: [2.4, 3.1, 3.3, 4.4, 5.3]
