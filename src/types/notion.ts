// Notion Property Types
export type NotionPropertyValue = 
  | { type: 'title'; title: string }
  | { type: 'rich_text'; rich_text: string }
  | { type: 'number'; number: number | null }
  | { type: 'select'; select: { name: string; color: string } | null }
  | { type: 'multi_select'; multi_select: { name: string; color: string }[] }
  | { type: 'status'; status: { name: string; color: string } | null }
  | { type: 'date'; date: { start: string; end?: string } | null }
  | { type: 'people'; people: { name: string; avatar_url?: string }[] }
  | { type: 'checkbox'; checkbox: boolean }
  | { type: 'url'; url: string | null }
  | { type: 'email'; email: string | null }
  | { type: 'phone_number'; phone_number: string | null }

export interface NotionProperty {
  id: string
  name: string
  type: string
  value: NotionPropertyValue
}

export interface NotionTask {
  id: string
  title: string
  properties: Record<string, NotionProperty>
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
