import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import './RecordDetails.css';

const RecordDetails = ({ record, tableName, onClose, onSave }) => {
    const [editedRecord, setEditedRecord] = useState(record || {});
    const [isEditing, setIsEditing] = useState(false);
    const [tableSchema, setTableSchema] = useState([]);

    useEffect(() => {
        if (tableName) {
            loadTableSchema();
        }
    }, [tableName]);

    useEffect(() => {
        // Update editedRecord whenever record prop changes
        if (record) {
            setEditedRecord({...record});
        } else if (tableSchema.length > 0) {
            // Create empty record with table columns
            const emptyRecord = {};
            tableSchema.forEach(column => {
                emptyRecord[column.name] = '';
            });
            setEditedRecord(emptyRecord);
        }
        setIsEditing(false);
    }, [record, tableSchema]);

    const loadTableSchema = async () => {
        try {
            const schema = await window.electron.getTableSchema(tableName);
            setTableSchema(schema);
        } catch (error) {
            console.error('Failed to load table schema:', error);
        }
    };

    const handleInputChange = (field, value) => {
        console.log('Input change:', field, value); // Debug log
        setEditedRecord(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = async () => {
        try {
            await onSave(editedRecord);
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to save record:', error);
            alert('Failed to save record: ' + error.message);
        }
    };

    // Function to determine if a field should use textarea
    const shouldUseTextarea = (columnName, value) => {
        // Convert value to string and handle null/undefined
        const stringValue = String(value || '');
        // If the value is longer than 100 characters or contains newlines
        return stringValue.length > 100 || stringValue.includes('\n');
    };

    if (!tableName) {
        return (
            <div className="record-details">
                <div className="record-details-placeholder">
                    Select a table to view details
                </div>
            </div>
        );
    }

    return (
        <div className="record-details">
            <div className="record-details-header">
                <h3>{tableName} Record Details</h3>
                <div className="record-details-actions">
                    {isEditing ? (
                        <>
                            <Button 
                                variant="primary" 
                                size="small" 
                                onClick={handleSave}
                            >
                                Save
                            </Button>
                            <Button 
                                variant="secondary" 
                                size="small" 
                                onClick={() => {
                                    setEditedRecord({...record});
                                    setIsEditing(false);
                                }}
                            >
                                Cancel
                            </Button>
                        </>
                    ) : (
                        <Button 
                            variant="secondary" 
                            size="small" 
                            onClick={() => setIsEditing(true)}
                        >
                            Edit
                        </Button>
                    )}
                    <Button 
                        variant="secondary" 
                        size="small" 
                        onClick={onClose}
                    >
                        ×
                    </Button>
                </div>
            </div>
            <div className="record-details-content">
                {tableSchema.map(column => {
                    const value = editedRecord[column.name] || '';
                    const useTextarea = shouldUseTextarea(column.name, value);
                    
                    return (
                        <div key={column.name} className="record-field">
                            <label>{column.name}</label>
                            {useTextarea ? (
                                <textarea
                                    value={value}
                                    onChange={(e) => handleInputChange(column.name, e.target.value)}
                                    readOnly={!isEditing}
                                    placeholder={column.type}
                                    disabled={!isEditing}
                                    rows={5}
                                />
                            ) : (
                                <input
                                    type="text"
                                    value={value}
                                    onChange={(e) => handleInputChange(column.name, e.target.value)}
                                    readOnly={!isEditing}
                                    placeholder={column.type}
                                    disabled={!isEditing}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default RecordDetails; 
