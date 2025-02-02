const { contextBridge, ipcRenderer } = require('electron')

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron',
  {
    openDatabaseFile: async () => {
      try {
        return await ipcRenderer.invoke('open-database-file')
      } catch (error) {
        throw error
      }
    },
    openRecentDatabase: async (path) => {
      try {
        return await ipcRenderer.invoke('open-recent-database', path)
      } catch (error) {
        throw error
      }
    },
    getTables: async () => {
      try {
        return await ipcRenderer.invoke('get-tables')
      } catch (error) {
        throw error
      }
    },
    getTableSchema: async (tableName) => {
      try {
        return await ipcRenderer.invoke('get-table-schema', tableName)
      } catch (error) {
        throw error
      }
    },
    getTableData: async (params) => {
      try {
        return await ipcRenderer.invoke('get-table-data', params)
      } catch (error) {
        throw error
      }
    },
    executeQuery: async (query) => {
      try {
        return await ipcRenderer.invoke('execute-query', query)
      } catch (error) {
        throw error
      }
    },
    getQueryHistory: async () => {
      try {
        return await ipcRenderer.invoke('get-query-history')
      } catch (error) {
        throw error
      }
    },
    getDatabaseInfo: async () => {
      try {
        return await ipcRenderer.invoke('get-database-info')
      } catch (error) {
        throw error
      }
    },
    onDatabaseChanged: (callback) => {
      ipcRenderer.on('database-changed', callback)
      return () => {
        ipcRenderer.removeListener('database-changed', callback)
      }
    },
    reconnectDatabase: async (path) => {
      try {
        return await ipcRenderer.invoke('reconnect-database', path)
      } catch (error) {
        throw error
      }
    },
    updateRecord: async (tableName, record, primaryKey) => {
      try {
        return await ipcRenderer.invoke('update-record', { tableName, record, primaryKey })
      } catch (error) {
        throw error
      }
    }
  }
) 
