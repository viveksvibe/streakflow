import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Clock, Check } from 'lucide-react'
import { useHabitStore, type Habit } from '../../store/habitStore'
import { CustomTimePicker } from '../CustomTimePicker'

const emojiOptions = ['🏃', '📖', '🧘', '💧', '💪', '🎯', '🎨', '🎵', '✍️', '🧹', '🥗', '😴']

interface Props {
  habit: Habit | null;
  onClose: () => void;
}

export const EditHabitModal = ({ habit, onClose }: Props) => {
  const { updateHabit } = useHabitStore()
  
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('✨')
  const [scheduleEnabled, setScheduleEnabled] = useState(false)
  const [scheduleTime, setScheduleTime] = useState('08:00')

  useEffect(() => {
    if (habit) {
      setName(habit.name)
      setIcon(habit.icon)
      setScheduleEnabled(habit.reminderEnabled)
      setScheduleTime(habit.reminderTime || '08:00')
    }
  }, [habit])

  const handleUpdate = async () => {
    if (!habit || !name.trim()) return
    await updateHabit(habit.id, {
      name: name.trim(),
      icon,
      reminderEnabled: scheduleEnabled,
      reminderTime: scheduleEnabled ? (scheduleTime || '08:00') : undefined,
    })
    onClose()
  }

  return (
    <AnimatePresence>
      {habit && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center px-6 sm:px-8 pointer-events-none">
            <motion.div
              className="w-full max-w-md bg-white rounded-3xl p-7 sm:p-9 shadow-[0_16px_60px_rgba(0,0,0,0.18)] relative pointer-events-auto"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <button
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors cursor-pointer"
                onClick={onClose}
              >
                <X size={16} />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-sf-teal/10 flex items-center justify-center text-2xl">
                  {icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-dark">Edit Habit</h3>
                  <p className="text-[0.78rem] text-text-dark-secondary mt-0.5">
                    Update your habit details
                  </p>
                </div>
              </div>

              <label className="text-[0.82rem] font-medium text-text-dark-secondary mb-1.5 block">
                Habit Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Morning Yoga"
                className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 text-text-dark text-[0.92rem] font-medium outline-none transition-all duration-200 focus:border-sf-teal focus:ring-2 focus:ring-sf-teal/15 placeholder:text-gray-300"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
              />

              <label className="text-[0.82rem] font-medium text-text-dark-secondary mt-4 mb-2 block">
                Choose an Icon
              </label>
              <div className="flex flex-wrap gap-2">
                {emojiOptions.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center cursor-pointer transition-all duration-200 ${
                      icon === emoji
                        ? 'bg-sf-teal/15 ring-2 ring-sf-teal scale-110'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                    onClick={() => setIcon(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[0.82rem] font-medium text-text-dark-secondary flex items-center gap-1.5">
                    <Clock size={14} className="text-sf-teal" />
                    Schedule Reminder
                  </label>
                  <button
                    type="button"
                    className={`relative w-11 h-6 rounded-full transition-colors duration-300 cursor-pointer ${
                      scheduleEnabled ? 'bg-sf-teal' : 'bg-gray-200'
                    }`}
                    onClick={() => setScheduleEnabled(!scheduleEnabled)}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${
                        scheduleEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                {scheduleEnabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <CustomTimePicker
                      value={scheduleTime}
                      onChange={setScheduleTime}
                    />
                  </motion.div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  className="flex-1 h-12 rounded-xl border border-gray-200 text-text-dark-secondary text-[0.92rem] font-semibold cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <motion.button
                  className="flex-1 h-12 bg-gradient-to-r from-sf-teal to-sf-teal-light text-white rounded-xl text-[0.92rem] font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(44,181,160,0.35)] active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed"
                  onClick={handleUpdate}
                  disabled={!name.trim()}
                  whileTap={{ scale: 0.97 }}
                >
                  <Check size={18} strokeWidth={2.5} />
                  Save Changes
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
