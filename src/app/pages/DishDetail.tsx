import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { CART_STORAGE_KEY, addCartItem, normalizeCartItems, persistCartItems } from '../utils/cart';

interface Dish {
  id: string;
  nameEn: string;
  nameZh: string;
  descriptionEn: string;
  descriptionZh: string;
  ingredientsEn: string;
  ingredientsZh: string;
  price: number;
  photoUrl: string;
  available: boolean;
}

export const DishDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const [dish, setDish] = useState<Dish | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDish();
  }, [id]);

  const fetchDish = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b11e7096/dishes/${id}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      setDish(data.dish);
    } catch (error) {
      console.error('Failed to fetch dish:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!dish) return;

    const storedCart = window.localStorage.getItem(CART_STORAGE_KEY);
    const currentCart = storedCart ? normalizeCartItems(JSON.parse(storedCart)) : [];
    const nextCart = addCartItem(currentCart, dish.id, 1);

    persistCartItems(nextCart);
    navigate('/order');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!dish) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {t('Dish not found', '未找到菜品')}
          </h2>
          <Link to="/menu" className="text-orange-600 hover:underline">
            {t('Back to menu', '返回菜单')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/menu')}
          className="flex items-center space-x-2 text-gray-700 hover:text-orange-600 mb-6 text-base sm:text-lg"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{t('Back to menu', '返回菜单')}</span>
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="aspect-square bg-gray-200">
              {dish.photoUrl ? (
                <img
                  src={dish.photoUrl}
                  alt={language === 'en' ? dish.nameEn : dish.nameZh}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg">
                  {t('No image', '暂无图片')}
                </div>
              )}
            </div>

            <div className="p-6 sm:p-8 lg:p-12 flex flex-col justify-between">
              <div>
                {!dish.available && (
                  <div className="inline-block px-4 py-2 bg-red-100 text-red-700 font-bold rounded-lg mb-4">
                    {t('Currently Unavailable', '暂不供应')}
                  </div>
                )}

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
                  {language === 'en' ? dish.nameEn : dish.nameZh}
                </h1>

                <p className="text-4xl sm:text-5xl font-bold text-orange-600 mb-6">
                  ${dish.price.toFixed(2)}
                </p>

                <div className="mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
                    {t('Description', '描述')}
                  </h2>
                  <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                    {language === 'en' ? dish.descriptionEn : dish.descriptionZh}
                  </p>
                </div>

                <div className="mb-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
                    {t('Ingredients', '食材')}
                  </h2>
                  <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                    {language === 'en' ? dish.ingredientsEn : dish.ingredientsZh}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="block w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 sm:py-5 px-6 rounded-xl text-center text-lg sm:text-xl transition-colors"
              >
                <div className="flex items-center justify-center space-x-2">
                  <ShoppingCart className="w-6 h-6" />
                  <span>{t('Add to Cart', '加入购物车')}</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
