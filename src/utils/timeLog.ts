import { writeTextFile, readTextFile, exists, mkdir, BaseDirectory } from '@tauri-apps/plugin-fs';
import type { ProjectTime } from '../stores/timerStore';
import type { Project } from '../stores/projectStore';

export interface TimeLogEntry {
  date: string;
  projects: {
    id: string;
    name: string;
    icon: string;
    color: string;
    totalTime: number;
    sessions: {
      startTime: number;
      endTime: number | null;
      duration: number;
    }[];
    // Daily description (set per day, not stored in project)
    description?: string;
    // CSV Export fields (copied from project)
    ignoreForCsvExport?: boolean;
    jobCode?: string;
    internalDescription?: string;
    workpackage?: string;
    customer?: string;
    projectCode?: string;
    km?: number;
  }[];
}

const LOGS_DIR = 'time-logs';

async function ensureLogsDir() {
  const dirExists = await exists(LOGS_DIR, { baseDir: BaseDirectory.AppData });
  if (!dirExists) {
    await mkdir(LOGS_DIR, { baseDir: BaseDirectory.AppData, recursive: true });
  }
}

export async function saveTimeLog(
  date: string,
  projectTimes: Record<string, ProjectTime>,
  projects: Project[],
  projectDescriptions?: Record<string, string>
): Promise<void> {
  await ensureLogsDir();

  const projectsWithData = projects
    .filter((p) => projectTimes[p.id])
    .map((p) => ({
      id: p.id,
      name: p.name,
      icon: p.icon,
      color: p.color,
      totalTime: projectTimes[p.id].totalTime,
      sessions: projectTimes[p.id].sessions,
      // Daily description
      description: projectDescriptions?.[p.id],
      // CSV Export fields
      ignoreForCsvExport: p.ignoreForCsvExport,
      jobCode: p.jobCode,
      internalDescription: p.internalDescription,
      workpackage: p.workpackage,
      customer: p.customer,
      projectCode: p.projectCode,
      km: p.km,
    }));

  const entry: TimeLogEntry = {
    date,
    projects: projectsWithData,
  };

  const filename = `${LOGS_DIR}/${date}.json`;

  await writeTextFile(filename, JSON.stringify(entry, null, 2), {
    baseDir: BaseDirectory.AppData,
  });
}

export async function loadTimeLog(date: string): Promise<TimeLogEntry | null> {
  try {
    const filename = `${LOGS_DIR}/${date}.json`;
    const fileExists = await exists(filename, { baseDir: BaseDirectory.AppData });

    if (!fileExists) return null;

    const content = await readTextFile(filename, {
      baseDir: BaseDirectory.AppData,
    });

    return JSON.parse(content) as TimeLogEntry;
  } catch (error) {
    console.error('Failed to load time log:', error);
    return null;
  }
}

export async function updateTimeLogEntry(
  date: string,
  projectId: string,
  newTotalTime: number
): Promise<void> {
  const log = await loadTimeLog(date);
  if (!log) return;

  const projectIndex = log.projects.findIndex((p) => p.id === projectId);
  if (projectIndex === -1) return;

  log.projects[projectIndex].totalTime = newTotalTime;

  const filename = `${LOGS_DIR}/${date}.json`;
  await writeTextFile(filename, JSON.stringify(log, null, 2), {
    baseDir: BaseDirectory.AppData,
  });
}

export async function saveCurrentDayLog(
  projectTimes: Record<string, ProjectTime>,
  projects: Project[],
  projectDescriptions?: Record<string, string>
): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  await saveTimeLog(today, projectTimes, projects, projectDescriptions);
}

export async function getAllLogDates(): Promise<string[]> {
  // Since Tauri fs doesn't have readDir in the same way,
  // we'll check for common date patterns
  const dates: string[] = [];
  const today = new Date();

  // Check last 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    try {
      const filename = `${LOGS_DIR}/${dateStr}.json`;
      const fileExists = await exists(filename, { baseDir: BaseDirectory.AppData });
      if (fileExists) {
        dates.push(dateStr);
      }
    } catch {
      // Ignore errors
    }
  }

  return dates;
}

export async function loadMonthLogs(yearMonth: string): Promise<TimeLogEntry[]> {
  const logs: TimeLogEntry[] = [];
  const [year, month] = yearMonth.split('-').map(Number);

  // Get the number of days in the month
  const daysInMonth = new Date(year, month, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    try {
      const log = await loadTimeLog(dateStr);
      if (log) {
        logs.push(log);
      }
    } catch {
      // Ignore errors for individual days
    }
  }

  return logs;
}
