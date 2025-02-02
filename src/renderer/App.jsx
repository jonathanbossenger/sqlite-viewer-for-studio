import React, { useState } from 'react';
import DatabaseConnection from './components/DatabaseConnection/DatabaseConnection';
import TableExplorer from './components/TableExplorer/TableExplorer';
import DataGrid from './components/DataGrid/DataGrid';
import QueryEditor from './components/QueryEditor/QueryEditor';
import RecordDetails from './components/RecordDetails/RecordDetails';
import './App.css';

// Helper function to decode HTML entities
const decodeHtmlEntities = (text) => {
  if (!text) return text;
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
};

const App = () => {
  const [selectedTable, setSelectedTable] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [showConnectionDialog, setShowConnectionDialog] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [siteName, setSiteName] = useState(null);
  const [queryResults, setQueryResults] = useState(null);

  const handleConnectionChange = (status) => {
    setIsConnected(status === 'connected');
    if (status === 'connected') {
      setShowConnectionDialog(false);
    }
  };

  const handleTableSelect = (tableName) => {
    setSelectedTable(tableName);
    setSelectedRecord(null);
    setQueryResults(null);
  };

  const handleRecordSelect = (record) => {
    setSelectedRecord(record);
  };

  const handleRecordSave = async (updatedRecord) => {
    try {
      const { _tableName, ...recordData } = updatedRecord;
      const targetTable = selectedTable || _tableName;
      
      await window.electron.updateRecord(targetTable, recordData);
      // Refresh the data grid by forcing a re-render
      setSelectedRecord(updatedRecord);
      
      // If we're viewing a table directly, force a reload
      if (selectedTable) {
        const currentTable = selectedTable;
        setSelectedTable(null);
        setTimeout(() => setSelectedTable(currentTable), 0);
      } else {
        // If we're viewing query results, re-run the query
        const currentQuery = queryResults.query;
        setQueryResults(null);
        setTimeout(async () => {
          try {
            const result = await window.electron.executeQuery(currentQuery);
            setQueryResults({ ...result, query: currentQuery });
          } catch (error) {
            console.error('Failed to refresh query results:', error);
          }
        }, 0);
      }
    } catch (error) {
      console.error('Failed to update record:', error);
      alert(`Failed to update record: ${error.message}`);
    }
  };

  const handleQueryResults = (results) => {
    setQueryResults(results);
    setSelectedTable(null);
    setSelectedRecord(null);
  };

  const handleSiteNameChange = (name) => {
    setSiteName(name ? decodeHtmlEntities(name) : null);
  };

  return (
    <div className="app-container">
      <div className="app-toolbar">
        <div className="toolbar-title">
          SQLite Database Viewer for Studio
          {siteName && <span className="site-name"> - {siteName}</span>}
        </div>
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
              onSiteNameChange={handleSiteNameChange}
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
                  queryResults={queryResults}
                />
              </div>
              
              <div className="query-panel">
                <QueryEditor onQueryResults={handleQueryResults} />
              </div>
            </div>

            {selectedRecord && (
              <div className="details-panel">
                <RecordDetails
                  record={selectedRecord}
                  tableName={selectedTable || selectedRecord._tableName}
                  onClose={() => setSelectedRecord(null)}
                  onSave={handleRecordSave}
                />
              </div>
            )}
          </>
        ) : (
          <div className="welcome-message">
            <h2>Welcome to SQLite Database Viewer for Studio</h2>
            <p>Click "Connect Database" to select a Studio WordPress installation.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App; 
