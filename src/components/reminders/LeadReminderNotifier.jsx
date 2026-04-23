import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { isHRUser } from '@/lib/roleUtils';

const REMINDER_ALERTS_KEY = 'lead_reminder_alerts';
const CHECK_INTERVAL_MS = 30000;
const DISMISS_SNOOZE_MS = 60000;
const LEAD_ROLES = new Set(['admin', 'manager', 'employee']);

const readAlertState = () => {
  try {
    const raw = localStorage.getItem(REMINDER_ALERTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const writeAlertState = (state) => {
  localStorage.setItem(REMINDER_ALERTS_KEY, JSON.stringify(state));
};

const formatReminderDateTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value || '-');

  const formatted = date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return formatted.replace(',', '');
};

const LeadReminderNotifier = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [activeReminder, setActiveReminder] = useState(null);

  const isReminderEnabledUser = useMemo(
    () => Boolean(currentUser?.role && LEAD_ROLES.has(currentUser.role) && !isHRUser(currentUser)),
    [currentUser]
  );

  useEffect(() => {
    let cancelled = false;
    let timer = null;

    if (!isReminderEnabledUser) {
      setActiveReminder(null);
      return undefined;
    }

    const evaluateReminders = async () => {
      try {
        const { data } = await api.get('/leads/reminders/due');
        if (cancelled) return;

        const alertState = readAlertState();
        const dueItems = Array.isArray(data?.items) ? data.items : [];
        const now = Date.now();
        const activeKeys = new Set(
          dueItems
            .map((item) => item?.reminderKey)
            .filter(Boolean)
        );

        Object.keys(alertState).forEach((key) => {
          if (!activeKeys.has(key)) {
            delete alertState[key];
          }
        });

        const nextReminder = dueItems.find((item) => {
          if (!item?.reminderKey) return false;
          const status = alertState[item.reminderKey];
          const snoozedUntil = status?.snoozedUntil ? new Date(status.snoozedUntil).getTime() : 0;
          const isSnoozed = Number.isFinite(snoozedUntil) && now < snoozedUntil;
          return !status?.handled && !isSnoozed;
        });

        if (!nextReminder) {
          writeAlertState(alertState);
          setActiveReminder(null);
          return;
        }

        if (!alertState[nextReminder.reminderKey]?.shownAt) {
          alertState[nextReminder.reminderKey] = {
            shownAt: new Date().toISOString(),
            handled: false,
            snoozedUntil: null,
          };
        }
        writeAlertState(alertState);

        setActiveReminder((prev) => {
          if (prev?.reminderKey === nextReminder.reminderKey) return prev;
          return nextReminder;
        });
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to fetch due reminders:', error);
        }
      }
    };

    evaluateReminders();
    timer = setInterval(evaluateReminders, CHECK_INTERVAL_MS);

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
    };
  }, [isReminderEnabledUser, currentUser?.id, currentUser?._id]);

  if (!activeReminder) return null;

  const dismissReminder = () => {
    const alertState = readAlertState();
    alertState[activeReminder.reminderKey] = {
      ...(alertState[activeReminder.reminderKey] || {}),
      snoozedUntil: new Date(Date.now() + DISMISS_SNOOZE_MS).toISOString(),
      dismissedAt: new Date().toISOString(),
    };
    writeAlertState(alertState);
    setActiveReminder(null);
  };

  const handleViewLead = async () => {
    try {
      await api.patch(`/leads/${activeReminder.id}/reminder/handled`);
    } catch (error) {
      console.error('Failed to mark reminder handled:', error);
    }

    const alertState = readAlertState();
    alertState[activeReminder.reminderKey] = {
      ...(alertState[activeReminder.reminderKey] || {}),
      handled: true,
      handledAt: new Date().toISOString(),
    };
    writeAlertState(alertState);
    setActiveReminder(null);

    navigate(`/leads/${activeReminder.id}`, {
      state: { leadData: { id: activeReminder.id, name: activeReminder.name } },
    });
  };

  return (
    <div className="fixed z-[70] w-full max-w-md p-4 right-4 bottom-4">
      <div className="p-4 bg-white border border-blue-200 shadow-xl rounded-xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-blue-50">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Lead Reminder</h4>
              <p className="mt-1 text-sm text-gray-700">
                {activeReminder.name || 'Unnamed Lead'} reminder is due at{' '}
                {formatReminderDateTime(activeReminder.followUpISO || activeReminder.followUp)}.
              </p>
            </div>
          </div>
          <button
            onClick={dismissReminder}
            className="p-1 text-gray-400 transition-colors rounded hover:text-gray-600 hover:bg-gray-100"
            aria-label="Close reminder"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-end gap-2 mt-4">
          <button
            onClick={dismissReminder}
            className="px-3 py-2 text-sm text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
          <button
            onClick={handleViewLead}
            className="px-3 py-2 text-sm text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            View Lead
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeadReminderNotifier;
