import { useState } from 'react';
import type { ComponentType } from 'react';
import { Plus, Pencil, Trash2, Check, X, Circle, Archive, ArchiveRestore } from 'lucide-react';
import * as Icons from 'lucide-react';
import { IconPicker } from './IconPicker';
import { useProjectStore, type Project } from '../stores/projectStore';
import { useTimerStore } from '../stores/timerStore';

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
  // CSV Export fields
  ignoreForCsvExport: boolean;
  jobCode: string;
  internalDescription: string;
  workpackage: string;
  customer: string;
  projectCode: string;
  km: string;
}

export function ProjectEditor() {
  const { projects, addProject, updateProject, removeProject, archiveProject, unarchiveProject } = useProjectStore();
  const { getProjectTime } = useTimerStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    color: COLORS[0],
    icon: 'Briefcase',
    ignoreForCsvExport: false,
    jobCode: '',
    internalDescription: '',
    workpackage: '',
    customer: '',
    projectCode: '',
    km: '',
  });

  const startEdit = (project: Project) => {
    setEditingId(project.id);
    setFormData({
      name: project.name,
      color: project.color,
      icon: project.icon,
      ignoreForCsvExport: project.ignoreForCsvExport || false,
      jobCode: project.jobCode || '',
      internalDescription: project.internalDescription || '',
      workpackage: project.workpackage || '',
      customer: project.customer || '',
      projectCode: project.projectCode || '',
      km: project.km !== undefined ? String(project.km) : '',
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
      ignoreForCsvExport: false,
      jobCode: '',
      internalDescription: '',
      workpackage: '',
      customer: '',
      projectCode: '',
      km: '',
    });
  };

  const save = () => {
    if (!formData.name.trim()) return;

    const projectData = {
      name: formData.name,
      color: formData.color,
      icon: formData.icon,
      ignoreForCsvExport: formData.ignoreForCsvExport || undefined,
      jobCode: formData.jobCode || undefined,
      internalDescription: formData.internalDescription || undefined,
      workpackage: formData.workpackage || undefined,
      customer: formData.customer || undefined,
      projectCode: formData.projectCode || undefined,
      km: formData.km ? parseFloat(formData.km) : undefined,
    };

    if (isAdding) {
      addProject(projectData);
    } else if (editingId) {
      updateProject(editingId, projectData);
    }

    cancel();
  };

  const cancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({
      name: '',
      color: COLORS[0],
      icon: 'Briefcase',
      ignoreForCsvExport: false,
      jobCode: '',
      internalDescription: '',
      workpackage: '',
      customer: '',
      projectCode: '',
      km: '',
    });
  };

  const handleDelete = (id: string) => {
    if (confirmDeleteId === id) {
      removeProject(id);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
    }
  };

  const handleArchive = (id: string) => {
    archiveProject(id);
    cancel();
  };

  const handleUnarchive = (id: string) => {
    unarchiveProject(id);
  };

  const canDeleteArchivedProject = (projectId: string) => {
    return getProjectTime(projectId) === 0;
  };

  const activeProjects = projects.filter(p => !p.archived);
  const archivedProjects = projects.filter(p => p.archived);

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

      {/* CSV Export Settings */}
      <div className="pt-2 border-t border-gray-200">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.ignoreForCsvExport}
            onChange={(e) => setFormData({ ...formData, ignoreForCsvExport: e.target.checked })}
            className="w-3.5 h-3.5 rounded border-gray-300 text-indigo-500 focus:ring-indigo-500"
          />
          <span className="text-xs text-gray-600">Ignore for CSV export</span>
        </label>

        {/* CSV Export Details - hidden when ignored */}
        {!formData.ignoreForCsvExport && (
          <div className="mt-2">
            <label className="block text-xs font-medium text-gray-500 mb-2">CSV Export Details</label>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-gray-500 mb-0.5">Job Code</label>
                <input
                  type="text"
                  value={formData.jobCode}
                  onChange={(e) => setFormData({ ...formData, jobCode: e.target.value })}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="e.g. 123456-789"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 mb-0.5">Project Code</label>
                <input
                  type="text"
                  value={formData.projectCode}
                  onChange={(e) => setFormData({ ...formData, projectCode: e.target.value })}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="External project ID"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 mb-0.5">Customer</label>
                <input
                  type="text"
                  value={formData.customer}
                  onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Customer name"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 mb-0.5">Workpackage</label>
                <input
                  type="text"
                  value={formData.workpackage}
                  onChange={(e) => setFormData({ ...formData, workpackage: e.target.value })}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Work package"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 mb-0.5">KM</label>
                <input
                  type="number"
                  value={formData.km}
                  onChange={(e) => setFormData({ ...formData, km: e.target.value })}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="0"
                  min="0"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] text-gray-500 mb-0.5">Internal Description</label>
                <input
                  type="text"
                  value={formData.internalDescription}
                  onChange={(e) => setFormData({ ...formData, internalDescription: e.target.value })}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Internal notes"
                />
              </div>
            </div>
          </div>
        )}
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
      {/* Active Project List */}
      <div className="space-y-2">
        {activeProjects.map((project) => {
          const IconComponent = (Icons as unknown as Record<string, ComponentType<IconProps>>)[project.icon] || Circle;

          if (editingId === project.id) {
            return (
              <div key={project.id}>
                {renderForm()}
                <button
                  onClick={() => handleArchive(project.id)}
                  className="mt-2 w-full p-2 text-xs text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors flex items-center justify-center gap-1 border border-gray-200"
                >
                  <Archive size={14} />
                  Archive Project
                </button>
              </div>
            );
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
              <button
                onClick={() => startEdit(project)}
                className="p-1.5 text-gray-400 hover:text-indigo-500 hover:bg-gray-100 rounded transition-colors"
              >
                <Pencil size={14} />
              </button>
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

      {/* Archived Projects */}
      {archivedProjects.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h3 className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
            <Archive size={12} />
            Archived Projects
          </h3>
          <div className="space-y-2">
            {archivedProjects.map((project) => {
              const IconComponent = (Icons as unknown as Record<string, ComponentType<IconProps>>)[project.icon] || Circle;
              const canDelete = canDeleteArchivedProject(project.id);

              return (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200 opacity-75"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${project.color}20` }}
                    >
                      <IconComponent size={16} style={{ color: project.color }} />
                    </div>
                    <span className="text-sm font-medium text-gray-500">{project.name}</span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleUnarchive(project.id)}
                      className="p-1.5 text-gray-400 hover:text-green-500 hover:bg-gray-100 rounded transition-colors"
                      title="Restore project"
                    >
                      <ArchiveRestore size={14} />
                    </button>
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded transition-colors"
                        title="Delete project"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
