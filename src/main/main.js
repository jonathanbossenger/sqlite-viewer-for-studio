const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs')
const isDev = process.env.NODE_ENV === 'development'
const Database = require('better-sqlite3')

let db = null
let queryHistory = []
let dbWatcher = null
let mainWindow = null
let store = null

// Initialize electron store
async function initializeStore() {
  const Store = await import('electron-store')
  store = new Store.default({
    name: 'wp-sqlite-dataview',
    defaults: {
      recentInstallations: []
    }
  })
}

// Add function to manage recent WordPress installations
function addRecentInstallation(wpDir, dbPath) {
  if (!store) return []
  
  const recentInstallations = store.get('recentInstallations', [])
  const installation = {
    wpDir,
    dbPath,
    name: path.basename(wpDir),
    timestamp: new Date().toISOString()
  }

  // Remove if already exists
  const filtered = recentInstallations.filter(item => item.wpDir !== wpDir)
  
  // Add to beginning and keep only last 5
  const updated = [installation, ...filtered].slice(0, 5)
  store.set('recentInstallations', updated)
  
  return updated
}

// Add function to setup file watcher
function setupDatabaseWatcher(dbPath) {
  if (dbWatcher) {
    dbWatcher.close()
  }

  dbWatcher = fs.watch(dbPath, (eventType) => {
    if (eventType === 'change') {
      // Notify renderer about database changes
      mainWindow?.webContents.send('database-changed')
    }
  })
}

// Add function to get WordPress site name
async function getWordPressSiteName() {
  if (!db) return null
  try {
    const result = db.prepare("SELECT option_value FROM wp_options WHERE option_name = 'blogname' LIMIT 1").get()
    return result?.option_value || null
  } catch (error) {
    console.error('Failed to get site name:', error)
    return null
  }
}

// Modify the database connection functions to include watching
function connectToDatabase(dbPath, readonly = false) {
  try {
    if (db) {
      db.close()
    }
    db = new Database(dbPath, { readonly })
    setupDatabaseWatcher(dbPath)
    return true
  } catch (error) {
    console.error('Database connection error:', error)
    throw error
  }
}

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
          connectToDatabase(dbPath)
          // Add to recent installations
          addRecentInstallation(wpDir, dbPath)
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

  ipcMain.handle('get-recent-installations', () => {
    return store ? store.get('recentInstallations', []) : []
  })

  ipcMain.handle('remove-recent-installation', (event, wpDir) => {
    if (!store) return []
    const recentInstallations = store.get('recentInstallations', [])
    const updated = recentInstallations.filter(item => item.wpDir !== wpDir)
    store.set('recentInstallations', updated)
    return updated
  })

  ipcMain.handle('open-recent-database', async (event, dbPath) => {
    try {
      return connectToDatabase(dbPath)
    } catch (error) {
      console.error('Failed to open recent database:', error)
      throw error
    }
  })

  ipcMain.handle('reconnect-database', async (event, dbPath) => {
    try {
      return connectToDatabase(dbPath)
    } catch (error) {
      console.error('Failed to reconnect to database:', error)
      throw error
    }
  })

  ipcMain.handle('get-database-info', () => {
    if (!db) throw new Error('No database connection')
    
    const dbPath = db.name
    const stats = fs.statSync(dbPath)
    const version = db.prepare('SELECT sqlite_version() as version').get()
    const tableCount = db.prepare("SELECT count(*) as count FROM sqlite_master WHERE type='table'").get()
    
    return {
      path: dbPath,
      size: stats.size,
      modified: stats.mtime,
      version: version.version,
      tableCount: tableCount.count
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

  ipcMain.handle('update-record', async (event, { tableName, record, primaryKey }) => {
    if (!db) throw new Error('No database connection')
    
    try {
      // Get the table schema to identify primary key if not provided
      const schema = db.prepare(`PRAGMA table_info("${tableName}")`).all()
      const pkColumn = primaryKey || schema.find(col => col.pk === 1)?.name
      
      if (!pkColumn) {
        throw new Error('No primary key found for table')
      }
      
      // Build the update query
      const columns = Object.keys(record)
      const setClause = columns
        .filter(col => col !== pkColumn)
        .map(col => `"${col}" = @${col}`)
        .join(', ')
      
      const query = `
        UPDATE "${tableName}"
        SET ${setClause}
        WHERE "${pkColumn}" = @${pkColumn}
      `
      
      // Execute the update
      const stmt = db.prepare(query)
      const result = stmt.run(record)
      
      return {
        success: true,
        changes: result.changes
      }
    } catch (error) {
      console.error('Update error:', error)
      throw error
    }
  })

  ipcMain.handle('get-site-name', async () => {
    return await getWordPressSiteName()
  })
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'SQLite Database Viewer for Studio',
    icon: path.join(__dirname, '../../assets/SQlite viewer icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, '../preload/preload.js')
    }
  })

  // In development, load from Vite dev server
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile('dist/index.html')
  }

  return mainWindow
}

// This method will be called when Electron has finished initialization
app.whenReady().then(async () => {
  await initializeStore()
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
  if (dbWatcher) {
    dbWatcher.close()
  }
  if (db) {
    db.close()
  }
}) 
