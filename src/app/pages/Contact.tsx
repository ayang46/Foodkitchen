import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react';

export const Contact: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 text-center mb-4">
          {t('Contact Us', '联系我们')}
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 text-center mb-12">
          {t(
            "We'd love to hear from you! Get in touch to place an order or ask any questions.",
            '我们很乐意听到您的声音！请联系我们下订单或提出任何问题。'
          )}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-start space-x-4 mb-6">
              <div className="bg-orange-100 p-3 rounded-lg">
                <Phone className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                  {t('Phone', '电话')}
                </h3>
                <a
                  href="tel:+1234567890"
                  className="text-lg sm:text-xl text-orange-600 hover:underline"
                >
                  (123) 456-7890
                </a>
                <p className="text-gray-600 mt-2">
                  {t('Call us for immediate assistance', '致电我们获得即时帮助')}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 mb-6">
              <div className="bg-orange-100 p-3 rounded-lg">
                <Mail className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                  {t('Email', '邮箱')}
                </h3>
                <a
                  href="mailto:grandma@kitchen.com"
                  className="text-lg sm:text-xl text-orange-600 hover:underline break-all"
                >
                  grandma@kitchen.com
                </a>
                <p className="text-gray-600 mt-2">
                  {t('Send us an email anytime', '随时给我们发送电子邮件')}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-orange-100 p-3 rounded-lg">
                <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                  {t('Location', '地址')}
                </h3>
                <p className="text-lg sm:text-xl text-gray-700">
                  123 Main Street
                  <br />
                  Your City, ST 12345
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-start space-x-4 mb-6">
              <div className="bg-orange-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
                  {t('Business Hours', '营业时间')}
                </h3>
                <div className="space-y-2 text-base sm:text-lg text-gray-700">
                  <div className="flex justify-between">
                    <span className="font-medium">{t('Monday - Friday', '周一至周五')}</span>
                    <span>10:00 AM - 8:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">{t('Saturday', '周六')}</span>
                    <span>11:00 AM - 9:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">{t('Sunday', '周日')}</span>
                    <span>11:00 AM - 7:00 PM</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-base sm:text-lg text-gray-700 mb-4">
                {t(
                  'Orders typically ready within 30-60 minutes. We recommend calling ahead for large orders.',
                  '订单通常在30-60分钟内准备好。我们建议提前致电预订大量订单。'
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl shadow-xl p-8 sm:p-12 text-center text-white">
          <MessageCircle className="w-16 h-16 mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            {t('Ready to Order?', '准备订购？')}
          </h2>
          <p className="text-lg sm:text-xl mb-8 opacity-90">
            {t(
              'Fill out our simple order form and Grandma will get back to you shortly!',
              '填写我们的简单订单表格，奶奶会很快回复您！'
            )}
          </p>
          <Link
            to="/order"
            className="inline-block bg-white text-orange-600 font-bold py-4 px-8 sm:px-12 rounded-xl text-lg sm:text-xl hover:bg-gray-100 transition-colors"
          >
            {t('Place an Order', '下订单')}
          </Link>
        </div>
      </div>
    </div>
  );
};
