// src/components/ReusableInput.js
import React from 'react';

const InputTab = ({ label, type, name, value, onChange, required, placeholder }) => {
    return (
        <div className="mb-4">
            <label className="block mb-2 text-sm text-gray-200">{label}</label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                placeholder={placeholder}
                className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
            />
        </div>
    );
};

export default InputTab;
