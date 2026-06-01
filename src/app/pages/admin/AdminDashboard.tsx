import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { UtensilsCrossed, ShoppingBag, LogOut, Home, Globe } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { signOut, user } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
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
                to="/"
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
      </div>
    </div>
  );
};
