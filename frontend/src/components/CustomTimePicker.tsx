import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock } from 'lucide-react';

interface Props {
  value: string; // "HH:mm" in 24-hour format
  onChange: (val: string) => void;
}

export const CustomTimePicker = ({ value, onChange }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // parse value safely
  const [hStr, mStr] = (value || '08:00').split(':');
  let hour = parseInt(hStr || '8', 10);
  const minute = parseInt(mStr || '0', 10);
  
  const isPM = hour >= 12;
  const displayHour = hour % 12 || 12;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleHourChange = (newDisplayHour: number, currentIsPM: boolean) => {
    let newH = newDisplayHour;
    if (currentIsPM && newH < 12) newH += 12;
    if (!currentIsPM && newH === 12) newH = 0;
    onChange(`${newH.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
  };

  const handleMinuteChange = (newMin: number) => {
    onChange(`${hour.toString().padStart(2, '0')}:${newMin.toString().padStart(2, '0')}`);
  };

  const handleAMPMChange = (newIsPM: boolean) => {
    let newH = displayHour;
    if (newIsPM && newH < 12) newH += 12;
    if (!newIsPM && newH === 12) newH = 0;
    onChange(`${newH.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
  };

  return (
    <div className="relative" ref={containerRef}>
      <div 
        className="w-full  h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-between cursor-pointer hover:border-sf-teal transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2.5">
          <Clock size={16} className="text-sf-teal" />
          <span className="text-text-dark font-bold text-[0.95rem]">
            {displayHour.toString().padStart(2, '0')}:{minute.toString().padStart(2, '0')} {isPM ? 'PM' : 'AM'}
          </span>
        </div>
        <div className="text-[0.72rem] font-bold text-sf-teal bg-sf-teal/10 px-2.5 py-1 rounded-md">
          Edit
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="absolute z-50 bottom-0 left-0 w-full bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.15)] border border-gray-100 p-4"
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex justify-between gap-2 h-[180px]">
              {/* Hours Column */}
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-1.5 flex flex-col gap-1">
                <div className="text-[0.65rem] font-extrabold text-gray-400 uppercase text-center sticky top-0 bg-white py-1.5 z-10">
                  Hour
                </div>
                {[1,2,3,4,5,6,7,8,9,10,11,12].map(h => (
                  <button 
                    key={h}
                    className={`py-2 rounded-lg text-sm font-bold transition-all ${
                      displayHour === h 
                        ? 'bg-gradient-to-r from-sf-teal to-sf-teal-light text-white shadow-md' 
                        : 'text-text-dark-secondary hover:bg-gray-100'
                    }`}
                    onClick={() => handleHourChange(h, isPM)}
                  >
                    {h.toString().padStart(2, '0')}
                  </button>
                ))}
              </div>
              
              {/* Minutes Column */}
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-1.5 flex flex-col gap-1">
                <div className="text-[0.65rem] font-extrabold text-gray-400 uppercase text-center sticky top-0 bg-white py-1.5 z-10">
                  Minute
                </div>
                {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map(m => (
                  <button 
                    key={m}
                    className={`py-2 rounded-lg text-sm font-bold transition-all ${
                      minute === m 
                        ? 'bg-gradient-to-r from-sf-teal to-sf-teal-light text-white shadow-md' 
                        : 'text-text-dark-secondary hover:bg-gray-100'
                    }`}
                    onClick={() => handleMinuteChange(m)}
                  >
                    {m.toString().padStart(2, '0')}
                  </button>
                ))}
              </div>

              {/* AM/PM Column */}
              <div className="flex-1 flex flex-col gap-2 pt-6 pb-1">
                <button 
                  className={`flex-1 rounded-xl font-extrabold text-[0.85rem] transition-all ${
                    !isPM 
                      ? 'bg-text-dark text-white shadow-lg scale-105' 
                      : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                  }`}
                  onClick={() => handleAMPMChange(false)}
                >
                  AM
                </button>
                <button 
                  className={`flex-1 rounded-xl font-extrabold text-[0.85rem] transition-all ${
                    isPM 
                      ? 'bg-text-dark text-white shadow-lg scale-105' 
                      : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                  }`}
                  onClick={() => handleAMPMChange(true)}
                >
                  PM
                </button>
              </div>
            </div>
            <button 
              className="w-full mt-4 py-2.5 rounded-xl bg-gray-50 text-text-dark font-extrabold text-[0.9rem] hover:bg-gray-100 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Done
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
