import React, { useState } from 'react';
import axios from 'axios';
import { AlertCircle } from 'lucide-react';

const ComplaintForm = ({ onAdded, userType }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: '',
    category: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const hostelerDepartments = [
    'Maintenance', 'Food', 'DSW', 'DCPD', 'Hostel', 'Fee Department', 
    'E-Governance', 'HOD', 'Faculty', 'Security', 'Others'
  ];

  const dayScholarDepartments = [
    'DSW', 'DCPD', 'Fee Department', 'Academics', 'HOD', 
    'E-Governance', 'Security', 'Others'
  ];

  const departments = userType === 'Hosteler' ? hostelerDepartments : dayScholarDepartments;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      let finalDept = formData.department;
      if (finalDept === 'Others') {
        const customDept = prompt("Please specify the department name:");
        if (!customDept) {
          setLoading(false);
          return;
        }
        finalDept = customDept;
      }

      const res = await axios.post('/complaints', { ...formData, department: finalDept });
      onAdded(res.data);
      setFormData({ title: '', description: '', department: '', category: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-bold text-slate-800 border-b pb-2">File a New Complaint</h3>
      
      <div className="bg-blue-50 border-l-4 border-primary-500 p-3 rounded-r-md flex items-start gap-2">
        <AlertCircle className="h-5 w-5 text-primary-500 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-primary-700">
          Please clearly describe your issue with all relevant details so that appropriate action can be taken.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-2 rounded text-sm text-center">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
        <input 
          type="text" 
          required 
          value={formData.title} 
          onChange={(e) => setFormData({...formData, title: e.target.value})} 
          className="w-full border border-slate-300 rounded-lg p-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
          placeholder="Brief summary of the issue"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
          <select 
            required 
            value={formData.department} 
            onChange={(e) => setFormData({...formData, department: e.target.value})}
            className="w-full border border-slate-300 rounded-lg p-2 focus:ring-primary-500 focus:border-primary-500 text-sm bg-white"
          >
            <option value="" disabled>Select Department</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
          <input 
            type="text" 
            required 
            value={formData.category} 
            onChange={(e) => setFormData({...formData, category: e.target.value})} 
            className="w-full border border-slate-300 rounded-lg p-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            placeholder="e.g. WiFi Issue, Cleanliness"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Description (Mandatory)</label>
        <textarea 
          required 
          rows="4" 
          value={formData.description} 
          onChange={(e) => setFormData({...formData, description: e.target.value})} 
          className="w-full border border-slate-300 rounded-lg p-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
          placeholder="Provide complete details..."
        ></textarea>
      </div>

      <div className="flex justify-end pt-2">
        <button 
          type="submit" 
          disabled={loading}
          className={`bg-primary-600 text-white px-5 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm ${loading ? 'opacity-70 cursor-wait' : 'hover:bg-primary-700'}`}
        >
          {loading ? 'Submitting...' : 'Submit Complaint'}
        </button>
      </div>
    </form>
  );
};

export default ComplaintForm;
