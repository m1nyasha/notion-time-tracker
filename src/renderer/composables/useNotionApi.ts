import type { NotionTask } from '@/types/notion'

export function useNotionApi() {
  const fetchTasks = async (apiKey: string, databaseId: string): Promise<NotionTask[]> => {
    try {
      if (!window.electronAPI?.notion) {
        throw new Error('Electron API недоступен')
      }

      const tasks = await window.electronAPI.notion.fetchTasks(apiKey, databaseId)
      return tasks as NotionTask[]
    } catch (error) {
      console.error('Failed to fetch tasks from Notion:', error)
      throw new Error(`Не удалось получить задачи: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`)
    }
  }

  const testConnection = async (apiKey: string, databaseId: string): Promise<boolean> => {
    try {
      if (!window.electronAPI?.notion) {
        console.error('Electron API недоступен')
        return false
      }

      return await window.electronAPI.notion.testConnection(apiKey, databaseId)
    } catch (error) {
      console.error('Failed to test Notion connection:', error)
      return false
    }
  }

  return {
    fetchTasks,
    testConnection,
  }
}

// As an AI Agent, I'm only working based on Clean Code Constitution. Applied rules: [2.4, 3.1, 4.2, 5.3]
