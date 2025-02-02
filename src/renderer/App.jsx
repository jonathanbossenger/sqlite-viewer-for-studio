import React, { useState } from 'react';
import DatabaseConnection from './components/DatabaseConnection/DatabaseConnection';
import TableExplorer from './components/TableExplorer/TableExplorer';
import DataGrid from './components/DataGrid/DataGrid';
import QueryEditor from './components/QueryEditor/QueryEditor';
import RecordDetails from './components/RecordDetails/RecordDetails';
import './App.css';

const App = () => {
  const [selectedTable, setSelectedTable] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [showConnectionDialog, setShowConnectionDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [currentTable, setCurrentTable] = useState(null);

  const handleTableSelect = (tableName) => {
    setSelectedTable(tableName);
    // Clear the selected record when changing tables
    setSelectedRecord(null);
  };

  const handleConnectionChange = (status) => {
    setIsConnected(status === 'connected');
    if (status === 'connected') {
      setShowConnectionDialog(false);
    }
  };

  const handleRecordSelect = (record) => {
    setSelectedRecord(record);
  };

  const handleRecordSave = async (updatedRecord) => {
    try {
      await window.electron.updateRecord(selectedTable, updatedRecord);
      // Refresh the data grid by forcing a re-render
      setSelectedRecord(updatedRecord);
      // Force DataGrid to reload
      const currentTable = selectedTable;
      setSelectedTable(null);
      setTimeout(() => setSelectedTable(currentTable), 0);
    } catch (error) {
      console.error('Failed to update record:', error);
      alert(`Failed to update record: ${error.message}`);
    }
  };

  return (
    <div className="app-container">
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
            
            <div className="middle-panel">
              <div className="data-panel">
                <DataGrid 
                  tableName={selectedTable}
                  onRecordSelect={handleRecordSelect}
                />
              </div>
              
              <div className="query-panel">
                <QueryEditor />
              </div>
            </div>

            {selectedRecord && (
              <div className="details-panel">
                <RecordDetails
                  record={selectedRecord}
                  tableName={selectedTable}
                  onClose={() => setSelectedRecord(null)}
                  onSave={handleRecordSave}
                />
              </div>
            )}
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
