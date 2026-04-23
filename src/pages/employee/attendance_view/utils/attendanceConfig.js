export const VIEW_MODES = {
  CALENDAR: 'calendar',
  LIST: 'list',
  BREAKS: 'breaks'
};

export const STATS_CONFIG = [
  {
    title: 'Present',
    valueKey: 'present',
    icon: 'CheckCircle',
    color: 'green',
    subtitle: 'Working days'
  },
  {
    title: 'Absent',
    valueKey: 'absent',
    icon: 'XCircle',
    color: 'red',
    subtitle: 'Days off'
  },
  {
    title: 'Late Arrivals',
    valueKey: 'late',
    icon: 'AlertCircle',
    color: 'yellow',
    subtitle: 'After 11:01 AM'
  },
  {
    title: 'Total Hours',
    valueKey: 'totalHours',
    icon: 'Clock',
    color: 'blue',
    subtitle: 'This month',
    format: (value) => `${value}h`
  }
];

export const BREAK_TYPE_MAP = {
  tea: { title: 'Tea Break', icon: 'Coffee', color: 'orange' },
  lunch: { title: 'Lunch Break', icon: 'Utensils', color: 'emerald' },
  prayer: { title: 'Lunch / Prayer Time', icon: 'Timer', color: 'blue' },
  meeting: { title: 'Meeting', icon: 'Users', color: 'purple' }
};

export const STATUS_COLORS = {
  present: {
    bg: 'bg-green-100 dark:bg-green-500/20',
    text: 'text-green-800 dark:text-green-300',
    border: 'border-green-100 dark:border-green-500/30',
    hover: 'hover:bg-green-200 dark:hover:bg-green-500/25'
  },
  absent: {
    bg: 'bg-red-100 dark:bg-red-500/20',
    text: 'text-red-800 dark:text-red-300',
    border: 'border-red-100 dark:border-red-500/30',
    hover: 'hover:bg-red-200 dark:hover:bg-red-500/25'
  },
  late: {
    bg: 'bg-yellow-100 dark:bg-yellow-500/20',
    text: 'text-yellow-800 dark:text-yellow-300',
    border: 'border-yellow-100 dark:border-yellow-500/30',
    hover: 'hover:bg-yellow-200 dark:hover:bg-yellow-500/25'
  },
  leave: {
    bg: 'bg-blue-100 dark:bg-blue-500/20',
    text: 'text-blue-800 dark:text-blue-300',
    border: 'border-blue-100 dark:border-blue-500/30',
    hover: 'hover:bg-blue-200 dark:hover:bg-blue-500/25'
  },
  off: {
    bg: 'bg-slate-100 dark:bg-slate-700/60',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-100 dark:border-slate-600',
    hover: 'hover:bg-slate-200 dark:hover:bg-slate-700'
  },
  default: { 
    bg: 'bg-gray-50 dark:bg-slate-800', 
    text: 'text-gray-700 dark:text-slate-200', 
    border: 'border-gray-100 dark:border-slate-700',
    hover: 'hover:bg-gray-100 dark:hover:bg-slate-700'
  }
};

export const BREAK_STATUS_COLORS = {
  exceeded: {
    bg: 'bg-rose-50 dark:bg-rose-500/20',
    text: 'text-rose-600 dark:text-rose-300',
    border: 'border-rose-100 dark:border-rose-500/30'
  },
  active: {
    bg: 'bg-green-50 dark:bg-green-500/20',
    text: 'text-green-600 dark:text-green-300',
    border: 'border-green-100 dark:border-green-500/30'
  },
  completed: {
    bg: 'bg-emerald-50 dark:bg-emerald-500/20',
    text: 'text-emerald-600 dark:text-emerald-300',
    border: 'border-emerald-100 dark:border-emerald-500/30'
  },
  default: {
    bg: 'bg-gray-50 dark:bg-slate-800',
    text: 'text-gray-600 dark:text-slate-300',
    border: 'border-gray-100 dark:border-slate-700'
  }
};
