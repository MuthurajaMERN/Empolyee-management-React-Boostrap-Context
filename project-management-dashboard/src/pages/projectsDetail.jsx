import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext'; // Adjust path as needed

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects, updateProject } = useContext(AppContext);

  // State to manage the form
  const [form, setForm] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: ''
  });

  // Load the project details based on the ID
  useEffect(() => {
    if (projects.length === 0) {
      console.log('Loading projects...');
      return;
    }

    // Find the selected project
    const selectedProject = projects.find((p) => String(p.id) === String(id));

    if (!selectedProject) {
      console.warn('Project not found. Redirecting...');
      navigate('/projects');
    } else {
      console.log('Project found:', selectedProject);
      setForm({
        name: selectedProject.name || '',
        description: selectedProject.description || '',
        startDate: selectedProject.startDate || '',
        endDate: selectedProject.endDate || ''
      });
    }
  }, [projects, id, navigate]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    console.log('Form updated:', { ...form, [name]: value });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    const selectedProject = projects.find((p) => String(p.id) === String(id));

    if (!selectedProject) {
      alert('Cannot update. Project not found.');
      console.error('Project not found:', id);
      return;
    }

    // Validate form inputs
    if (!form.name || !form.description || !form.startDate || !form.endDate) {
      alert('All fields are required!');
      console.warn('Form validation failed:', form);
      return;
    }

    // Update the project
    updateProject(selectedProject.id, { ...form });

    // Success message
    alert('Project updated successfully!');
    console.log('Project updated:', form);

    // Redirect back to the projects list
    navigate('/projects');
  };

  // Display loading message when projects are still loading
  if (!projects.length) {
    return <div>Loading project...</div>;
  }

  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-semibold mb-4">Edit Project</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Project Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Start Date</label>
          <input
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1">End Date</label>
          <input
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default ProjectDetail;
