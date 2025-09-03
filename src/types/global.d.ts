// Global type definitions for Planme

declare global {
  interface Window {
    electronAPI: {
      getIsDev: () => Promise<boolean>
      notion: {
        testConnection: (apiKey: string, databaseId: string) => Promise<boolean>
        fetchTasks: (apiKey: string, databaseId: string) => Promise<any[]>
      }
    }
  }
}

// Vite env types
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  // Добавим другие env переменные по необходимости
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

export {}
