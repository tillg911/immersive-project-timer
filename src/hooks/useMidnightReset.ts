import { useEffect, useRef } from 'react';
import { useTimerStore } from '../stores/timerStore';
import { useProjectStore } from '../stores/projectStore';
import { saveTimeLog, saveCurrentDayLog } from '../utils/timeLog';

export function useMidnightReset() {
  const { currentDate, resetDay, projectTimes } = useTimerStore();
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

  // Periodic auto-save every 5 minutes as backup
  useEffect(() => {
    const autoSave = async () => {
      if (Object.keys(projectTimes).length > 0) {
        try {
          await saveCurrentDayLog(projectTimes, projects);
        } catch (error) {
          console.error('Failed to auto-save time log:', error);
        }
      }
    };

    // Auto-save every 5 minutes (300000ms)
    const interval = setInterval(autoSave, 300000);

    return () => clearInterval(interval);
  }, [projectTimes, projects]);
}
