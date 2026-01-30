import * as Icons from 'lucide-react';
import type { ComponentType } from 'react';

type IconProps = { size?: number; style?: React.CSSProperties; className?: string };

const AVAILABLE_ICONS = [
  'Briefcase',
  'Code',
  'Palette',
  'FileText',
  'Folder',
  'Mail',
  'MessageSquare',
  'Phone',
  'Video',
  'Music',
  'Image',
  'Camera',
  'Gamepad2',
  'Book',
  'GraduationCap',
  'Trophy',
  'Heart',
  'Star',
  'Zap',
  'Coffee',
  'Home',
  'Building',
  'Car',
  'CarFront',
  'Motorbike',
  'Bike',
  'Van',
  'Bus',
  'Truck',
  'TrainFront',
  'Forklift',
  'Helicopter',
  'Plane',
  'Sailboat',
  'Ship',
  'Watch',
  'Glasses',
  'GPU',
  'Globe',
  'Users',
  'User',
  'Settings',
  'Wrench',
  'Lightbulb',
  'Target',
  'Flag',
  'Calendar',
  'Rocket',
  'Bug',
  'Terminal',
  'Database',
  'Cloud',
] as const;

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
  color?: string;
}

export function IconPicker({ value, onChange, color = '#6366F1' }: IconPickerProps) {
  return (
    <div className="grid grid-cols-8 gap-1 p-2 bg-gray-100 rounded-lg max-h-32 overflow-y-auto">
      {AVAILABLE_ICONS.map((iconName) => {
        const IconComponent = (Icons as unknown as Record<string, ComponentType<IconProps>>)[iconName];
        if (!IconComponent) return null;
        const isSelected = value === iconName;

        return (
          <button
            key={iconName}
            type="button"
            onClick={() => onChange(iconName)}
            className={`
              p-1.5 rounded transition-all
              ${isSelected
                ? 'ring-2 ring-offset-1'
                : 'hover:bg-gray-200'
              }
            `}
            style={isSelected ? { backgroundColor: `${color}30`, outlineColor: color } : undefined}
            title={iconName}
          >
            <IconComponent
              size={16}
              style={{ color: isSelected ? color : '#6B7280' }}
            />
          </button>
        );
      })}
    </div>
  );
}
