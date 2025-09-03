import { app, BrowserWindow, ipcMain, Menu } from 'electron'
import { join } from 'path'

const isDev = process.env.NODE_ENV === 'development'

let mainWindow: BrowserWindow | null = null

function createMenu() {
  const template: any = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Quit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit()
          },
        },
      ],
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow?.reload()
          },
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: process.platform === 'darwin' ? 'Alt+Cmd+I' : 'Ctrl+Shift+I',
          click: () => {
            mainWindow?.webContents.toggleDevTools()
          },
        },
      ],
    },
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, 'preload.js'),
    },
    titleBarStyle: 'hiddenInset',
    show: false,
    title: 'Notion Tasks Timer'
  })

  // Загружаем приложение
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/renderer/index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// App event handlers
app.whenReady().then(() => {
  createMenu()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// IPC handlers
ipcMain.handle('get-is-dev', () => {
  return isDev
})

// Notion API handlers
ipcMain.handle('notion-test-connection', async (event, apiKey: string, databaseId: string) => {
  try {
    const { Client } = require('@notionhq/client')
    const notion = new Client({ auth: apiKey })
    
    await notion.databases.retrieve({
      database_id: databaseId,
    })
    
    return true
  } catch (error) {
    console.error('Failed to test Notion connection:', error)
    return false
  }
})

ipcMain.handle('notion-fetch-tasks', async (event, apiKey: string, databaseId: string) => {
  try {
    const { Client } = require('@notionhq/client')
    const notion = new Client({ auth: apiKey })
    
    const response = await notion.databases.query({
      database_id: databaseId,
      // Убираем сортировку, так как created_time - системное свойство
      // page_size: 100, // можно ограничить количество если нужно
    })

    return response.results.map((page: any) => {
      // Extract title from properties
      let title = 'Untitled Task'
      const properties: Record<string, any> = {}
      
      // Process all properties
      for (const [propertyName, property] of Object.entries(page.properties as any)) {
        const prop = property as any
        
        // Extract title
        if (prop.type === 'title' && prop.title?.length > 0) {
          title = prop.title.map((text: any) => text.plain_text).join('')
          properties[propertyName] = {
            id: prop.id,
            name: propertyName,
            type: 'title',
            value: { type: 'title', title }
          }
        }
        // Extract other property types
        else if (prop.type === 'rich_text') {
          const richText = prop.rich_text?.map((text: any) => text.plain_text).join('') || ''
          properties[propertyName] = {
            id: prop.id,
            name: propertyName,
            type: 'rich_text',
            value: { type: 'rich_text', rich_text: richText }
          }
        }
        else if (prop.type === 'number') {
          properties[propertyName] = {
            id: prop.id,
            name: propertyName,
            type: 'number',
            value: { type: 'number', number: prop.number }
          }
        }
        else if (prop.type === 'select') {
          properties[propertyName] = {
            id: prop.id,
            name: propertyName,
            type: 'select',
            value: { type: 'select', select: prop.select }
          }
        }
        else if (prop.type === 'status') {
          properties[propertyName] = {
            id: prop.id,
            name: propertyName,
            type: 'status',
            value: { type: 'status', status: prop.status }
          }
        }
        else if (prop.type === 'multi_select') {
          properties[propertyName] = {
            id: prop.id,
            name: propertyName,
            type: 'multi_select',
            value: { type: 'multi_select', multi_select: prop.multi_select || [] }
          }
        }
        else if (prop.type === 'date') {
          properties[propertyName] = {
            id: prop.id,
            name: propertyName,
            type: 'date',
            value: { type: 'date', date: prop.date }
          }
        }
        else if (prop.type === 'people') {
          const people = prop.people?.map((person: any) => ({
            name: person.name,
            avatar_url: person.avatar_url
          })) || []
          properties[propertyName] = {
            id: prop.id,
            name: propertyName,
            type: 'people',
            value: { type: 'people', people }
          }
        }
        else if (prop.type === 'checkbox') {
          properties[propertyName] = {
            id: prop.id,
            name: propertyName,
            type: 'checkbox',
            value: { type: 'checkbox', checkbox: prop.checkbox }
          }
        }
        else if (prop.type === 'url') {
          properties[propertyName] = {
            id: prop.id,
            name: propertyName,
            type: 'url',
            value: { type: 'url', url: prop.url }
          }
        }
        else if (prop.type === 'email') {
          properties[propertyName] = {
            id: prop.id,
            name: propertyName,
            type: 'email',
            value: { type: 'email', email: prop.email }
          }
        }
        else if (prop.type === 'phone_number') {
          properties[propertyName] = {
            id: prop.id,
            name: propertyName,
            type: 'phone_number',
            value: { type: 'phone_number', phone_number: prop.phone_number }
          }
        }
      }

      return {
        id: page.id,
        title,
        properties,
        created_time: page.created_time,
        last_edited_time: page.last_edited_time,
      }
    })
  } catch (error) {
    console.error('Failed to fetch tasks from Notion:', error)
    throw new Error(`Failed to fetch tasks: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
})
