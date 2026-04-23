import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { User, Mail, Lock, Phone, Eye, EyeOff } from 'lucide-react';
import { getDashboardPathForUser } from '@/lib/roleUtils';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    userName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Password mismatch',
        description: 'Password and confirm password must match.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    const { confirmPassword, ...payload } = formData;
    const result = await register(payload);

    if (result.success) {
      if (result.requiresApproval) {
        navigate('/login', {
          replace: true,
          state: {
            message:
              result.message || 'Registration submitted. Wait for admin approval before signing in.',
          },
        });
      } else {
        navigate(getDashboardPathForUser(result.user) || '/employee/dashboard', { replace: true });
      }
    }

    setIsLoading(false);
  };

  return (
    <>
      <Helmet>
        <title>Register - HRMS</title>
        <meta name="description" content="Create your HRMS account" />
      </Helmet>
      <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="p-8 bg-white shadow-xl rounded-2xl">
            <div className="mb-8 text-center">
                <div className="flex justify-center mb-4">
              <img
                src="/images/logo1.webp"
                alt="CRM Logo"
                className="object-contain w-20 h-20 rounded-xl"
              />
            </div>
              <h1 className="mb-2 text-3xl font-bold text-gray-900">Create Account</h1>
              <p className="text-gray-600">Register as a new employee</p>
            </div>

            <div className="p-3 mb-4 border rounded-lg border-amber-200 bg-amber-50">
              <p className="text-sm font-medium text-amber-900">Admin approval required</p>
              <p className="mt-1 text-sm text-amber-700">
                You can sign in only after an admin approves your registration.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="pl-10 text-gray-900 bg-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+1234567890"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="pl-10 text-gray-900 bg-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="pl-10 text-gray-900 bg-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="userName">Username</Label>
                <div className="relative">
                  <User className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                  <Input
                    id="userName"
                    name="userName"
                    type="text"
                    placeholder="john.doe"
                    value={formData.userName}
                    onChange={handleChange}
                    className="pl-10 text-gray-900 bg-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="pl-10 pr-10 text-gray-900 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute text-gray-400 -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="pl-10 pr-10 text-gray-900 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute text-gray-400 -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full text-white bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default RegisterPage;
