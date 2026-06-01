import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { CheckCircle, AlertCircle } from 'lucide-react';

export const Setup: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const createTestAccount = async () => {
    setStatus('loading');
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b11e7096/auth/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            email: 'test@test.com',
            password: 'test-12345',
            name: 'Test Admin',
          }),
        }
      );

      const data = await response.json();
      console.log('Signup response:', { status: response.status, data });

      if (response.ok) {
        setStatus('success');
        setMessage('Test admin account created successfully!');
      } else {
        if (data.error?.includes('already registered') || data.error?.includes('User already registered')) {
          setStatus('success');
          setMessage('Test account already exists. You can log in now.');
        } else if (data.code === 'UNAUTHORIZED_LEGACY_JWT' || data.code?.includes('UNAUTHORIZED')) {
          setStatus('error');
          setMessage(`Authentication issue detected. Error: ${data.message || data.error}. Please check the browser console for details.`);
        } else {
          setStatus('error');
          setMessage(`Error: ${data.error || data.message || 'Failed to create account'}. Check console for details.`);
        }
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(`Network error: ${error.message}. Please check your connection.`);
      console.error('Setup error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 w-full max-w-2xl">
        <h1 className="text-4xl font-bold text-gray-800 text-center mb-4">
          Admin Account Setup
        </h1>
        <p className="text-lg text-gray-600 text-center mb-8">
          Create a test admin account to access the dashboard
        </p>

        <div className="bg-gray-50 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Test Credentials:</h2>
          <div className="space-y-2 font-mono text-lg">
            <p>
              <span className="text-gray-600">Email:</span>{' '}
              <span className="font-bold">test@test.com</span>
            </p>
            <p>
              <span className="text-gray-600">Password:</span>{' '}
              <span className="font-bold">test-12345</span>
            </p>
          </div>
        </div>

        {status === 'idle' && (
          <button
            onClick={createTestAccount}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-6 rounded-xl text-xl transition-colors mb-4"
          >
            Create Test Admin Account
          </button>
        )}

        {status === 'loading' && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mb-4"></div>
            <p className="text-lg text-gray-600">Creating account...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-4">
            <div className="flex items-center space-x-3 mb-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <h3 className="text-xl font-bold text-green-800">Success!</h3>
            </div>
            <p className="text-lg text-green-700 mb-4">{message}</p>
            <button
              onClick={() => navigate('/admin')}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl text-lg transition-colors"
            >
              Go to Admin Login
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-4">
            <div className="flex items-center space-x-3 mb-3">
              <AlertCircle className="w-8 h-8 text-red-600" />
              <h3 className="text-xl font-bold text-red-800">Error</h3>
            </div>
            <p className="text-lg text-red-700 mb-4">{message}</p>
            <button
              onClick={createTestAccount}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl text-lg transition-colors mb-4"
            >
              Try Again
            </button>

            <div className="mt-6 pt-6 border-t border-red-200">
              <h4 className="text-lg font-bold text-gray-800 mb-3">Alternative: Manual Setup via Supabase</h4>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Visit your Supabase Dashboard</li>
                <li>Go to Authentication → Users</li>
                <li>Click "Add User" and enter:
                  <ul className="ml-6 mt-1 text-sm">
                    <li>Email: test@test.com</li>
                    <li>Password: test-12345</li>
                  </ul>
                </li>
                <li>Then you can log in at /admin</li>
              </ol>
            </div>
          </div>
        )}

        <div className="text-center">
          <button
            onClick={() => navigate('/menu')}
            className="text-orange-600 hover:underline font-medium text-lg"
          >
            Back to home
          </button>
        </div>
      </div>
    </div>
  );
};
