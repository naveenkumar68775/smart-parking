import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data.users);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
    }
  };

  useEffect(() => { load(); }, []);

  const toggleActive = async (id) => {
    await api.put(`/users/${id}/toggle-active`);
    load();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Manage Users</h2>
      {error && <div className="text-red-600">{error}</div>}

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="py-2">Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th><th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-b last:border-0">
                <td className="py-2">{u.name}</td>
                <td>{u.email}</td>
                <td>{u.phone || '-'}</td>
                <td><span className="badge bg-primary-50 text-primary-700">{u.role}</span></td>
                <td>
                  <span className={`badge ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {u.isActive ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td>
                  <button onClick={() => toggleActive(u._id)} className="text-primary-600 text-sm">
                    {u.isActive ? 'Disable' : 'Enable'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageUsers;
