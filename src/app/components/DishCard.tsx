import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

interface Dish {
  id: string;
  nameEn: string;
  nameZh: string;
  descriptionEn: string;
  descriptionZh: string;
  price: number;
  photoUrl: string;
  available: boolean;
  categoryId: string;
}

export const DishCard: React.FC<{ dish: Dish }> = ({ dish }) => {
  const { language, t } = useLanguage();

  return (
    <Link to={`/dish/${dish.id}`} className="block group">
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <div className="aspect-video bg-gray-200 overflow-hidden relative">
          {dish.photoUrl ? (
            <img
              src={dish.photoUrl}
              alt={language === 'en' ? dish.nameEn : dish.nameZh}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              {t('No image', '暂无图片')}
            </div>
          )}
          {!dish.available && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-bold text-xl px-4 py-2 bg-red-600 rounded-lg">
                {t('Unavailable', '暂不供应')}
              </span>
            </div>
          )}
        </div>
        <div className="p-4 sm:p-6">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
            {language === 'en' ? dish.nameEn : dish.nameZh}
          </h3>
          <p className="text-gray-600 mb-3 line-clamp-2 text-sm sm:text-base">
            {language === 'en' ? dish.descriptionEn : dish.descriptionZh}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-2xl sm:text-3xl font-bold text-orange-600">
              ${dish.price.toFixed(2)}
            </span>
            <span className="text-orange-600 font-medium text-sm sm:text-base">
              {t('View Details →', '查看详情 →')}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};
