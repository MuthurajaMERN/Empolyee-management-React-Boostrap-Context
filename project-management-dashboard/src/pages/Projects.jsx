import React, { useContext, useState, useEffect, useCallback } from 'react';
import { AppContext } from '../contexts/AppContext';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const initialForm = {
  id: '',
  title: '',
  description: '',
  logo: '',
  assignedEmployees: [],
  tasks: []
};

const Projects = () => {
  const { 
    projects, 
    employees, 
    addProject, 
    updateProject, 
    deleteProject 
  } = useContext(AppContext);

  const [form, setForm] = useState(initialForm);
  const [showModal, setShowModal] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal closes
  useEffect(() => {
    if (!showModal) {
      setForm(initialForm);
      setErrors({});
    }
  }, [showModal]);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleImage  = (e) => {
    const file = e?.target?.files?.[0];
    if (!file) return;
  
    // Validate image type
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, image: 'Only image files allowed' }));
      return;
    }
  
    // Validate size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, image: 'Max size 2MB' }));
      return;
    }
  
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      setPreview(loadEvent.target.result);
      setFormValue('image', loadEvent.target.result);
      setErrors(prev => ({ ...prev, image: '' }));
    };
    reader.onerror = () => setErrors(prev => ({ ...prev, image: 'Upload failed' }));
    reader.readAsDataURL(file);
  };
  const toggleEmployee = (employeeId) => {
    setForm(prev => ({
      ...prev,
      assignedEmployees: prev.assignedEmployees.includes(employeeId)
        ? prev.assignedEmployees.filter(id => id !== employeeId)
        : [...prev.assignedEmployees, employeeId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = 'Title is required';
    if (!form.description.trim()) newErrors.description = 'Description is required';
    if (!form.logo && !form.id) newErrors.logo = 'Logo is required';
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
  
    setIsSubmitting(true);
    
    try {
      const projectData = {
        title: form.title,
        description: form.description,
        logo: form.logo,
        assignedEmployees: form.assignedEmployees,
        tasks: form.tasks,
        updatedAt: new Date().toISOString()
      };
  
      if (form.id) {
        if (!updateProject) throw new Error('updateProject function not available');
        await updateProject(form.id, projectData);
        console.log('Project updated:', projectData);
      } else {
        if (!addProject) throw new Error('addProject function not available');
        await addProject(projectData);
        console.log('Project added:', projectData);
      }
  
      setShowModal(false);
    } catch (error) {
      console.error('Failed to save project:', error);
      setErrors(prev => ({ 
        ...prev, 
        form: error.message || 'Failed to save project' 
      }));
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleEdit = (project) => {
    setForm(project);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(id);
        console.log('Project deleted:', id);
      } catch (error) {
        console.error('Failed to delete project:', error);
      }
    }
  };

  return (
    <div className="container py-4">
    <div className="d-flex justify-content-between align-items-center mb-4">
      <h2>Projects</h2>
      <Button onClick={() => setShowModal(true)}>Add Project</Button>
    </div>
  
    {projects.length === 0 ? (
      <div className="alert alert-info">No projects found</div>
    ) : (
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        {projects.map(project => (
          <div key={project.id} className="col">
            <div className="card h-100">
              {project.logo && (
                <img 
                  src={project.logo} 
                  alt={project.title} 
                  className="card-img-top"
                  style={{ height: '200px', objectFit: 'cover' }}
                />
              )}
              <div className="card-body">
                <h5 className="card-title">{project.title}</h5>
                <p className="card-text text-muted">{project.description}</p>
                
                {project.assignedEmployees.length > 0 && (
                  <div className="mb-3">
                    <small className="text-muted">Assigned Team:</small>
                    <div className="d-flex flex-wrap gap-1 mt-1">
                      {project.assignedEmployees.map(empId => {
                        const employee = employees.find(e => e.id === empId);
                        return employee ? (
                          <span key={empId} className="badge bg-primary">
                            {employee.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>
              <div className="card-footer bg-transparent">
                <div className="d-flex gap-2">
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={() => handleEdit(project)}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={() => handleDelete(project.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  
    <Modal 
      show={showModal} 
      onHide={() => setShowModal(false)} 
      title={`${form.id ? 'Edit' : 'Add'} Project`}
    >
      {errors.form && (
        <div className="alert alert-danger">{errors.form}</div>
      )}
  
      <div className="mb-3">
        <label className="form-label">Title *</label>
        <Input
          type="text"
          name="title"
          className={`form-control ${errors.title ? 'is-invalid' : ''}`}
          value={form.title}
          onChange={handleInput}
        />
        {errors.title && (
          <div className="invalid-feedback">{errors.title}</div>
        )}
      </div>
  
      <div className="mb-3">
        <label className="form-label">Description *</label>
        <textarea
          name="description"
          className={`form-control ${errors.description ? 'is-invalid' : ''}`}
          value={form.description}
          onChange={handleInput}
          rows={3}
        />
        {errors.description && (
          <div className="invalid-feedback">{errors.description}</div>
        )}
      </div>
  
      <div className="mb-3">
        <label htmlFor="Upload Logo" className="form-label">Logo *</label>
        <Input
          type="file"
          accept="image/*"
          className={`form-control ${errors.logo ? 'is-invalid' : ''}`}
          onChange={(e)=>handleImage(e)}
        />
        {errors.logo && (
          <div className="invalid-feedback">{errors.logo}</div>
        )}
        {form.logo && (
          <img 
            src={form.logo} 
            alt="Preview" 
            className="img-thumbnail mt-2" 
            style={{ maxHeight: '700px' }} 
          />
        )}
      </div>
  
      {employees.length > 0 && (
        <div className="mb-3">
          <label className="form-label">Assign Team Members</label>
          <div className="border rounded p-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {employees.map(employee => (
              <div key={employee.id} className="form-check">
                <Input
                  type="checkbox"
                  className="form-check-input"
                  id={`emp-${employee.id}`}
                  checked={form.assignedEmployees.includes(employee.id)}
                  onChange={() => toggleEmployee(employee.id)}
                />
                <label 
                  htmlFor={`emp-${employee.id}`} 
                  className="form-check-label"
                >
                  {employee.name}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
  
      <div className="d-flex justify-content-end gap-2 mt-4">
        <Button
          type="button"
          variant="outline-secondary"
          onClick={() => setShowModal(false)}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          {form.id ? 'Update Project' : 'Create Project'}
        </Button>
      </div>
    </Modal>
  </div>
  );
};

export default Projects;