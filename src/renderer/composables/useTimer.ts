import { computed } from 'vue'
import { useTimersStore } from '@/stores/timers'

export function useTimer(taskId: string) {
  const timersStore = useTimersStore()

  // Getters
  const timer = computed(() => timersStore.getTimerByTaskId(taskId))
  const timeProgress = computed(() => timersStore.getTimeProgress(taskId))
  const isActive = computed(() => timersStore.activeTimerId === taskId)
  const isRunning = computed(() => timer.value?.isRunning ?? false)
  const hasPlannedTime = computed(() => (timer.value?.plannedMinutes ?? 0) > 0)

  // Actions
  const setPlannedTime = (minutes: number) => {
    timersStore.setPlannedTime(taskId, minutes)
  }

  const start = () => {
    timersStore.startTimer(taskId)
  }

  const stop = () => {
    timersStore.stopTimer(taskId)
  }

  const pause = () => {
    timersStore.pauseTimer(taskId)
  }

  const reset = () => {
    timersStore.resetTimer(taskId)
  }

  const remove = () => {
    timersStore.deleteTimer(taskId)
  }

  // Helper functions
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = Math.floor(minutes % 60)
    const secs = Math.floor((minutes % 1) * 60)

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatTimeShort = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = Math.floor(minutes % 60)

    if (hours > 0) {
      return `${hours}ч ${mins}м`
    }
    return `${mins}м`
  }

  const getTimerStatus = () => {
    if (!timer.value) return 'idle'
    if (timer.value.isRunning) return 'running'
    if (timer.value.spentMinutes > 0) return 'paused'
    return 'idle'
  }

  const getProgressColor = () => {
    if (!timeProgress.value) return 'blue'
    
    const { percentage, isOvertime } = timeProgress.value
    
    if (isOvertime) return 'red'
    if (percentage >= 90) return 'orange'
    if (percentage >= 75) return 'yellow'
    return 'green'
  }

  return {
    // State
    timer,
    timeProgress,
    isActive,
    isRunning,
    hasPlannedTime,

    // Actions
    setPlannedTime,
    start,
    stop,
    pause,
    reset,
    remove,

    // Helpers
    formatTime,
    formatTimeShort,
    getTimerStatus,
    getProgressColor,
  }
}

// As an AI Agent, I'm only working based on Clean Code Constitution. Applied rules: [2.4, 3.1, 4.2, 5.3]
