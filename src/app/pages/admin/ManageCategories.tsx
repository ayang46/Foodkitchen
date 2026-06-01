import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { translateText } from '../../../utils/translate';
import { ArrowLeft, Plus, Edit, Trash2, X, Globe } from 'lucide-react';

interface Category {
  id: string;
  nameEn: string;
  nameZh: string;
}

export const ManageCategories: React.FC = () => {
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [translating, setTranslating] = useState(false);
  const [formData, setFormData] = useState({
    nameEn: '',
    nameZh: '',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b11e7096/categories`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate at least one language is filled
    if (!formData.nameEn && !formData.nameZh) {
      alert(t('Please enter category name in at least one language.', '请至少用一种语言输入分类名称。'));
      return;
    }

    setTranslating(true);

    try {
      // Auto-translate missing fields
      const finalData = { ...formData };

      // Check and translate name
      if (formData.nameEn && !formData.nameZh) {
        finalData.nameZh = await translateText(formData.nameEn, 'en', 'zh');
      } else if (formData.nameZh && !formData.nameEn) {
        finalData.nameEn = await translateText(formData.nameZh, 'zh', 'en');
      }

      const url = editingCategory
        ? `https://${projectId}.supabase.co/functions/v1/make-server-b11e7096/categories/${editingCategory.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-b11e7096/categories`;

      const response = await fetch(url, {
        method: editingCategory ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(finalData),
      });

      if (response.ok) {
        await fetchCategories();
        resetForm();
      } else {
        alert(t('Failed to save category', '保存分类失败'));
      }
    } catch (error) {
      console.error('Failed to save category:', error);
      alert(t('Failed to save category', '保存分类失败'));
    } finally {
      setTranslating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('Are you sure you want to delete this category?', '确定要删除此分类吗？'))) {
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b11e7096/categories/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        await fetchCategories();
      } else {
        alert(t('Failed to delete category', '删除分类失败'));
      }
    } catch (error) {
      console.error('Failed to delete category:', error);
      alert(t('Failed to delete category', '删除分类失败'));
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      nameEn: category.nameEn,
      nameZh: category.nameZh,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingCategory(null);
    setFormData({
      nameEn: '',
      nameZh: '',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center space-x-2 text-gray-700 hover:text-orange-600 text-lg"
          >
            <ArrowLeft className="w-6 h-6" />
            <span>{t('Back', '返回')}</span>
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium transition-colors"
            >
              <Globe className="w-5 h-5" />
              <span>{language === 'en' ? '中文' : 'EN'}</span>
            </button>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-xl text-lg transition-colors"
              >
                <Plus className="w-6 h-6" />
                <span>{t('Add Category', '添加分类')}</span>
              </button>
            )}
          </div>
        </div>

        <h1 className="text-4xl font-bold text-gray-800 mb-8">
          {t('Manage Categories', '管理分类')}
        </h1>

        {showForm && (
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                {editingCategory ? t('Edit Category', '编辑分类') : t('Add New Category', '添加新分类')}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700 p-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                  <strong>{t('Tip', '提示')}:</strong> {t('You can enter content in either English or Chinese. Missing translations will be automatically generated when you save.', '您可以使用英文或中文输入内容。保存时会自动生成缺少的翻译。')}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xl font-bold text-gray-800 mb-3">
                    {t('Name (English)', '名称（英文）')}
                  </label>
                  <input
                    type="text"
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    className="w-full px-5 py-4 text-xl rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none"
                    placeholder="e.g., Main Dishes"
                  />
                </div>

                <div>
                  <label className="block text-xl font-bold text-gray-800 mb-3">
                    {t('Name (Chinese)', '名称（中文）')}
                  </label>
                  <input
                    type="text"
                    value={formData.nameZh}
                    onChange={(e) => setFormData({ ...formData, nameZh: e.target.value })}
                    className="w-full px-5 py-4 text-xl rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none"
                    placeholder="例如：主菜"
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={translating}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-xl text-xl transition-colors"
                >
                  {translating
                    ? t('Saving...', '保存中...')
                    : editingCategory
                    ? t('Update Category', '更新分类')
                    : t('Add Category', '添加分类')}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl text-xl transition-colors"
                >
                  {t('Cancel', '取消')}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div key={category.id} className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                {language === 'en' ? category.nameEn : category.nameZh}
              </h3>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleEdit(category)}
                  className="flex-1 flex items-center justify-center space-x-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold py-3 px-4 rounded-lg transition-colors text-lg"
                >
                  <Edit className="w-5 h-5" />
                  <span>{t('Edit', '编辑')}</span>
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-700 font-bold py-3 px-4 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {categories.length === 0 && !showForm && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600 mb-6">
              {t('No categories yet. Add your first category!', '还没有分类。添加您的第一个分类！')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
