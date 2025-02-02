import React, { useState, useEffect } from 'react';
import Loading from '../common/Loading';
import './DataGrid.css';

const DataGrid = ({ tableName, onRecordSelect }) => {
    const [data, setData] = useState({ rows: [], total: 0 });
    const [schema, setSchema] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');
    const rowsPerPage = 50;

    useEffect(() => {
        if (tableName) {
            loadSchema();
            loadData();
        }
    }, [tableName, page, sortColumn, sortDirection]);

    const loadSchema = async () => {
        try {
            const result = await window.electron.getTableSchema(tableName);
            setSchema(result);
        } catch (error) {
            console.error('Failed to load schema:', error);
        }
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const result = await window.electron.getTableData({
                tableName,
                page,
                rowsPerPage,
                sortColumn,
                sortDirection
            });
            setData(result);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (column) => {
        if (sortColumn === column) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
        setPage(1);
    };

    const handleRowClick = (row) => {
        if (onRecordSelect) {
            onRecordSelect(row);
        }
    };

    const handleNewRecord = () => {
        // Create an empty record based on the schema
        const emptyRecord = {};
        schema.forEach(column => {
            emptyRecord[column.name] = '';
        });
        onRecordSelect({ ...emptyRecord, isNew: true });
    };

    if (!tableName) {
        return (
            <div className="data-grid">
                <div className="data-grid-placeholder">
                    Select a table to view data
                </div>
            </div>
        );
    }

    return (
        <div className="data-grid">
            {loading && <Loading overlay />}
            
            <div className="data-grid-header">
                <h3>{tableName}</h3>
                <div className="data-grid-actions">
                    <div className="pagination">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                        >
                            Previous
                        </button>
                        <span>Page {page}</span>
                        <button
                            disabled={data.rows.length < rowsPerPage}
                            onClick={() => setPage(p => p + 1)}
                        >
                            Next
                        </button>
                        <button
                            onClick={handleNewRecord}
                            className="new-record-button"
                        >
                            New Record
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="data-grid-table-container">
                <table>
                    <thead>
                        <tr>
                            {schema.map(column => (
                                <th
                                    key={column.name}
                                    onClick={() => handleSort(column.name)}
                                    className={sortColumn === column.name ? `sorted-${sortDirection}` : ''}
                                >
                                    {column.name}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.rows.map((row, index) => (
                            <tr 
                                key={index}
                                onClick={() => handleRowClick(row)}
                                className="clickable-row"
                            >
                                {schema.map(column => (
                                    <td key={column.name} title={row[column.name]}>
                                        {row[column.name]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                        {data.rows.length === 0 && (
                            <tr>
                                <td colSpan={schema.length} className="no-data-message">
                                    No data available in this table
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DataGrid; 
