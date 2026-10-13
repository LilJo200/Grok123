import React, { useState } from 'react';
import { VehicleModelId, TestDriveBooking } from '../types/tesla';
import { VEHICLE_MODELS, TESLA_SHOWROOMS } from '../data/teslaData';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Compass,
  ArrowRight,
  Car,
} from 'lucide-react';

interface DemoDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultModelId?: VehicleModelId;
}

export const DemoDriveModal: React.FC<DemoDriveModalProps> = ({
  isOpen,
  onClose,
  defaultModelId = 'models',
}) => {
  const [modelId, setModelId] = useState<VehicleModelId>(defaultModelId);
  const [selectedShowroom, setSelectedShowroom] = useState(TESLA_SHOWROOMS[0].id);
  const [selectedDate, setSelectedDate] = useState('Tomorrow, 2:00 PM');
  const [fullName, setFullName] = useState('Alex Mercer');
  const [email, setEmail] = useState('alex.mercer@example.com');
  const [phone, setPhone] = useState('(555) 382-9011');
  const [hasLicense, setHasLicense] = useState(true);
  const [confirmedBooking, setConfirmedBooking] = useState<TestDriveBooking | null>(null);

  if (!isOpen) return null;

  const currentModel = VEHICLE_MODELS.find((m) => m.id === modelId) || VEHICLE_MODELS[0];
  const showroomObj = TESLA_SHOWROOMS.find((s) => s.id === selectedShowroom) || TESLA_SHOWROOMS[0];

  const timeSlots = [
    'Tomorrow, 10:00 AM',
    'Tomorrow, 11:30 AM',
    'Tomorrow, 2:00 PM',
    'Tomorrow, 4:00 PM',
    'Friday, 1:00 PM',
    'Saturday, 11:00 AM',
  ];

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    const booking: TestDriveBooking = {
      bookingId: `TD-${Math.floor(100000 + Math.random() * 900000)}`,
      modelId,
      modelName: currentModel.name,
      date: selectedDate.split(',')[0],
      timeSlot: selectedDate.split(',')[1]?.trim() || selectedDate,
      showroomLocation: `${showroomObj.name} (${showroomObj.address})`,
      fullName,
      email,
      phone,
      hasValidLicense: hasLicense,
    };
    setConfirmedBooking(booking);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#111216] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-white">
              <Compass className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Schedule a Demo Drive</h3>
              <p className="text-xs text-zinc-400">Experience Tesla acceleration and Autopilot</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {confirmedBooking ? (
          <div className="p-6 space-y-6 animate-fade-in text-center">
            <div className="w-14 h-14 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-lg font-bold text-white">Demo Drive Confirmed!</h4>
              <p className="text-xs text-zinc-400 mt-1">
                Your pass has been generated. Bring your driver's license to the showroom.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 text-left space-y-3 text-xs">
              <div className="flex justify-between border-b border-zinc-800 pb-2">
                <span className="text-zinc-500">Booking Pass ID:</span>
                <span className="font-mono font-bold text-white">{confirmedBooking.bookingId}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-2">
                <span className="text-zinc-500">Vehicle:</span>
                <span className="font-semibold text-white">{confirmedBooking.modelName}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-2">
                <span className="text-zinc-500">Date & Time:</span>
                <span className="font-medium text-cyan-300">{selectedDate}</span>
              </div>
              <div>
                <span className="text-zinc-500 block mb-0.5">Location:</span>
                <span className="text-zinc-300 block">{confirmedBooking.showroomLocation}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 px-4 rounded-xl text-xs font-semibold bg-white hover:bg-zinc-200 text-zinc-950 transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleConfirm} className="p-6 space-y-5">
            {/* Vehicle Selection */}
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                Select Model
              </label>
              <div className="grid grid-cols-3 gap-2">
                {VEHICLE_MODELS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setModelId(m.id)}
                    className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                      modelId === m.id
                        ? 'bg-zinc-800 border-white text-white'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Showroom Location */}
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                Tesla Showroom Hub
              </label>
              <select
                value={selectedShowroom}
                onChange={(e) => setSelectedShowroom(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-zinc-500"
              >
                {TESLA_SHOWROOMS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.state})
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-zinc-500 mt-1 block">
                {showroomObj.address}
              </span>
            </div>

            {/* Time Slot Picker */}
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                Available Appointment Slots
              </label>
              <div className="grid grid-cols-2 gap-2">
                {timeSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedDate(slot)}
                    className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-colors ${
                      selectedDate === slot
                        ? 'bg-zinc-800 border-cyan-500 text-white font-semibold'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Contact details */}
            <div className="space-y-3 pt-2 border-t border-zinc-800">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                <input
                  type="checkbox"
                  checked={hasLicense}
                  onChange={(e) => setHasLicense(e.target.checked)}
                  className="rounded border-zinc-700 bg-zinc-900 text-white"
                />
                <span>I hold a valid driver's license and am 18+ years of age</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-white hover:bg-zinc-200 text-zinc-950 transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              <span>Confirm Demo Drive</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
