import React, { useState, useEffect } from 'react';
import Loading from '../common/Loading';
import './DataGrid.css';

const DataGrid = ({ tableName, onRecordSelect }) => {
    const [data, setData] = useState({ rows: [], total: 0 });
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');
    const rowsPerPage = 50;

    useEffect(() => {
        if (tableName) {
            loadData();
        }
    }, [tableName, page, sortColumn, sortDirection]);

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
            // TODO: Show error message
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
                </div>
            </div>

            <div className="data-grid-table-container">
                <table>
                    <thead>
                        <tr>
                            {data.rows[0] && Object.keys(data.rows[0]).map(column => (
                                <th
                                    key={column}
                                    onClick={() => handleSort(column)}
                                    className={sortColumn === column ? `sorted-${sortDirection}` : ''}
                                >
                                    {column}
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
                                {Object.values(row).map((value, i) => (
                                    <td key={i} title={value}>
                                        {value}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DataGrid; 
