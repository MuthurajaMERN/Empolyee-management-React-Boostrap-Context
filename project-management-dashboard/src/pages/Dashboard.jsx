import React, { useContext, useState, memo } from 'react';
import { AppContext } from '../contexts/AppContext';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FiEdit, FiUser, FiBriefcase, FiCalendar, FiImage } from 'react-icons/fi';

const statusConfig = [
  { id: 'pending', title: 'To Do', color: '#6B7280' },
  { id: 'inprogress', title: 'In Progress', color: '#3B82F6' },
  { id: 'testing', title: 'Testing', color: '#F59E0B' },
  { id: 'completed', title: 'Done', color: '#10B981' }
];

const TaskCard = memo(({ task, employees, projects, onEdit }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'TASK',
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const project = projects.find((p) => p.id === task.projectId);
  const employee = employees.find((e) => e.id === task.assignedEmployeeId);
  const status = statusConfig.find((s) => s.id === task.status);

  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        backgroundColor: '#1F2937',
        color: 'white',
        borderLeft: `4px solid ${status?.color || '#6B7280'}`,
        borderRadius: '8px',
        padding: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        cursor: 'grab',
        marginBottom: '12px',
        transition: 'all 0.2s ease',
        ':hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }
      }}
    >
      <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>{task.title}</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiBriefcase style={{ color: '#9CA3AF', flexShrink: 0 }} />
          <span>{project?.title || 'No project'}</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiUser style={{ color: '#9CA3AF', flexShrink: 0 }} />
          <span>{employee?.name || 'Unassigned'}</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiCalendar style={{ color: '#9CA3AF', flexShrink: 0 }} />
          <span>{task.eta ? new Date(task.eta).toLocaleDateString() : 'No deadline'}</span>
        </div>
        
        {task.referenceImages && (
          <div style={{ marginTop: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <FiImage style={{ color: '#9CA3AF' }} />
              <span>Reference:</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
              {Array.isArray(task.referenceImages) ? (
                task.referenceImages.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Reference ${index + 1}`}
                    style={{
                      width: '80px',
                      height: '60px',
                      borderRadius: '4px',
                      border: '1px solid #374151',
                      objectFit: 'cover'
                    }}
                  />
                ))
              ) : (
                <img
                  src={task.referenceImages}
                  alt="Reference"
                  style={{
                    width: '100%',
                    maxHeight: '150px',
                    borderRadius: '4px',
                    border: '1px solid #374151',
                    objectFit: 'contain'
                  }}
                />
              )}
            </div>
          </div>
        )}
      </div>
      
      <button
        onClick={() => onEdit(task)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginTop: '16px',
          padding: '6px 12px',
          backgroundColor: '#4F46E5',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          transition: 'background-color 0.2s',
          ':hover': {
            backgroundColor: '#4338CA'
          }
        }}
      >
        <FiEdit size={14} />
        <span>Edit</span>
      </button>
    </div>
  );
});

const StatusColumn = ({ status, tasks, employees, projects, onTaskDrop, onEdit }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'TASK',
    drop: (item) => onTaskDrop(item.id, status.id),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const columnTasks = tasks.filter((task) => task.status === status.id);

  return (
    <div
      ref={drop}
      style={{
        flex: '1 0 300px',
        minWidth: '300px',
        maxWidth: '400px',
        backgroundColor: isOver ? '#1F2937' : '#111827',
        borderRadius: '12px',
        padding: '16px',
        transition: 'all 0.2s ease'
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        paddingBottom: '12px',
        borderBottom: '1px solid #374151'
      }}>
        <h2 style={{
          color: 'white',
          fontSize: '18px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: status.color
          }} />
          {status.title}
        </h2>
        <span style={{
          backgroundColor: '#374151',
          color: '#D1D5DB',
          borderRadius: '12px',
          padding: '2px 8px',
          fontSize: '12px'
        }}>
          {columnTasks.length}
        </span>
      </div>
      
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        height: 'calc(100vh - 220px)',
        overflowY: 'auto',
        paddingRight: '4px'
      }}>
        {columnTasks.length > 0 ? (
          columnTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              employees={employees}
              projects={projects}
              onEdit={onEdit}
            />
          ))
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100px',
            color: '#9CA3AF',
            fontStyle: 'italic'
          }}>
            No tasks here
          </div>
        )}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { tasks, projects, employees, updateTaskStatus } = useContext(AppContext);
  const [selectedProject, setSelectedProject] = useState('');
  const [editingTask, setEditingTask] = useState(null);

  const filteredTasks = selectedProject
    ? tasks.filter((task) => task.projectId === selectedProject)
    : tasks;

  const handleTaskDrop = (taskId, newStatus) => {
    updateTaskStatus(taskId, newStatus);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    // You can add modal opening logic here
    console.log('Editing task:', task);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#030712',
      color: 'white'
    }}>
      <header style={{
        backgroundColor: '#111827',
        padding: '16px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{
          fontSize: '20px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          🚀 Task Dashboard
        </h1>
      </header>
      
      <div style={{ padding: '16px' }}>
        <div style={{
          marginBottom: '16px',
          maxWidth: '400px'
        }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            color: '#D1D5DB'
          }}>
            Filter by Project:
          </label>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              backgroundColor: '#1F2937',
              color: 'white',
              border: '1px solid #374151',
              borderRadius: '6px',
              outline: 'none'
            }}
          >
            <option value="">All Projects</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </select>
        </div>
        
        <DndProvider backend={HTML5Backend}>
          <div style={{
            display: 'flex',
            gap: '16px',
            overflowX: 'auto',
            paddingBottom: '16px'
          }}>
            {statusConfig.map((status) => (
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
    </div>
  );
};

export default Dashboard;