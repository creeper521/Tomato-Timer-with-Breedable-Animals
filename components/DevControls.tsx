
import React, { useState } from 'react';
import { Settings, FastForward, Save, RefreshCw } from 'lucide-react';

interface DevControlsProps {
  focusTime: number;
  shortBreakTime: number;
  longBreakTime: number;
  onUpdateTimes: (focus: number, short: number, long: number) => void;
  onForceComplete: () => void;
}

export const DevControls: React.FC<DevControlsProps> = ({
  focusTime,
  shortBreakTime,
  longBreakTime,
  onUpdateTimes,
  onForceComplete,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localFocus, setLocalFocus] = useState(focusTime / 60);
  const [localShort, setLocalShort] = useState(shortBreakTime / 60);
  const [localLong, setLocalLong] = useState(longBreakTime / 60);

  const handleSave = () => {
    onUpdateTimes(localFocus * 60, localShort * 60, localLong * 60);
    alert('Timer settings updated! Reset the timer to apply changes.');
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {isOpen && (
        <div className="bg-slate-800 border border-slate-600 p-4 rounded-xl shadow-2xl w-64 mb-2 animate-fade-in">
          <h3 className="text-white font-bold mb-3 border-b border-slate-700 pb-2 flex items-center gap-2">
            <Settings size={16} /> Developer / Test Mode
          </h3>
          
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Focus Duration (mins)</label>
              <input 
                type="number" 
                step="0.1"
                value={localFocus}
                onChange={(e) => setLocalFocus(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 text-white px-2 py-1 rounded text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Short Break (mins)</label>
              <input 
                type="number" 
                step="0.1"
                value={localShort}
                onChange={(e) => setLocalShort(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 text-white px-2 py-1 rounded text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Long Break (mins)</label>
              <input 
                type="number" 
                step="0.1"
                value={localLong}
                onChange={(e) => setLocalLong(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 text-white px-2 py-1 rounded text-sm"
              />
            </div>

            <button 
              onClick={handleSave}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-1.5 rounded text-xs font-bold flex items-center justify-center gap-2 mt-2"
            >
              <Save size={14} /> Apply Settings
            </button>

            <div className="border-t border-slate-700 my-2 pt-2">
               <button 
                onClick={onForceComplete}
                className="w-full bg-amber-600 hover:bg-amber-500 text-white py-1.5 rounded text-xs font-bold flex items-center justify-center gap-2"
              >
                <FastForward size={14} /> Force Timer Complete
              </button>
              <p className="text-[10px] text-slate-500 mt-1 text-center">
                Use this to test rewards & AI instantly.
              </p>
            </div>
          </div>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-slate-700 hover:bg-slate-600 text-white p-3 rounded-full shadow-lg border border-slate-500 transition-transform hover:scale-110"
        title="Open Test Controls"
      >
        {isOpen ? <RefreshCw size={20} /> : <Settings size={20} />}
      </button>
    </div>
  );
};
