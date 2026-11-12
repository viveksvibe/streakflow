import { useState, useMemo, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Clock } from 'lucide-react'
import { useHabitStore } from '../../store/habitStore'
import { CustomTimePicker } from '../common/CustomTimePicker'

// Defined outside the component — reference is stable across renders
const EMOJI_OPTIONS = ['🏃', '📖', '🧘', '💧', '💪', '🎯', '🎨', '🎵', '✍️', '🧹', '🥗', '😴']

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AddHabitModal = memo(({ isOpen, onClose }: Props) => {
  const { createHabit } = useHabitStore()

  const [name, setName] = useState('')
  const [icon, setIcon] = useState('✨')
  const [scheduleEnabled, setScheduleEnabled] = useState(false)
  const [scheduleTime, setScheduleTime] = useState('08:00')

  const handleAdd = useCallback(() => {
    if (!name.trim()) return
    createHabit({
      name: name.trim(),
      icon,
      reminderEnabled: scheduleEnabled,
      reminderTime: scheduleEnabled ? (scheduleTime || '08:00') : undefined,
    }).catch(() => {})
    setName('')
    setIcon('✨')
    setScheduleEnabled(false)
    setScheduleTime('08:00')
    onClose()
  }, [name, icon, scheduleEnabled, scheduleTime, createHabit, onClose])

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd()
  }, [handleAdd])

  const toggleSchedule = useCallback(() => setScheduleEnabled((v) => !v), [])

  const emojiButtons = useMemo(() => (
    EMOJI_OPTIONS.map((emoji) => (
      <button
        key={emoji}
        type="button"
        className={`w-9 h-9 rounded-xl text-base flex items-center justify-center cursor-pointer transition-all duration-200 ${
          icon === emoji
            ? 'bg-brand/15 ring-2 ring-brand scale-110'
            : 'bg-well hover:bg-line'
        }`}
        onClick={() => setIcon(emoji)}
      >
        {emoji}
      </button>
    ))
  ), [icon])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center px-6 sm:px-8 pointer-events-none">
            <motion.div
              className="w-full max-w-md bg-surface rounded-3xl p-7 sm:p-9 shadow-[var(--sf-card-shadow)] border border-line relative pointer-events-auto"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              {/* AUDIT FIX [5.3]: Accessible label for modal close button */}
              <button
                type="button"
                className="absolute top-4 right-4 w-7 h-7 rounded-full bg-well flex items-center justify-center text-ink-mute hover:bg-line hover:text-ink transition-colors cursor-pointer"
                onClick={onClose}
                aria-label="Close dialog"
              >
                <X size={15} />
              </button>

              <h3 className="text-[1.1rem] font-bold text-ink mb-5">New Habit</h3>

              <label className="text-[0.78rem] font-medium text-ink-mid mb-1.5 block">
                Habit Name
              </label>
              <input
                type="text"
                value={name}
                onChange={handleNameChange}
                placeholder="e.g. Morning Yoga"
                className="w-full h-11 px-4 rounded-xl border border-line bg-well text-ink text-[0.88rem] font-medium outline-none transition-all duration-200 focus:border-brand-ring focus:ring-2 focus:ring-brand-ring/20 placeholder:text-ink-mute"
                autoFocus
                onKeyDown={handleKeyDown}
              />

              <label className="text-[0.78rem] font-medium text-ink-mid mt-4 mb-2 block">
                Choose an Icon
              </label>
              <div className="flex flex-wrap gap-2">
                {emojiButtons}
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[0.78rem] font-medium text-ink-mid flex items-center gap-1.5">
                    <Clock size={13} className="text-brand" />
                    Schedule Reminder
                  </label>
                  <button
                    type="button"
                    className={`relative w-10 h-5.5 rounded-full transition-colors duration-300 cursor-pointer ${
                      scheduleEnabled ? 'bg-brand' : 'bg-line'
                    }`}
                    onClick={toggleSchedule}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-surface rounded-full shadow-md transition-transform duration-300 ${
                        scheduleEnabled ? 'translate-x-4.5' : 'translate-x-0'
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

              <motion.button
                className="w-full h-11 mt-6 bg-ink text-on-brand rounded-xl text-[0.88rem] font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)] active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed"
                onClick={handleAdd}
                disabled={!name.trim()}
                whileTap={{ scale: 0.97 }}
              >
                <Plus size={17} />
                Add Habit
              </motion.button>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
})

AddHabitModal.displayName = 'AddHabitModal'
