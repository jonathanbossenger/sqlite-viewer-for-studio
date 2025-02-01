import React from 'react';
import './Loading.css';

const Loading = ({ size = 'medium', overlay = false }) => {
    const spinnerClasses = [
        'loading-spinner',
        `size-${size}`
    ].filter(Boolean).join(' ');

    if (overlay) {
        return (
            <div className="loading-overlay">
                <div className={spinnerClasses}>
                    <div className="spinner-circle"></div>
                </div>
            </div>
        );
    }

    return (
        <div className={spinnerClasses}>
            <div className="spinner-circle"></div>
        </div>
    );
};

export default Loading; 
