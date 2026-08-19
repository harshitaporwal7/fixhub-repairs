import {
  Smartphone,
  Tablet,
  Laptop,
  Watch,
  Gamepad2,
  Cpu,
  Wrench,
  Battery,
  Plug,
  Camera,
  Mic,
  Droplets,
  Square,
  Settings,
  MoreHorizontal,
  HelpCircle,
} from 'lucide-react';

const DEVICE_ICONS = {
  smartphone: Smartphone,
  tablet: Tablet,
  laptop: Laptop,
  watch: Watch,
  'gamepad-2': Gamepad2,
  cpu: Cpu,
};

const REPAIR_ICONS = {
  'Screen Replacement': Square,
  'Battery Replacement': Battery,
  'Charging Port': Plug,
  'Camera Repair': Camera,
  'Speaker/Microphone': Mic,
  'Water Damage': Droplets,
  'Software Issues': Settings,
  'Back Glass': Square,
  'Other Repairs': Wrench,
};

export function DeviceIcon({ name, className = 'w-6 h-6' }) {
  const IconComp = DEVICE_ICONS[name] || Smartphone;
  return <IconComp className={className} />;
}

export function RepairIcon({ category, className = 'w-6 h-6' }) {
  const IconComp = REPAIR_ICONS[category] || MoreHorizontal;
  return <IconComp className={className} />;
}

export function FallbackIcon({ className = 'w-6 h-6' }) {
  return <HelpCircle className={className} />;
}
