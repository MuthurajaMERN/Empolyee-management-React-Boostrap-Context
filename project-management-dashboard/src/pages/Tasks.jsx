import React, { useContext, useState, useRef, useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import { AppContext } from '../contexts/AppContext';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { BsPlusLg, BsTrash, BsPencilSquare, BsUpload, BsX } from 'react-icons/bs';

const Tasks = () => {
  const { tasks, projects, employees, addTask, updateTask, deleteTask } = useContext(AppContext);
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

  const validate = (data) => {
    const err = {};
    if (!data.title) err.title = 'Title is required';
    if (!data.description) err.description = 'Description is required';
    if (!data.projectId) err.projectId = 'Project is required';
    if (!data.assignedEmployeeId) err.assignedEmployeeId = 'Employee is required';
    if (!data.eta) err.eta = 'ETA is required';
    if (!data.referenceImages) err.referenceImages = 'Image is required';
    return err;
  };

  const onImageChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImg(reader.result);
        setValue('referenceImages', file);
      };
      reader.readAsDataURL(file);
    }
  }, [setValue]);

  const onSubmit = async (data) => {
    const errorList = validate(data);
    if (Object.keys(errorList).length > 0) return;

    const taskData = {
      ...data,
      eta: new Date(data.eta).toISOString(),
      status: editId ? data.status : 'Pending',
    };

    editId ? await updateTask(editId, taskData) : await addTask({ ...taskData, id: uuidv4() });
    setShowModal(false);
  };

  const openModal = useCallback((task = null) => {
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
  }, [reset]);

  const filteredEmployees = useMemo(() => {
    const project = projects.find((p) => p.id === watch('projectId'));
    return employees.filter((e) => project?.assignedEmployees?.includes(e.id));
  }, [watch('projectId'), projects, employees]);

  const statusBadge = {
    completed: 'success',
    inprogress: 'primary',
    testing: 'warning',
    pending: 'secondary',
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h2 className="mb-0 text-primary">📝 Task Manager</h2>
        <Button variant="success" onClick={() => openModal()}>
          <BsPlusLg className="me-2" /> Add Task
        </Button>
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle table-striped border rounded">
          <thead className="table-dark text-center">
            <tr>
              <th>Title</th>
              <th>Project</th>
              <th>Assigned</th>
              <th>ETA</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => {
              const project = projects.find((p) => p.id === task.projectId);
              const employee = employees.find((e) => e.id === task.assignedEmployeeId);

              return (
                <tr key={task.id} className="text-center">
                  <td>{task.title}</td>
                  <td>{project?.title || 'N/A'}</td>
                  <td>{employee?.name || 'N/A'}</td>
                  <td>{new Date(task.eta).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge bg-${statusBadge[task.status]}`}>{task.status}</span>
                  </td>
                  <td>
                    <Button variant="outline-info" size="sm" onClick={() => openModal(task)}>
                      <BsPencilSquare />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="ms-2"
                      onClick={() => deleteTask({ type: 'DELETE', payload: task.id })}
                    >
                      <BsTrash />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal show onClose={() => setShowModal(false)} title={editId ? 'Edit Task' : 'Add Task'}>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Input label="Title" name="title" register={register} error={errors.title?.message} required />
            <Input
              label="Description"
              name="description"
              as="textarea"
              rows={3}
              register={register}
              error={errors.description?.message}
              required
            />

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label">Project</label>
                <select className="form-select" {...register('projectId')}>
                  <option value="">Select Project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label">Assign To</label>
                <select className="form-select" {...register('assignedEmployeeId')} disabled={!watch('projectId')}>
                  <option value="">Select Employee</option>
                  {filteredEmployees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.position})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <Input label="ETA" name="eta" type="date" register={register} error={errors.eta?.message} required />
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

            <div className="mb-4">
              <label className="form-label fw-bold">Reference Image</label>
              <input type="file" accept="image/*" onChange={onImageChange} ref={fileRef} className="d-none" />
              <div className="border rounded p-3 text-center">
                {previewImg ? (
                  <img src={previewImg} alt="Preview" className="img-fluid mb-2" style={{ maxHeight: 150 }} />
                ) : (
                  <div className="py-4 text-muted">
                    <BsUpload size={30} />
                    <p>No image selected</p>
                  </div>
                )}

                <div className="d-flex justify-content-center gap-2">
                  <Button type="button" variant="outline-secondary" onClick={() => fileRef.current?.click()}>
                    <BsUpload className="me-1" /> Choose Image
                  </Button>
                  {previewImg && (
                    <Button
                      type="button"
                      variant="outline-danger"
                      onClick={() => {
                        setPreviewImg(null);
                        setValue('referenceImages', null);
                        fileRef.current.value = '';
                      }}
                    >
                      <BsX className="me-1" /> Remove
                    </Button>
                  )}
                </div>
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
        </Modal>
      )}
    </div>
  );
};

export default Tasks;
