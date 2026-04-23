import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Clock, LogIn, LogOut } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';

const CheckInOutComponent = ({
  isCheckedIn,
  onCheckIn,
  onCheckOut,
  canCheckIn = true,
  canCheckOut = true,
  lastCheckIn: externalLastCheckIn = null,
  lastCheckOut: externalLastCheckOut = null,
  isLoading = false,
  className = ''
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const displayStatus = isCheckedIn ? 'checked-in' : 'checked-out';
  const displayLastCheckIn = externalLastCheckIn;
  const displayLastCheckOut = externalLastCheckOut;

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCheckIn = () => {
    if (typeof onCheckIn === 'function') {
      onCheckIn();
    }
  };

  const handleCheckOut = () => {
    if (typeof onCheckOut === 'function') {
      onCheckOut();
    }
  };

  const getSessionDuration = () => {
    if (displayStatus !== 'checked-in' || !displayLastCheckIn) return null;

    const parsedCheckIn = new Date(displayLastCheckIn);
    if (Number.isNaN(parsedCheckIn.getTime())) return null;

    const diff = new Date() - parsedCheckIn;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s
      .toString()
      .padStart(2, '0')}`;
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const parsed = new Date(dateString);
    if (Number.isNaN(parsed.getTime())) return dateString;
    return parsed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`p-6 text-white shadow-lg bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="mb-2 text-2xl font-bold">Attendance</h2>
          <div className="flex items-center gap-2 text-blue-100">
            <Clock className="w-5 h-5" />
            <span className="text-lg">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>

          <div className="mt-4 space-y-1 text-sm">
            {displayLastCheckIn && <p>Last Check-in: {formatTime(displayLastCheckIn)}</p>}
            {displayLastCheckOut && <p>Last Check-out: {formatTime(displayLastCheckOut)}</p>}
            {displayStatus === 'checked-in' && (
              <>
                <p className="font-medium text-green-300">✓ Currently Checked In</p>
                <p className="text-xs text-blue-200">Session duration: {getSessionDuration()}</p>
              </>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          {displayStatus === 'checked-out' ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="lg"
                  className="text-blue-600 bg-white hover:bg-blue-50"
                  disabled={!canCheckIn || isLoading}
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  {isLoading ? 'Please wait...' : 'Check In'}
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Check In</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to check in now?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>No</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCheckIn} disabled={!canCheckIn || isLoading}>
                    Yes, Check In
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="lg"
                  className="text-red-600 bg-white hover:bg-red-50"
                  disabled={!canCheckOut || isLoading}
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  {isLoading ? 'Please wait...' : 'Check Out'}
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Check Out</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to check out?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>No</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCheckOut} disabled={!canCheckOut || isLoading}>
                    Yes, Check Out
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckInOutComponent;
