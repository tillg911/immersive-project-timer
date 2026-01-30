import { useState } from 'react';
import type { ComponentType } from 'react';
import { Plus, Pencil, Trash2, Check, X, Circle } from 'lucide-react';
import * as Icons from 'lucide-react';
import { IconPicker } from './IconPicker';
import { useProjectStore, type Project } from '../stores/projectStore';

type IconProps = { size?: number; style?: React.CSSProperties };

const COLORS = [
  '#F87171', // Coral/Red
  '#A78BFA', // Purple
  '#86EFAC', // Mint/Green
  '#60A5FA', // Blue
  '#FBBF24', // Yellow
  '#F472B6', // Pink
  '#34D399', // Teal
  '#FB923C', // Orange
];

interface ProjectFormData {
  name: string;
  color: string;
  icon: string;
}

export function ProjectEditor() {
  const { projects, addProject, updateProject, removeProject } = useProjectStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    color: COLORS[0],
    icon: 'Briefcase',
  });

  const startEdit = (project: Project) => {
    setEditingId(project.id);
    setFormData({
      name: project.name,
      color: project.color,
      icon: project.icon,
    });
    setIsAdding(false);
  };

  const startAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setFormData({
      name: '',
      color: COLORS[projects.length % COLORS.length],
      icon: 'Briefcase',
    });
  };

  const save = () => {
    if (!formData.name.trim()) return;

    if (isAdding) {
      addProject(formData);
    } else if (editingId) {
      updateProject(editingId, formData);
    }

    cancel();
  };

  const cancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({ name: '', color: COLORS[0], icon: 'Briefcase' });
  };

  const handleDelete = (id: string) => {
    if (confirmDeleteId === id) {
      removeProject(id);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
    }
  };

  const renderForm = () => (
    <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Project name"
          autoFocus
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Color</label>
        <div className="flex gap-1.5">
          {COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setFormData({ ...formData, color })}
              className={`w-6 h-6 rounded-full transition-transform ${
                formData.color === color ? 'ring-2 ring-offset-1 ring-gray-400 scale-110' : ''
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Icon</label>
        <IconPicker
          value={formData.icon}
          onChange={(icon) => setFormData({ ...formData, icon })}
          color={formData.color}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          onClick={cancel}
          className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-200 rounded transition-colors"
        >
          <X size={14} className="inline mr-1" />
          Cancel
        </button>
        <button
          onClick={save}
          disabled={!formData.name.trim()}
          className="px-3 py-1.5 text-xs bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Check size={14} className="inline mr-1" />
          Save
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      {/* Project List */}
      <div className="space-y-2">
        {projects.map((project) => {
          const IconComponent = (Icons as unknown as Record<string, ComponentType<IconProps>>)[project.icon] || Circle;

          if (editingId === project.id) {
            return <div key={project.id}>{renderForm()}</div>;
          }

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
                <span className="text-sm font-medium text-gray-700">{project.name}</span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => startEdit(project)}
                  className="p-1.5 text-gray-400 hover:text-indigo-500 hover:bg-gray-100 rounded transition-colors"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDelete(project.id)}
                  onBlur={() => setConfirmDeleteId(null)}
                  className={`p-1.5 rounded transition-colors ${
                    confirmDeleteId === project.id
                      ? 'text-white bg-red-500 hover:bg-red-600'
                      : 'text-gray-400 hover:text-red-500 hover:bg-gray-100'
                  }`}
                  title={confirmDeleteId === project.id ? 'Click again to confirm' : 'Delete project'}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Form */}
      {isAdding ? (
        renderForm()
      ) : (
        <button
          onClick={startAdd}
          className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-indigo-400 hover:text-indigo-500 transition-colors flex items-center justify-center gap-1 text-sm"
        >
          <Plus size={16} />
          Add Project
        </button>
      )}
    </div>
  );
}
