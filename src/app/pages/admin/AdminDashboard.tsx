import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { UtensilsCrossed, ShoppingBag, LogOut, Home, Globe, Database, CheckCircle, AlertCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

export const AdminDashboard: React.FC = () => {
  const { signOut, user } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [seedStatus, setSeedStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [seedMessage, setSeedMessage] = useState('');

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const handleSeedDatabase = async () => {
    setSeedStatus('loading');
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b11e7096/seed`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setSeedStatus('success');
        setSeedMessage(t('Successfully added 5 categories, 10 dishes, and 5 sample orders!', '成功添加了5个分类、10道菜品和5个示例订单！'));
      } else {
        setSeedStatus('error');
        setSeedMessage(data.error || t('Failed to seed database', '无法为数据库添加种子数据'));
      }
    } catch (error: any) {
      setSeedStatus('error');
      setSeedMessage(error.message || t('Network error', '网络错误'));
    }

    setTimeout(() => setSeedStatus('idle'), 5000);
  };

  const menuItems = [
    {
      icon: UtensilsCrossed,
      title: t('Manage Dishes & Categories', '管理菜品和分类'),
      description: t('Add dishes, organize categories, and drag & drop to arrange', '添加菜品、组织分类，拖放排列'),
      link: '/admin/dishes',
      color: 'bg-orange-500',
    },
    {
      icon: ShoppingBag,
      title: t('View Orders', '查看订单'),
      description: t('See customer order inquiries', '查看客户订单询问'),
      link: '/admin/orders',
      color: 'bg-green-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              {t('Admin Dashboard', '管理员控制台')}
            </h1>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium transition-colors"
              >
                <Globe className="w-5 h-5" />
                <span className="hidden sm:inline">{language === 'en' ? '中文' : 'EN'}</span>
              </button>
              <Link
                to="/menu"
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Home className="w-5 h-5" />
                <span className="hidden sm:inline font-medium">{t('View Site', '查看网站')}</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline font-medium">{t('Sign Out', '退出登录')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
            {t('Welcome back!', '欢迎回来！')}
          </h2>
          <p className="text-lg sm:text-xl text-gray-600">
            {t('Manage your kitchen from here', '从这里管理您的厨房')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.link}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group"
            >
              <div className={`${item.color} p-6 sm:p-8`}>
                <item.icon className="w-16 h-16 sm:w-20 sm:h-20 text-white" />
              </div>
              <div className="p-6 sm:p-8">
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 group-hover:text-orange-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-base sm:text-lg text-gray-600">{item.description}</p>
                <div className="mt-4 text-orange-600 font-medium group-hover:translate-x-2 transition-transform inline-block">
                  {t('Go →', '前往 →')}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="bg-blue-50 rounded-2xl p-6 sm:p-8">
            <div className="flex items-start space-x-4">
              <Database className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                  {t('Demo Data', '演示数据')}
                </h3>
                <p className="text-base sm:text-lg text-gray-600 mb-4">
                  {t('Populate the database with sample dishes, categories, and orders for testing and demo purposes', '使用示例菜品、分类和订单来填充数据库以用于测试和演示目的')}
                </p>
                <button
                  onClick={handleSeedDatabase}
                  disabled={seedStatus === 'loading'}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition-colors"
                >
                  {seedStatus === 'loading' ? t('Seeding...', '正在添加...') : t('Add Demo Data', '添加演示数据')}
                </button>
                {seedStatus === 'success' && (
                  <div className="mt-4 flex items-center space-x-2 text-green-700 bg-green-50 p-4 rounded-lg">
                    <CheckCircle className="w-5 h-5" />
                    <span>{seedMessage}</span>
                  </div>
                )}
                {seedStatus === 'error' && (
                  <div className="mt-4 flex items-center space-x-2 text-red-700 bg-red-50 p-4 rounded-lg">
                    <AlertCircle className="w-5 h-5" />
                    <span>{seedMessage}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
