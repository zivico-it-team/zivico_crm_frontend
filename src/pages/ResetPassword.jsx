import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/lib/api';

const ResetPasswordPage = () => {
  const { token = '' } = useParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('Invalid reset link.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    if (String(newPassword).length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data } = await api.post('/auth/reset-password', {
        token,
        newPassword,
        confirmPassword,
      });
      setSuccess(data?.message || 'Password reset successful.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to reset password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Reset Password - CRM</title>
      </Helmet>

      <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="w-full max-w-md p-8 bg-white shadow-xl rounded-2xl">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-gray-900">Reset Password</h1>
            <p className="text-gray-600">Enter your new password</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Lock className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="At least 6 characters"
                  required
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Re-enter password"
                  required
                  className="pl-10"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full text-white bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>

          {error && (
            <div className="p-3 mt-4 text-sm text-red-700 border border-red-200 rounded-md bg-red-50">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 mt-4 text-sm text-green-700 border border-green-200 rounded-md bg-green-50">
              {success}
            </div>
          )}

          <p className="mt-6 text-sm text-center text-gray-600">
            Back to{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700">
              Login
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default ResetPasswordPage;
