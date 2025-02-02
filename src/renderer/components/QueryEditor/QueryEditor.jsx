import React, { useState, useEffect } from 'react';
import './QueryEditor.css';

const QueryEditor = ({ onQueryResults }) => {
    const [query, setQuery] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [queryHistory, setQueryHistory] = useState([]);

    useEffect(() => {
        loadQueryHistory();
    }, []);

    const loadQueryHistory = async () => {
        try {
            const history = await window.electron.getQueryHistory();
            setQueryHistory(history);
        } catch (error) {
            console.error('Failed to load query history:', error);
        }
    };

    const executeQuery = async () => {
        if (!query.trim()) return;

        try {
            setLoading(true);
            setError(null);
            const result = await window.electron.executeQuery(query);
            onQueryResults({ ...result, query: query.trim() });
            
            // Add to history
            setQueryHistory(prev => [
                { query, timestamp: new Date().toISOString() },
                ...prev
            ].slice(0, 50)); // Keep last 50 queries
        } catch (error) {
            setError(error.message);
            onQueryResults(null);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            executeQuery();
        }
    };

    const loadFromHistory = (historicQuery) => {
        setQuery(historicQuery);
    };

    return (
        <div className="query-panel">
            <div className="query-editor-section">
                <div className="editor-header">
                    <h3>SQL Query Editor</h3>
                    <button 
                        onClick={executeQuery}
                        disabled={loading || !query.trim()}
                    >
                        {loading ? 'Executing...' : 'Execute (Ctrl/⌘ + Enter)'}
                    </button>
                </div>
                
                <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter your SQL query here..."
                    className="query-textarea"
                />

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}
            </div>

            <div className="query-history-section">
                <h3>Query History</h3>
                <div className="history-list">
                    {queryHistory.map((item, index) => (
                        <div 
                            key={index}
                            className="history-item"
                            onClick={() => loadFromHistory(item.query)}
                            title={item.query}
                        >
                            <div className="history-query">{item.query}</div>
                            <div className="history-timestamp">
                                {new Date(item.timestamp).toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default QueryEditor; 
