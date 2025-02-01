const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs')
const isDev = process.env.NODE_ENV === 'development'
const Database = require('better-sqlite3')

let db = null
let queryHistory = []

// IPC Handlers
function setupIpcHandlers() {
  ipcMain.handle('open-database-file', async () => {
    // First, let user select WordPress installation directory
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openDirectory'],
      title: 'Select Studio WordPress Installation Directory',
      message: 'Please select your Studio WordPress installation directory'
    })

    if (!canceled && filePaths.length > 0) {
      const wpDir = filePaths[0]
      const dbPath = path.join(wpDir, 'wp-content', 'database', '.ht.sqlite')

      // Check if the database file exists
      if (fs.existsSync(dbPath)) {
        try {
          if (db) {
            db.close()
          }
          db = new Database(dbPath, { readonly: false })
          return dbPath
        } catch (error) {
          console.error('Failed to open database:', error)
          throw new Error('Failed to open the WordPress SQLite database. Please make sure it is not corrupted or in use by another process.')
        }
      } else {
        throw new Error('Could not find the SQLite database file at wp-content/database/.ht.sqlite. Please make sure this is a valid Studio WordPress installation.')
      }
    }
    return null
  })

  ipcMain.handle('open-recent-database', async (event, dbPath) => {
    try {
      if (db) {
        db.close()
      }
      db = new Database(dbPath, { readonly: false })
      return true
    } catch (error) {
      console.error('Failed to open recent database:', error)
      throw error
    }
  })

  ipcMain.handle('get-tables', () => {
    if (!db) throw new Error('No database connection')
    const tables = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      ORDER BY name
    `).all()
    return tables.map(t => t.name)
  })

  ipcMain.handle('get-table-schema', (event, tableName) => {
    if (!db) throw new Error('No database connection')
    const tableInfo = db.prepare(`PRAGMA table_info("${tableName}")`).all()
    return tableInfo
  })

  ipcMain.handle('get-table-data', (event, { tableName, page = 1, rowsPerPage = 50, sortColumn, sortDirection }) => {
    if (!db) throw new Error('No database connection')
    
    const offset = (page - 1) * rowsPerPage
    const orderBy = sortColumn ? `ORDER BY "${sortColumn}" ${sortDirection}` : ''
    
    const countStmt = db.prepare(`SELECT COUNT(*) as total FROM "${tableName}"`)
    const { total } = countStmt.get()
    
    const rows = db.prepare(`
      SELECT * FROM "${tableName}"
      ${orderBy}
      LIMIT ? OFFSET ?
    `).all(rowsPerPage, offset)
    
    return {
      rows,
      total
    }
  })

  ipcMain.handle('execute-query', (event, query) => {
    if (!db) throw new Error('No database connection')
    try {
      const stmt = db.prepare(query)
      const isSelect = query.trim().toLowerCase().startsWith('select')
      
      // Add to query history
      queryHistory.unshift({
        query,
        timestamp: new Date().toISOString()
      })
      // Keep only last 50 queries
      queryHistory = queryHistory.slice(0, 50)
      
      if (isSelect) {
        const rows = stmt.all()
        const columns = rows.length > 0 ? Object.keys(rows[0]) : []
        return { columns, rows }
      } else {
        const result = stmt.run()
        return {
          columns: ['Changes'],
          rows: [{ Changes: result.changes }]
        }
      }
    } catch (error) {
      throw error
    }
  })

  ipcMain.handle('get-query-history', () => {
    return queryHistory
  })
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, '../preload/preload.js')
    }
  })

  // In development, load from Vite dev server
  if (isDev) {
    win.loadURL('http://localhost:3000')
    win.webContents.openDevTools()
  } else {
    win.loadFile('dist/index.html')
  }

  return win
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  setupIpcHandlers()
  const mainWindow = createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Cleanup database connection when app is quitting
app.on('before-quit', () => {
  if (db) {
    db.close()
  }
}) 
