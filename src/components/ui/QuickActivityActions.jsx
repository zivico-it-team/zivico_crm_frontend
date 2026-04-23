import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Coffee, Utensils, Users, XCircle, PlayCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import api from '../../lib/api';
import { useToast } from '@/components/ui/use-toast';

const ACTIVITIES_CONFIG = {
  tea: { 
    title: 'Tea Break', 
    icon: Coffee, 
    color: 'orange', 
    bgColor: 'bg-gradient-to-r from-orange-50 to-amber-50 dark:bg-slate-800 dark:bg-none',
    borderColor: 'border-orange-200 dark:border-slate-700',
    textColor: 'text-orange-700 dark:text-orange-300',
    iconBg: 'bg-gradient-to-br from-orange-100 to-amber-100 dark:bg-orange-500/20 dark:bg-none',
    iconBorder: 'border-orange-200 dark:border-orange-500/30',
    bubbleColor: 'bg-orange-400 dark:bg-orange-400/20',
    duration: 20 * 60,  
    maxLabel: 'Max 20 minutes',
    type: 'break',
    apiType: 'tea_break'  // Must match exactly: tea_break, lunch_break, prayer_time, meeting
  },
  lunch: { 
    title: 'Lunch Break', 
    icon: Utensils, 
    color: 'emerald', 
    bgColor: 'bg-gradient-to-r from-emerald-50 to-green-50 dark:bg-slate-800 dark:bg-none',
    borderColor: 'border-emerald-200 dark:border-slate-700',
    textColor: 'text-emerald-700 dark:text-emerald-300',
    iconBg: 'bg-gradient-to-br from-emerald-100 to-green-100 dark:bg-emerald-500/20 dark:bg-none',
    iconBorder: 'border-emerald-200 dark:border-emerald-500/30',
    bubbleColor: 'bg-emerald-400 dark:bg-emerald-400/20',
    duration: 40 * 60,
    maxLabel: 'Max 40 minutes',
    type: 'break',
    apiType: 'lunch_break'
  },
  prayer: { 
    title: 'Prayer Time', 
    icon: Clock, 
    color: 'blue', 
    bgColor: 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:bg-slate-800 dark:bg-none',
    borderColor: 'border-blue-200 dark:border-slate-700',
    textColor: 'text-blue-700 dark:text-blue-300',
    iconBg: 'bg-gradient-to-br from-blue-100 to-cyan-100 dark:bg-blue-500/20 dark:bg-none',
    iconBorder: 'border-blue-200 dark:border-blue-500/30',
    bubbleColor: 'bg-blue-400 dark:bg-blue-400/20',
    duration: 70 * 60,
    maxLabel: 'Max 1 hour 10 minutes',
    type: 'break',
    apiType: 'prayer_time'  // Note: prayer_time not prayer_break
  },
  meeting: { 
    title: 'Meeting', 
    icon: Users, 
    color: 'purple', 
    bgColor: 'bg-gradient-to-r from-purple-50 to-violet-50 dark:bg-slate-800 dark:bg-none',
    borderColor: 'border-purple-200 dark:border-slate-700',
    textColor: 'text-purple-700 dark:text-purple-300',
    iconBg: 'bg-gradient-to-br from-purple-100 to-violet-100 dark:bg-purple-500/20 dark:bg-none',
    iconBorder: 'border-purple-200 dark:border-purple-500/30',
    bubbleColor: 'bg-purple-400 dark:bg-purple-400/20',
    duration: null,
    maxLabel: 'No time limit',
    type: 'meeting',
    apiType: 'meeting'
  }
};

const QuickActivityActions = ({ isUserCheckedIn, onBirthdayActionCelebration }) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [activities, setActivities] = useState({});
  const [isLoading, setIsLoading] = useState({});
  const [todayActivities, setTodayActivities] = useState([]);
  const [activeActivity, setActiveActivity] = useState(null);

  // Fetch today's activities on mount
  useEffect(() => {
    if (!currentUser || !isUserCheckedIn) return;

    const fetchTodayActivities = async () => {
      try {
        const response = await api.get('/activity/today');
        console.log('Today activities:', response.data);
        
        if (response.data) {
          const { active, activities } = response.data;
          
          setTodayActivities(activities || []);
          setActiveActivity(active);
          
          // Update activities state based on active activity
          if (active) {
            const activityId = Object.keys(ACTIVITIES_CONFIG).find(key => 
              ACTIVITIES_CONFIG[key].apiType === active.type
            );
            
            if (activityId) {
              const config = ACTIVITIES_CONFIG[activityId];
              const elapsed = Math.floor((Date.now() - new Date(active.startedAt).getTime()) / 1000);
              
              setActivities(prev => ({
                ...prev,
                [activityId]: {
                  active: true,
                  activityId: active._id,
                  remaining: config.duration ? Math.max(0, config.duration - elapsed) : 0,
                  elapsed: elapsed,
                  exceededTime: config.duration ? Math.max(0, elapsed - config.duration) : 0,
                  max: config.duration,
                  lastUpdated: Date.now(),
                  startTime: new Date(active.startedAt).getTime()
                }
              }));
            }
          }
        }
      } catch (error) {
        console.log('Could not fetch today activities:', error);
      }
    };

    fetchTodayActivities();
  }, [currentUser, isUserCheckedIn]);

  // Timer effect for active activities
  useEffect(() => {
    if (!isUserCheckedIn || !activeActivity) return;

    const timer = setInterval(() => {
      setActivities(prev => {
        const updated = { ...prev };
        let hasChanges = false;

        Object.keys(updated).forEach(id => {
          if (updated[id].active) {
            const config = ACTIVITIES_CONFIG[id];
            const newElapsed = updated[id].elapsed + 1;
            
            if (config.duration) {
              const newRemaining = Math.max(0, config.duration - newElapsed);
              const newExceeded = Math.max(0, newElapsed - config.duration);
              
              updated[id] = {
                ...updated[id],
                elapsed: newElapsed,
                remaining: newRemaining,
                exceededTime: newExceeded,
                lastUpdated: Date.now()
              };
            } else {
              updated[id] = {
                ...updated[id],
                elapsed: newElapsed,
                lastUpdated: Date.now()
              };
            }
            hasChanges = true;
          }
        });

        return hasChanges ? updated : prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isUserCheckedIn, activeActivity]);

  useEffect(() => {
    if (!isUserCheckedIn) {
      // Reset all activities when user checks out
      setActivities({});
      setActiveActivity(null);
      setTodayActivities([]);
    }
  }, [isUserCheckedIn]);

  const isAnyBreakActive = useCallback(() => {
    return Object.entries(activities).some(([id, activity]) => {
      const config = ACTIVITIES_CONFIG[id];
      return activity?.active && config.type === 'break';
    });
  }, [activities]);

  const isAnyMeetingActive = useCallback(() => {
    return Object.entries(activities).some(([id, activity]) => {
      const config = ACTIVITIES_CONFIG[id];
      return activity?.active && config.type === 'meeting';
    });
  }, [activities]);

  const formatTime = useCallback((activity, config) => {
    if (!activity) return '0s';
    
    if (config.duration === null) {
      return formatSeconds(activity.elapsed || 0);
    }
    
    if (activity.exceededTime > 0) {
      return `-${formatSeconds(activity.exceededTime)}`;
    }
    
    return formatSeconds(activity.remaining || 0);
  }, []);

  const formatSeconds = useCallback((seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${secs < 10 ? '0' : ''}${secs}s`;
    return `${secs}s`;
  }, []);

  const handleStartActivity = async (id) => {
    if (!isUserCheckedIn || isLoading[id]) return;
    
    const config = ACTIVITIES_CONFIG[id];
    
    // Check if any activity is already active
    if (activeActivity) {
      toast({
        title: "Cannot Start Activity",
        description: "You already have an active activity. End it first.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(prev => ({ ...prev, [id]: true }));
    
    try {
      // Backend expects only { type: "tea_break" } in the request body
      const requestBody = {
        type: config.apiType
      };

      console.log('Starting activity with:', requestBody);

      const response = await api.post('/activity/start', requestBody);

      console.log('Start activity response:', response.data);

      if (response.status === 201 || response.status === 200) {
        const activityData = response.data.activity;
        const now = Date.now();
        
        setActiveActivity(activityData);
        
        setActivities(prev => ({
          ...prev,
          [id]: {
            active: true,
            activityId: activityData._id,
            remaining: config.duration || 0,
            elapsed: 0,
            exceededTime: 0,
            max: config.duration,
            lastUpdated: now,
            startTime: now
          }
        }));

        toast({
          title: "Success",
          description: `${config.title} started successfully`,
        });

        if (config.type === 'break' && typeof onBirthdayActionCelebration === 'function') {
          onBirthdayActionCelebration();
        }
      }
    } catch (error) {
      console.error('Error starting activity:', error);
      
      let errorMessage = `Failed to start ${config.title}`;
      
      if (error.response) {
        console.log('Error response:', error.response.data);
        errorMessage = error.response.data?.message || errorMessage;
        
        // Handle specific error messages
        if (error.response.status === 400) {
          if (error.response.data?.message?.includes('check in first')) {
            errorMessage = 'Please check in first before starting activities';
          } else if (error.response.data?.message?.includes('already active')) {
            errorMessage = 'Another activity is already active. End it first.';
          }
        }
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleEndActivity = async (id) => {
    const config = ACTIVITIES_CONFIG[id];
    const activity = activities[id];
    
    if (!activity?.active || isLoading[id]) return;

    setIsLoading(prev => ({ ...prev, [id]: true }));
    
    try {
      // Backend expects empty body for end activity
      // It finds the active activity from the user and date
      const response = await api.post('/activity/end', {});

      console.log('End activity response:', response.data);

      if (response.status === 200) {
        setActivities(prev => ({
          ...prev,
          [id]: {
            ...prev[id],
            active: false,
            remaining: config.duration || 0,
            lastUpdated: Date.now()
          }
        }));
        
        setActiveActivity(null);

        toast({
          title: "Success",
          description: `${config.title} ended successfully`,
        });

        if (config.type === 'break' && typeof onBirthdayActionCelebration === 'function') {
          onBirthdayActionCelebration();
        }
      }
    } catch (error) {
      console.error('Error ending activity:', error);
      
      let errorMessage = `Failed to end ${config.title}`;
      
      if (error.response) {
        console.log('Error response:', error.response.data);
        errorMessage = error.response.data?.message || errorMessage;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const getProgressGradient = useCallback((activity, config) => {
    if (!activity) return 'bg-gradient-to-r from-emerald-400 to-teal-400';
    
    if (activity.exceededTime > 0) {
      return 'bg-gradient-to-r from-red-500 via-red-400 to-red-300';
    }
    
    const progress = activity.max && activity.remaining !== undefined
      ? ((activity.max - activity.remaining) / activity.max) * 100 
      : 0;
    
    if (progress >= 90) return 'bg-gradient-to-r from-red-500 to-orange-400';
    if (progress >= 70) return 'bg-gradient-to-r from-orange-400 to-yellow-400';
    if (progress >= 50) return 'bg-gradient-to-r from-yellow-400 to-amber-400';
    if (progress >= 30) return 'bg-gradient-to-r from-amber-400 to-green-400';
    if (progress >= 10) return 'bg-gradient-to-r from-green-400 to-emerald-400';
    return 'bg-gradient-to-r from-emerald-400 to-teal-400';
  }, []);

  const isButtonDisabled = useCallback((id) => {
    const activity = activities[id];
    
    if (activity?.active) return false;
    if (!isUserCheckedIn) return true;
    if (isLoading[id]) return true;
    
    // If any activity is active, disable all start buttons
    return !!activeActivity;
  }, [activities, isUserCheckedIn, isLoading, activeActivity]);

  if (!currentUser) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay: 0.4 }} 
      className="p-6 border border-gray-300 shadow-xl bg-white rounded-2xl dark:bg-slate-900 dark:border-slate-700"
    >
      <div className="flex flex-col justify-between mb-8 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Quick Activity Actions
          </h2>
          <p className="mt-1 text-gray-600 dark:text-slate-300">Track and manage your work breaks</p>
        </div>
        <div className="flex items-center px-3 py-2 mt-2 text-sm text-gray-600 bg-gray-100 rounded-lg md:mt-0 dark:bg-slate-800 dark:text-slate-300">
          <Clock className="w-4 h-4 mr-2 text-blue-500"/>
          <span>Working time pauses during activities</span>
        </div>
      </div>

      {!isUserCheckedIn ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 flex items-start gap-3 rounded-xl border border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50 p-4 text-amber-800 shadow-sm dark:border-amber-400/60 dark:bg-gradient-to-r dark:from-amber-950/80 dark:to-slate-800 dark:ring-1 dark:ring-amber-400/20"
        >
          <div className="mt-0.5 rounded-full bg-amber-100 p-2 dark:bg-amber-400/20">
            <AlertCircle className="h-4 w-4 flex-shrink-0 text-amber-700 dark:text-amber-200"/> 
          </div>
          <div className="border-l-2 border-amber-300 pl-3 dark:border-amber-400/70">
            <p className="font-semibold text-amber-900 dark:text-white">Check-in required</p>
            <p className="text-sm text-amber-800/90 dark:text-slate-100">Please check in first to start activities.</p>
          </div>
        </motion.div>
      ) : activeActivity && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 flex items-start gap-3 rounded-xl border border-blue-300 bg-gradient-to-r from-blue-50 to-cyan-50 p-4 text-blue-800 shadow-sm dark:border-blue-400/60 dark:bg-gradient-to-r dark:from-blue-950/80 dark:to-slate-800 dark:ring-1 dark:ring-blue-400/20"
        >
          <div className="mt-0.5 rounded-full bg-blue-100 p-2 dark:bg-blue-400/20">
            <AlertCircle className="h-4 w-4 flex-shrink-0 text-blue-700 dark:text-blue-200"/> 
          </div>
          <div className="border-l-2 border-blue-300 pl-3 dark:border-blue-400/70">
            <p className="font-semibold text-blue-900 dark:text-white">Activity already running</p>
            <p className="text-sm text-blue-800/90 dark:text-slate-100">You have an active activity. End it before starting another.</p>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Object.entries(ACTIVITIES_CONFIG).map(([id, config]) => {
          const activity = activities[id] || {
            active: false,
            remaining: config.duration || 0,
            elapsed: 0,
            exceededTime: 0,
            max: config.duration,
            lastUpdated: Date.now()
          };
          
          const Icon = config.icon;
          const isTimed = config.duration !== null;
          const hasExceeded = activity.exceededTime > 0;
          const time = formatTime(activity, config);
          const progress = isTimed && activity.remaining !== undefined
            ? ((config.duration - activity.remaining) / config.duration) * 100 
            : 0;
          const buttonDisabled = isButtonDisabled(id);
          const loading = isLoading[id];
          
          return (
              <motion.div 
                key={id}
                whileHover={{ 
                  scale: activity.active ? 1.03 : 1,
                  boxShadow: activity.active ? "0 20px 40px rgba(0,0,0,0.1)" : "none"
                }}
                className={`relative overflow-hidden border-2 rounded-2xl p-5 min-h-[320px] flex flex-col ${hasExceeded ? 'border-red-300 bg-gradient-to-r from-red-50 to-pink-50 dark:border-red-500/40 dark:bg-slate-800 dark:bg-none' : `${config.bgColor} ${config.borderColor}`} transition-all duration-300 ${buttonDisabled && !activity.active ? 'opacity-80' : ''}`}
              >
                <div className={`absolute top-0 right-0 w-24 h-24 rounded-full -mr-10 -mt-10 opacity-10 ${hasExceeded ? 'bg-red-400 dark:bg-red-400/30' : config.bubbleColor}`}></div>
              
              <div className="relative flex flex-col flex-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl border ${hasExceeded ? 'border-red-200 bg-gradient-to-r from-red-100 to-pink-100 dark:border-red-500/40 dark:bg-red-500/15' : `${config.iconBg} ${config.iconBorder}`} shadow-sm`}>
                      <Icon className={`w-5 h-5 ${hasExceeded ? 'text-red-600' : config.textColor}`}/>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">{config.title}</h3>
                      <p className="text-xs text-gray-500 dark:text-slate-400">{config.maxLabel}</p>
                    </div>
                  </div>
                  {activity.active && (
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full animate-pulse ${hasExceeded ? 'bg-red-500' : 'bg-green-500'}`}></div>
                      <span className={`text-xs font-medium ${hasExceeded ? 'text-red-600 dark:text-red-300' : 'text-green-600 dark:text-green-300'}`}>
                        Active
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col justify-center flex-1 mb-4">
                  <div className="mb-2 text-center">
                    <div className={`font-mono text-3xl font-bold mb-1 ${hasExceeded ? 'text-red-600' : config.textColor}`}>
                      {loading ? '...' : (hasExceeded ? `-${time}` : time)}
                    </div>
                    <div className="text-xs tracking-wider text-gray-500 uppercase dark:text-slate-400">
                      {hasExceeded ? 'Time Exceeded' : activity.active ? 'Remaining' : 'Duration'}
                    </div>
                  </div>

                  {isTimed ? (
                    <div className="mt-4">
                      <div className="flex justify-between mb-1 text-sm text-gray-600 dark:text-slate-300">
                        <span>Progress</span>
                        <span className="font-semibold">{Math.round(progress)}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden dark:bg-slate-700">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${hasExceeded ? 100 : Math.min(progress, 100)}%` }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                          className={`h-2.5 rounded-full ${getProgressGradient(activity, config)}`}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 text-center">
                      <div className="text-sm text-gray-600 dark:text-slate-300">Flexible Duration</div>
                      <div className="mt-1 text-xs text-gray-500 dark:text-slate-400">No time limit for meetings</div>
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-auto">
                  {activity.active ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleEndActivity(id)}
                      disabled={loading}
                      className="flex items-center justify-center w-full py-3 text-white transition-all duration-300 shadow-lg rounded-xl bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      ) : (
                        <XCircle className="w-5 h-5 mr-2"/>
                      )}
                      <span className="font-semibold">End Activity</span>
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: buttonDisabled || loading ? 1 : 1.05 }}
                      whileTap={{ scale: buttonDisabled || loading ? 1 : 0.95 }}
                      onClick={() => handleStartActivity(id)}
                      disabled={buttonDisabled || loading}
                      className={`flex items-center justify-center w-full py-3 text-white rounded-xl shadow-lg transition-all duration-300 ${
                        isUserCheckedIn && !buttonDisabled && !loading
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600' 
                          : 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      ) : (
                        <PlayCircle className="w-5 h-5 mr-2"/>
                      )}
                      <span className="font-semibold">
                        {loading ? 'Starting...' : (buttonDisabled ? 'Activity Active' : 'Start Activity')}
                      </span>
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="pt-6 mt-8 border-t border-gray-200 dark:border-slate-700">
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"></div>
            <span>Within limit</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500"></div>
            <span>Almost there</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-500 to-pink-500"></div>
            <span>Time exceeded</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default QuickActivityActions;
