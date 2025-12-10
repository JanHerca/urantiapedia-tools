import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('NodeAPI', {

  // fs helpers (async)
  stat: (p) => ipcRenderer.invoke('fs:stat', p),
  exists: (p) => ipcRenderer.invoke('fs:exists', p),
  readDir: (p, options) => ipcRenderer.invoke('fs:readdir', p, options),
  readFile: (p, enc = 'utf8') => ipcRenderer.invoke('fs:readFile', p, enc),
  writeFile: (p, data, enc = 'utf8') => ipcRenderer.invoke('fs:writeFile', p, data, enc),
  createFolder: (p) => ipcRenderer.invoke('fs:mkdir', p),

  // native dialogs
  selectPath: (options) => ipcRenderer.invoke('dialog:openSystemDialog', options),

  //version
  getAppVersion: () => ipcRenderer.invoke('app:getVersion'),

  //Pug
  compileTemplate: (fileName) => ipcRenderer.invoke('pug:compileTemplate', fileName),
  renderTemplate: (fileName, data) => ipcRenderer.invoke('pug:renderTemplate', fileName, data)
})