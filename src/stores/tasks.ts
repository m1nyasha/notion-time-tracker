import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { NotionTask, LoadingState } from '@/types/notion'

export const useTasksStore = defineStore('tasks', () => {
  // State
  const tasks = ref<NotionTask[]>([])
  const loading = ref<LoadingState>({
    isLoading: false,
    error: null
  })

  // Getters
  const isLoading = computed(() => loading.value.isLoading)
  const hasError = computed(() => !!loading.value.error)
  const errorMessage = computed(() => loading.value.error)
  const tasksCount = computed(() => tasks.value.length)

  // Actions
  const setTasks = (newTasks: NotionTask[]) => {
    // Применяем сохраненный порядок если он есть
    const orderedTasks = applySavedOrder(newTasks)
    tasks.value = orderedTasks
    loading.value.isLoading = false // Автоматически сбрасываем загрузку
    loading.value.error = null // Сбрасываем ошибки
  }

  const addTask = (task: NotionTask) => {
    tasks.value.push(task)
  }

  const removeTask = (taskId: string) => {
    const index = tasks.value.findIndex(task => task.id === taskId)
    if (index !== -1) {
      tasks.value.splice(index, 1)
    }
  }

  const updateTask = (taskId: string, updates: Partial<NotionTask>) => {
    const index = tasks.value.findIndex(task => task.id === taskId)
    if (index !== -1) {
      tasks.value[index] = { ...tasks.value[index], ...updates }
    }
  }

  const reorderTasks = (newOrder: NotionTask[]) => {
    tasks.value = newOrder
    saveTasksOrder(newOrder)
  }

  const setLoading = (isLoading: boolean) => {
    loading.value.isLoading = isLoading
    if (isLoading) {
      loading.value.error = null
    }

  }

  const setError = (error: string | null) => {
    loading.value.error = error
    loading.value.isLoading = false

  }

  const clearError = () => {
    loading.value.error = null
  }

  const clearTasks = () => {
    tasks.value = []
    clearSavedOrder()
  }

  // Private methods для работы с сохраненным порядком
  const saveTasksOrder = (orderedTasks: NotionTask[]) => {
    try {
      const taskIds = orderedTasks.map(task => task.id)
      localStorage.setItem('notion-tasks-order', JSON.stringify(taskIds))
    } catch (error) {
      console.warn('Failed to save tasks order:', error)
    }
  }

  const getSavedOrder = (): string[] => {
    try {
      const savedOrder = localStorage.getItem('notion-tasks-order')
      return savedOrder ? JSON.parse(savedOrder) : []
    } catch (error) {
      console.warn('Failed to load saved tasks order:', error)
      return []
    }
  }

  const applySavedOrder = (newTasks: NotionTask[]): NotionTask[] => {
    const savedOrder = getSavedOrder()
    if (savedOrder.length === 0) {
      return newTasks // Нет сохраненного порядка, возвращаем как есть
    }

    // Создаем карту задач для быстрого поиска
    const taskMap = new Map(newTasks.map(task => [task.id, task]))
    
    // Сначала добавляем задачи в сохраненном порядке (если они еще существуют)
    const orderedTasks: NotionTask[] = []
    const usedTaskIds = new Set<string>()

    for (const taskId of savedOrder) {
      const task = taskMap.get(taskId)
      if (task) {
        orderedTasks.push(task)
        usedTaskIds.add(taskId)
      }
    }

    // Затем добавляем новые задачи, которых не было в сохраненном порядке
    for (const task of newTasks) {
      if (!usedTaskIds.has(task.id)) {
        orderedTasks.push(task) // Новые задачи добавляем в конец
      }
    }

    // Сохраняем обновленный порядок (удаляем удаленные задачи из порядка)
    if (orderedTasks.length !== savedOrder.length) {
      saveTasksOrder(orderedTasks)
    }

    return orderedTasks
  }

  const clearSavedOrder = () => {
    try {
      localStorage.removeItem('notion-tasks-order')
    } catch (error) {
      console.warn('Failed to clear saved tasks order:', error)
    }
  }

  return {
    // State
    tasks,
    loading,

    // Getters
    isLoading,
    hasError,
    errorMessage,
    tasksCount,

    // Actions
    setTasks,
    addTask,
    removeTask,
    updateTask,
    reorderTasks,
    setLoading,
    setError,
    clearError,
    clearTasks,
    
    // Expose methods for external use
    clearSavedOrder,
  }
})

// As an AI Agent, I'm only working based on Clean Code Constitution. Applied rules: [2.4, 3.1, 4.2, 5.3]
