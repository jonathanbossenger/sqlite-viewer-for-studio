import React, { useState, useEffect } from 'react';
import './DatabaseConnection.css';

const DatabaseConnection = ({ onConnectionChange, onClose }) => {
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const [recentInstallations, setRecentInstallations] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Load recent installations on mount
        loadRecentInstallations();
        // Notify parent component of connection status changes
        onConnectionChange?.(connectionStatus);
    }, [connectionStatus, onConnectionChange]);

    const loadRecentInstallations = async () => {
        try {
            const installations = await window.electron.getRecentInstallations();
            setRecentInstallations(installations);
        } catch (error) {
            console.error('Failed to load recent installations:', error);
        }
    };

    const handleDatabaseSelect = async () => {
        try {
            setError(null);
            setConnectionStatus('connecting');
            const result = await window.electron.openDatabaseFile();
            if (result) {
                setConnectionStatus('connected');
                // Refresh recent installations list
                await loadRecentInstallations();
            } else {
                setConnectionStatus('disconnected');
            }
        } catch (error) {
            console.error('Failed to connect to database:', error);
            setError(error.message);
            setConnectionStatus('error');
        }
    };

    const handleRecentInstallationClick = async (installation) => {
        try {
            setError(null);
            setConnectionStatus('connecting');
            // Verify the database file still exists
            const result = await window.electron.openRecentDatabase(installation.dbPath);
            if (result) {
                setConnectionStatus('connected');
            }
        } catch (error) {
            console.error('Failed to connect to recent installation:', error);
            setError(error.message);
            setConnectionStatus('error');
        }
    };

    const handleRemoveInstallation = async (e, wpDir) => {
        e.stopPropagation(); // Prevent triggering the click handler of the parent
        try {
            await window.electron.removeRecentInstallation(wpDir);
            await loadRecentInstallations();
        } catch (error) {
            console.error('Failed to remove installation:', error);
        }
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
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
            
            {recentInstallations.length > 0 && (
                <div className="recent-connections">
                    <h3>Recent WordPress Installations</h3>
                    <ul>
                        {recentInstallations.map((installation, index) => (
                            <li 
                                key={index}
                                onClick={() => handleRecentInstallationClick(installation)}
                                className="recent-installation-item"
                            >
                                <div className="installation-info">
                                    <span className="installation-name">{installation.name}</span>
                                    <span className="installation-path" title={installation.wpDir}>
                                        {installation.wpDir}
                                    </span>
                                    <span className="installation-timestamp">
                                        {formatTimestamp(installation.timestamp)}
                                    </span>
                                </div>
                                <button
                                    className="remove-installation-button"
                                    onClick={(e) => handleRemoveInstallation(e, installation.wpDir)}
                                    title="Remove from recent installations"
                                >
                                    ×
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default DatabaseConnection; 
