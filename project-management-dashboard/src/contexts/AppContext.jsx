import React, { createContext, useReducer, useEffect, useCallback } from 'react';

// Action Types
const ACTIONS = {
  ADD: 'ADD',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  UPDATE_TASK_STATUS: 'UPDATE_TASK_STATUS',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
};

// Local Storage Utility
const storage = {
  get: (key, fallback = []) => {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (err) {
      console.error(`Error getting "${key}" from localStorage`, err);
      return fallback;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error(`Error setting "${key}" to localStorage`, err);
    }
  },
};

// Initial App State
const initialState = {
  employees: storage.get('employees'),
  projects: storage.get('projects'),
  tasks: storage.get('tasks'),
  loading: false,
  error: null,
};

// Reducer Function
const reducer = (state, { type, payload, entity }) => {
  switch (type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: payload };

    case ACTIONS.SET_ERROR:
      return { ...state, error: payload };

    case ACTIONS.ADD:
      return { ...state, [entity]: [...(state[entity] || []), payload] };

    case ACTIONS.UPDATE:
      return {
        ...state,
        [entity]: state[entity]?.map(item =>
          item.id === payload.id ? { ...item, ...payload } : item
        ),
      };

    case ACTIONS.DELETE:
      return {
        ...state,
        [entity]: state[entity]?.filter(item => item.id !== payload),
      };

    case ACTIONS.UPDATE_TASK_STATUS:
      return {
        ...state,
        tasks: state.tasks?.map(task =>
          task.id === payload.id ? { ...task, status: payload.status } : task
        ),
      };

    default:
      console.warn(`Unknown action type: ${type}`);
      return state;
  }
};

// Create Context
export const AppContext = createContext();

// Provider Component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Persist changes to localStorage
  useEffect(() => {
    storage.set('employees', state.employees);
    storage.set('projects', state.projects);
    storage.set('tasks', state.tasks);
  }, [state.employees, state.projects, state.tasks]);

  // Utility: Set Loading
  const setLoading = useCallback(value => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: value });
  }, []);

  // Utility: Set Error
  const setError = useCallback(error => {
    dispatch({ type: ACTIONS.SET_ERROR, payload: error });
  }, []);

  // Generalized Entity Add
  const addEntity = useCallback(async (entity, data) => {
    try {
      setLoading(true);
      const newItem = {
        ...data,
        id: data.id || Date.now().toString(36) + Math.random().toString(36).slice(2),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      dispatch({ type: ACTIONS.ADD, entity, payload: newItem });
      return newItem;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  // Generalized Entity Update
  const updateEntity = useCallback(async (entity, id, data) => {
    try {
      setLoading(true);
      const updatedItem = {
        ...data,
        id,
        updatedAt: new Date().toISOString(),
      };
      dispatch({ type: ACTIONS.UPDATE, entity, payload: updatedItem });
      return updatedItem;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  // Generalized Entity Delete
  const deleteEntity = useCallback(async (entity, id) => {
    try {
      setLoading(true);
      dispatch({ type: ACTIONS.DELETE, entity, payload: id });
      return id;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  // Task-specific: Update Status
  const updateTaskStatus = useCallback(async (id, status) => {
    try {
      setLoading(true);
      dispatch({
        type: ACTIONS.UPDATE_TASK_STATUS,
        payload: { id, status },
      });
      return { id, status };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  // Final Context Value
  const contextValue = {
    // State
    employees: state.employees || [],
    projects: state.projects || [],
    tasks: state.tasks || [],
    loading: state.loading,
    error: state.error,

    // CRUD Actions
    addEmployee: (data) => addEntity('employees', data),
    updateEmployee: (id, data) => updateEntity('employees', id, data),
    deleteEmployee: (id) => deleteEntity('employees', id),

    addProject: (data) => addEntity('projects', data),
    updateProject: (id, data) => updateEntity('projects', id, data),
    deleteProject: (id) => deleteEntity('projects', id),

    addTask: (data) => addEntity('tasks', data),
    updateTask: (id, data) => updateEntity('tasks', id, data),
    deleteTask: (id) => deleteEntity('tasks', id),
    updateTaskStatus,

    // Utility
    clearError: () => setError(null),
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};
