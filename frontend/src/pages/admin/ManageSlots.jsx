import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import api from '../../services/api';
import SlotCard from '../../components/SlotCard';

const emptyForm = { slotNumber: '', floor: 'Ground', section: 'A', vehicleType: 'Car', hourlyRate: 20 };

const ManageSlots = () => {
  const [slots, setSlots] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [carCount, setCarCount] = useState(10);

  const load = async () => {
    try {
      const { data } = await api.get('/slots');
      setSlots(data.slots);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load slots');
    }
  };

  useEffect(() => { load(); }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/slots', form);
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create slot');
    }
  };

  const toggleStatus = async (slot, status) => {
    await api.put(`/slots/${slot._id}`, { status });
    load();
  };

  const remove = async (id) => {
    const confirm = await Swal.fire({ title: 'Delete this slot?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Delete' });
    if (!confirm.isConfirmed) return;
    await api.delete(`/slots/${id}`);
    load();
  };

  const seedDemo = async () => {
    try {
      await api.post('/slots/seed');
      load();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Seed failed', text: err.response?.data?.message });
    }
  };

  const addCarSlots = async () => {
    try {
      const { data } = await api.post('/slots/add-cars', { count: Number(carCount) || 10 });
      Swal.fire({ icon: 'success', title: data.message, timer: 1500, showConfirmButton: false });
      load();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Failed', text: err.response?.data?.message });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <h2 className="text-2xl font-bold">Manage Parking Slots</h2>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={seedDemo}>Seed Demo Slots</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <form onSubmit={submit} className="card space-y-1">
          <h3 className="font-semibold mb-1">Add New Slot</h3>
          {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3">{error}</div>}
          <label className="label">Slot Number</label>
          <input className="input" name="slotNumber" value={form.slotNumber} onChange={onChange} required />
          <label className="label">Floor</label>
          <input className="input" name="floor" value={form.floor} onChange={onChange} />
          <label className="label">Section</label>
          <input className="input" name="section" value={form.section} onChange={onChange} />
          <label className="label">Vehicle Type</label>
          <select className="input" name="vehicleType" value={form.vehicleType} onChange={onChange}>
            <option>Car</option><option>Bike</option><option>EV</option><option>VIP</option>
          </select>
          <label className="label">Hourly Rate</label>
          <input className="input" type="number" name="hourlyRate" value={form.hourlyRate} onChange={onChange} />
          <button className="btn-primary w-full mt-3" type="submit">Add Slot</button>
        </form>

        <div className="card">
          <h3 className="font-semibold mb-3">Bulk Add Car Slots</h3>
          <label className="label">Count</label>
          <input className="input" type="number" min="1" value={carCount} onChange={(e) => setCarCount(e.target.value)} />
          <button className="btn-primary w-full mt-3" onClick={addCarSlots}>Add Car Slots</button>
          <p className="text-xs text-gray-500 mt-2">Creates sequential "C-01, C-02, ..." car slots (skips existing numbers).</p>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">All Slots ({slots.length})</h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {slots.map((slot) => (
            <div key={slot._id} className="relative group">
              <SlotCard slot={slot} />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex flex-col items-center justify-center gap-1 text-white text-[10px]">
                {slot.status !== 'Maintenance' ? (
                  <button onClick={() => toggleStatus(slot, 'Maintenance')} className="hover:underline">Disable</button>
                ) : (
                  <button onClick={() => toggleStatus(slot, 'Available')} className="hover:underline">Enable</button>
                )}
                <button onClick={() => remove(slot._id)} className="hover:underline text-red-300">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageSlots;
