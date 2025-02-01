import React, { useState } from 'react';
import DatabaseConnection from './components/DatabaseConnection/DatabaseConnection';
import TableExplorer from './components/TableExplorer/TableExplorer';
import DataGrid from './components/DataGrid/DataGrid';
import QueryEditor from './components/QueryEditor/QueryEditor';
import './App.css';

const App = () => {
  const [selectedTable, setSelectedTable] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [showConnectionDialog, setShowConnectionDialog] = useState(false);

  const handleTableSelect = (tableName) => {
    setSelectedTable(tableName);
  };

  const handleConnectionChange = (status) => {
    setIsConnected(status === 'connected');
    if (status === 'connected') {
      setShowConnectionDialog(false);
    }
  };

  return (
    <div className="app">
      <div className="app-toolbar">
        <div className="toolbar-title">SQLite Database Viewer</div>
        <button 
          className="toolbar-button"
          onClick={() => setShowConnectionDialog(true)}
        >
          {isConnected ? 'Change Database' : 'Connect Database'}
        </button>
      </div>
      
      {showConnectionDialog && (
        <div className="connection-dialog-overlay">
          <div className="connection-dialog">
            <DatabaseConnection 
              onConnectionChange={handleConnectionChange}
              onClose={() => setShowConnectionDialog(false)}
            />
          </div>
        </div>
      )}

      <div className="app-content">
        {isConnected ? (
          <>
            <div className="left-panel">
              <TableExplorer 
                onTableSelect={handleTableSelect}
                selectedTable={selectedTable}
              />
            </div>
            
            <div className="right-panel">
              <div className="data-panel">
                <DataGrid tableName={selectedTable} />
              </div>
              
              <div className="query-panel">
                <QueryEditor />
              </div>
            </div>
          </>
        ) : (
          <div className="welcome-message">
            <h2>Welcome to SQLite Database Viewer</h2>
            <p>Click "Connect Database" to select a Studio WordPress installation.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App; 
