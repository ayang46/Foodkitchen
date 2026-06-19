import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { Globe, ShoppingCart } from 'lucide-react';
import { CART_CHANGED_EVENT, CART_STORAGE_KEY, normalizeCartItems } from '../utils/cart';

export const Header: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCartCount = () => {
      try {
        const storedCart = window.localStorage.getItem(CART_STORAGE_KEY);
        const items = storedCart ? normalizeCartItems(JSON.parse(storedCart)) : [];
        setCartCount(items.reduce((total, item) => total + item.quantity, 0));
      } catch (error) {
        console.error('Failed to read cart count:', error);
        setCartCount(0);
      }
    };

    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    window.addEventListener(CART_CHANGED_EVENT, updateCartCount);

    return () => window.removeEventListener('storage', updateCartCount);
    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener(CART_CHANGED_EVENT, updateCartCount);
    };
  }, []);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link to="/menu" className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-orange-600">
              {t("Grandma's Kitchen", "奶奶的厨房")}
            </h1>
          </Link>

          <nav className="flex items-center space-x-4 sm:space-x-6">
            <Link
              to="/order"
              className="relative inline-flex items-center justify-center rounded-full p-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
              aria-label={t('Shopping Cart', '购物车')}
            >
              <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-600 px-1 text-[11px] font-bold text-white">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>
            <Link
              to="/menu"
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
