import { useState, useEffect, useCallback } from 'react';
import { useTimerStore } from '../stores/timerStore';

export function useTimer(projectId: string) {
  const {
    activeProjectId,
    getProjectTime,
    startTimer,
    stopTimer,
  } = useTimerStore();

  const [elapsed, setElapsed] = useState(getProjectTime(projectId));
  const isActive = activeProjectId === projectId;

  useEffect(() => {
    setElapsed(getProjectTime(projectId));

    if (!isActive) return;

    const interval = setInterval(() => {
      setElapsed(getProjectTime(projectId));
    }, 1000);

    return () => clearInterval(interval);
  }, [projectId, isActive, getProjectTime]);

  const toggle = useCallback(() => {
    if (isActive) {
      stopTimer();
    } else {
      startTimer(projectId);
    }
  }, [isActive, projectId, startTimer, stopTimer]);

  return {
    elapsed,
    isActive,
    toggle,
  };
}

export function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function formatTimeVerbose(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}

export function formatTimeCompact(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    // Over 60 min: show hours and minutes
    return `${hours}h${minutes}m`;
  }

  // Under 60 min: show minutes and seconds
  return `${minutes}m${seconds}s`;
}
