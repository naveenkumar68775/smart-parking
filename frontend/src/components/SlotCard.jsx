import React from 'react';

const STATUS_STYLES = {
  Available: 'border-green-400 bg-green-50 text-green-700',
  Occupied: 'border-red-400 bg-red-50 text-red-700',
  Reserved: 'border-amber-400 bg-amber-50 text-amber-700',
  Maintenance: 'border-gray-400 bg-gray-50 text-gray-500',
};

const SlotCard = ({ slot }) => (
  <div className={`border-2 rounded-xl p-3 text-center ${STATUS_STYLES[slot.status] || ''}`}>
    <div className="font-bold">{slot.slotNumber}</div>
    <div className="text-xs opacity-75">{slot.vehicleType}</div>
    <div className="text-xs opacity-75">
      {slot.floor} / {slot.section}
    </div>
    <div className="text-[11px] mt-1 font-semibold">{slot.status}</div>
    <div className="text-[11px] opacity-75">₹{slot.hourlyRate}/hr</div>
  </div>
);

export default SlotCard;
