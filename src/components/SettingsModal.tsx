import { useState } from 'react';
import { X, FolderKanban, Clock } from 'lucide-react';
import { ProjectEditor } from './ProjectEditor';
import { TimeLogView } from './TimeLogView';

type Tab = 'projects' | 'timelog';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('projects');

  if (!isOpen) return null;

  const tabs: { id: Tab; label: string; icon: typeof FolderKanban }[] = [
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'timelog', label: 'Time Log', icon: Clock },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-80 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h3 className="font-semibold text-gray-800">Settings</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors
                  ${isActive
                    ? 'text-indigo-600 border-b-2 border-indigo-600 -mb-[1px]'
                    : 'text-gray-500 hover:text-gray-700'
                  }
                `}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {activeTab === 'projects' && <ProjectEditor />}
          {activeTab === 'timelog' && <TimeLogView />}
        </div>
      </div>
    </div>
  );
}
