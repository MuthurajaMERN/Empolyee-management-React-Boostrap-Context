import React from 'react';
import { Form } from 'react-bootstrap';

const Input = ({ 
  label, 
  type = 'text', 
  name, 
  value = '', 
  onChange, 
  placeholder = '', 
  error = null, 
  register = null, 
  options = [], 
  multiple = false, 
  ...props 
}) => {
  console.log(`Rendering Input component - Name: ${name}, Type: ${type}, Value: ${value}`);

  try {
    const inputProps = register 
      ? { ...register(name) } 
      : { 
          name, 
          value: type === 'file' ? undefined : value, 
          onChange: (e) => {
            try {
              if (onChange) {
                
                if (type === 'file') {
                  onChange(multiple ? e.target.files : e.target.files[0]);
                } else {
                  onChange(e);
                }
              }
            } catch (err) {
              console.error(`Error in ${name} input onChange:`, err);
            }
          }
        };

    return (
      <Form.Group className="mb-3" controlId={name}>
        {label && <Form.Label>{label}</Form.Label>}
        
        {type === 'select' ? (
          <Form.Select
            multiple={multiple}
            isInvalid={!!error}
            {...inputProps}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Form.Select>
        ) : (
          <Form.Control
            type={type}
            placeholder={placeholder}
            isInvalid={!!error}
            multiple={multiple && type === 'file'}
            {...inputProps}
            {...props}
          />
        )}

        {error && (
          <Form.Control.Feedback type="invalid">
            {typeof error === 'object' ? error.message : error}
          </Form.Control.Feedback>
        )}
      </Form.Group>
    );
  } catch (error) {
    console.error('Error rendering Input component:', error);
    return (
      <Form.Group className="mb-3" controlId={name}>
        <Form.Label className="text-danger">Error rendering input</Form.Label>
        <Form.Control plaintext readOnly value={`Error loading input: ${name}`} />
      </Form.Group>
    );
  }
};

export default Input;