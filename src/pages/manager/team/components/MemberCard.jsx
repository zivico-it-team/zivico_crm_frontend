import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Building, Mail, Phone, Calendar, Shield, 
  Mail as MailIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getStatusColor, getInitials, formatDate } from '../utils/teamUtils';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Custom Badge component
const Badge = ({ children, variant = 'default', className, ...props }) => {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    secondary: 'bg-blue-100 text-blue-800',
    destructive: 'bg-red-100 text-red-800',
    outline: 'border border-gray-300 bg-transparent text-gray-700',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
  };
  
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variantClasses[variant] || variantClasses.default,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

// Custom Textarea component
const Textarea = ({ className, ...props }) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
};

const MemberCard = ({ 
  member, 
  index, 
  onOpenProfile, 
  getManagerName 
}) => {
  const { toast } = useToast();
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [showAssignTaskDialog, setShowAssignTaskDialog] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [messageSubject, setMessageSubject] = useState('');
  
  // Task form state
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    assignedTo: member.id
  });

  const handleViewProfile = () => {
    if (onOpenProfile) {
      onOpenProfile(member);
    } else {
      toast({
        title: "Profile View",
        description: `Viewing profile for ${member.name || 'member'}`,
      });
    }
  };

  const handleSendMessage = () => {
    setShowMessageDialog(true);
  };

  const handleMessageSubmit = () => {
    if (!messageSubject.trim() || !messageContent.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both subject and message fields.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Message Sent",
      description: `Your message has been sent to ${member.name || 'the member'}.`,
    });

    setMessageSubject('');
    setMessageContent('');
    setShowMessageDialog(false);
  };

  const handleAssignTask = () => {
    setShowAssignTaskDialog(true);
  };

  const handleTaskSubmit = () => {
    if (!taskData.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a task title.",
        variant: "destructive"
      });
      return;
    }

    if (!taskData.dueDate) {
      toast({
        title: "Error",
        description: "Please select a due date.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Task Assigned",
      description: `Task "${taskData.title}" has been assigned to ${member.name || 'the member'}.`,
    });

    setTaskData({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: '',
      assignedTo: member.id
    });
    setShowAssignTaskDialog(false);
  };

  const handleTaskFormChange = (field, value) => {
    setTaskData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 24, scale: 0.96 },
          visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
              delay: index * 0.03,
              duration: 0.35,
              ease: 'easeOut',
            },
          },
          exit: {
            opacity: 0,
            y: -12,
            scale: 0.98,
            transition: { duration: 0.18 },
          },
        }}
        whileHover={{ y: -8, scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        layout
        className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl dark:border-slate-700 dark:bg-slate-900"
      >
        <div className="relative p-6">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-blue-500/0 via-blue-500/8 to-indigo-500/0 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100 dark:from-blue-400/0 dark:via-blue-400/10 dark:to-indigo-400/0" />
          <div className="flex items-start justify-between mb-4">
            <div className="flex gap-3">
              <div className="relative">
                <div className={cn(
                  "absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white z-10",
                  member.status === 'Active' ? "bg-green-500" :
                  member.status === 'On Leave' ? "bg-blue-500" :
                  "bg-gray-400"
                )} />
                <Avatar className="relative w-12 h-12 transition-transform duration-300 group-hover:scale-105">
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback className={cn(
                    "font-semibold",
                    member.status === 'Active' ? "bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700" :
                    member.status === 'On Leave' ? "bg-gradient-to-br from-blue-50 to-sky-50 text-blue-600" :
                    "bg-gradient-to-br from-gray-50 to-slate-50 text-gray-600"
                  )}>
                    {getInitials(member.name)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <h3 className="font-semibold text-gray-900">
                    {member.name || 'Unknown'}
                  </h3>
                  {member.joiningDate && new Date(member.joiningDate) > new Date(Date.now() - 7*24*60*60*1000) && (
                    <Badge variant="outline" className="ml-1 text-xs text-amber-600 border-amber-200">
                      New
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500">{member.designation || 'No Designation'}</p>
                {member.employeeId && (
                  <p className="text-xs text-gray-400">ID: {member.employeeId}</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-center text-sm text-gray-600">
              <Building className="w-4 h-4 mr-2 text-gray-400 shrink-0" />
              <span className="truncate">{member.department || 'N/A'}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Mail className="w-4 h-4 mr-2 text-gray-400 shrink-0" />
              <span className="truncate">{member.email || 'N/A'}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="w-4 h-4 mr-2 text-gray-400 shrink-0" />
              <span className="truncate">{member.phone || 'N/A'}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2 text-gray-400 shrink-0" />
              <span>Joined {formatDate(member.joiningDate)}</span>
            </div>
            {member.manager && member.manager !== 'none' && getManagerName && (
              <div className="flex items-center text-sm text-gray-600">
                <Shield className="w-4 h-4 mr-2 text-gray-400 shrink-0" />
                <span className="truncate">Manager: {getManagerName(member.manager)}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <span className={cn(
                "px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-200",
                getStatusColor(member.status)
              )}>
                {member.status || 'Unknown'}
              </span>
              {member.lastActive && member.status === 'Active' && (
                <span className="text-xs text-gray-400">
                  Last active: {new Date(member.lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs transition-all duration-200 opacity-0 group-hover:opacity-100"
              onClick={handleViewProfile}
            >
              View Details →
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Send Message Dialog */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Send Message to {member.name}</DialogTitle>
            <DialogDescription>
              Compose your message to {member.name}. They will receive it via email.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Enter message subject"
                value={messageSubject}
                onChange={(e) => setMessageSubject(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Type your message here..."
                rows={5}
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
              />
            </div>
            <div className="text-sm text-gray-500">
              Recipient: {member.email || 'No email provided'}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMessageDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleMessageSubmit} disabled={!member.email}>
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Task Dialog */}
      <Dialog open={showAssignTaskDialog} onOpenChange={setShowAssignTaskDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Assign Task to {member.name}</DialogTitle>
            <DialogDescription>
              Create a new task and assign it to {member.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="task-title">Task Title *</Label>
              <Input
                id="task-title"
                placeholder="Enter task title"
                value={taskData.title}
                onChange={(e) => handleTaskFormChange('title', e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="task-description">Description</Label>
              <Textarea
                id="task-description"
                placeholder="Describe the task..."
                rows={3}
                value={taskData.description}
                onChange={(e) => handleTaskFormChange('description', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="task-priority">Priority</Label>
                <Select 
                  value={taskData.priority} 
                  onValueChange={(value) => handleTaskFormChange('priority', value)}
                >
                  <SelectTrigger id="task-priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="task-due">Due Date *</Label>
                <Input
                  id="task-due"
                  type="date"
                  value={taskData.dueDate}
                  onChange={(e) => handleTaskFormChange('dueDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignTaskDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleTaskSubmit}>
              Assign Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MemberCard;
