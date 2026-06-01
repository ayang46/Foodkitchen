import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { CheckCircle, ArrowLeft } from 'lucide-react';

interface Dish {
  id: string;
  nameEn: string;
  nameZh: string;
  price: number;
}

export const OrderForm: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [selectedDishes, setSelectedDishes] = useState<string[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDishes();
    if (location.state?.dishId) {
      setSelectedDishes([location.state.dishId]);
    }
  }, []);

  const fetchDishes = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b11e7096/dishes?available=true`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      setDishes(data.dishes || []);
    } catch (error) {
      console.error('Failed to fetch dishes:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b11e7096/orders`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            customerName,
            customerEmail,
            customerPhone,
            dishIds: selectedDishes,
            message,
            language,
          }),
        }
      );

      if (response.ok) {
        setSubmitted(true);
      } else {
        alert(t('Failed to submit order. Please try again.', '提交订单失败。请重试。'));
      }
    } catch (error) {
      console.error('Failed to submit order:', error);
      alert(t('Failed to submit order. Please try again.', '提交订单失败。请重试。'));
    } finally {
      setLoading(false);
    }
  };

  const toggleDish = (dishId: string) => {
    setSelectedDishes((prev) =>
      prev.includes(dishId) ? prev.filter((id) => id !== dishId) : [...prev, dishId]
    );
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 max-w-2xl w-full text-center">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
            {t('Order Inquiry Sent!', '订单询问已发送！')}
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 mb-8">
            {t(
              'Thank you for your interest! Grandma will review your request and contact you shortly.',
              '感谢您的关注！奶奶会审核您的请求并很快联系您。'
            )}
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-xl text-lg transition-colors"
          >
            {t('Back to Menu', '返回菜单')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-700 hover:text-orange-600 mb-6 text-base sm:text-lg"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{t('Back', '返回')}</span>
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
            {t('Place an Order', '下订单')}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 mb-8">
            {t(
              'Fill out the form below and Grandma will contact you to confirm your order.',
              '填写下面的表格，奶奶会联系您确认订单。'
            )}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-lg sm:text-xl font-bold text-gray-800 mb-3">
                {t('Your Name', '您的姓名')} *
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-3 sm:py-4 text-base sm:text-lg rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none"
                placeholder={t('Enter your name', '输入您的姓名')}
              />
            </div>

            <div>
              <label className="block text-lg sm:text-xl font-bold text-gray-800 mb-3">
                {t('Email Address', '电子邮箱')} *
              </label>
              <input
                type="email"
                required
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-4 py-3 sm:py-4 text-base sm:text-lg rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none"
                placeholder={t('Enter your email', '输入您的邮箱')}
              />
            </div>

            <div>
              <label className="block text-lg sm:text-xl font-bold text-gray-800 mb-3">
                {t('Phone Number', '电话号码')} *
              </label>
              <input
                type="tel"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-4 py-3 sm:py-4 text-base sm:text-lg rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none"
                placeholder={t('Enter your phone number', '输入您的电话号码')}
              />
            </div>

            <div>
              <label className="block text-lg sm:text-xl font-bold text-gray-800 mb-3">
                {t('Select Dishes', '选择菜品')} *
              </label>
              <div className="space-y-2 max-h-64 overflow-y-auto border-2 border-gray-200 rounded-xl p-4">
                {dishes.map((dish) => (
                  <label
                    key={dish.id}
                    className="flex items-center space-x-3 p-3 hover:bg-orange-50 rounded-lg cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedDishes.includes(dish.id)}
                      onChange={() => toggleDish(dish.id)}
                      className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                    />
                    <span className="flex-1 text-base sm:text-lg text-gray-700">
                      {language === 'en' ? dish.nameEn : dish.nameZh}
                    </span>
                    <span className="text-base sm:text-lg font-bold text-orange-600">
                      ${dish.price.toFixed(2)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-lg sm:text-xl font-bold text-gray-800 mb-3">
                {t('Additional Notes', '备注')}
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 text-base sm:text-lg rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none resize-none"
                placeholder={t(
                  'Any special requests or questions?',
                  '有任何特殊要求或问题吗？'
                )}
              />
            </div>

            <button
              type="submit"
              disabled={loading || selectedDishes.length === 0}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-bold py-4 sm:py-5 px-6 rounded-xl text-lg sm:text-xl transition-colors"
            >
              {loading
                ? t('Submitting...', '提交中...')
                : t('Submit Order Inquiry', '提交订单询问')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
