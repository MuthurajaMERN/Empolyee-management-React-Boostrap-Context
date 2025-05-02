import React, { useContext, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { v4 as uuidv4 } from 'uuid';
import { AppContext } from '../contexts/AppContext';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const schema = yup.object({
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
  projectId: yup.string().required('Select a project'),
  assignedEmployeeId: yup.string().required('Select an employee'),
  eta: yup.date().required('ETA is required'),
  referenceImages: yup.mixed().required('Image is required'),
});

const Tasks = () => {
  const { tasks, projects, employees,addTask,updateTask,deleteTask} = useContext(AppContext);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [previewImg, setPreviewImg] = useState(null);
  const fileRef = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      projectId: '',
      assignedEmployeeId: '',
      eta: '',
      referenceImages: null,
      status: 'Pending',
    },
  });

  const onImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImg(reader.result);
        setValue('referenceImages', file, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };

  // const onSubmit = (data) => {
  //   dispatchTasks({
  //     type: editId ? 'UPDATE' : 'ADD',
  //     payload: {
  //       ...data,
  //       id: editId || uuidv4(),
  //       eta: new Date(data.eta).toISOString(),
  //       status: editId ? data.status : 'Pending',
  //     },
  //   });
  //   setShowModal(false);
  // };
  const onSubmit = async (data) => {
    const taskData = {
      ...data,
      eta: new Date(data.eta).toISOString(),
      status: editId ? data.status : 'Pending',
    };

    if (editId) {
      await updateTask(editId, taskData);
    } else {
      await addTask({ ...taskData, id: uuidv4() });
    }

    setShowModal(false);
  };


  const openModal = (task = null) => {
    setEditId(task?.id || null);
    setPreviewImg(task?.referenceImages || null);
    reset(task || {
      title: '',
      description: '',
      projectId: '',
      assignedEmployeeId: '',
      eta: '',
      referenceImages: null,
      status: 'Pending',
    });
    setShowModal(true);
  };

  const filteredEmployees = employees.filter((e) =>
    projects.find((p) => p.id === watch('projectId'))?.assignedEmployees.includes(e.id)
  );

  const statusBadge = {
    completed: 'success',
    inprogress: 'primary',
    testing: 'warning',
    Pending: 'secondary',
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h2 className="mb-0">Task Management</h2>
        <Button variant="primary" onClick={() => openModal()}>
          <i className="bi bi-plus-lg me-1"></i>Add Task
        </Button>
      </div>

      {/* ✅ Task Table */}
      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>Title</th>
              <th>Project</th>
              <th>Assigned</th>
              <th>ETA</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => {
              const project = projects.find((p) => p.id === task.projectId);
              const employee = employees.find((e) => e.id === task.assignedEmployeeId);

              return (
                <tr key={task.id}>
                  <td>{task.title}</td>
                  <td>{project?.title || 'N/A'}</td>
                  <td>{employee?.name || 'N/A'}</td>
                  <td>{new Date(task.eta).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge bg-${statusBadge[task.status]}`}>{task.status}</span>
                  </td>
                  <td>
                    <Button variant="outline-primary" size="sm" onClick={() => openModal(task)}>
                      <i className="bi bi-pencil"></i>
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="ms-2"
                      onClick={() => deleteTask({ type: 'DELETE', payload: task.id })}
                    >
                      <i className="bi bi-trash"></i>
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ✅ Modal */}
      {showModal && (
        <Modal  show={true} onClose={() => setShowModal(false)} title={editId ? 'Edit Task' : 'Add Task'}>
        <div>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Input label="Title" name="title" register={register} error={errors.title} required />
            <Input
              label="Description"
              name="description"
              as="textarea"
              rows={3}
              register={register}
              error={errors.description}
              required
            />

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label">Project</label>
                <select className={`form-select ${errors.projectId ? 'is-invalid' : ''}`} {...register('projectId')}>
                  <option value="">Select Project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
                {errors.projectId && <div className="invalid-feedback">{errors.projectId.message}</div>}
              </div>

              <div className="col-md-6">
                <label className="form-label">Assign To</label>
                <select
                  className={`form-select ${errors.assignedEmployeeId ? 'is-invalid' : ''}`}
                  {...register('assignedEmployeeId')}
                  disabled={!watch('projectId')}
                >
                  <option value="">Select Employee</option>
                  {filteredEmployees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.position})
                    </option>
                  ))}
                </select>
                {errors.assignedEmployeeId && (
                  <div className="invalid-feedback">{errors.assignedEmployeeId.message}</div>
                )}
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <Input label="ETA" name="eta" type="date" register={register} error={errors.eta} required />
              </div>
              {editId && (
                <div className="col-md-6">
                  <label className="form-label">Status</label>
                  <select className="form-select" {...register('status')}>
                    {['Pending', 'inprogress', 'testing', 'completed'].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* ✅ Image Upload */}
            <div className="mb-4">
              <label className="form-label fw-bold">Reference Image</label>
              <input type="file" accept="image/*" onChange={onImageChange} ref={fileRef} className="d-none" />

              <div className="border rounded p-3 text-center">
                {previewImg ? (
                  <img src={previewImg} alt="Preview" className="img-fluid mb-2" style={{ maxHeight: 150 }} />
                ) : (
                  <div className="py-4 text-muted">
                    <i className="bi bi-image fs-1"></i>
                    <p>No image selected</p>
                  </div>
                )}

                <div className="d-flex justify-content-center gap-2">
                  <Button type="button" variant="outline-secondary" onClick={() => fileRef.current?.click()}>
                    <i className="bi bi-upload me-1"></i>Choose Image
                  </Button>
                  {previewImg && (
                    <Button
                      type="button"
                      variant="outline-danger"
                      onClick={() => {
                        setPreviewImg(null);
                        setValue('referenceImages', null, { shouldValidate: true });
                        fileRef.current.value = '';
                      }}
                    >
                      <i className="bi bi-trash me-1"></i>Remove
                    </Button>
                  )}
                </div>
                {errors.referenceImages && (
                  <div className="text-danger small mt-2">{errors.referenceImages.message}</div>
                )}
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="outline-secondary" type="button" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editId ? 'Update Task' : 'Create Task'}
              </Button>
            </div>
          </form>
        </div>
        </Modal>
      )}
    </div>
  );
};

export default Tasks;
