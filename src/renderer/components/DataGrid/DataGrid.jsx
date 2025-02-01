import React, { useState, useEffect } from 'react';
import './DataGrid.css';

const DataGrid = ({ tableName }) => {
    const [data, setData] = useState([]);
    const [columns, setColumns] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');
    const [loading, setLoading] = useState(false);
    const rowsPerPage = 50;

    useEffect(() => {
        if (tableName) {
            loadTableData();
            loadTableSchema();
        }
    }, [tableName, page, sortColumn, sortDirection]);

    const loadTableData = async () => {
        try {
            setLoading(true);
            const result = await window.electron.getTableData({
                tableName,
                page,
                rowsPerPage,
                sortColumn,
                sortDirection
            });
            setData(result.rows);
            setTotalPages(Math.ceil(result.total / rowsPerPage));
        } catch (error) {
            console.error('Failed to load table data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadTableSchema = async () => {
        try {
            const schema = await window.electron.getTableSchema(tableName);
            setColumns(schema.map(col => col.name));
        } catch (error) {
            console.error('Failed to load table schema:', error);
        }
    };

    const handleSort = (column) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
        setPage(1);
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    if (!tableName) {
        return <div className="data-grid-placeholder">Select a table to view data</div>;
    }

    return (
        <div className="data-grid">
            {loading && <div className="loading-overlay">Loading...</div>}
            
            <div className="data-grid-header">
                <h3>{tableName} Data</h3>
                <div className="pagination">
                    <button 
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                    >
                        Previous
                    </button>
                    <span>Page {page} of {totalPages}</span>
                    <button 
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === totalPages}
                    >
                        Next
                    </button>
                </div>
            </div>

            <div className="data-grid-table-container">
                <table>
                    <thead>
                        <tr>
                            {columns.map((column) => (
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
                        {data.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {columns.map((column) => (
                                    <td key={`${rowIndex}-${column}`}>
                                        {row[column]}
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
