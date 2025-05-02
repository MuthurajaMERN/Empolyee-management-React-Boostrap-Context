import React from 'react';
import { Form } from 'react-bootstrap';

const Select = ({
  name,
  label,
  value = '',
  onChange,
  options = [],
  placeholder = 'Select...',
  error = null,
  multiple = false,
  disabled = false,
  register = null,
  ...props
}) => {
  console.log(`[Select] Rendering - ${name}`, { value, options });

  const handleChange = (e) => {
    try {
      if (onChange) {
        const selectedValue = multiple
          ? Array.from(e.target.selectedOptions).map(option => option.value)
          : e.target.value;
        onChange(selectedValue);
      }
    } catch (err) {
      console.error(`[Select] Change Error (${name}):`, err);
    }
  };

  const inputProps = register 
    ? { ...register(name) } 
    : { 
        name,
        value: multiple ? [] : value, // Handle array values for multiple select
        onChange: handleChange
      };

  try {
    return (
      <Form.Group className="mb-3" controlId={name}>
        {label && <Form.Label>{label}</Form.Label>}
        
        <Form.Select
          multiple={multiple}
          disabled={disabled}
          isInvalid={!!error}
          {...inputProps}
          {...props}
        >
          {placeholder && !multiple && (
            <option value="">{placeholder}</option>
          )}
          
          {options.map((option, index) => {
            const optionValue = option.value ?? option;
            const optionLabel = option.label ?? option;
            const isSelected = multiple
              ? value?.includes(optionValue)
              : value === optionValue;

            return (
              <option
                key={`${name}-${index}`}
                value={optionValue}
                selected={isSelected}
              >
                {optionLabel}
              </option>
            );
          })}
        </Form.Select>

        {error && (
          <Form.Control.Feedback type="invalid">
            {error.message || error}
          </Form.Control.Feedback>
        )}
      </Form.Group>
    );
  } catch (error) {
    console.error('[Select] Render Error:', error);
    return (
      <div className="alert alert-danger">
        Failed to render select: {name}
      </div>
    );
  }
};

export default Select;