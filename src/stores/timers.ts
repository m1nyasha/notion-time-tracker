import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { TaskTimer, TimerSession, TimerState, TimeProgress } from '@/types/timer'

export const useTimersStore = defineStore('timers', () => {
  // State
  const activeTimerId = ref<string | null>(null)
  const timers = ref<Map<string, TaskTimer>>(new Map())
  const currentTime = ref(Date.now()) // Для реактивности времени

  // Interval для обновления текущего времени
  let timeUpdateInterval: NodeJS.Timeout | null = null

  // Getters
  const getTimerByTaskId = (taskId: string): TaskTimer | undefined => {
    return timers.value.get(taskId)
  }

  const getActiveTimer = computed((): TaskTimer | undefined => {
    if (!activeTimerId.value) return undefined
    return timers.value.get(activeTimerId.value)
  })

  const getTimeProgress = (taskId: string): TimeProgress | null => {
    const timer = getTimerByTaskId(taskId)
    if (!timer || timer.plannedMinutes === 0) return null

    let spentMinutes = timer.spentMinutes

    // Добавляем время текущей активной сессии
    if (timer.isRunning && timer.startedAt) {
      const currentSessionMinutes = (currentTime.value - timer.startedAt) / (1000 * 60)
      spentMinutes += currentSessionMinutes
    }

    const percentage = Math.min((spentMinutes / timer.plannedMinutes) * 100, 100)
    const remaining = Math.max(timer.plannedMinutes - spentMinutes, 0)
    const isOvertime = spentMinutes > timer.plannedMinutes

    return {
      spent: spentMinutes,
      planned: timer.plannedMinutes,
      percentage,
      remaining,
      isOvertime
    }
  }

  // Actions
  const createTimer = (taskId: string): TaskTimer => {
    const timer: TaskTimer = {
      taskId,
      plannedMinutes: 0,
      spentMinutes: 0,
      isRunning: false,
      startedAt: null,
      sessions: [],
      overtimeNotified: false
    }
    timers.value.set(taskId, timer)
    saveToStorage()
    return timer
  }

  const setPlannedTime = (taskId: string, minutes: number) => {
    let timer = getTimerByTaskId(taskId)
    if (!timer) {
      timer = createTimer(taskId)
    }
    
    // Ограничиваем максимум 8 часов (480 минут)
    timer.plannedMinutes = Math.min(Math.max(minutes, 0), 480)
    // Reset notification flag when planned time changes
    if (timer.spentMinutes <= timer.plannedMinutes) {
      timer.overtimeNotified = false
    }
    timers.value.set(taskId, timer)
    saveToStorage()
  }

  const checkForOvertime = (taskId: string) => {
    const timer = getTimerByTaskId(taskId)
    
    if (!timer || !timer.isRunning) return
    
    // Вычисляем общее потраченное время (включая активную сессию)
    let totalSpentMinutes = timer.spentMinutes
    if (timer.startedAt) {
      const currentSessionTime = (currentTime.value - timer.startedAt) / (1000 * 60)
      totalSpentMinutes += currentSessionTime
    }
    
    const plannedMinutes = timer.plannedMinutes
    const isInOvertime = totalSpentMinutes > plannedMinutes && plannedMinutes > 0
    
    console.log(`🔔 Checking overtime for task ${taskId}:`, {
      spentMinutes: totalSpentMinutes,
      plannedMinutes,
      isInOvertime,
      wasNotified: timer.overtimeNotified || false,
      currentSession: timer.startedAt ? (currentTime.value - timer.startedAt) / (1000 * 60) : 0
    })
    
    // If we're in overtime and haven't notified yet
    if (isInOvertime && !timer.overtimeNotified) {
      console.log('🚨 Triggering overtime notification!')
      timer.overtimeNotified = true // Mark as notified
      
      setTimeout(async () => {
        try {
          const { useNotificationsStore } = await import('@/stores/notifications')
          const notificationsStore = useNotificationsStore()
          
          console.log('📢 Notifications settings:', notificationsStore.settings.enableOvertimeNotifications)
          
          if (notificationsStore.settings.enableOvertimeNotifications) {
            notificationsStore.showOvertimeNotification(taskId)
          }
        } catch (error) {
          console.error('Failed to show overtime notification:', error)
        }
      }, 0)
    }
  }

  const startTimer = (taskId: string) => {
    // Останавливаем активный таймер если есть
    if (activeTimerId.value && activeTimerId.value !== taskId) {
      stopTimer(activeTimerId.value)
    }

    let timer = getTimerByTaskId(taskId)
    if (!timer) {
      timer = createTimer(taskId)
    }

    timer.isRunning = true
    timer.startedAt = Date.now()
    activeTimerId.value = taskId
    
    timers.value.set(taskId, timer)
    saveToStorage()
    startTimeUpdateInterval()
  }

  const stopTimer = (taskId: string) => {
    const timer = getTimerByTaskId(taskId)
    if (!timer || !timer.isRunning || !timer.startedAt) return

    const now = Date.now()
    const sessionDuration = (now - timer.startedAt) / (1000 * 60) // в минутах

    // Создаем сессию
    const session: TimerSession = {
      startedAt: timer.startedAt,
      endedAt: now,
      duration: sessionDuration
    }

    timer.sessions.push(session)
    timer.spentMinutes += sessionDuration
    timer.isRunning = false
    timer.startedAt = null

    if (activeTimerId.value === taskId) {
      activeTimerId.value = null
    }

    timers.value.set(taskId, timer)
    saveToStorage()
    
    // Останавливаем обновление времени если нет активных таймеров
    if (!activeTimerId.value) {
      stopTimeUpdateInterval()
    }
  }

  const pauseTimer = (taskId: string) => {
    stopTimer(taskId) // pause = stop для простоты
  }

  const resetTimer = (taskId: string) => {
    const timer = getTimerByTaskId(taskId)
    if (!timer) return

    if (timer.isRunning) {
      stopTimer(taskId)
    }

    timer.spentMinutes = 0
    timer.sessions = []
    timer.overtimeNotified = false // Reset notification flag
    timers.value.set(taskId, timer)
    saveToStorage()
  }

  const deleteTimer = (taskId: string) => {
    if (activeTimerId.value === taskId) {
      stopTimer(taskId)
    }
    timers.value.delete(taskId)
    saveToStorage()
  }

  // Private methods
  const startTimeUpdateInterval = () => {
    if (timeUpdateInterval) return

    timeUpdateInterval = setInterval(() => {
      currentTime.value = Date.now()
      
      // Check for overtime when time updates
      if (activeTimerId.value) {
        checkForOvertime(activeTimerId.value)
      }
    }, 1000) // Обновляем каждую секунду
  }

  const stopTimeUpdateInterval = () => {
    if (timeUpdateInterval) {
      clearInterval(timeUpdateInterval)
      timeUpdateInterval = null
    }
  }

  const saveToStorage = () => {
    try {
      const state: TimerState = {
        activeTimerId: activeTimerId.value,
        timers: timers.value
      }
      
      // Преобразуем Map в Object для сериализации
      const serializable = {
        ...state,
        timers: Object.fromEntries(state.timers)
      }
      
      localStorage.setItem('notion-timers', JSON.stringify(serializable))
    } catch (error) {
      console.warn('Failed to save timers to storage:', error)
    }
  }

  const loadFromStorage = () => {
    try {
      const saved = localStorage.getItem('notion-timers')
      if (!saved) return

      const parsed = JSON.parse(saved)
      activeTimerId.value = parsed.activeTimerId
      
      // Восстанавливаем Map из Object
      const timersMap = new Map<string, TaskTimer>()
      for (const [taskId, timer] of Object.entries(parsed.timers as Record<string, TaskTimer>)) {
        // Ensure overtimeNotified is initialized
        timer.overtimeNotified = timer.overtimeNotified || false
        timersMap.set(taskId, timer)
      }
      timers.value = timersMap

      // Если есть активный таймер, продолжаем отсчет времени
      if (activeTimerId.value) {
        const activeTimer = getTimerByTaskId(activeTimerId.value)
        if (activeTimer?.isRunning) {
          startTimeUpdateInterval()
        }
      }
    } catch (error) {
      console.warn('Failed to load timers from storage:', error)
    }
  }

  const clearAllTimers = () => {
    stopTimeUpdateInterval()
    activeTimerId.value = null
    timers.value.clear()
    saveToStorage()
  }

  // Initialize
  const initialize = () => {
    loadFromStorage()
  }

  // Cleanup on app unmount
  const cleanup = () => {
    stopTimeUpdateInterval()
  }

  // Watch for changes and save
  watch([activeTimerId, timers], () => {
    saveToStorage()
  }, { deep: true })

  initialize()

  return {
    // State
    activeTimerId,
    timers,
    currentTime,

    // Getters
    getTimerByTaskId,
    getActiveTimer,
    getTimeProgress,

    // Actions
    createTimer,
    setPlannedTime,
    startTimer,
    stopTimer,
    pauseTimer,
    resetTimer,
    deleteTimer,
    clearAllTimers,
    initialize,
    cleanup,
  }
})

// As an AI Agent, I'm only working based on Clean Code Constitution. Applied rules: [2.4, 3.1, 4.2, 5.3]
