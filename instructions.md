# Implementation Instructions

## 1. Project Setup
1. Create a new directory for the project
2. Initialize a new Node.js project:
   ```bash
   npm init -y
   ```
3. Install core dependencies:
   ```bash
   npm install electron electron-builder react react-dom better-sqlite3 @electron/remote
   ```
4. Install development dependencies:
   ```bash
   npm install -D @babel/core @babel/preset-react @babel/preset-env babel-loader webpack webpack-cli
   ```

## 2. Project Structure
1. Create the following directory structure:
   ```
   src/
   ├── main/           # Electron main process
   ├── renderer/       # React application
   ├── shared/         # Shared utilities
   └── preload/        # Preload scripts
   ```

## 3. Electron Main Process Setup
1. Create `src/main/main.js`:
   - Set up main window creation
   - Configure IPC handlers for file operations
   - Implement SQLite connection management
   - Set up file watching for database changes

2. Create `src/preload/preload.js`:
   - Expose required APIs to renderer process
   - Set up IPC communication bridges

## 4. React Application Structure
1. Set up base React application in `src/renderer`:
   - Create main App component
   - Set up routing (if needed)
   - Create basic layout components

2. Create core components:
   ```
   src/renderer/components/
   ├── DatabaseConnection/    # Connection management
   ├── TableExplorer/        # Table list and schema viewer
   ├── DataGrid/             # Data viewing and editing
   ├── QueryEditor/          # SQL query interface
   └── common/               # Shared UI components
   ```

## 5. Feature Implementation Order

### Phase 1: Database Connection
1. Implement directory picker
2. Add SQLite file detection
3. Create connection management
4. Add recent connections storage
5. Implement connection status display

### Phase 2: Database Explorer
1. Create table list view
2. Implement schema viewer
3. Add database info display
4. Set up refresh functionality

### Phase 3: Data Viewer
1. Implement basic grid view
2. Add pagination (50 rows per page)
3. Implement sorting
4. Add column filtering
5. Create row editing interface
6. Implement copy/paste functionality

### Phase 4: Query Interface
1. Create SQL editor component
2. Add syntax highlighting
3. Implement basic autocompletion
4. Add query history
5. Create results display grid

### Phase 5: Data Management
1. Implement transaction handling
2. Add automatic backup system
3. Create error handling system

## 6. Testing and Polish
1. Add loading indicators
2. Implement error messages
3. Add keyboard shortcuts
4. Test with large datasets
5. Optimize performance

## 7. Build and Package
1. Configure electron-builder
2. Set up build scripts
3. Create installers for different platforms

## Development Notes
- Implement proper error handling throughout
- Follow React best practices and hooks
- Keep main process and renderer process responsibilities separate
- Use IPC communication patterns effectively
- Implement proper cleanup and resource management

## Common Gotchas
- Remember to rebuild better-sqlite3 for Electron
- Handle database file locking properly
- Manage memory for large result sets
- Clean up file watchers and database connections
- Handle path differences between development and production 
