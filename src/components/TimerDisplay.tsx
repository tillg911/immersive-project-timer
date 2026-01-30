import { useTimer, formatTime } from '../hooks/useTimer';

interface TimerDisplayProps {
  projectId: string;
  compact?: boolean;
}

export function TimerDisplay({ projectId, compact = false }: TimerDisplayProps) {
  const { elapsed, isActive } = useTimer(projectId);

  if (compact) {
    return (
      <span className={`font-mono text-xs ${isActive ? 'text-white' : 'text-gray-600'}`}>
        {formatTime(elapsed)}
      </span>
    );
  }

  return (
    <div className={`font-mono text-sm ${isActive ? 'text-white font-semibold' : 'text-gray-700'}`}>
      {formatTime(elapsed)}
    </div>
  );
}
