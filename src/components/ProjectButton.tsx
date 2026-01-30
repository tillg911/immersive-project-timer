import { Circle } from "lucide-react";
import * as Icons from "lucide-react";
import type { ComponentType } from "react";
import { useTimer, formatTime } from "../hooks/useTimer";
import type { Project } from "../stores/projectStore";

type IconProps = { size?: number; className?: string };

interface ProjectButtonProps {
  project: Project;
}

export function ProjectButton({ project }: ProjectButtonProps) {
  const { elapsed, isActive, toggle } = useTimer(project.id);

  const IconComponent =
    (Icons as unknown as Record<string, ComponentType<IconProps>>)[
      project.icon
    ] || Circle;

  const bgStyle = isActive
    ? { backgroundColor: project.color }
    : { backgroundColor: `${project.color}40` };

  return (
    <button
      onClick={toggle}
      className={`
        relative flex items-center justify-between
        p-3 rounded-xl transition-all duration-200
        hover:scale-105 active:scale-95
        ${isActive ? "shadow-lg ring-2 ring-white/50" : "hover:shadow-md"}
      `}
      style={bgStyle}
    >
      <div className="flex gap-2 items-center">
        <IconComponent
          size={20}
          className={isActive ? "text-white" : "text-gray-700"}
        />
        <span
          className={`text-[12px] font-bold truncate max-w-full ${isActive ? "text-white/80" : "text-gray-500"}`}
        >
          {project.name}
        </span>
      </div>

      <span
        className={`mt-1 font-mono text-xs ${isActive ? "text-white font-semibold" : "text-gray-600"}`}
      >
        {formatTime(elapsed)}
      </span>

      {isActive && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
      )}
    </button>
  );
}
