import { contextBridge, ipcRenderer } from 'electron'

const electronAPI = {
  // Environment info
  getIsDev: () => ipcRenderer.invoke('get-is-dev'),
  
  // Notion API methods
  notion: {
    testConnection: (apiKey: string, databaseId: string) => 
      ipcRenderer.invoke('notion-test-connection', apiKey, databaseId),
    fetchTasks: (apiKey: string, databaseId: string) => 
      ipcRenderer.invoke('notion-fetch-tasks', apiKey, databaseId),
  }
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)

// Типы для глобального electronAPI
declare global {
  interface Window {
    electronAPI: typeof electronAPI
  }
}