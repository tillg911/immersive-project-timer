import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Project {
  id: string;
  name: string;
  color: string;
  icon: string;
  archived?: boolean;
  // CSV Export fields
  ignoreForCsvExport?: boolean;
  jobCode?: string;
  internalDescription?: string;
  workpackage?: string;
  customer?: string;
  projectCode?: string;
  km?: number;
}

interface ProjectStore {
  projects: Project[];
  addProject: (project: Omit<Project, 'id'>) => void;
  updateProject: (id: string, updates: Partial<Omit<Project, 'id'>>) => void;
  removeProject: (id: string) => void;
  getProject: (id: string) => Project | undefined;
  archiveProject: (id: string) => void;
  unarchiveProject: (id: string) => void;
}

const defaultProjects: Project[] = [
  { id: '1', name: 'Project 1', color: '#F87171', icon: 'Briefcase' },
  { id: '2', name: 'Project 2', color: '#A78BFA', icon: 'Code' },
  { id: '3', name: 'Project 3', color: '#86EFAC', icon: 'Palette' },
];

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: defaultProjects,

      addProject: (project) =>
        set((state) => ({
          projects: [
            ...state.projects,
            { ...project, id: crypto.randomUUID() },
          ],
        })),

      updateProject: (id, updates) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),

      removeProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
        })),

      getProject: (id) => get().projects.find((p) => p.id === id),

      archiveProject: (id) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, archived: true } : p
          ),
        })),

      unarchiveProject: (id) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, archived: false } : p
          ),
        })),
    }),
    {
      name: 'project-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
