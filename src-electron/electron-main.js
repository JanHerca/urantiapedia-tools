import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import path from 'node:path'
import os from 'node:os'
import { fileURLToPath } from 'node:url'

// needed in case process is undefined under Linux
const platform = process.platform || os.platform()
const currentDir = fileURLToPath(new URL('.', import.meta.url))

let mainWindow

async function installDevTools() {
  if (process.env.DEV) {
    try {
      // dynamic import to work in ESM environment
      const devtools = await import('electron-devtools-installer')
      await devtools.default(devtools.VUEJS3_DEVTOOLS)
      console.log('Vue Devtools installed via electron-devtools-installer')
    } catch (err) {
      console.warn('electron-devtools-installer failed — trying loadExtension fallback', err)

      // fallback: load unpacked extension from a relative project folder (no absolut path hard-coded)
      // place the unpacked Vue Devtools in the project root (folder name "vue-devtools"),
      // or adjust this relative path as needed.
      const devtoolsPath = path.resolve(process.cwd(), 'vue-devtools')

      try {
        if (fs.existsSync(devtoolsPath)) {
          await session.defaultSession.loadExtension(devtoolsPath, { allowFileAccess: true })
          console.log('Vue Devtools loaded from', devtoolsPath)
        } else {
          console.warn('Vue Devtools unpacked folder not found at', devtoolsPath)
        }
      } catch (err2) {
        console.error('Failed loading unpacked Vue Devtools', err2)
      }
    }
  }
}

async function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    icon: path.resolve(currentDir, 'icons/icon.png'), // tray icon
    width: 1000,
    height: 600,
    useContentSize: true,
    webPreferences: {
      contextIsolation: true,
      // More info: https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/electron-preload-script
      preload: path.resolve(
        currentDir,
        path.join(process.env.QUASAR_ELECTRON_PRELOAD_FOLDER, 'electron-preload' + process.env.QUASAR_ELECTRON_PRELOAD_EXTENSION)
      )
    }
  })

  if (process.env.DEV) {
    await mainWindow.loadURL(process.env.APP_URL)
  } else {
    await mainWindow.loadFile('index.html')
  }

  if (process.env.DEBUGGING) {
    // if on DEV or Production with debug enabled
    mainWindow.webContents.openDevTools()
  } else {
    // we're on production; no access to devtools pls
    mainWindow.webContents.on('devtools-opened', () => {
      mainWindow.webContents.closeDevTools()
    })
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(installDevTools).then(createWindow)

app.on('window-all-closed', () => {
  if (platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

ipcMain.handle('dialog:openSystemDialog', async (event, options = {}) => {
  const properties = []

  // In Vue we can choose 'file', 'folder' o 'both'
  // Note: 'both' works only in macOS
  if (options.type === 'folder') {
    properties.push('openDirectory')
  } else if (options.type === 'file') {
    properties.push('openFile')
  } else {
    // By default, allow both files and folders
    properties.push('openFile', 'openDirectory')
  }
  
  // Add filters configuration (e.g., only .txt or .json) if provided in options
  const filters = options.filters || []

  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: properties,
    filters: filters
  })

  if (canceled) {
    return null
  } else {
    // Return first path
    return filePaths[0]
  }
})
