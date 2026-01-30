import { useEffect, useRef } from 'react';
import { useTimerStore } from '../stores/timerStore';
import { useProjectStore } from '../stores/projectStore';
import { saveTimeLog } from '../utils/timeLog';

export function useMidnightReset() {
  const { currentDate, resetDay } = useTimerStore();
  const { projects } = useProjectStore();
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    const checkMidnight = async () => {
      const today = new Date().toISOString().split('T')[0];

      if (currentDate && currentDate !== today && !hasCheckedRef.current) {
        hasCheckedRef.current = true;

        // Save the previous day's log
        const oldTimes = resetDay();

        try {
          await saveTimeLog(currentDate, oldTimes, projects);
        } catch (error) {
          console.error('Failed to save time log:', error);
        }

        hasCheckedRef.current = false;
      }
    };

    // Check immediately
    checkMidnight();

    // Check every minute
    const interval = setInterval(checkMidnight, 60000);

    return () => clearInterval(interval);
  }, [currentDate, resetDay, projects]);
}
