import React from 'react';
import { Button as BootstrapButton } from 'react-bootstrap';

const Button = ({ 
  variant = 'primary', 
  children, 
  onClick, 
  type = 'button', 
  className = '',
  disabled = false,
  size,
  loading = false, // New loading state prop
  loadingText = 'Processing...', // Text to show when loading
  ...rest
}) => {
  console.log(`Rendering Button - Type: ${type}, Variant: ${variant}, Disabled: ${disabled}`);

  const handleClick = (e) => {
    try {
      if (disabled || loading) {
        e.preventDefault();
        return;
      }
      onClick && onClick(e);
    } catch (error) {
      console.error('Button click handler error:', error);
      // Optional: You could add a toast notification here
    }
  };

  return (
    <BootstrapButton 
      variant={variant}
      onClick={handleClick}
      type={type}
      disabled={disabled || loading}
      size={size}
      className={`${className} m-1 position-relative`}
      {...rest}
    >
      {loading ? (
        <>
          <span className="invisible">{children}</span>
          <span className="position-absolute start-50 translate-middle">
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
            {loadingText && <span className="visually-hidden">{loadingText}</span>}
          </span>
        </>
      ) : (
        children
      )}
    </BootstrapButton>
  );
};

export default Button;