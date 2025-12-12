import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import path from 'node:path'
import fs from 'node:fs/promises'
import os from 'node:os'
import { fileURLToPath } from 'node:url'
import pug from 'pug';

if (process.platform === 'win32') {
  app.setAppUserModelId(app.name)
}

// needed in case process is undefined under Linux
const platform = process.platform || os.platform()
const currentDir = fileURLToPath(new URL('.', import.meta.url))

const compiledPugFunctions = {}
let mainWindow

// async function installDevTools() {
//   if (process.env.DEV) {
//     try {
//       // dynamic import to work in ESM environment
//       const devtools = await import('electron-devtools-installer')
//       await devtools.default(devtools.VUEJS3_DEVTOOLS)
//       console.log('Vue Devtools installed via electron-devtools-installer')
//     } catch (err) {
//       console.warn('electron-devtools-installer failed — trying loadExtension fallback', err)

//       // fallback: load unpacked extension from a relative project folder 
//       // (no absolut path hard-coded) place the unpacked Vue Devtools in the 
//       // project root (folder name "vue-devtools"), or adjust this relative 
//       // path as needed.
//       const devtoolsPath = path.resolve(process.cwd(), 'vue-devtools')

//       try {
//         if (fs.existsSync(devtoolsPath)) {
//           await session.defaultSession.loadExtension(devtoolsPath, { allowFileAccess: true })
//           console.log('Vue Devtools loaded from', devtoolsPath)
//         } else {
//           console.warn('Vue Devtools unpacked folder not found at', devtoolsPath)
//         }
//       } catch (err2) {
//         console.error('Failed loading unpacked Vue Devtools', err2)
//       }
//     }
//   }
// }

async function createWindow () {
  const iconDir = process.env.DEV
    ? path.resolve(app.getAppPath(), 'public', 'icons')
    : path.resolve(app.getAppPath(), 'icons')
  let iconPath = path.resolve(iconDir, 'icons', 'icon.png')

  // In MacOS, sometimes it's better to use nativeImage to ensure quality
  // if (platform === 'darwin') {
  //   const icon = nativeImage.createFromPath(iconPath)
  //   app.dock.setIcon(icon)
  // }

  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    icon: iconPath, // tray icon
    width: 1000,
    height: 600,
    useContentSize: true,
    webPreferences: {
      contextIsolation: true,
      sandbox: false,
      // More info: https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/electron-preload-script
      preload: path.resolve(
        currentDir,
        path.join(process.env.QUASAR_ELECTRON_PRELOAD_FOLDER, 
          'electron-preload' + process.env.QUASAR_ELECTRON_PRELOAD_EXTENSION)
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

app.whenReady()/*.then(installDevTools)*/.then(createWindow)

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

// FS handlers
ipcMain.handle('fs:exists', async (evt, p) => {
  try { 
    await fs.access(p, fs.constants.F_OK | fs.constants.W_OK); 
    return true 
  } catch { 
    return false 
  }
})
ipcMain.handle('fs:stat', async (evt, p) => {
  try { 
    return await fs.stat(p) 
  } catch { 
    return null 
  }
})
ipcMain.handle('fs:readdir', async (evt, p, options) => {
  try {
    const dirents = await fs.readdir(p, options)

    if (!options || !options.withFileTypes) {
      return dirents
    }

    return dirents.map(dirent => ({
      name: dirent.name,
      isFile: dirent.isFile(),
      isDirectory: dirent.isDirectory(),
      isSymbolicLink: dirent.isSymbolicLink(),
    }))
  } catch (err) { 
    throw err
  }
})
ipcMain.handle('fs:readFile', async (evt, p, enc = 'utf8') => {
  try { 
    return await fs.readFile(p, enc) 
  } catch (err) { 
    throw err
  }
})
ipcMain.handle('fs:writeFile', async (evt, p, data, enc = 'utf8') => {
  try { 
    await fs.writeFile(p, data, enc); 
    return { ok: true } 
  } catch (err) { 
    throw err
  }
})
ipcMain.handle('fs:mkdir', async (evt, p) => {
  try {
    await fs.mkdir(p)
    return { ok: true}
  } catch (err) {
    throw err
  }
})
ipcMain.handle('fs:copyFile', async (evt, p1, p2) => {
  try {
    await fs.copyFile(p1, p2)
    return { ok: true}
  } catch (err) {
    throw err
  }
})

// Native dialog handlers
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

//Version handler
ipcMain.handle('app:getVersion', async () => {
  let packageJsonPath;
  if (process.env.DEV) {
    packageJsonPath = path.join(process.cwd(), 'package.json')
  } else {
    packageJsonPath = path.join(app.getAppPath(), 'package.json')
  }
  try {
    const data = await fs.readFile(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(data)
    return packageJson.version
  } catch (err) {
    console.error('Error reading package.json:', err)
    return null
  }
})

//Pug handlers
ipcMain.handle('pug:compileTemplate', async (evt, fileName) => {
  let filePath;
  try {
    const templatePath = process.env.NODE_ENV === 'development'
      ? path.join(app.getAppPath(), '..', '..', 'src-electron', 'resources')
      : app.getAppPath();
    filePath = path.join(templatePath, fileName);
    await fs.access(filePath, fs.constants.F_OK | fs.constants.W_OK); 
  } catch (err) {
    throw new Error(`[PUG ERROR] File not found: ${filePath}`);
  }

  try {
    compiledPugFunctions[fileName] = pug.compileFile(filePath, { pretty: true });
  } catch (err) {
    throw err
  }
})

ipcMain.handle('pug:renderTemplate', async (evt, fileName, data) => {
  if (compiledPugFunctions[fileName]) {
    try {
      const htmlOutput = compiledPugFunctions[fileName](data);
      return htmlOutput;
    } catch (err) {
      throw err
    }
  }
  throw new Error('Template is not found as compiled.')
})