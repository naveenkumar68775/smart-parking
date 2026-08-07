import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import api from '../../services/api';

const emptyForm = { vehicleNumber: '', vehicleName: '', vehicleBrand: '', vehicleColor: '', vehicleType: 'Car' };

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const { data } = await api.get('/vehicles');
      setVehicles(data.vehicles);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load vehicles');
    }
  };

  useEffect(() => { load(); }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await api.put(`/vehicles/${editingId}`, form);
      } else {
        await api.post('/vehicles', form);
      }
      setForm(emptyForm);
      setEditingId(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    }
  };

  const edit = (v) => {
    setEditingId(v._id);
    setForm({
      vehicleNumber: v.vehicleNumber,
      vehicleName: v.vehicleName || '',
      vehicleBrand: v.vehicleBrand || '',
      vehicleColor: v.vehicleColor || '',
      vehicleType: v.vehicleType,
    });
  };

  const remove = async (id) => {
    const confirm = await Swal.fire({
      title: 'Delete this vehicle?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
    });
    if (!confirm.isConfirmed) return;
    await api.delete(`/vehicles/${id}`);
    load();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">My Vehicles</h2>

      <form onSubmit={submit} className="card grid grid-cols-1 md:grid-cols-2 gap-3">
        {error && <div className="md:col-span-2 bg-red-50 text-red-600 text-sm rounded-lg p-3">{error}</div>}
        <div>
          <label className="label">Vehicle Number</label>
          <input className="input" name="vehicleNumber" value={form.vehicleNumber} onChange={onChange} required />
        </div>
        <div>
          <label className="label">Vehicle Name</label>
          <input className="input" name="vehicleName" value={form.vehicleName} onChange={onChange} />
        </div>
        <div>
          <label className="label">Brand</label>
          <input className="input" name="vehicleBrand" value={form.vehicleBrand} onChange={onChange} />
        </div>
        <div>
          <label className="label">Color</label>
          <input className="input" name="vehicleColor" value={form.vehicleColor} onChange={onChange} />
        </div>
        <div>
          <label className="label">Type</label>
          <select className="input" name="vehicleType" value={form.vehicleType} onChange={onChange}>
            <option>Car</option>
            <option>Bike</option>
            <option>EV</option>
            <option>VIP</option>
          </select>
        </div>
        <div className="flex items-end">
          <button className="btn-primary flex items-center gap-2" type="submit">
            <FaPlus /> {editingId ? 'Update Vehicle' : 'Add Vehicle'}
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {vehicles.map((v) => (
          <div key={v._id} className="card">
            <div className="font-bold">{v.vehicleNumber}</div>
            <div className="text-sm text-gray-500">{v.vehicleName} • {v.vehicleBrand} • {v.vehicleColor}</div>
            <div className="badge bg-primary-50 text-primary-700 mt-2">{v.vehicleType}</div>
            <div className="flex gap-3 mt-3">
              <button onClick={() => edit(v)} className="text-primary-600 flex items-center gap-1 text-sm"><FaEdit /> Edit</button>
              <button onClick={() => remove(v._id)} className="text-red-500 flex items-center gap-1 text-sm"><FaTrash /> Delete</button>
            </div>
          </div>
        ))}
        {vehicles.length === 0 && <p className="text-gray-500">No vehicles added yet.</p>}
      </div>
    </div>
  );
};

export default Vehicles;
