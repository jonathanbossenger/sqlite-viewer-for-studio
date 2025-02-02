# SQLite Database Viewer for Studio Requirements

## Overview
A desktop application built with Electron and React for viewing and editing SQLite databases, with special support for WordPress Studio installations.

## WordPress Studio Integration
- Directory selection to locate WordPress Studio installation
- Auto-detect SQLite database at `{selected_dir}/wp-content/database/.ht.sqlite`
- Watch for database file changes
- Manual refresh option to reload data

## Core Features

### Database Connection
- Directory picker for WordPress Studio installations
- Direct SQLite file selection for general databases
- Recent connections list
- Connection status indicator
- Auto-reconnect on database changes

### Database Explorer
- Tree view of database tables
- Table schema viewer showing:
  - Column names
  - Data types
  - Primary/foreign keys
  - Indexes
- Basic database information:
  - File size
  - SQLite version
  - Number of tables
  - Last modified date

### Data Viewer/Editor
- Grid view of table data with:
  - Pagination (50 rows per page)
  - Sorting by columns
  - Column filtering
  - Inline data editing
  - Copy/paste support
- Row addition/deletion

### Query Interface
- SQL editor featuring:
  - Syntax highlighting
  - Auto-completion
  - Basic SQL syntax validation
- Query history
- Results view with:
  - Grid display
  - Error handling

## Technical Requirements

### Main Process (Electron)
- File system operations
- SQLite database connections using better-sqlite3
- File watching for database changes
- IPC communication between main and renderer processes

### Renderer Process (React)
- Modern React with hooks
- Component-based architecture
- State management using React Context
- Responsive UI design

### Data Handling
- Efficient loading of large datasets
- Transaction support for data modifications
- Automatic backup before making database modifications
- Data type conversion between SQLite and JavaScript
- Error handling and validation

## User Interface
- Clean, modern design
- Resizable panels
- Keyboard shortcuts
- Status bar with connection info
- Loading indicators for long operations

## Performance Requirements
- Handle large tables (100k+ rows) efficiently
- Responsive UI during data operations
- Efficient memory usage
- Quick startup time

## Future Considerations
- Export/import functionality
- Database structure modifications
- Multiple simultaneous connections
- Custom theme support
- Query templates
- Saved queries 
