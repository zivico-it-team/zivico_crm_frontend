export const LEAVE_TYPES = {
  ANNUAL: 'Annual',
  CASUAL: 'Casual',
  SPECIAL: 'Special',
  UNPAID: 'Unpaid'
};

export const LEAVE_SESSIONS = {
  FIRST_HALF: 'first',
  SECOND_HALF: 'second'
};

export const SESSION_LABELS = {
  [LEAVE_SESSIONS.FIRST_HALF]: 'First Half (8am - 12pm)',
  [LEAVE_SESSIONS.SECOND_HALF]: 'Second Half (1pm - 5pm)'
};

export const LEAVE_TYPE_CONFIG = {
  Annual: {
    color: 'blue',
    description: 'Plan your vacation time in advance',
    placeholder: 'Please provide a detailed reason for your leave request...',
    hint: 'Provide sufficient details for faster approval',
    buttonClass: 'bg-blue-600 hover:bg-blue-700',
    borderClass: 'border-blue-200',
    gradientClass: 'from-blue-50 to-blue-50',
    supportsHalfDay: true,
    tips: [
      'Annual leave accrues monthly',
      'Minimum 2 days notice required',
      'Can be taken in half-day increments',
      'Unused leave carries over (max 5 days)',
    ]
  },
  Casual: {
    color: 'emerald',
    description: 'For personal or urgent matters',
    placeholder: 'Please provide a detailed reason for your leave request...',
    hint: 'Provide sufficient details for faster approval',
    buttonClass: 'bg-emerald-600 hover:bg-emerald-700',
    borderClass: 'border-emerald-200',
    gradientClass: 'from-emerald-50 to-emerald-50',
    supportsHalfDay: true,
    tips: [
      'For urgent personal matters',
      'Maximum 3 consecutive days',
      'Can be taken in half-day increments',
      'Manager approval required',
    ]
  },
  Special: {
    color: 'amber',
    description: 'For approved special leave needs',
    placeholder: 'Please provide the special leave reason and attach supporting documents if available...',
    hint: 'Supporting documents may be required for approval',
    buttonClass: 'bg-amber-600 hover:bg-amber-700',
    borderClass: 'border-amber-200',
    gradientClass: 'from-amber-50 to-amber-50',
    supportsHalfDay: true,
    tips: [
      'Provide documents for faster approval',
      'Can be taken in single days or half-days',
      'Use this for approved special reasons',
      'Manager approval required',
    ]
  },
  Unpaid: {
    color: 'purple',
    description: 'Unlimited leave requests without pay',
    placeholder: 'Please provide a detailed reason for your unpaid leave request...',
    hint: 'Detailed reasons are required for unpaid leave approval',
    buttonClass: 'bg-purple-600 hover:bg-purple-700',
    borderClass: 'border-purple-200',
    gradientClass: 'from-purple-50 to-purple-50',
    supportsHalfDay: true,
    tips: [
      'No salary during leave period',
      'Maximum 30 days at once',
      'Half-day available for partial days',
      'Affects probation period',
    ]
  }
};

export const DEFAULT_LEAVE_BALANCES = [
  { type: 'Annual', total: 0, used: 0, remaining: 0, color: 'blue' },
  { type: 'Casual', total: 0, used: 0, remaining: 0, color: 'emerald' },
  { type: 'Special', total: 0, used: 0, remaining: 0, color: 'amber' },
  { type: 'Unpaid', total: 0, used: 0, remaining: 0, color: 'purple' }
];

export const STATUS_CONFIG = {
  approved: {
    color: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    icon: 'CheckCircle',
    label: 'Approved'
  },
  rejected: {
    color: 'bg-red-100 text-red-700 border border-red-200',
    icon: 'XCircle',
    label: 'Rejected'
  },
  cancelled: {
    color: 'bg-gray-100 text-gray-700 border border-gray-200',
    icon: 'XCircle',
    label: 'Cancelled'
  },
  pending: {
    color: 'bg-amber-100 text-amber-700 border border-amber-200',
    icon: 'Clock',
    label: 'Pending'
  }
};

export const HALF_DAY_CONFIG = {
  duration: 0.5,
  maxPerMonth: 4,
  requiresManagerApproval: true,
  sessions: {
    [LEAVE_SESSIONS.FIRST_HALF]: {
      label: 'First Half',
      time: '8:00 AM - 12:00 PM',
      icon: 'Sun'
    },
    [LEAVE_SESSIONS.SECOND_HALF]: {
      label: 'Second Half',
      time: '1:00 PM - 5:00 PM',
      icon: 'Moon'
    }
  }
};
