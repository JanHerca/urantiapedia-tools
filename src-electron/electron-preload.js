/**
 * This file is used specifically for security reasons.
 * Here you can access Nodejs stuff and inject functionality into
 * the renderer thread (accessible there through the "window" object)
 *
 * WARNING!
 * If you import anything from node_modules, then make sure that the package is specified
 * in package.json > dependencies and NOT in devDependencies
 *
 * Example (injects window.myAPI.doAThing() into renderer thread):
 *
 *   import { contextBridge } from 'electron'
 *
 *   contextBridge.exposeInMainWorld('myAPI', {
 *     doAThing: () => {}
 *   })
 *
 * WARNING!
 * If accessing Node functionality (like importing @electron/remote) then in your
 * electron-main.js you will need to set the following when you instantiate BrowserWindow:
 *
 * mainWindow = new BrowserWindow({
 *   // ...
 *   webPreferences: {
 *     // ...
 *     sandbox: false // <-- to be able to import @electron/remote in preload script
 *   }
 * }
 */

import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('NodeAPI', {
  // path helpers
  // pathJoin: (...parts) => ipcRenderer.invoke('node:path-join', parts),
  // pathResolve: (...parts) => ipcRenderer.invoke('node:path-resolve', parts),
  // pathBasename: (p) => ipcRenderer.invoke('node:path-basename', p),
  // pathDirname: (p) => ipcRenderer.invoke('node:path-dirname', p),
  // pathExtname: (p) => ipcRenderer.invoke('node:path-extname', p),

  // fs helpers (async)
  stat: (p) => ipcRenderer.invoke('fs:stat', p),
  exists: (p) => ipcRenderer.invoke('fs:exists', p),
  readDir: (p) => ipcRenderer.invoke('fs:readdir', p),
  readFile: (p, enc = 'utf8') => ipcRenderer.invoke('fs:readFile', p, enc),
  writeFile: (p, data, enc = 'utf8') => ipcRenderer.invoke('fs:writeFile', p, data, enc),

  // native dialogs
  selectPath: (options) => ipcRenderer.invoke('dialog:openSystemDialog', options)
})