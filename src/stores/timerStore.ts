import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface TimerSession {
  startTime: number;
  endTime: number | null;
  duration: number;
}

export interface ProjectTime {
  projectId: string;
  totalTime: number;
  sessions: TimerSession[];
}

interface TimerState {
  activeProjectId: string | null;
  activeStartTime: number | null;
  projectTimes: Record<string, ProjectTime>;
  currentDate: string;
}

interface TimerStore extends TimerState {
  startTimer: (projectId: string) => void;
  stopTimer: () => void;
  getProjectTime: (projectId: string) => number;
  getTodayTotal: () => number;
  updateProjectTime: (projectId: string, newTotalTime: number) => void;
  resetDay: () => Record<string, ProjectTime>;
  getActiveElapsed: () => number;
}

const getToday = () => new Date().toISOString().split('T')[0];

export const useTimerStore = create<TimerStore>()(
  persist(
    (set, get) => ({
      activeProjectId: null,
      activeStartTime: null,
      projectTimes: {},
      currentDate: getToday(),

      startTimer: (projectId: string) => {
        const state = get();
        const now = Date.now();

        // If there's an active timer, stop it first
        if (state.activeProjectId && state.activeStartTime) {
          const elapsed = now - state.activeStartTime;
          const currentProjectTime = state.projectTimes[state.activeProjectId] || {
            projectId: state.activeProjectId,
            totalTime: 0,
            sessions: [],
          };

          set((s) => ({
            projectTimes: {
              ...s.projectTimes,
              [state.activeProjectId!]: {
                ...currentProjectTime,
                totalTime: currentProjectTime.totalTime + elapsed,
                sessions: [
                  ...currentProjectTime.sessions,
                  {
                    startTime: state.activeStartTime!,
                    endTime: now,
                    duration: elapsed,
                  },
                ],
              },
            },
          }));
        }

        // Start new timer
        set({
          activeProjectId: projectId,
          activeStartTime: now,
        });
      },

      stopTimer: () => {
        const state = get();
        if (!state.activeProjectId || !state.activeStartTime) return;

        const now = Date.now();
        const elapsed = now - state.activeStartTime;
        const currentProjectTime = state.projectTimes[state.activeProjectId] || {
          projectId: state.activeProjectId,
          totalTime: 0,
          sessions: [],
        };

        set({
          activeProjectId: null,
          activeStartTime: null,
          projectTimes: {
            ...state.projectTimes,
            [state.activeProjectId]: {
              ...currentProjectTime,
              totalTime: currentProjectTime.totalTime + elapsed,
              sessions: [
                ...currentProjectTime.sessions,
                {
                  startTime: state.activeStartTime,
                  endTime: now,
                  duration: elapsed,
                },
              ],
            },
          },
        });
      },

      getProjectTime: (projectId: string) => {
        const state = get();
        const baseTime = state.projectTimes[projectId]?.totalTime || 0;

        if (state.activeProjectId === projectId && state.activeStartTime) {
          return baseTime + (Date.now() - state.activeStartTime);
        }

        return baseTime;
      },

      getTodayTotal: () => {
        const state = get();
        let total = Object.values(state.projectTimes).reduce(
          (sum, pt) => sum + pt.totalTime,
          0
        );

        if (state.activeProjectId && state.activeStartTime) {
          total += Date.now() - state.activeStartTime;
        }

        return total;
      },

      updateProjectTime: (projectId: string, newTotalTime: number) => {
        set((state) => {
          const existing = state.projectTimes[projectId] || {
            projectId,
            totalTime: 0,
            sessions: [],
          };

          return {
            projectTimes: {
              ...state.projectTimes,
              [projectId]: {
                ...existing,
                totalTime: newTotalTime,
              },
            },
          };
        });
      },

      resetDay: () => {
        const state = get();
        const oldTimes = { ...state.projectTimes };

        // Stop active timer before reset
        if (state.activeProjectId && state.activeStartTime) {
          const now = Date.now();
          const elapsed = now - state.activeStartTime;
          const currentProjectTime = oldTimes[state.activeProjectId] || {
            projectId: state.activeProjectId,
            totalTime: 0,
            sessions: [],
          };

          oldTimes[state.activeProjectId] = {
            ...currentProjectTime,
            totalTime: currentProjectTime.totalTime + elapsed,
            sessions: [
              ...currentProjectTime.sessions,
              {
                startTime: state.activeStartTime,
                endTime: now,
                duration: elapsed,
              },
            ],
          };
        }

        set({
          activeProjectId: null,
          activeStartTime: null,
          projectTimes: {},
          currentDate: getToday(),
        });

        return oldTimes;
      },

      getActiveElapsed: () => {
        const state = get();
        if (!state.activeProjectId || !state.activeStartTime) return 0;
        return Date.now() - state.activeStartTime;
      },
    }),
    {
      name: 'timer-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
