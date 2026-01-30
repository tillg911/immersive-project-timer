import { useState, useEffect } from 'react';
import type { ComponentType } from 'react';
import { ChevronLeft, ChevronRight, Save, Circle, Calendar, CalendarDays, Download } from 'lucide-react';
import * as Icons from 'lucide-react';
import { loadTimeLog, loadMonthLogs, updateTimeLogEntry, type TimeLogEntry } from '../utils/timeLog';
import { useTimerStore } from '../stores/timerStore';
import { useProjectStore } from '../stores/projectStore';
import { formatTimeVerbose } from '../hooks/useTimer';
import { exportMonthToCsv } from '../utils/csvExport';

type IconProps = { size?: number; style?: React.CSSProperties };

type ViewMode = 'day' | 'month';

function formatTimeInput(ms: number): string {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}:${minutes.toString().padStart(2, '0')}`;
}

function parseTimeInput(value: string): number | null {
  const match = value.match(/^(\d+):(\d{1,2})$/);
  if (!match) return null;
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  if (minutes >= 60) return null;
  return (hours * 60 + minutes) * 60000;
}

interface AggregatedProject {
  id: string;
  name: string;
  icon: string;
  color: string;
  totalTime: number;
}

export function TimeLogView() {
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [logEntry, setLogEntry] = useState<TimeLogEntry | null>(null);
  const [monthLogs, setMonthLogs] = useState<TimeLogEntry[]>([]);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isToday, setIsToday] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const { getProjectTime, updateProjectTime } = useTimerStore();
  const { projects } = useProjectStore();

  const today = new Date().toISOString().split('T')[0];
  const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

  // Load day logs
  useEffect(() => {
    if (viewMode !== 'day') return;

    setIsToday(selectedDate === today);

    if (selectedDate === today) {
      setLogEntry(null);
    } else {
      loadTimeLog(selectedDate).then(setLogEntry);
    }
  }, [selectedDate, today, viewMode]);

  // Load month logs
  useEffect(() => {
    if (viewMode !== 'month') return;

    loadMonthLogs(selectedMonth).then(setMonthLogs);
  }, [selectedMonth, viewMode]);

  const changeDate = (delta: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + delta);
    const newDate = date.toISOString().split('T')[0];
    if (newDate <= today) {
      setSelectedDate(newDate);
    }
  };

  const changeMonth = (delta: number) => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const newDate = new Date(year, month - 1 + delta, 1);
    const newMonth = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}`;
    if (newMonth <= currentMonth) {
      setSelectedMonth(newMonth);
    }
  };

  const startEdit = (projectId: string, currentTime: number) => {
    setEditingProject(projectId);
    setEditValue(formatTimeInput(currentTime));
  };

  const saveEdit = async (projectId: string) => {
    const newTime = parseTimeInput(editValue);
    if (newTime === null) {
      setEditingProject(null);
      return;
    }

    if (isToday) {
      updateProjectTime(projectId, newTime);
    } else {
      await updateTimeLogEntry(selectedDate, projectId, newTime);
      const updated = await loadTimeLog(selectedDate);
      setLogEntry(updated);
    }

    setEditingProject(null);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportMonthToCsv(selectedMonth, monthLogs);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Get display data based on view mode
  const displayProjects = viewMode === 'day'
    ? isToday
      ? projects.map((p) => ({
          id: p.id,
          name: p.name,
          icon: p.icon,
          color: p.color,
          totalTime: getProjectTime(p.id),
        }))
      : logEntry?.projects || []
    : (() => {
        // Aggregate monthly data
        const aggregated: Record<string, AggregatedProject> = {};

        for (const log of monthLogs) {
          for (const proj of log.projects) {
            if (!aggregated[proj.id]) {
              aggregated[proj.id] = {
                id: proj.id,
                name: proj.name,
                icon: proj.icon,
                color: proj.color,
                totalTime: 0,
              };
            }
            aggregated[proj.id].totalTime += proj.totalTime;
          }
        }

        return Object.values(aggregated);
      })();

  const totalTime = displayProjects.reduce((sum, p) => sum + p.totalTime, 0);

  return (
    <div className="space-y-3">
      {/* View Mode Toggle */}
      <div className="flex bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setViewMode('day')}
          className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded text-xs font-medium transition-colors ${
            viewMode === 'day'
              ? 'bg-white text-gray-800 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Calendar size={14} />
          Day
        </button>
        <button
          onClick={() => setViewMode('month')}
          className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded text-xs font-medium transition-colors ${
            viewMode === 'month'
              ? 'bg-white text-gray-800 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <CalendarDays size={14} />
          Month
        </button>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between bg-gray-100 rounded-lg p-2">
        <button
          onClick={() => (viewMode === 'day' ? changeDate(-1) : changeMonth(-1))}
          className="p-1 hover:bg-gray-200 rounded transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="text-center">
          {viewMode === 'day' ? (
            <>
              <div className="text-sm font-medium text-gray-700">{formatDate(selectedDate)}</div>
              {isToday && <div className="text-xs text-indigo-500">Today</div>}
            </>
          ) : (
            <>
              <div className="text-sm font-medium text-gray-700">{formatMonth(selectedMonth)}</div>
              {selectedMonth === currentMonth && <div className="text-xs text-indigo-500">This Month</div>}
            </>
          )}
        </div>
        <button
          onClick={() => (viewMode === 'day' ? changeDate(1) : changeMonth(1))}
          disabled={viewMode === 'day' ? selectedDate >= today : selectedMonth >= currentMonth}
          className="p-1 hover:bg-gray-200 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Summary */}
      <div className="text-center py-2">
        <span className="text-2xl font-bold text-gray-800">{formatTimeVerbose(totalTime)}</span>
        <span className="text-xs text-gray-500 ml-2">total</span>
      </div>

      {/* Project Times */}
      {displayProjects.length === 0 ? (
        <div className="text-center py-6 text-gray-400 text-sm">
          No time tracked for this {viewMode === 'day' ? 'day' : 'month'}
        </div>
      ) : (
        <div className="space-y-2">
          {displayProjects.map((project) => {
            const IconComponent = (Icons as unknown as Record<string, ComponentType<IconProps>>)[project.icon] || Circle;
            const isEditing = editingProject === project.id && viewMode === 'day';

            return (
              <div
                key={project.id}
                className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${project.color}40` }}
                  >
                    <IconComponent size={16} style={{ color: project.color }} />
                  </div>
                  <span className="text-sm text-gray-700">{project.name}</span>
                </div>

                {isEditing ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-16 px-1.5 py-0.5 text-sm border border-gray-300 rounded text-center font-mono"
                      placeholder="0:00"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit(project.id);
                        if (e.key === 'Escape') setEditingProject(null);
                      }}
                      autoFocus
                    />
                    <button
                      onClick={() => saveEdit(project.id)}
                      className="p-1 text-green-500 hover:bg-green-50 rounded"
                    >
                      <Save size={14} />
                    </button>
                  </div>
                ) : viewMode === 'day' ? (
                  <button
                    onClick={() => startEdit(project.id, project.totalTime)}
                    className="text-sm font-mono text-gray-600 hover:text-indigo-500 hover:bg-gray-100 px-2 py-0.5 rounded transition-colors"
                  >
                    {formatTimeVerbose(project.totalTime)}
                  </button>
                ) : (
                  <span className="text-sm font-mono text-gray-600 px-2 py-0.5">
                    {formatTimeVerbose(project.totalTime)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Export Button (only in month view) */}
      {viewMode === 'month' && monthLogs.length > 0 && (
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="w-full mt-3 flex items-center justify-center gap-2 py-2 px-4 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          <Download size={16} />
          {isExporting ? 'Exporting...' : 'Export CSV'}
        </button>
      )}
    </div>
  );
}
