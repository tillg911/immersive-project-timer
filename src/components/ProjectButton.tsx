import { Circle } from "lucide-react";
import * as Icons from "lucide-react";
import type { ComponentType } from "react";
import { useState, useRef, useEffect } from "react";
import { useTimer, formatTime } from "../hooks/useTimer";
import { useTimerStore } from "../stores/timerStore";
import type { Project } from "../stores/projectStore";

type IconProps = { size?: number; className?: string };

interface ProjectButtonProps {
  project: Project;
}

export function ProjectButton({ project }: ProjectButtonProps) {
  const { elapsed, isActive, toggle } = useTimer(project.id);
  const { getProjectDescription, setProjectDescription } = useTimerStore();

  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [descriptionValue, setDescriptionValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const description = getProjectDescription(project.id);

  useEffect(() => {
    if (isEditingDescription && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditingDescription]);

  const IconComponent =
    (Icons as unknown as Record<string, ComponentType<IconProps>>)[
      project.icon
    ] || Circle;

  const bgStyle = isActive
    ? { backgroundColor: project.color }
    : { backgroundColor: `${project.color}40` };

  const handleDescriptionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDescriptionValue(description);
    setIsEditingDescription(true);
  };

  const handleDescriptionBlur = () => {
    setProjectDescription(project.id, descriptionValue);
    setIsEditingDescription(false);
  };

  const handleDescriptionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setProjectDescription(project.id, descriptionValue);
      setIsEditingDescription(false);
    } else if (e.key === "Escape") {
      setIsEditingDescription(false);
    }
  };

  return (
    <div
      className={`
        relative rounded-xl transition-all duration-200
        hover:scale-105 active:scale-95
        ${isActive ? "shadow-lg ring-2 ring-white/50" : "hover:shadow-md"}
      `}
      style={bgStyle}
    >
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between p-3"
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
            {project.jobCode && (
              <span className={`ml-1 font-normal italic ${isActive ? "text-white/60" : "text-gray-400"}`}>
                {project.jobCode}
              </span>
            )}
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

      {/* Daily Description */}
      <div
        className="px-3 pb-2 -mt-1"
        onClick={handleDescriptionClick}
      >
        {isEditingDescription ? (
          <input
            ref={inputRef}
            type="text"
            value={descriptionValue}
            onChange={(e) => setDescriptionValue(e.target.value)}
            onBlur={handleDescriptionBlur}
            onKeyDown={handleDescriptionKeyDown}
            onClick={(e) => e.stopPropagation()}
            className={`w-full text-[10px] px-1.5 py-0.5 rounded border-none outline-none ${
              isActive
                ? "bg-white/20 text-white placeholder-white/50"
                : "bg-white/50 text-gray-600 placeholder-gray-400"
            }`}
            placeholder="Add description..."
          />
        ) : (
          <span
            className={`block text-[10px] truncate cursor-text ${
              isActive
                ? description
                  ? "text-white/70"
                  : "text-white/40"
                : description
                  ? "text-gray-500"
                  : "text-gray-400"
            }`}
          >
            {description || "Add description..."}
          </span>
        )}
      </div>
    </div>
  );
}
