import { save } from '@tauri-apps/plugin-dialog';
import { writeTextFile } from '@tauri-apps/plugin-fs';
import type { TimeLogEntry } from './timeLog';

interface CsvRow {
  Date: string;
  StartTime: string;
  EndTime: string;
  JobCode: string;
  Break: number;
  TotalHours: number;
  Description: string;
  InternalDescription: string;
  Workpackage: string;
  Customer: string;
  Project: string;
  KM: number;
}

interface AggregatedDayProject {
  id: string;
  totalTime: number;
  earliestStart: number;
  description?: string;
  jobCode?: string;
  internalDescription?: string;
  workpackage?: string;
  customer?: string;
  projectCode?: string;
  km?: number;
}

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;

function formatTime(hours: number, minutes: number, seconds: number): string {
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function msToTimeString(ms: number): string {
  const date = new Date(ms);
  return formatTime(date.getHours(), date.getMinutes(), date.getSeconds());
}

// Round down to nearest 15-minute interval (for start times)
function roundDownTo15Min(timestamp: number): number {
  const date = new Date(timestamp);
  const minutes = date.getMinutes();
  const roundedMinutes = Math.floor(minutes / 15) * 15;
  date.setMinutes(roundedMinutes, 0, 0);
  return date.getTime();
}

// Round up duration to nearest 15 minutes
function roundUpTo15MinDuration(ms: number): number {
  if (ms <= 0) return 0;
  return Math.ceil(ms / FIFTEEN_MINUTES_MS) * FIFTEEN_MINUTES_MS;
}

function msToHours(ms: number): number {
  return ms / (1000 * 60 * 60);
}

function calculateBreakMinutes(totalWorkMs: number): number {
  const totalHours = totalWorkMs / (1000 * 60 * 60);

  if (totalHours >= 9) {
    return 45;
  } else if (totalHours >= 6) {
    return 30;
  }
  return 0;
}

function escapeCSVField(value: string | number | undefined | null): string {
  if (value === undefined || value === null) {
    return '';
  }

  const strValue = String(value);

  // If the field contains comma, newline, or quote, wrap it in quotes
  if (strValue.includes(',') || strValue.includes('\n') || strValue.includes('"')) {
    // Escape quotes by doubling them
    return `"${strValue.replace(/"/g, '""')}"`;
  }

  return strValue;
}

export function generateCsvContent(logs: TimeLogEntry[]): string {
  const headers = [
    'Date',
    'StartTime',
    'EndTime',
    'JobCode',
    'Break',
    'TotalHours',
    'Description',
    'InternalDescription',
    'Workpackage',
    'Customer',
    'Project',
    'KM',
  ];

  const rows: CsvRow[] = [];

  // Group logs by date
  const logsByDate = new Map<string, TimeLogEntry[]>();
  for (const log of logs) {
    const existing = logsByDate.get(log.date) || [];
    existing.push(log);
    logsByDate.set(log.date, existing);
  }

  // Process each day
  for (const [date, dayLogs] of logsByDate) {
    // Aggregate projects for this day
    const projectsMap = new Map<string, AggregatedDayProject>();
    let dayEarliestStart = Infinity;

    for (const log of dayLogs) {
      for (const project of log.projects) {
        // Skip projects marked as ignored for CSV export
        if (project.ignoreForCsvExport) continue;

        const existing = projectsMap.get(project.id);

        // Find earliest session start for this project
        let projectEarliestStart = Infinity;
        for (const session of project.sessions) {
          if (session.startTime < projectEarliestStart) {
            projectEarliestStart = session.startTime;
          }
          if (session.startTime < dayEarliestStart) {
            dayEarliestStart = session.startTime;
          }
        }

        if (existing) {
          existing.totalTime += project.totalTime;
          if (projectEarliestStart < existing.earliestStart) {
            existing.earliestStart = projectEarliestStart;
          }
        } else {
          projectsMap.set(project.id, {
            id: project.id,
            totalTime: project.totalTime,
            earliestStart: projectEarliestStart,
            description: project.description,
            jobCode: project.jobCode,
            internalDescription: project.internalDescription,
            workpackage: project.workpackage,
            customer: project.customer,
            projectCode: project.projectCode,
            km: project.km,
          });
        }
      }
    }

    // Convert to array and sort by earliest start time
    const dayProjects = Array.from(projectsMap.values())
      .filter(p => p.totalTime > 0)
      .sort((a, b) => a.earliestStart - b.earliestStart);

    if (dayProjects.length === 0) continue;

    // Round each project's time up to 15 minutes
    const roundedProjects = dayProjects.map(p => ({
      ...p,
      roundedTime: roundUpTo15MinDuration(p.totalTime),
    }));

    // Calculate total ROUNDED work time for the day (for break calculation)
    const totalRoundedWorkMs = roundedProjects.reduce((sum, p) => sum + p.roundedTime, 0);
    const breakMinutes = calculateBreakMinutes(totalRoundedWorkMs);
    const breakMs = breakMinutes * 60 * 1000;

    // Round down the day's earliest start to 15-minute interval
    let currentTimeMs = roundDownTo15Min(dayEarliestStart);

    // Build rows with sequential times (no overlap)
    for (let i = 0; i < roundedProjects.length; i++) {
      const project = roundedProjects[i];
      const isLastProject = i === roundedProjects.length - 1;

      const startTimeMs = currentTimeMs;
      let endTimeMs = currentTimeMs + project.roundedTime;

      // Add break time to the last project's end time
      if (isLastProject && breakMinutes > 0) {
        endTimeMs += breakMs;
      }

      rows.push({
        Date: date,
        StartTime: msToTimeString(startTimeMs),
        EndTime: msToTimeString(endTimeMs),
        JobCode: project.jobCode || '',
        Break: isLastProject ? breakMinutes : 0,
        TotalHours: msToHours(project.roundedTime),
        Description: project.description || '',
        InternalDescription: project.internalDescription || '',
        Workpackage: project.workpackage || '',
        Customer: project.customer || '',
        Project: project.projectCode || '',
        KM: project.km ?? 0,
      });

      // Move current time forward by the rounded project time
      currentTimeMs += project.roundedTime;
    }
  }

  // Sort rows by date and start time
  rows.sort((a, b) => {
    const dateCompare = a.Date.localeCompare(b.Date);
    if (dateCompare !== 0) return dateCompare;
    return a.StartTime.localeCompare(b.StartTime);
  });

  // Build CSV content
  const headerLine = headers.join(',');
  const dataLines = rows.map((row) =>
    [
      escapeCSVField(row.Date),
      escapeCSVField(row.StartTime),
      escapeCSVField(row.EndTime),
      escapeCSVField(row.JobCode),
      escapeCSVField(row.Break),
      escapeCSVField(row.TotalHours),
      escapeCSVField(row.Description),
      escapeCSVField(row.InternalDescription),
      escapeCSVField(row.Workpackage),
      escapeCSVField(row.Customer),
      escapeCSVField(row.Project),
      escapeCSVField(row.KM),
    ].join(',')
  );

  return [headerLine, ...dataLines].join('\n');
}

export async function exportMonthToCsv(
  yearMonth: string,
  logs: TimeLogEntry[]
): Promise<boolean> {
  const csvContent = generateCsvContent(logs);

  // Parse yearMonth to get month and year for filename
  const [year, month] = yearMonth.split('-');
  const defaultFilename = `ImmersiveTimeTrackLog-${month}-${year}.csv`;

  // Show save dialog
  const filePath = await save({
    defaultPath: defaultFilename,
    filters: [
      {
        name: 'CSV Files',
        extensions: ['csv'],
      },
    ],
  });

  if (!filePath) {
    // User cancelled
    return false;
  }

  // Write the file
  await writeTextFile(filePath, csvContent);

  return true;
}
