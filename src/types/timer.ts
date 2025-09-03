export interface TaskTimer {
  taskId: string
  plannedMinutes: number // Запланированное время в минутах (макс 480 = 8 часов)
  spentMinutes: number   // Потраченное время в минутах
  isRunning: boolean
  startedAt: number | null // timestamp начала текущей сессии
  sessions: TimerSession[] // История сессий работы
}

export interface TimerSession {
  startedAt: number   // timestamp начала сессии
  endedAt: number     // timestamp окончания сессии
  duration: number    // длительность в минутах
}

export interface TimerState {
  activeTimerId: string | null // ID активного таймера (только один может быть активным)
  timers: Map<string, TaskTimer> // Таймеры по taskId
}

export interface TimerControls {
  start: (taskId: string) => void
  stop: (taskId: string) => void
  pause: (taskId: string) => void
  setPlannedTime: (taskId: string, minutes: number) => void
  reset: (taskId: string) => void
}

// Helper types
export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed'

export interface TimeProgress {
  spent: number      // потраченное время в минутах
  planned: number    // запланированное время в минутах
  percentage: number // процент выполнения
  remaining: number  // оставшееся время в минутах
  isOvertime: boolean // превышение времени
}

// As an AI Agent, I'm only working based on Clean Code Constitution. Applied rules: [3.1, 3.3, 5.3]
