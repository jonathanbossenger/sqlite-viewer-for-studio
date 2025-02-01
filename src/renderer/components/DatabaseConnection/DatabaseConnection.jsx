import React, { useState, useEffect } from 'react';
import './DatabaseConnection.css';

const DatabaseConnection = ({ onConnectionChange, onClose }) => {
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const [recentConnections, setRecentConnections] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Notify parent component of connection status changes
        onConnectionChange?.(connectionStatus);
    }, [connectionStatus, onConnectionChange]);

    const handleDatabaseSelect = async () => {
        try {
            setError(null);
            setConnectionStatus('connecting');
            const result = await window.electron.openDatabaseFile();
            if (result) {
                setConnectionStatus('connected');
                // Update recent connections
                setRecentConnections(prev => [...prev, result].slice(-5));
            } else {
                setConnectionStatus('disconnected');
            }
        } catch (error) {
            console.error('Failed to connect to database:', error);
            setError(error.message);
            setConnectionStatus('error');
        }
    };

    const handleRecentConnectionClick = async (connection) => {
        try {
            setError(null);
            setConnectionStatus('connecting');
            const result = await window.electron.openRecentDatabase(connection);
            if (result) {
                setConnectionStatus('connected');
            }
        } catch (error) {
            console.error('Failed to connect to recent database:', error);
            setError(error.message);
            setConnectionStatus('error');
        }
    };

    return (
        <div className="database-connection">
            <div className="connection-header">
                <h2>Studio WordPress Database Connection</h2>
                <button className="close-button" onClick={onClose}>×</button>
            </div>
            
            <div className="connection-instructions">
                Please select your Studio WordPress installation directory. 
                The SQLite database file will be automatically located in the wp-content/database folder.
            </div>
            
            <div className={`connection-status status-${connectionStatus}`}>
                Status: {connectionStatus}
            </div>
            
            {error && (
                <div className="connection-error">
                    {error}
                </div>
            )}
            
            <button 
                onClick={handleDatabaseSelect}
                className="connect-button"
                disabled={connectionStatus === 'connecting'}
            >
                {connectionStatus === 'connecting' ? 'Connecting...' : 'Select WordPress Directory'}
            </button>
            
            {recentConnections.length > 0 && (
                <div className="recent-connections">
                    <h3>Recent Connections</h3>
                    <ul>
                        {recentConnections.map((connection, index) => (
                            <li 
                                key={index}
                                onClick={() => handleRecentConnectionClick(connection)}
                            >
                                {connection}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default DatabaseConnection; 
