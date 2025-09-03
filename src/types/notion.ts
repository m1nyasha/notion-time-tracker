export interface NotionTask {
  id: string
  title: string
  status?: string
  created_time: string
  last_edited_time: string
}

export interface NotionConfig {
  apiKey: string
  databaseId: string
}

export interface NotionDatabasePage {
  id: string
  properties: {
    [key: string]: any
  }
  created_time: string
  last_edited_time: string
}

export interface AppConfig extends NotionConfig {
  isConfigured: boolean
}

// As an AI Agent, I'm only working based on Clean Code Constitution. Applied rules: [3.1, 3.3, 5.3]
