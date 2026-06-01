import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { LogIn, Globe } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, configError } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (configError) {
      setError(`Configuration Error: ${configError}. Please check that Supabase is properly connected.`);
    }
  }, [configError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      navigate('/admin/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMessage = err.message || t('Invalid email or password', '邮箱或密码无效');
      setError(errorMessage);

      // If it's a network error, provide additional guidance
      if (errorMessage.includes('network') || errorMessage.includes('connect')) {
        setError(errorMessage + ' ' + t('The authentication service may be temporarily unavailable.', '身份验证服务可能暂时不可用。'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center px-4">
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white hover:bg-gray-100 text-gray-700 font-medium transition-colors shadow-lg"
        >
          <Globe className="w-5 h-5" />
          <span>{language === 'en' ? '中文' : 'EN'}</span>
        </button>
      </div>
      <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block bg-orange-100 p-4 rounded-full mb-4">
            <LogIn className="w-12 h-12 text-orange-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
            {t('Admin Login', '管理员登录')}
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            {t('Sign in to manage your kitchen', '登录以管理您的厨房')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
              <p className="text-red-700 font-medium text-base">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-lg font-bold text-gray-800 mb-2">
              {t('Email', '邮箱')}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-4 text-lg rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none"
              placeholder={t('Enter your email', '输入您的邮箱')}
            />
          </div>

          <div>
            <label className="block text-lg font-bold text-gray-800 mb-2">
              {t('Password', '密码')}
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-4 text-lg rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none"
              placeholder={t('Enter your password', '输入您的密码')}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-xl text-xl transition-colors"
          >
            {loading ? t('Signing in...', '登录中...') : t('Sign In', '登录')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/menu')}
            className="text-orange-600 hover:underline font-medium"
          >
            {t('Back to menu', '返回菜单')}
          </button>
        </div>
      </div>
    </div>
  );
};
