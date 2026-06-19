import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { ArrowLeft, CheckCircle, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import {
  CART_STORAGE_KEY,
  addCartItem,
  flattenCartItemIds,
  normalizeCartItems,
  removeCartItem,
  persistCartItems,
  updateCartItemQuantity,
} from '../utils/cart';

interface Dish {
  id: string;
  nameEn: string;
  nameZh: string;
  price: number;
}

interface CartItem {
  dishId: string;
  quantity: number;
}

export const OrderForm: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartLoaded, setCartLoaded] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const initialDishId =
    location.state && typeof location.state === 'object' && 'dishId' in location.state
      ? (location.state as { dishId?: string }).dishId
      : undefined;

  useEffect(() => {
    fetchDishes();
    try {
      const storedCart = window.localStorage.getItem(CART_STORAGE_KEY);
      if (storedCart) {
        setCartItems(normalizeCartItems(JSON.parse(storedCart)));
      }
    } catch (error) {
      console.error('Failed to restore cart:', error);
    } finally {
      setCartLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!initialDishId) return;
    setCartItems((currentCart) => addCartItem(currentCart, initialDishId, 1));
  }, [initialDishId]);

  useEffect(() => {
    if (!cartLoaded) return;
    persistCartItems(cartItems);
  }, [cartItems, cartLoaded]);

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

  const dishLookup = useMemo(() => new Map(dishes.map((dish) => [dish.id, dish])), [dishes]);

  const cartSummary = useMemo(() => {
    return cartItems
      .map((item) => {
        const dish = dishLookup.get(item.dishId);
        const name = dish ? (language === 'en' ? dish.nameEn : dish.nameZh) : item.dishId;
        const price = dish?.price ?? 0;
        const subtotal = price * item.quantity;

        return {
          ...item,
          name,
          price,
          subtotal,
        };
      })
      .filter((item) => item.quantity > 0);
  }, [cartItems, dishLookup, language]);

  const cartSubtotal = cartSummary.reduce((total, item) => total + item.subtotal, 0);

  const changeQuantity = (dishId: string, nextQuantity: number) => {
    setCartItems((currentCart) => updateCartItemQuantity(currentCart, dishId, nextQuantity));
  };

  const handleRemoveDish = (dishId: string) => {
    setCartItems((currentCart) => removeCartItem(currentCart, dishId));
  };

  const clearCart = () => {
    setCartItems([]);
    window.localStorage.removeItem(CART_STORAGE_KEY);
    window.dispatchEvent(new Event('foodkitchen-cart-changed'));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      alert(t('Please add at least one dish to your cart.', '请先将至少一道菜加入购物车。'));
      return;
    }

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
            items: cartItems,
            dishIds: flattenCartItemIds(cartItems),
            message,
            language,
          }),
        }
      );

      if (response.ok) {
        setSubmitted(true);
        clearCart();
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
              'Thank you for your interest! Grandma will review your cart, send confirmation messages, and contact you shortly.',
              '感谢您的关注！奶奶会查看您的购物车，发送确认消息，并尽快联系您。'
            )}
          </p>
          <button
            onClick={() => navigate('/menu')}
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
              'Add dishes to your cart, adjust quantities, and leave a note before sending the inquiry.',
              '将菜品加入购物车，调整数量，并在发送询问前留下备注。'
            )}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-orange-50 rounded-2xl p-5 sm:p-6 border border-orange-200">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {t('Shopping Cart', '购物车')}
                  </h2>
                  <p className="text-gray-600">
                    {cartSummary.length > 0
                      ? t('Adjust quantities before checkout.', '在结账前调整数量。')
                      : t('Your cart is empty.', '您的购物车是空的。')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/menu')}
                  className="text-orange-700 font-semibold hover:underline"
                >
                  {t('Continue shopping', '继续购物')}
                </button>
              </div>

              {cartSummary.length === 0 ? (
                <div className="rounded-xl border border-dashed border-orange-300 bg-white p-6 text-center">
                  <ShoppingCart className="mx-auto mb-3 h-10 w-10 text-orange-500" />
                  <p className="text-lg font-semibold text-gray-800">
                    {t('No dishes in your cart yet.', '购物车里还没有菜品。')}
                  </p>
                  <p className="text-gray-600 mt-1">
                    {t('Pick a dish and add it to the cart to begin.', '选择一道菜并加入购物车即可开始。')}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cartSummary.map((item) => (
                    <div
                      key={item.dishId}
                      className="rounded-xl bg-white p-4 sm:p-5 shadow-sm border border-orange-100"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <h3 className="text-lg sm:text-xl font-bold text-gray-800 break-words">
                            {item.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            ${item.price.toFixed(2)} {t('per item', '每份')}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => changeQuantity(item.dishId, item.quantity - 1)}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-700 hover:border-orange-300 hover:text-orange-600"
                            aria-label={t('Decrease quantity', '减少数量')}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="min-w-10 text-center text-lg font-bold text-gray-800">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => changeQuantity(item.dishId, item.quantity + 1)}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-700 hover:border-orange-300 hover:text-orange-600"
                            aria-label={t('Increase quantity', '增加数量')}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveDish(item.dishId)}
                            className="ml-2 inline-flex h-10 w-10 items-center justify-center rounded-full border border-red-200 text-red-600 hover:bg-red-50"
                            aria-label={t('Remove item', '删除菜品')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
                        <span>
                          {t('Item total', '小计')}
                        </span>
                        <span className="font-bold text-gray-900">
                          ${item.subtotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}

                  <div className="flex items-center justify-between border-t border-orange-200 pt-4">
                    <span className="text-lg font-semibold text-gray-800">
                      {t('Order total', '订单总计')}
                    </span>
                    <span className="text-2xl font-bold text-orange-600">
                      ${cartSubtotal.toFixed(2)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={clearCart}
                    className="text-sm font-semibold text-gray-500 hover:text-gray-700"
                  >
                    {t('Clear cart', '清空购物车')}
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block text-lg sm:text-xl font-bold text-gray-800 mb-3">
                  {t('Your Name', '您的姓名')} *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-base sm:text-lg focus:outline-none focus:border-orange-500"
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
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-base sm:text-lg focus:outline-none focus:border-orange-500"
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
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-base sm:text-lg focus:outline-none focus:border-orange-500"
                  placeholder={t('Enter your phone number', '输入您的电话号码')}
                />
              </div>

              <div>
                <label className="block text-lg sm:text-xl font-bold text-gray-800 mb-3">
                  {t('Additional Notes', '备注')}
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full resize-none rounded-xl border-2 border-gray-200 px-4 py-3 text-base sm:text-lg focus:outline-none focus:border-orange-500"
                  placeholder={t(
                    'Any special requests or questions?',
                    '有任何特殊要求或问题吗？'
                  )}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || cartSummary.length === 0}
              className="w-full rounded-xl bg-orange-600 px-6 py-4 text-lg font-bold text-white transition-colors hover:bg-orange-700 disabled:bg-gray-400 sm:py-5 sm:text-xl"
            >
              {loading
                ? t('Submitting...', '提交中...')
                : t('Send Order Inquiry', '发送订单询问')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
