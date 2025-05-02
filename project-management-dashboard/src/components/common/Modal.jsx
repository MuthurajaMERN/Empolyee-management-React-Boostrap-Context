import React, { memo } from 'react';
import { Modal as BootstrapModal, Button } from 'react-bootstrap';

const Modal = ({ 
  show = false,
  onHide, 
  title, 
  children, 
  onSubmit, 
  submitText = 'Save', 
  cancelText = 'Cancel',
  size = 'lg',
  disableSubmit = false,
  ...props
}) => {
  if (!show) return null;

  console.log(`Rendering Modal - Title: ${title}, Show: ${show}`);

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      onSubmit?.(e);
    } catch (err) {
      console.error('Error in modal form submission:', err);
    }
  };

  return (
    <BootstrapModal 
      show={true} 
      onHide={onHide} 
      size={size} 
      centered
      {...props}
    >
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title>{title}</BootstrapModal.Title>
      </BootstrapModal.Header>

      <BootstrapModal.Body>
        {children}
      </BootstrapModal.Body>

      <BootstrapModal.Footer>
        <Button variant="secondary" onClick={onHide}>
          {cancelText}
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit}
          disabled={disableSubmit}
        >
          {submitText}
        </Button>
      </BootstrapModal.Footer>
    </BootstrapModal>
  );
};

export default memo(Modal);
