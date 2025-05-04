import React, { useContext, useState, useRef } from 'react';
import { AppContext } from '../contexts/AppContext';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { useForm } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';

const Employees = () => {
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useContext(AppContext);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);

  const { 
    register, 
    handleSubmit, 
    reset, 
    formState: { errors, isValid, isDirty, touchedFields },
    setValue,
    trigger
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      name: '',
      position: '',
      email: '',
      profileImage: null
    }
  });

 
  const validationRules = {
    name: { 
      required: 'Name is required',
      minLength: {
        value: 2,
        message: 'Name must be at least 2 characters'
      }
    },
    position: { 
      required: 'Position is required' 
    },
    email: { 
      required: 'Email is required',
      pattern: {
        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        message: 'Invalid email address'
      }
    },
    profileImage: {
      validate: value => value !== null || 'Profile image is required'
    }
  };

  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setPreviewImage(null);
    reset({
      name: '',
      position: '',
      email: '',
      profileImage: null
    });
    setShowModal(true);
  };

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
    setPreviewImage(employee.profileImage || null);
    reset({
      name: employee.name,
      position: employee.position,
      email: employee.email,
      profileImage: employee.profileImage || null
    });
    setShowModal(true);
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setValue('profileImage', reader.result, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data) => {
    const employeeData = {
      ...data,
      id: editingEmployee ? editingEmployee.id : uuidv4()
    };

    if (editingEmployee) {
      updateEmployee(editingEmployee.id, employeeData);
    } else {
      addEmployee(employeeData);
    }
    
    setShowModal(false);
    reset();
    setPreviewImage(null);
  };

  const getFieldStatus = (name) => {
    if (errors[name]) return 'error';
    if (touchedFields[name]) return 'success';
    return null;
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Employee Management</h2>
      <Button variant="primary" onClick={handleAddEmployee} className="mb-4">
        <i className="bi bi-plus-circle me-2"></i>Add Employee
      </Button>
      
      <div className="row">
        {employees.map(employee => (
          <div key={employee.id} className="col-md-4 mb-4">
            <div className="card h-100 shadow-sm">
              <div className="card-img-top overflow-hidden" style={{ height: '200px' }}>
                <img 
                  src={employee.profileImage || 'https://via.placeholder.com/300x200?text=No+Image'} 
                  className="w-100 h-100 object-fit-cover"
                  alt={employee.name}
                />
              </div>
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{employee.name}</h5>
                <p className="card-text text-muted">{employee.position}</p>
                <p className="card-text">
                  <a href={`mailto:${employee.email}`}>{employee.email}</a>
                </p>
                <div className="mt-auto d-flex justify-content-between">
                  <Button 
                    variant="outline-primary" 
                    onClick={() => handleEditEmployee(employee)}
                    size="sm"
                  >
                    <i className="bi bi-pencil me-1"></i>Edit
                  </Button>
                  <Button 
                    variant="outline-danger" 
                    onClick={() => deleteEmployee(employee.id)}
                    size="sm"
                  >
                    <i className="bi bi-trash me-1"></i>Delete
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setPreviewImage(null);
        }}
        title={editingEmployee ? 'Edit Employee' : 'Add Employee'}
        onSubmit={handleSubmit(onSubmit)}
        size="fullscreen" 
        disableSubmit={!isValid || !isDirty}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="p-3">
          <div className="row">
            <div className="col-md-6">
              <Input
                label="Full Name"
                name="name"
                register={register}
                validation={validationRules.name}
                error={errors.name}
                status={getFieldStatus('name')}
              />
              <Input
                label="Position"
                name="position"
                register={register}
                validation={validationRules.position}
                error={errors.position}
                status={getFieldStatus('position')}
              />
              <Input
                label="Email Address"
                name="email"
                type="email"
                register={register}
                validation={validationRules.email}
                error={errors.email}
                status={getFieldStatus('email')}
              />
            </div>
            <div className="col-md-6">
              <div className="mb-4">
                <label className="form-label fw-bold">Profile Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  ref={fileInputRef}
                  className="d-none"
                />
                
                <div className="d-flex flex-column align-items-center">
                  <div 
                    className="mb-3 position-relative" 
                    style={{ 
                      width: '200px', 
                      height: '200px', 
                      borderRadius: '50%', 
                      overflow: 'hidden', 
                      border: `2px dashed ${errors.profileImage ? '#dc3545' : '#dee2e6'}`
                    }}
                  >
                    {previewImage ? (
                      <img 
                        src={previewImage} 
                        alt="Preview" 
                        className="w-100 h-100 object-fit-cover"
                      />
                    ) : (
                      <div className="w-100 h-100 d-flex flex-column justify-content-center align-items-center text-muted bg-light">
                        <i className="bi bi-person-bounding-box fs-1"></i>
                        <small>No image selected</small>
                      </div>
                    )}
                    {errors.profileImage && (
                      <div className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-danger bg-opacity-10">
                        <i className="bi bi-exclamation-circle-fill text-danger fs-4"></i>
                      </div>
                    )}
                  </div>
                  
                  <div className="d-flex gap-2">
                    <Button 
                      variant="outline-secondary" 
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                    >
                      <i className="bi bi-upload me-1"></i>Choose Image
                    </Button>
                    {previewImage && (
                      <Button 
                        variant="outline-danger" 
                        type="button"
                        onClick={() => {
                          setPreviewImage(null);
                          setValue('profileImage', null, { shouldValidate: true });
                        }}
                      >
                        <i className="bi bi-trash me-1"></i>Remove
                      </Button>
                    )}
                  </div>
                </div>
                
                {errors.profileImage && (
                  <div className="text-danger small mt-2">{errors.profileImage.message}</div>
                )}
              </div>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Employees;