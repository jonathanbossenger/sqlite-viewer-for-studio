import React from 'react';
import './Button.css';

const Button = ({ 
    children, 
    variant = 'primary', 
    size = 'medium',
    disabled = false,
    fullWidth = false,
    onClick,
    type = 'button',
    className = '',
    ...props 
}) => {
    const buttonClasses = [
        'common-button',
        `variant-${variant}`,
        `size-${size}`,
        fullWidth ? 'full-width' : '',
        className
    ].filter(Boolean).join(' ');

    return (
        <button
            type={type}
            className={buttonClasses}
            disabled={disabled}
            onClick={onClick}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button; 
