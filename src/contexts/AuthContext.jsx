/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import api from '@/lib/api';

const AuthContext = createContext(null);
const TOKEN_STORAGE_KEY = 'token';
const LEGACY_TOKEN_STORAGE_KEY = 'authToken';
const USER_STORAGE_KEY = 'currentUser';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUserState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const isPendingApprovalUser = (user) =>
    String(user?.role || '').trim().toLowerCase() === 'employee' &&
    String(user?.approvalStatus || 'approved').trim().toLowerCase() !== 'approved';

  const normalizeSessionUser = (user) => {
    if (!user) return null;

    const userData = { ...user };
    delete userData.token;

    return {
      ...userData,
      id: userData.id || userData._id,
      _id: userData._id || userData.id,
      profilePicture: userData.profilePicture || userData.profileImageUrl || '',
      profileImageVersion: userData.profileImageVersion || (userData.updatedAt ? new Date(userData.updatedAt).getTime() : null),
    };
  };

  const readJwtPayload = (token) => {
    try {
      const parts = String(token || '').split('.');
      if (parts.length < 2) return {};
      const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = payload + '='.repeat((4 - (payload.length % 4 || 4)) % 4);
      const decoded = atob(padded);
      return JSON.parse(decoded);
    } catch {
      return {};
    }
  };

  const persistSession = (token, user) => {
    const tokenPayload = readJwtPayload(token);
    const normalizedUser = normalizeSessionUser({
      ...user,
      role: user?.role || tokenPayload?.role || '',
      id: user?.id || user?._id || tokenPayload?.id || '',
      _id: user?._id || user?.id || tokenPayload?.id || '',
    });
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    localStorage.setItem(LEGACY_TOKEN_STORAGE_KEY, token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(normalizedUser));
    setCurrentUserState(normalizedUser);
    return normalizedUser;
  };

  const setCurrentUser = (user) => {
    if (!user) {
      setCurrentUserState(null);
      return;
    }

    setCurrentUserState(normalizeSessionUser(user));
  };

  useEffect(() => {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    const storedToken =
      localStorage.getItem(TOKEN_STORAGE_KEY) || localStorage.getItem(LEGACY_TOKEN_STORAGE_KEY);

    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (isPendingApprovalUser(parsedUser)) {
          localStorage.removeItem(USER_STORAGE_KEY);
          localStorage.removeItem(TOKEN_STORAGE_KEY);
          localStorage.removeItem(LEGACY_TOKEN_STORAGE_KEY);
        } else {
          setCurrentUser(parsedUser);
        }
      } catch {
        localStorage.removeItem(USER_STORAGE_KEY);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(LEGACY_TOKEN_STORAGE_KEY);
      }
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(currentUser));
      return;
    }

    localStorage.removeItem(USER_STORAGE_KEY);
  }, [currentUser]);

  const login = async (identifier, password) => {
    try {
      const normalizedIdentifier = String(identifier || '').trim();
      const { data } = await api.post('/auth/login', {
        identifier: normalizedIdentifier,
        userName: normalizedIdentifier,
        email: normalizedIdentifier,
        password,
      });
      const { token, ...user } = data;

      const normalizedUser = persistSession(token, user);

      toast({
        title: "Login Successful",
        description: `Welcome ${user.name}!`,
      });

      return { success: true, user: normalizedUser };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      toast({
        title: "Login Failed",
        description: message,
        variant: "destructive",
      });
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      const { data } = await api.post('/auth/register', userData);
      const { token, user, ...rest } = data || {};

      if (token) {
        const normalizedUser = persistSession(token, user);

        toast({
          title: "Registration Successful",
          description: "Your account has been created successfully.",
        });

        return { success: true, user: normalizedUser, message: rest?.message || '' };
      }

      const normalizedUser = normalizeSessionUser(user);
      const message =
        rest?.message || 'Your registration has been submitted. Wait for admin approval before logging in.';

      toast({
        title: "Registration Successful",
        description: message,
      });

      return { success: true, user: normalizedUser, message, requiresApproval: true };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Registration failed';
      toast({
        title: "Registration Failed",
        description: message,
        variant: "destructive",
      });
      return { success: false, error: message };
    }
  };

  // Helper function to add employee (used by EmployeeModal)
  const addEmployeeToSystem = (employeeData) => {
    try {
      const employees = JSON.parse(localStorage.getItem('employees') || '[]');
      
      // Check if email already exists
      if (employees.find(emp => emp.email === employeeData.email)) {
        throw new Error('Employee with this email already exists');
      }

      const newEmployee = {
        id: Date.now().toString(),
        ...employeeData,
        role: 'employee',
        status: 'active',
        created_at: new Date().toISOString(),
        // Ensure password is set (use default if not provided)
        password: employeeData.password || 'password123'
      };

      employees.push(newEmployee);
      localStorage.setItem('employees', JSON.stringify(employees));

      return { success: true, employee: newEmployee };
    } catch (error) {
      console.error('Error adding employee:', error);
      return { success: false, error: error.message };
    }
  };

  // Helper function to update employee
  const updateEmployeeInSystem = (employeeData) => {
    try {
      const employees = JSON.parse(localStorage.getItem('employees') || '[]');
      const index = employees.findIndex(emp => 
        emp.id === employeeData.id || 
        emp.employeeId === employeeData.employeeId ||
        emp.email === employeeData.email
      );
      
      if (index === -1) {
        // If not found, add as new
        return addEmployeeToSystem(employeeData);
      }

      // Update existing employee
      employees[index] = {
        ...employees[index],
        ...employeeData,
        updated_at: new Date().toISOString()
      };

      localStorage.setItem('employees', JSON.stringify(employees));

      // Update current user session if it's the same user
      if (currentUser && 
          (currentUser.email === employeeData.email || 
           currentUser.id === employeeData.id ||
           currentUser.employeeId === employeeData.employeeId)) {
        const updatedUser = {
          ...currentUser,
          ...employeeData
        };
        setCurrentUser(updatedUser);
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating employee:', error);
      return { success: false, error: error.message };
    }
  };

  // Get current employee data (for profile page)
  const getCurrentEmployeeData = () => {
    if (!currentUser) return null;
    
    const employees = JSON.parse(localStorage.getItem('employees') || '[]');
    const employee = employees.find(emp => 
      emp.email === currentUser.email || 
      emp.id === currentUser.id ||
      emp.employeeId === currentUser.employeeId
    );
    
    return employee || currentUser;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(LEGACY_TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    setCurrentUser(null);
    
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
  };

  const value = {
    currentUser,
    setCurrentUser,
    isAuthenticated: !!currentUser,
    isLoading,
    login,
    register,
    logout,
    addEmployeeToSystem,
    updateEmployeeInSystem,
    getCurrentEmployeeData
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
