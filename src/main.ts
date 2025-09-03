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
      
      // Look for common title property names
      const titleProperty = Object.values(page.properties).find(
        (prop: any) => prop.type === 'title' && prop.title?.length > 0
      ) as any

      if (titleProperty && titleProperty.title) {
        title = titleProperty.title
          .map((text: any) => text.plain_text)
          .join('')
      }

      return {
        id: page.id,
        title,
        created_time: page.created_time,
        last_edited_time: page.last_edited_time,
      }
    })
  } catch (error) {
    console.error('Failed to fetch tasks from Notion:', error)
    throw new Error(`Failed to fetch tasks: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
})
