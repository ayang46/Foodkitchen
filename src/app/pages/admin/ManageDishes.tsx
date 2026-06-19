import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { translateText } from '../../../utils/translate';
import { ArrowLeft, Plus, Edit, Trash2, Upload, Check, X, Globe, FolderPlus, GripVertical } from 'lucide-react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

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
  categoryId: string;
}

interface Category {
  id: string;
  nameEn: string;
  nameZh: string;
}

interface DraggableDishProps {
  dish: Dish;
  onEdit: (dish: Dish) => void;
  onDelete: (id: string) => void;
  language: string;
  t: (en: string, zh: string) => string;
}

const DraggableDish: React.FC<DraggableDishProps> = ({ dish, onEdit, onDelete, language, t }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'DISH',
    item: { dishId: dish.id, currentCategoryId: dish.categoryId },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      className={`bg-white rounded-xl shadow-lg overflow-hidden cursor-move ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-center justify-center p-2 bg-gray-100">
        <GripVertical className="w-5 h-5 text-gray-400" />
      </div>
      <div className="aspect-video bg-gray-200">
        {dish.photoUrl ? (
          <img
            src={dish.photoUrl}
            alt={language === 'en' ? dish.nameEn : dish.nameZh}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            {t('No image', '暂无图片')}
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          {language === 'en' ? dish.nameEn : dish.nameZh}
        </h3>
        <p className="text-2xl font-bold text-orange-600 mb-4">
          ${dish.price.toFixed(2)}
        </p>
        <div className="mb-4">
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              dish.available
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {dish.available ? t('Available', '可供应') : t('Unavailable', '不可供应')}
          </span>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => onEdit(dish)}
            className="flex-1 flex items-center justify-center space-x-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold py-3 px-4 rounded-lg transition-colors"
          >
            <Edit className="w-5 h-5" />
            <span>{t('Edit', '编辑')}</span>
          </button>
          <button
            onClick={() => onDelete(dish.id)}
            className="flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-700 font-bold py-3 px-4 rounded-lg transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

interface CategorySectionProps {
  category: Category;
  dishes: Dish[];
  onDrop: (dishId: string, categoryId: string) => void;
  onEdit: (dish: Dish) => void;
  onDelete: (id: string) => void;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (id: string) => void;
  language: string;
  t: (en: string, zh: string) => string;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  dishes,
  onDrop,
  onEdit,
  onDelete,
  onEditCategory,
  onDeleteCategory,
  language,
  t,
}) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'DISH',
    drop: (item: { dishId: string; currentCategoryId: string }) => {
      if (item.currentCategoryId !== category.id) {
        onDrop(item.dishId, category.id);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      ref={drop}
      className={`bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-6 border-2 ${
        isOver ? 'border-orange-500 border-dashed' : 'border-transparent'
      }`}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-800">
          {language === 'en' ? category.nameEn : category.nameZh}
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => onEditCategory(category)}
            className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
          >
            <Edit className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDeleteCategory(category.id)}
            className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {dishes.length === 0 ? (
        <div className="bg-white bg-opacity-50 rounded-xl p-8 text-center border-2 border-dashed border-gray-300">
          <p className="text-lg text-gray-500">
            {t('Drag dishes here', '拖动菜品到这里')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dishes.map((dish) => (
            <DraggableDish
              key={dish.id}
              dish={dish}
              onEdit={onEdit}
              onDelete={onDelete}
              language={language}
              t={t}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const ManageDishes: React.FC = () => {
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const dishFormRef = useRef<HTMLDivElement>(null);
  const categoryFormRef = useRef<HTMLDivElement>(null);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showDishForm, setShowDishForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [uploading, setUploading] = useState(false);
  const [translating, setTranslating] = useState(false);

  const [dishFormData, setDishFormData] = useState({
    nameEn: '',
    nameZh: '',
    descriptionEn: '',
    descriptionZh: '',
    ingredientsEn: '',
    ingredientsZh: '',
    price: '',
    categoryId: '',
    available: true,
    photoUrl: '',
  });

  const [categoryFormData, setCategoryFormData] = useState({
    nameEn: '',
    nameZh: '',
  });

  useEffect(() => {
    fetchDishes();
    fetchCategories();
  }, []);

  const fetchDishes = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b11e7096/dishes`,
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

  const handleDrop = async (dishId: string, categoryId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b11e7096/dishes/${dishId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ categoryId }),
        }
      );

      if (response.ok) {
        await fetchDishes();
      } else {
        alert(t('Failed to move dish', '移动菜品失败'));
      }
    } catch (error) {
      console.error('Failed to move dish:', error);
      alert(t('Failed to move dish', '移动菜品失败'));
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b11e7096/upload-photo`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        }
      );

      const data = await response.json();
      if (response.ok) {
        setDishFormData((prev) => ({ ...prev, photoUrl: data.url }));
      } else {
        alert(t('Failed to upload photo', '上传照片失败'));
      }
    } catch (error) {
      console.error('Photo upload error:', error);
      alert(t('Failed to upload photo', '上传照片失败'));
    } finally {
      setUploading(false);
    }
  };

  const handleDishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate at least one language is filled for each field
    if (!dishFormData.nameEn && !dishFormData.nameZh) {
      alert(t('Please enter dish name in at least one language.', '请至少用一种语言输入菜品名称。'));
      return;
    }
    if (!dishFormData.descriptionEn && !dishFormData.descriptionZh) {
      alert(t('Please enter description in at least one language.', '请至少用一种语言输入描述。'));
      return;
    }
    if (!dishFormData.ingredientsEn && !dishFormData.ingredientsZh) {
      alert(t('Please enter ingredients in at least one language.', '请至少用一种语言输入食材。'));
      return;
    }

    setTranslating(true);

    try {
      // Auto-translate missing fields
      const finalData = { ...dishFormData };

      // Check and translate name
      if (dishFormData.nameEn && !dishFormData.nameZh) {
        finalData.nameZh = await translateText(dishFormData.nameEn, 'en', 'zh');
      } else if (dishFormData.nameZh && !dishFormData.nameEn) {
        finalData.nameEn = await translateText(dishFormData.nameZh, 'zh', 'en');
      }

      // Check and translate description
      if (dishFormData.descriptionEn && !dishFormData.descriptionZh) {
        finalData.descriptionZh = await translateText(dishFormData.descriptionEn, 'en', 'zh');
      } else if (dishFormData.descriptionZh && !dishFormData.descriptionEn) {
        finalData.descriptionEn = await translateText(dishFormData.descriptionZh, 'zh', 'en');
      }

      // Check and translate ingredients
      if (dishFormData.ingredientsEn && !dishFormData.ingredientsZh) {
        finalData.ingredientsZh = await translateText(dishFormData.ingredientsEn, 'en', 'zh');
      } else if (dishFormData.ingredientsZh && !dishFormData.ingredientsEn) {
        finalData.ingredientsEn = await translateText(dishFormData.ingredientsZh, 'zh', 'en');
      }

      const url = editingDish
        ? `https://${projectId}.supabase.co/functions/v1/make-server-b11e7096/dishes/${editingDish.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-b11e7096/dishes`;

      const response = await fetch(url, {
        method: editingDish ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          ...finalData,
          price: parseFloat(finalData.price),
        }),
      });

      if (response.ok) {
        await fetchDishes();
        resetDishForm();
      } else {
        alert(t('Failed to save dish', '保存菜品失败'));
      }
    } catch (error) {
      console.error('Failed to save dish:', error);
      alert(t('Failed to save dish', '保存菜品失败'));
    } finally {
      setTranslating(false);
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate at least one language is filled
    if (!categoryFormData.nameEn && !categoryFormData.nameZh) {
      alert(t('Please enter category name in at least one language.', '请至少用一种语言输入分类名称。'));
      return;
    }

    setTranslating(true);

    try {
      // Auto-translate missing fields
      const finalData = { ...categoryFormData };

      if (categoryFormData.nameEn && !categoryFormData.nameZh) {
        finalData.nameZh = await translateText(categoryFormData.nameEn, 'en', 'zh');
      } else if (categoryFormData.nameZh && !categoryFormData.nameEn) {
        finalData.nameEn = await translateText(categoryFormData.nameZh, 'zh', 'en');
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
        resetCategoryForm();
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

  const handleDeleteDish = async (id: string) => {
    if (!confirm(t('Are you sure you want to delete this dish?', '确定要删除此菜品吗？'))) {
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b11e7096/dishes/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        await fetchDishes();
      } else {
        alert(t('Failed to delete dish', '删除菜品失败'));
      }
    } catch (error) {
      console.error('Failed to delete dish:', error);
      alert(t('Failed to delete dish', '删除菜品失败'));
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const dishesInCategory = dishes.filter(d => d.categoryId === id);
    if (dishesInCategory.length > 0) {
      alert(t('Cannot delete category with dishes. Please move or delete all dishes first.', '无法删除包含菜品的分类。请先移动或删除所有菜品。'));
      return;
    }

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

  const handleEditDish = (dish: Dish) => {
    setEditingDish(dish);
    setDishFormData({
      nameEn: dish.nameEn,
      nameZh: dish.nameZh,
      descriptionEn: dish.descriptionEn,
      descriptionZh: dish.descriptionZh,
      ingredientsEn: dish.ingredientsEn,
      ingredientsZh: dish.ingredientsZh,
      price: dish.price.toString(),
      categoryId: dish.categoryId,
      available: dish.available,
      photoUrl: dish.photoUrl,
    });
    setShowDishForm(true);
    setTimeout(() => {
      dishFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryFormData({
      nameEn: category.nameEn,
      nameZh: category.nameZh,
    });
    setShowCategoryForm(true);
    setTimeout(() => {
      categoryFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };

  const resetDishForm = () => {
    setShowDishForm(false);
    setEditingDish(null);
    setDishFormData({
      nameEn: '',
      nameZh: '',
      descriptionEn: '',
      descriptionZh: '',
      ingredientsEn: '',
      ingredientsZh: '',
      price: '',
      categoryId: '',
      available: true,
      photoUrl: '',
    });
  };

  const resetCategoryForm = () => {
    setShowCategoryForm(false);
    setEditingCategory(null);
    setCategoryFormData({
      nameEn: '',
      nameZh: '',
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              {!showCategoryForm && !showDishForm && (
                <>
                  <button
                    onClick={() => setShowCategoryForm(true)}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl text-lg transition-colors"
                  >
                    <FolderPlus className="w-6 h-6" />
                    <span>{t('Add Category', '添加分类')}</span>
                  </button>
                  <button
                    onClick={() => setShowDishForm(true)}
                    className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-xl text-lg transition-colors"
                  >
                    <Plus className="w-6 h-6" />
                    <span>{t('Add Dish', '添加菜品')}</span>
                  </button>
                </>
              )}
            </div>
          </div>

          <h1 className="text-4xl font-bold text-gray-800 mb-8">
            {t('Manage Dishes & Categories', '管理菜品和分类')}
          </h1>

        {showCategoryForm && (
          <div ref={categoryFormRef} className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                {editingCategory ? t('Edit Category', '编辑分类') : t('Add New Category', '添加新分类')}
              </h2>
              <button
                onClick={resetCategoryForm}
                className="text-gray-500 hover:text-gray-700 p-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCategorySubmit} className="space-y-6">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                  <strong>{t('Tip', '提示')}:</strong> {t('You can enter content in either English or Chinese. Missing translations will be automatically generated when you save.', '您可以使用英文或中文输入内容。保存时会自动生成缺少的翻译。')}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-bold text-gray-800 mb-2">
                    {t('Category Name (English)', '分类名称（英文）')}
                  </label>
                  <input
                    type="text"
                    value={categoryFormData.nameEn}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, nameEn: e.target.value })}
                    className="w-full px-4 py-3 text-lg rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
                    placeholder="e.g., Appetizers"
                  />
                </div>

                <div>
                  <label className="block text-lg font-bold text-gray-800 mb-2">
                    {t('Category Name (Chinese)', '分类名称（中文）')}
                  </label>
                  <input
                    type="text"
                    value={categoryFormData.nameZh}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, nameZh: e.target.value })}
                    className="w-full px-4 py-3 text-lg rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
                    placeholder="例如：开胃菜"
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={translating}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-xl text-xl transition-colors"
                >
                  {translating
                    ? t('Saving...', '保存中...')
                    : editingCategory
                    ? t('Update Category', '更新分类')
                    : t('Add Category', '添加分类')}
                </button>
                <button
                  type="button"
                  onClick={resetCategoryForm}
                  className="px-6 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl text-xl transition-colors"
                >
                  {t('Cancel', '取消')}
                </button>
              </div>
            </form>
          </div>
        )}

        {showDishForm && (
          <div ref={dishFormRef} className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                {editingDish ? t('Edit Dish', '编辑菜品') : t('Add New Dish', '添加新菜品')}
              </h2>
              <button
                onClick={resetDishForm}
                className="text-gray-500 hover:text-gray-700 p-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleDishSubmit} className="space-y-6">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                  <strong>{t('Tip', '提示')}:</strong> {t('You can enter content in either English or Chinese. Missing translations will be automatically generated when you save.', '您可以使用英文或中文输入内容。保存时会自动生成缺少的翻译。')}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-bold text-gray-800 mb-2">
                    {t('Name (English)', '名称（英文）')}
                  </label>
                  <input
                    type="text"
                    value={dishFormData.nameEn}
                    onChange={(e) => setDishFormData({ ...dishFormData, nameEn: e.target.value })}
                    className="w-full px-4 py-3 text-lg rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none"
                    placeholder="e.g., Kung Pao Chicken"
                  />
                </div>

                <div>
                  <label className="block text-lg font-bold text-gray-800 mb-2">
                    {t('Name (Chinese)', '名称（中文）')}
                  </label>
                  <input
                    type="text"
                    value={dishFormData.nameZh}
                    onChange={(e) => setDishFormData({ ...dishFormData, nameZh: e.target.value })}
                    className="w-full px-4 py-3 text-lg rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none"
                    placeholder="例如：宫保鸡丁"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-bold text-gray-800 mb-2">
                    {t('Description (English)', '描述（英文）')}
                  </label>
                  <textarea
                    value={dishFormData.descriptionEn}
                    onChange={(e) => setDishFormData({ ...dishFormData, descriptionEn: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 text-lg rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none resize-none"
                    placeholder="Describe the dish..."
                  />
                </div>

                <div>
                  <label className="block text-lg font-bold text-gray-800 mb-2">
                    {t('Description (Chinese)', '描述（中文）')}
                  </label>
                  <textarea
                    value={dishFormData.descriptionZh}
                    onChange={(e) => setDishFormData({ ...dishFormData, descriptionZh: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 text-lg rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none resize-none"
                    placeholder="描述这道菜..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-bold text-gray-800 mb-2">
                    {t('Ingredients (English)', '食材（英文）')}
                  </label>
                  <textarea
                    value={dishFormData.ingredientsEn}
                    onChange={(e) => setDishFormData({ ...dishFormData, ingredientsEn: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 text-lg rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none resize-none"
                    placeholder="List the ingredients..."
                  />
                </div>

                <div>
                  <label className="block text-lg font-bold text-gray-800 mb-2">
                    {t('Ingredients (Chinese)', '食材（中文）')}
                  </label>
                  <textarea
                    value={dishFormData.ingredientsZh}
                    onChange={(e) => setDishFormData({ ...dishFormData, ingredientsZh: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 text-lg rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none resize-none"
                    placeholder="列出食材..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-lg font-bold text-gray-800 mb-2">
                    {t('Price ($)', '价格 ($)')} *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={dishFormData.price}
                    onChange={(e) => setDishFormData({ ...dishFormData, price: e.target.value })}
                    className="w-full px-4 py-3 text-lg rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-lg font-bold text-gray-800 mb-2">
                    {t('Category', '分类')} *
                  </label>
                  <select
                    required
                    value={dishFormData.categoryId}
                    onChange={(e) => setDishFormData({ ...dishFormData, categoryId: e.target.value })}
                    className="w-full px-4 py-3 text-lg rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none"
                  >
                    <option value="">{t('Select...', '选择...')}</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {language === 'en' ? cat.nameEn : cat.nameZh}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-lg font-bold text-gray-800 mb-2">
                    {t('Available', '可供应')}
                  </label>
                  <label className="flex items-center space-x-3 mt-3">
                    <input
                      type="checkbox"
                      checked={dishFormData.available}
                      onChange={(e) => setDishFormData({ ...dishFormData, available: e.target.checked })}
                      className="w-6 h-6 text-orange-600 rounded focus:ring-orange-500"
                    />
                    <span className="text-lg text-gray-700">
                      {dishFormData.available ? t('Yes', '是') : t('No', '否')}
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-lg font-bold text-gray-800 mb-2">
                  {t('Photo', '照片')}
                </label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl cursor-pointer transition-colors">
                    <Upload className="w-5 h-5" />
                    <span className="text-lg font-medium">
                      {uploading ? t('Uploading...', '上传中...') : t('Upload Photo', '上传照片')}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                  {dishFormData.photoUrl && (
                    <div className="flex items-center space-x-2 text-green-600">
                      <Check className="w-5 h-5" />
                      <span className="text-lg">{t('Photo uploaded', '照片已上传')}</span>
                    </div>
                  )}
                </div>
                {dishFormData.photoUrl && (
                  <img
                    src={dishFormData.photoUrl}
                    alt="Preview"
                    className="mt-4 w-48 h-48 object-cover rounded-xl"
                  />
                )}
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={translating}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-xl text-xl transition-colors"
                >
                  {translating
                    ? t('Saving...', '保存中...')
                    : editingDish
                    ? t('Update Dish', '更新菜品')
                    : t('Add Dish', '添加菜品')}
                </button>
                <button
                  type="button"
                  onClick={resetDishForm}
                  className="px-6 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl text-xl transition-colors"
                >
                  {t('Cancel', '取消')}
                </button>
              </div>
            </form>
          </div>
        )}

        {categories.length === 0 && !showCategoryForm ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
            <p className="text-xl text-gray-600 mb-6">
              {t('No categories yet. Create your first category!', '还没有分类。创建您的第一个分类！')}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {categories.map((category) => (
              <CategorySection
                key={category.id}
                category={category}
                dishes={dishes.filter((dish) => dish.categoryId === category.id)}
                onDrop={handleDrop}
                onEdit={handleEditDish}
                onDelete={handleDeleteDish}
                onEditCategory={handleEditCategory}
                onDeleteCategory={handleDeleteCategory}
                language={language}
                t={t}
              />
            ))}
          </div>
        )}
        </div>
      </div>
    </DndProvider>
  );
};
