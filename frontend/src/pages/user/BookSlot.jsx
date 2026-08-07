import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../../services/api';
import { FaCar, FaMotorcycle, FaBolt, FaCrown, FaCheckCircle, FaMapMarkerAlt } from 'react-icons/fa';

const toLocalInputValue = (date) => {
  const d = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return d.toISOString().slice(0, 16);
};

const TYPE_ICONS = {
  Car: <FaCar className="text-blue-500" />,
  Bike: <FaMotorcycle className="text-emerald-500" />,
  EV: <FaBolt className="text-amber-500" />,
  VIP: <FaCrown className="text-purple-500" />,
};

const BookSlot = () => {
  const [slots, setSlots] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [slotId, setSlotId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [floorFilter, setFloorFilter] = useState('');
  const [expectedExitTime, setExpectedExitTime] = useState(
    toLocalInputValue(new Date(Date.now() + 2 * 60 * 60 * 1000))
  );
  const [vehicleType, setVehicleType] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loadSlots = async (type) => {
    try {
      const { data } = await api.get('/slots/available', { params: type ? { vehicleType: type } : {} });
      setSlots(data.slots || []);
      if (data.slots && data.slots.length > 0) {
        setSlotId(data.slots[0]._id);
      } else {
        setSlotId('');
      }
    } catch (err) {
      console.error('Failed to load slots:', err);
    }
  };

  useEffect(() => {
    loadSlots();
    api.get('/vehicles').then(({ data }) => {
      setVehicles(data.vehicles || []);
      if (data.vehicles && data.vehicles.length) {
        setVehicleId(data.vehicles[0]._id);
        if (data.vehicles[0].vehicleType) {
          setVehicleType(data.vehicles[0].vehicleType);
          loadSlots(data.vehicles[0].vehicleType);
        }
      }
    });
  }, []);

  const onVehicleTypeChange = (e) => {
    const type = e.target.value;
    setVehicleType(type);
    loadSlots(type);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!slotId || !vehicleId) {
      setError('Please select a slot and a vehicle');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/bookings', {
        slotId,
        vehicleId,
        expectedExitTime: new Date(expectedExitTime).toISOString(),
      });
      Swal.fire({ icon: 'success', title: 'Slot booked successfully!', text: `Booking ID: ${data.booking.bookingId}` });
      navigate('/my-bookings');
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const selectedSlot = slots.find((s) => s._id === slotId);

  const filteredSlots = slots.filter((s) => (!floorFilter ? true : s.floor === floorFilter));
  const availableFloors = Array.from(new Set(slots.map((s) => s.floor))).filter(Boolean);

  const groupedSlots = slots.reduce((acc, s) => {
    const floor = s.floor || 'Ground Floor';
    if (!acc[floor]) acc[floor] = [];
    acc[floor].push(s);
    return acc;
  }, {});

  const calculateHoursAndCost = () => {
    if (!selectedSlot || !expectedExitTime) return { hours: 0, cost: 0 };
    const exit = new Date(expectedExitTime);
    const now = new Date();
    const diffMs = exit - now;
    const hours = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)));
    return { hours, cost: hours * selectedSlot.hourlyRate };
  };

  const { hours: estimatedHours, cost: estimatedCost } = calculateHoursAndCost();

  if (vehicles.length === 0) {
    return (
      <div className="card max-w-md mx-auto text-center py-8">
        <div className="text-4xl mb-3 text-amber-500 flex justify-center">🚗</div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">No Vehicles Registered</h3>
        <p className="text-gray-600 mb-4">You need to add a vehicle to your profile before booking a parking slot.</p>
        <a href="/vehicles" className="btn-primary inline-block">Add Vehicle Now</a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Book a Parking Slot</h2>
          <p className="text-sm text-gray-500">Select an available spot organized by floor with hourly rate estimation.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Visual Interactive Slot Grid Selector */}
        <div className="lg:col-span-2 card space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
            <h3 className="font-semibold text-gray-700 flex items-center gap-2">
              <FaMapMarkerAlt className="text-blue-600" /> Choose Parking Spot ({slots.length} Total Slots)
            </h3>
            <div className="flex flex-wrap gap-2 text-xs">
              <select className="input text-xs py-1" value={vehicleType} onChange={onVehicleTypeChange}>
                <option value="">All Vehicle Types</option>
                <option value="Car">Car</option>
                <option value="Bike">Bike</option>
                <option value="EV">EV</option>
                <option value="VIP">VIP</option>
              </select>
              {availableFloors.length > 0 && (
                <select className="input text-xs py-1" value={floorFilter} onChange={(e) => setFloorFilter(e.target.value)}>
                  <option value="">All Floors ({availableFloors.length})</option>
                  {availableFloors.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {filteredSlots.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200 space-y-2">
              <p className="text-gray-600 font-medium">No available slots found for this filter.</p>
              <button
                type="button"
                onClick={() => {
                  setVehicleType('');
                  setFloorFilter('');
                  loadSlots('');
                }}
                className="btn-secondary text-xs py-1.5 px-3"
              >
                Reset Filters & Load All Slots
              </button>
            </div>
          ) : (
            <div>
              <div className="text-xs text-gray-500 mb-2">
                Showing {filteredSlots.length} available spots:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[400px] overflow-y-auto pr-1">
                {filteredSlots.map((s) => {
                  const isSelected = s._id === slotId;
                  return (
                    <button
                      key={s._id}
                      type="button"
                      onClick={() => setSlotId(s._id)}
                      className={`relative border-2 rounded-xl p-3 text-left transition-all duration-150 flex flex-col justify-between hover:shadow-md ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-400'
                          : 'border-green-300 bg-green-50/40 hover:border-blue-300'
                      }`}
                    >
                      {isSelected && (
                        <FaCheckCircle className="absolute top-2 right-2 text-blue-600 text-sm" />
                      )}
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-gray-800 text-sm">{s.slotNumber}</span>
                        <span className="text-sm">{TYPE_ICONS[s.vehicleType] || <FaCar />}</span>
                      </div>
                      <div className="text-[11px] text-gray-600 font-medium truncate">
                        {s.floor}
                      </div>
                      <div className="text-[10px] text-gray-500">
                        Sec {s.section} • {s.vehicleType}
                      </div>
                      <div className="text-xs font-semibold text-emerald-700 mt-2">
                        ₹{s.hourlyRate}<span className="text-[10px] font-normal text-gray-500">/hr</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Booking Form */}
        <div className="card space-y-4 h-fit">
          <h3 className="font-semibold text-gray-700 border-b pb-2">Booking Details</h3>
          <form onSubmit={submit} className="space-y-3">
            {error && <div className="bg-red-50 text-red-600 text-xs rounded-lg p-3 border border-red-200">{error}</div>}

            <div>
              <label className="label">Select Slot (Grouped by Floor)</label>
              <select className="input text-xs" value={slotId} onChange={(e) => setSlotId(e.target.value)} required>
                <option value="">-- Select a parking slot --</option>
                {Object.entries(groupedSlots).map(([floorName, floorSlots]) => (
                  <optgroup key={floorName} label={`📍 ${floorName} (${floorSlots.length} slots)`}>
                    {floorSlots.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.slotNumber} | {s.vehicleType} | Sec {s.section} — ₹{s.hourlyRate}/hr
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {selectedSlot && (
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 text-xs space-y-2 shadow-sm">
                <div className="flex justify-between items-center border-b border-blue-100 pb-1.5">
                  <span className="text-gray-500 font-medium">Slot Number:</span>
                  <span className="font-bold text-blue-900 text-sm">{selectedSlot.slotNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Floor Location:</span>
                  <span className="font-semibold text-gray-800">{selectedSlot.floor} (Sec {selectedSlot.section})</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Vehicle Type:</span>
                  <span className="font-semibold text-gray-800">{selectedSlot.vehicleType}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Hourly Rate (Cost):</span>
                  <span className="font-bold text-emerald-700">₹{selectedSlot.hourlyRate} / hour</span>
                </div>
                <div className="flex justify-between items-center pt-1.5 border-t border-blue-100 font-bold text-sm">
                  <span className="text-gray-700">Est. Total ({estimatedHours} hrs):</span>
                  <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-sm">₹{estimatedCost}</span>
                </div>
              </div>
            )}

            <div>
              <label className="label">Your Vehicle</label>
              <select className="input" value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} required>
                {vehicles.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.vehicleNumber} ({v.vehicleType})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Expected Exit Time</label>
              <input
                className="input"
                type="datetime-local"
                value={expectedExitTime}
                onChange={(e) => setExpectedExitTime(e.target.value)}
                required
              />
            </div>

            <button className="btn-primary w-full mt-4 py-2.5 text-sm font-medium" disabled={loading || !slotId} type="submit">
              {loading ? 'Booking...' : `Confirm & Book Slot (₹${estimatedCost || selectedSlot?.hourlyRate || 0})`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookSlot;
