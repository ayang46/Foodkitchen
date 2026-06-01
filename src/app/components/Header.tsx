import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { Globe, Phone, Mail } from 'lucide-react';

export const Header: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-orange-600">
              {t("Grandma's Kitchen", "奶奶的厨房")}
            </h1>
          </Link>

          <nav className="flex items-center space-x-4 sm:space-x-6">
            <Link
              to="/"
              className="text-base sm:text-lg font-medium text-gray-700 hover:text-orange-600"
            >
              {t('Menu', '菜单')}
            </Link>
            <Link
              to="/contact"
              className="text-base sm:text-lg font-medium text-gray-700 hover:text-orange-600"
            >
              {t('Contact', '联系我们')}
            </Link>
            <button
              onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
              className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm sm:text-base font-medium"
            >
              <Globe className="w-4 h-4" />
              <span>{language === 'en' ? '中文' : 'EN'}</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
