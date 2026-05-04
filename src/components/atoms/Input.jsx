import React from 'react';

const Input = ({ 
    type = 'text', 
    placeholder, 
    value, 
    onChange, 
    name, 
    required = false,
    as = 'input',
    className = ''
}) => {
    const Tag = as;
    return (
        <Tag
            type={type === 'input' ? 'text' : type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            name={name}
            required={required}
            className={className}
        />
    );
};

export default Input;
