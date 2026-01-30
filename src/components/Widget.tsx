import { useState, useEffect, useRef, useCallback, type ComponentType } from 'react';
import { Timer, Settings, GripVertical, Pin, PinOff } from 'lucide-react';
import * as Icons from 'lucide-react';
import { ProjectButton } from './ProjectButton';
import { SettingsModal } from './SettingsModal';
import { useProjectStore } from '../stores/projectStore';
import { useTimerStore } from '../stores/timerStore';
import { useMidnightReset } from '../hooks/useMidnightReset';
import { formatTimeVerbose, formatTimeCompact } from '../hooks/useTimer';

type IconProps = { size?: number; className?: string };

export function Widget() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [totalTime, setTotalTime] = useState(0);
  const isHoveringRef = useRef(false);
  const justUnpinnedRef = useRef(false);

  const { projects, getProject } = useProjectStore();
  const { getTodayTotal, activeProjectId, getProjectTime } = useTimerStore();

  const activeProject = activeProjectId ? getProject(activeProjectId) : null;
  const ActiveIcon = activeProject
    ? (Icons as unknown as Record<string, ComponentType<IconProps>>)[activeProject.icon] || Timer
    : Timer;

  const [activeElapsed, setActiveElapsed] = useState(0);

  useMidnightReset();

  useEffect(() => {
    const updateTimes = () => {
      setTotalTime(getTodayTotal());
      if (activeProjectId) {
        setActiveElapsed(getProjectTime(activeProjectId));
      }
    };
    updateTimes();

    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, [getTodayTotal, activeProjectId, getProjectTime]);

  const today = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  const startDrag = async (e: React.MouseEvent) => {
    // Check if click is on a button or inside a button (e.g., clicking on an icon inside the button)
    const target = e.target as HTMLElement;
    if (target.closest('button')) return;

    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      const appWindow = getCurrentWindow();
      await appWindow.startDragging();
    } catch (error) {
      console.error('Failed to start dragging:', error);
    }
  };

  const togglePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (isPinned) {
      // When unpinning, set a flag to prevent immediate collapse
      justUnpinnedRef.current = true;
      setIsPinned(false);
      // Reset the flag after a short delay
      setTimeout(() => {
        justUnpinnedRef.current = false;
        // Only collapse if mouse has actually left
        if (!isHoveringRef.current && !isSettingsOpen) {
          setIsExpanded(false);
        }
      }, 500);
    } else {
      setIsPinned(true);
      setIsExpanded(true);
    }
  };

  const handleMouseEnter = () => {
    isHoveringRef.current = true;
    setIsExpanded(true);
  };

  const handleMouseLeave = () => {
    isHoveringRef.current = false;
    // Don't collapse if pinned, settings open, or just unpinned
    if (!isSettingsOpen && !isPinned && !justUnpinnedRef.current) {
      setTimeout(() => {
        // Double-check state before collapsing
        if (!isHoveringRef.current && !justUnpinnedRef.current) {
          setIsExpanded(false);
        }
      }, 100);
    }
  };

  return (
    <>
      <div
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Collapsed State */}
        <div
          className={`
            transition-all duration-300 ease-in-out cursor-move
            ${isExpanded ? 'opacity-0 scale-75 pointer-events-none absolute' : 'opacity-100 scale-100'}
          `}
          onMouseDown={startDrag}
        >
          <div className="relative w-16 h-16">
            {/* Spinning indicator when timer is active */}
            {activeProject && (
              <svg
                className="absolute inset-0 w-16 h-16 animate-spin"
                style={{ animationDuration: '3s' }}
                viewBox="0 0 64 64"
              >
                <circle
                  cx="32"
                  cy="32"
                  r="30"
                  fill="none"
                  stroke={activeProject.color}
                  strokeWidth="3"
                  strokeDasharray="140 48"
                  strokeLinecap="round"
                />
              </svg>
            )}
            {/* Inner colored circle with icon */}
            <div
              className="absolute inset-1 rounded-full flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
              style={{
                background: activeProject
                  ? activeProject.color
                  : 'linear-gradient(to bottom right, #6366F1, #9333EA)',
              }}
            >
              {activeProject ? (
                <>
                  <ActiveIcon className="text-white" size={14} />
                  <span className="text-white text-[8px] font-mono font-bold leading-tight">
                    {formatTimeCompact(activeElapsed)}
                  </span>
                </>
              ) : (
                <ActiveIcon className="text-white" size={24} />
              )}
            </div>
          </div>
        </div>

        {/* Expanded State */}
        <div
          className={`
            transition-all duration-300 ease-in-out
            ${isExpanded ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none absolute'}
          `}
        >
          <div
            className="bg-widget-bg/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-widget-border overflow-hidden"
            style={{ width: '280px' }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 cursor-move"
              onMouseDown={startDrag}
            >
              <div className="flex items-center gap-2">
                <GripVertical className="text-white/60" size={16} />
                <div>
                  <h2 className="text-white font-semibold text-sm">Project Times</h2>
                  <p className="text-white/70 text-xs">{today}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-white/90 text-xs font-mono mr-1">
                  {formatTimeVerbose(totalTime)}
                </span>
                <button
                  onClick={togglePin}
                  className={`p-1.5 rounded-full transition-colors ${isPinned ? 'bg-white/30' : 'hover:bg-white/20'}`}
                  title={isPinned ? 'Unpin widget' : 'Pin widget open'}
                >
                  {isPinned ? (
                    <PinOff className="text-white" size={14} />
                  ) : (
                    <Pin className="text-white" size={14} />
                  )}
                </button>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
                >
                  <Settings className="text-white" size={16} />
                </button>
              </div>
            </div>

            {/* Projects Grid */}
            <div className="p-3">
              {projects.length === 0 ? (
                <div className="text-center py-6 text-gray-500 text-sm">
                  No projects yet. Click the gear icon to add one.
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {projects.map((project) => (
                    <ProjectButton key={project.id} project={project} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
}
