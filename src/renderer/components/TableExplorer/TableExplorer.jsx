import React, { useState, useEffect } from 'react';
import './TableExplorer.css';

const TableExplorer = ({ onTableSelect, selectedTable: externalSelectedTable }) => {
    const [tables, setTables] = useState([]);
    const [schema, setSchema] = useState(null);
    const [selectedTable, setSelectedTable] = useState(externalSelectedTable);

    useEffect(() => {
        // Load tables when component mounts or database connection changes
        loadTables();
    }, []);

    useEffect(() => {
        // Keep internal state in sync with external state
        setSelectedTable(externalSelectedTable);
        if (externalSelectedTable) {
            loadSchema(externalSelectedTable);
        }
    }, [externalSelectedTable]);

    const loadTables = async () => {
        try {
            // This will be implemented using IPC to communicate with main process
            const result = await window.electron.getTables();
            setTables(result);
        } catch (error) {
            console.error('Failed to load tables:', error);
        }
    };

    const loadSchema = async (tableName) => {
        try {
            // This will be implemented using IPC to communicate with main process
            const result = await window.electron.getTableSchema(tableName);
            setSchema(result);
            setSelectedTable(tableName);
            onTableSelect?.(tableName);
        } catch (error) {
            console.error('Failed to load schema:', error);
        }
    };

    return (
        <div className="table-explorer">
            <div className="tables-list">
                <h3>Tables</h3>
                <ul>
                    {tables.map((table) => (
                        <li 
                            key={table}
                            className={selectedTable === table ? 'selected' : ''}
                            onClick={() => loadSchema(table)}
                        >
                            {table}
                        </li>
                    ))}
                </ul>
            </div>
            
            {schema && (
                <div className="schema-viewer">
                    <h3>Schema for {selectedTable}</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Column</th>
                                <th>Type</th>
                                <th>Nullable</th>
                                <th>Key</th>
                            </tr>
                        </thead>
                        <tbody>
                            {schema.map((column, index) => (
                                <tr key={index}>
                                    <td>{column.name}</td>
                                    <td>{column.type}</td>
                                    <td>{column.notnull ? 'No' : 'Yes'}</td>
                                    <td>{column.pk ? 'Primary' : ''}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default TableExplorer; 
