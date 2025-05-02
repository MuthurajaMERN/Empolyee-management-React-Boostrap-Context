import React, { useContext, useState } from 'react';
import { AppContext } from '../contexts/AppContext';
import { useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';

const statuses = [
  { id: 'todo', title: 'Need to Do' },
  { id: 'inprogress', title: 'In Progress' },
  { id: 'testing', title: 'Need for Test' },
  { id: 'completed', title: 'Completed' },
  { id: 'reopen', title: 'Re-open' }
];

const TaskCard = ({ task, employees, projects, onEdit }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'TASK',
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    })
  }));

  const project = projects.find(p => p.id === task.projectId);
  const employee = employees.find(e => e.id === task.assignedEmployeeId);

  return (<div 
      ref={drag}
      className={`card mb-2 ${isDragging ? 'opacity-50' : ''}`}
      style={{ cursor: 'move' }}
    >
      <div className="card-body">
        <h6 className="card-title">{task.title}</h6>
        <p className="card-text small">
          <strong>Project:</strong> {project?.title || 'N/A'}<br />
          <strong>Assigned:</strong> {employee?.name || 'N/A'}<br />
          <strong>ETA:</strong> {new Date(task.eta).toLocaleDateString()}
        </p>
        {task.referenceImages && (
          <img 
            src={task.referenceImages} 
            alt="Reference" 
            className="img-fluid"
            style={{ maxHeight: '50px' }}
          />
        )}
        <button 
          className="btn btn-sm btn-outline-secondary mt-2"
          onClick={() => onEdit(task)}
        >
          Edit
        </button>
      </div>
    </div>
  );
};

const StatusColumn = ({ status, tasks, employees, projects, onTaskDrop, onEdit }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'TASK',
    drop: (item) => onTaskDrop(item.id, status.id),
    collect: (monitor) => ({
      isOver: !!monitor.isOver()
    })
  }));

  const columnTasks = tasks.filter(task => task.status === status.id);

  return (
    <div 
      ref={drop}
      className={`col-md-2 p-3 rounded ${isOver ? 'bg-light' : ''}`}
      style={{ minHeight: '500px', border: '1px dashed #ccc' }}
    >
      <h5 className="text-center">{status.title}</h5>
      <div className="mt-3">
        {columnTasks.map(task => (
          <TaskCard 
            key={task.id} 
            task={task} 
            employees={employees} 
            projects={projects}
            onEdit={onEdit}
          />
        ))}
      </div>
    </div>
  );
};

const Dashboard = () => {
  console.log('Rendering Dashboard component');
  const { tasks, projects, employees, updateTaskStatus } = useContext(AppContext);
  const [selectedProject, setSelectedProject] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  
  const filteredTasks = selectedProject 
    ? tasks.filter(task => task.projectId === selectedProject)
    : tasks;

  const handleTaskDrop = (taskId, newStatus) => {
    console.log(`Moving task ${taskId} to ${newStatus}`);
    updateTaskStatus(taskId, newStatus);
  };

  const handleEditTask = (task) => {
    console.log('Editing task from dashboard:', task);
    setEditingTask(task);
  };

  return (
    <div className="container mt-4">
      <h2>Project Dashboard</h2>
      
      <div className="mb-4">
        <label className="form-label">Filter by Project</label>
        <select 
          className="form-select"
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
        >
          <option value="">All Projects</option>
          {projects.map(project => (
            <option key={project.id} value={project.id}>{project.title}</option>
          ))}
        </select>
      </div>
      
      <DndProvider backend={HTML5Backend}>
        <div className="row">
          {statuses.map(status => (
            <StatusColumn
              key={status.id}
              status={status}
              tasks={filteredTasks}
              employees={employees}
              projects={projects}
              onTaskDrop={handleTaskDrop}
              onEdit={handleEditTask}
            />
          ))}
        </div>
      </DndProvider>
    </div>
  );
};

export default Dashboard;