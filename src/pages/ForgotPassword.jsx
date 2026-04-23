import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/lib/api';

const GENERIC_SUCCESS_MESSAGE = 'If that email exists, a reset link has been sent.';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setResponseMessage(data?.message || GENERIC_SUCCESS_MESSAGE);
    } catch {
      setResponseMessage(GENERIC_SUCCESS_MESSAGE);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Forgot Password - CRM</title>
      </Helmet>

      <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="w-full max-w-md p-8 bg-white shadow-xl rounded-2xl">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-gray-900">Forgot Password</h1>
            <p className="text-gray-600">Enter your registered email address</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="your@email.com"
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
              {isSubmitting ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>

          {responseMessage && (
            <div className="p-3 mt-4 text-sm text-blue-700 border border-blue-200 rounded-md bg-blue-50">
              {responseMessage}
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

export default ForgotPasswordPage;
