# SQLite Database Viewer for Studio (TM)

<p align="center">
  <img src="assets/SQlite viewer icon.png" width="128" height="128" alt="SQLite Viewer Icon">
</p>

A modern, cross-platform desktop application for viewing and managing SQLite databases in [Studio by WordPress.com](https://developer.wordpress.com/studio/) installations. Built with Electron and React.

## Features

- 🔍 **Studio Integration**
  - Auto-detect SQLite database in Studio installations
  - Live database file watching and auto-refresh
  - Direct SQLite file selection for general databases

- 📊 **Database Explorer**
  - Tree view of database tables
  - Detailed schema information
  - Database statistics and information
  - Recent connections management

- 📋 **Data Management**
  - Paginated data grid (50 rows per page)
  - Column sorting and filtering
  - Inline data editing
  - Copy/paste support
  - Transaction support

- 💻 **Query Interface**
  - SQL editor with syntax highlighting
  - Query history
  - Results grid view
  - Error handling and validation

## Installation

Download the latest version for your platform from the [Releases](../../releases) page.

### Supported Platforms
- Windows (x64, ia32)
- macOS (Universal - Apple Silicon & Intel)
- Linux (x64, arm64)
  - AppImage
  - DEB package
  - RPM package

### macOS quarantine:
This app is not signed, so you might get a warning when you try to open it.

- You can either overriding the security settings by following the instructions here: https://support.apple.com/en-gb/guide/mac-help/mh40617/15.0/mac/15.0
- If you are not able to do that, you can remove the quarantine attribute by running the following command in the terminal:
```bash
sudo xattr -d com.apple.quarantine /path/to/SQLite\ Viewer\ for\ Studio.app 
```

## Development

### Prerequisites
- Node.js 18 or later
- npm 8 or later
- Python (for node-gyp)
- C++ build tools for your platform

### Setup

1. Clone the repository:
```bash
git clone https://github.com/jonathanbossenger/wp-sqlite-dataview.git
cd wp-sqlite-dataview
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

### Building

Build for your current platform:
```bash
npm run pack
```

Platform-specific builds:
```bash
npm run pack:mac    # macOS
npm run pack:win    # Windows
npm run pack:linux  # Linux
npm run pack:all    # All platforms
```

## Technical Stack

- **Frontend**: React
- **Backend**: Electron
- **Database**: better-sqlite3
- **Build**: Vite + Electron Builder

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the GNU General Public License v2.0 or later - see the [LICENSE](LICENSE) file for details.

This program is free software; you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation; either version 2 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

## Acknowledgments

- [Electron](https://www.electronjs.org/)
- [React](https://reactjs.org/)
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)
- [Vite](https://vitejs.dev/) 
