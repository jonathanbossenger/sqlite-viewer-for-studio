import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import './RecordDetails.css';

const RecordDetails = ({ record, tableName, onClose, onSave }) => {
    const [editedRecord, setEditedRecord] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [tableSchema, setTableSchema] = useState([]);

    useEffect(() => {
        if (tableName) {
            loadTableSchema();
        }
    }, [tableName]);

    useEffect(() => {
        if (record) {
            setEditedRecord(record);
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
            // TODO: Show error message to user
        }
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
                <h3>{tableName} {record ? `Record #${record.id}` : 'New Record'}</h3>
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
                                    setEditedRecord(record || {});
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
                {tableSchema.map(column => (
                    <div key={column.name} className="record-field">
                        <label>{column.name}</label>
                        <input
                            type="text"
                            value={editedRecord[column.name] || ''}
                            onChange={(e) => handleInputChange(column.name, e.target.value)}
                            readOnly={!isEditing}
                            placeholder={column.type}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecordDetails; 
