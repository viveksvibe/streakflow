import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useHabitStore } from '../store/habitStore';

export const useHabitReminders = () => {
  const habits = useHabitStore((state) => state.habits);
  const notifiedTimes = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Check every 10 seconds to not miss the minute mark
    const interval = setInterval(() => {
      const now = new Date();
      const currentHours = now.getHours().toString().padStart(2, '0');
      const currentMinutes = now.getMinutes().toString().padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;

      habits.forEach((habit) => {
        if (habit.reminderEnabled && habit.reminderTime === currentTimeStr && !habit.completedToday) {
          const notificationKey = `${habit.id}-${currentTimeStr}`;
          
          if (!notifiedTimes.current.has(notificationKey)) {
            toast(`Time for ${habit.name}!`, {
              icon: habit.icon,
              duration: 8000,
              style: {
                background: '#2cb5a0',
                color: '#fff',
                fontWeight: 'bold'
              }
            });
            notifiedTimes.current.add(notificationKey);
          }
        }
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [habits]);
};
