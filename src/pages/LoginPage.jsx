import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Helmet } from 'react-helmet';
import { Lock, CircleUser, Eye, EyeOff } from 'lucide-react';
import { getDashboardPathForUser } from '@/lib/roleUtils';

const resolveDashboardPath = (user) => {
  const nextPath = getDashboardPathForUser(user);
  if (!nextPath || nextPath === '/' || nextPath === '/login') {
    return '/hr/dashboard';
  }
  return nextPath;
};

const LoginPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { login, isAuthenticated, currentUser } = useAuth();
  const registrationMessage = location.state?.message || '';

  React.useEffect(() => {
    if (!isAuthenticated || !currentUser) return;
    navigate(resolveDashboardPath(currentUser), { replace: true });
  }, [isAuthenticated, currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await login(identifier, password);
    if (result.success) {
      const userData = result.user;
      navigate(resolveDashboardPath(userData), { replace: true });
    }

    setIsLoading(false);
  };

  return (
    <>
      <Helmet>
        <title>Login - CRM</title>
      </Helmet>

      <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div
          className="w-full max-w-md"
        >
          <div className="p-8 bg-white shadow-xl rounded-2xl">
            <div className="flex justify-center mb-4">
              <img
                src="/images/logo1.webp"
                alt="CRM Logo"
                className="object-contain w-20 h-20 rounded-xl"
              />
            </div>

            <div className="mb-8 text-center">
              <h1 className="mb-2 text-3xl font-bold text-gray-900">Welcome Back</h1>
              <p className="text-gray-600">Sign in to your CRM account</p>
            </div>

            {registrationMessage && (
              <div className="p-3 mb-6 border rounded-lg border-emerald-200 bg-emerald-50">
                <p className="text-sm text-emerald-800">{registrationMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label>Username or Email</Label>
                <div className="relative">
                  <CircleUser className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                  <Input
                    type="text"
                    placeholder="Enter username or email"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Password</Label>
                <div className="relative">
                  <Lock className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 pr-10"
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
                <div className="text-right">
                  <Link to="/forgot-password" className="text-xs font-medium text-blue-600 hover:text-blue-700">
                    Forgot password?
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full text-white bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <p className="mt-6 text-sm text-center text-gray-600">
              Need an account?{' '}
              <Link to="/register" className="font-medium text-blue-600 hover:text-blue-700">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
