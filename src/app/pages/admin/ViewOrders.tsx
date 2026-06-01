import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { projectId } from '../../../utils/supabase/info';
import { ArrowLeft, Mail, Phone, MessageSquare, Calendar, Globe, StickyNote, CheckCircle, X, UtensilsCrossed, Plus, Search, Filter, ArrowUpDown, GripVertical } from 'lucide-react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  dishIds: string[];
  message: string;
  language: string;
  createdAt: string;
  adminNotes?: string;
}

interface DraggableOrderCardProps {
  order: Order;
  index: number;
  onMoveOrder: (dragIndex: number, hoverIndex: number) => void;
  getDishName: (dishId: string) => string;
  formatDate: (dateString: string) => string;
  editingNotes: string | null;
  noteText: string;
  setNoteText: (text: string) => void;
  startEditingNotes: (order: Order) => void;
  handleSaveNotes: (orderId: string) => void;
  setEditingNotes: (id: string | null) => void;
  setCompletingOrder: (id: string) => void;
  language: string;
  t: (en: string, zh: string) => string;
}

const DraggableOrderCard: React.FC<DraggableOrderCardProps> = ({
  order,
  index,
  onMoveOrder,
  getDishName,
  formatDate,
  editingNotes,
  noteText,
  setNoteText,
  startEditingNotes,
  handleSaveNotes,
  setEditingNotes,
  setCompletingOrder,
  language,
  t,
}) => {
  const ref = React.useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: 'ORDER',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: 'ORDER',
    hover: (item: { index: number }) => {
      if (!ref.current) return;

      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      onMoveOrder(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      className={`bg-white rounded-2xl shadow-lg p-6 sm:p-8 relative transition-all cursor-move select-none ${
        isDragging ? 'opacity-30 scale-95' : ''
      } ${
        isOver ? 'ring-4 ring-orange-300 scale-102' : ''
      }`}
      style={{ touchAction: 'none' }}
    >
      <div className="absolute top-4 left-4 pointer-events-none">
        <div className="p-2 bg-orange-100 rounded-lg">
          <GripVertical className="w-6 h-6 text-orange-600" />
        </div>
      </div>

      <div className="ml-12 mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          {order.customerName}
        </h2>
        <div className="flex items-center space-x-2 text-gray-600">
          <Calendar className="w-5 h-5" />
          <span className="text-lg">{formatDate(order.createdAt)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="flex items-start space-x-3">
          <Mail className="w-6 h-6 text-orange-600 mt-1" />
          <div>
            <p className="text-sm text-gray-500 mb-1">{t('Email', '邮箱')}</p>
            <a
              href={`mailto:${order.customerEmail}`}
              className="text-lg text-gray-800 hover:text-orange-600 break-all"
            >
              {order.customerEmail}
            </a>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Phone className="w-6 h-6 text-orange-600 mt-1" />
          <div>
            <p className="text-sm text-gray-500 mb-1">{t('Phone', '电话')}</p>
            <a
              href={`tel:${order.customerPhone}`}
              className="text-lg text-gray-800 hover:text-orange-600"
            >
              {order.customerPhone}
            </a>
          </div>
        </div>
      </div>

      <div className="bg-orange-50 rounded-xl p-4 sm:p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center space-x-2">
          <UtensilsCrossed className="w-6 h-6 text-orange-600" />
          <span>{t('Selected Dishes', '选择的菜品')}</span>
        </h3>
        {order.dishIds && order.dishIds.length > 0 ? (
          <ul className="space-y-2">
            {order.dishIds.map((dishId, idx) => (
              <li key={idx} className="flex items-start space-x-2 text-lg">
                <span className="text-orange-600 font-bold">{idx + 1}.</span>
                <span className="text-gray-800 font-medium">{getDishName(dishId)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic">{t('No dishes selected', '未选择菜品')}</p>
        )}
      </div>

      {order.message && (
        <div className="bg-blue-50 rounded-xl p-4 sm:p-6 mb-6 border-2 border-blue-200">
          <div className="flex items-start space-x-3">
            <MessageSquare className="w-6 h-6 text-blue-600 mt-1" />
            <div className="flex-1">
              <p className="text-sm font-bold text-blue-800 mb-2">
                {t('Customer Message', '客户留言')}
              </p>
              <p className="text-lg text-gray-800 whitespace-pre-wrap">
                {order.message}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-yellow-50 rounded-xl p-4 sm:p-6 mb-6">
        <div className="flex items-start space-x-3">
          <StickyNote className="w-6 h-6 text-yellow-600 mt-1" />
          <div className="flex-1">
            <p className="text-sm text-gray-500 mb-2">
              {t('Admin Notes', '管理员备注')}
            </p>
            {editingNotes === order.id ? (
              <div className="space-y-3">
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 text-base rounded-lg border-2 border-gray-200 focus:border-yellow-500 focus:outline-none resize-none"
                  placeholder={t('Add notes about this order...', '添加关于此订单的备注...')}
                />
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleSaveNotes(order.id)}
                    className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded-lg transition-colors"
                  >
                    {t('Save', '保存')}
                  </button>
                  <button
                    onClick={() => {
                      setEditingNotes(null);
                      setNoteText('');
                    }}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-lg transition-colors"
                  >
                    {t('Cancel', '取消')}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {order.adminNotes ? (
                  <p className="text-lg text-gray-700 whitespace-pre-wrap mb-3">
                    {order.adminNotes}
                  </p>
                ) : (
                  <p className="text-gray-400 italic mb-3">
                    {t('No notes yet', '暂无备注')}
                  </p>
                )}
                <button
                  onClick={() => startEditingNotes(order)}
                  className="text-yellow-600 hover:text-yellow-700 font-medium"
                >
                  {order.adminNotes ? t('Edit Notes', '编辑备注') : t('Add Notes', '添加备注')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="absolute top-6 right-6">
        <button
          onClick={() => setCompletingOrder(order.id)}
          className="flex items-center space-x-2 px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 font-bold rounded-lg transition-colors"
          title={t('Mark as Completed', '标记为已完成')}
        >
          <CheckCircle className="w-5 h-5" />
          <span className="hidden sm:inline">{t('Completed', '已完成')}</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <a
          href={`mailto:${order.customerEmail}`}
          className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          <Mail className="w-5 h-5" />
          <span>{t('Email Customer', '发送邮件')}</span>
        </a>
        <a
          href={`tel:${order.customerPhone}`}
          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          <Phone className="w-5 h-5" />
          <span>{t('Call Customer', '致电客户')}</span>
        </a>
      </div>
    </div>
  );
};

export const ViewOrders: React.FC = () => {
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [dishes, setDishes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [completingOrder, setCompletingOrder] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newOrderForm, setNewOrderForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    dishIds: [] as string[],
    message: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date'>('date');
  const [filterDishId, setFilterDishId] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [manuallyReordered, setManuallyReordered] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchDishes();
  }, []);

  // Reset manual reorder flag when filters/sort change
  useEffect(() => {
    setManuallyReordered(false);
  }, [searchQuery, sortBy, filterDishId]);

  const fetchDishes = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b11e7096/dishes`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const data = await response.json();
      setDishes(data.dishes || []);
    } catch (error) {
      console.error('Failed to fetch dishes:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b11e7096/orders`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDishName = (dishId: string) => {
    const dish = dishes.find(d => d.id === dishId);
    if (!dish) return dishId;
    return language === 'en' ? dish.nameEn : dish.nameZh;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleSaveNotes = async (orderId: string) => {
    try {
      const orderToUpdate = orders.find(o => o.id === orderId);
      if (!orderToUpdate) return;

      const updatedOrder = {
        ...orderToUpdate,
        adminNotes: noteText,
      };

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b11e7096/orders/${orderId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(updatedOrder),
        }
      );

      if (response.ok) {
        setOrders(orders.map(o => o.id === orderId ? updatedOrder : o));
        setEditingNotes(null);
        setNoteText('');
      } else {
        alert(t('Failed to save notes', '保存备注失败'));
      }
    } catch (error) {
      console.error('Failed to save notes:', error);
      alert(t('Failed to save notes', '保存备注失败'));
    }
  };

  const handleCompleteOrder = async (orderId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b11e7096/orders/${orderId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        setOrders(orders.filter(o => o.id !== orderId));
        setCompletingOrder(null);
      } else {
        alert(t('Failed to complete order', '完成订单失败'));
      }
    } catch (error) {
      console.error('Failed to complete order:', error);
      alert(t('Failed to complete order', '完成订单失败'));
    }
  };

  const handleAddOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b11e7096/orders`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            ...newOrderForm,
            language: language,
          }),
        }
      );

      if (response.ok) {
        await fetchOrders();
        setShowAddForm(false);
        setNewOrderForm({
          customerName: '',
          customerEmail: '',
          customerPhone: '',
          dishIds: [],
          message: '',
        });
      } else {
        alert(t('Failed to add order', '添加订单失败'));
      }
    } catch (error) {
      console.error('Failed to add order:', error);
      alert(t('Failed to add order', '添加订单失败'));
    }
  };

  const toggleDishSelection = (dishId: string) => {
    setNewOrderForm(prev => ({
      ...prev,
      dishIds: prev.dishIds.includes(dishId)
        ? prev.dishIds.filter(id => id !== dishId)
        : [...prev.dishIds, dishId]
    }));
  };

  const startEditingNotes = (order: Order) => {
    setEditingNotes(order.id);
    setNoteText(order.adminNotes || '');
  };

  // Filter and sort orders - computed value, not state
  const filteredOrders = React.useMemo(() => {
    let filtered = [...orders];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order =>
        order.customerName.toLowerCase().includes(query) ||
        order.customerEmail.toLowerCase().includes(query) ||
        order.customerPhone.includes(query)
      );
    }

    // Apply dish filter
    if (filterDishId) {
      filtered = filtered.filter(order =>
        order.dishIds && order.dishIds.includes(filterDishId)
      );
    }

    // Apply sort only if not manually reordered
    if (!manuallyReordered) {
      if (sortBy === 'name') {
        filtered.sort((a, b) => a.customerName.localeCompare(b.customerName));
      } else {
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    }

    return filtered;
  }, [orders, searchQuery, filterDishId, sortBy, manuallyReordered]);

  const handleMoveOrder = (dragIndex: number, hoverIndex: number) => {
    setManuallyReordered(true);

    setOrders((prevOrders) => {
      const newFiltered = [...filteredOrders];
      const [removed] = newFiltered.splice(dragIndex, 1);
      newFiltered.splice(hoverIndex, 0, removed);

      // Map back to main orders array
      const filteredIds = new Set(filteredOrders.map(o => o.id));
      const nonFiltered = prevOrders.filter(o => !filteredIds.has(o.id));

      return [...newFiltered, ...nonFiltered];
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-xl text-lg transition-colors"
              >
                <Plus className="w-6 h-6" />
                <span>{t('Add Order', '添加订单')}</span>
              </button>
            )}
          </div>
        </div>

        <h1 className="text-4xl font-bold text-gray-800 mb-8">
          {t('Customer Order Inquiries', '客户订单询问')}
        </h1>

        {/* Search and Filter Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('Search by name, email, or phone...', '按姓名、邮箱或电话搜索...')}
                className="w-full pl-12 pr-4 py-3 text-lg rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none"
              />
            </div>

            {/* Sort and Filter Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  showFilters || filterDishId
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Filter className="w-5 h-5" />
                <span>{t('Filter by Dish', '按菜品筛选')}</span>
              </button>

              <button
                onClick={() => setSortBy(sortBy === 'date' ? 'name' : 'date')}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-100 text-blue-700 font-medium hover:bg-blue-200 transition-colors"
              >
                <ArrowUpDown className="w-5 h-5" />
                <span>
                  {sortBy === 'date'
                    ? t('Sort by Date', '按日期排序')
                    : t('Sort by Name', '按姓名排序')}
                </span>
              </button>

              {(searchQuery || filterDishId) && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterDishId('');
                    setShowFilters(false);
                  }}
                  className="px-4 py-2 rounded-lg bg-red-100 text-red-700 font-medium hover:bg-red-200 transition-colors"
                >
                  {t('Clear Filters', '清除筛选')}
                </button>
              )}
            </div>

            {/* Dish Filter Dropdown */}
            {showFilters && (
              <div className="pt-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {t('Filter by Dish', '按菜品筛选')}
                </label>
                <select
                  value={filterDishId}
                  onChange={(e) => setFilterDishId(e.target.value)}
                  className="w-full px-4 py-3 text-lg rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none"
                >
                  <option value="">{t('All Dishes', '所有菜品')}</option>
                  {dishes.map((dish) => (
                    <option key={dish.id} value={dish.id}>
                      {language === 'en' ? dish.nameEn : dish.nameZh}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Drag and Drop Hint */}
        {!loading && filteredOrders.length > 1 && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6 flex items-center space-x-3">
            <GripVertical className="w-6 h-6 text-blue-600" />
            <p className="text-blue-800 font-medium">
              {t('Click and drag any order card to reorder', '点击并拖动任何订单卡片以重新排序')}
            </p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <p className="text-xl text-gray-600">
              {t('No order inquiries yet', '还没有订单询问')}
            </p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <p className="text-xl text-gray-600">
              {t('No orders match your search criteria', '没有符合搜索条件的订单')}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order, index) => (
              <DraggableOrderCard
                key={order.id}
                order={order}
                index={index}
                onMoveOrder={handleMoveOrder}
                getDishName={getDishName}
                formatDate={formatDate}
                editingNotes={editingNotes}
                noteText={noteText}
                setNoteText={setNoteText}
                startEditingNotes={startEditingNotes}
                handleSaveNotes={handleSaveNotes}
                setEditingNotes={setEditingNotes}
                setCompletingOrder={setCompletingOrder}
                language={language}
                t={t}
              />
            ))}
          </div>
        )}
        </div>

      {completingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                {t('Order Completed', '订单已完成')}
              </h3>
              <button
                onClick={() => setCompletingOrder(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-lg text-gray-700 mb-6">
              {t('Mark this order as completed? It will be removed from the list.', '将此订单标记为已完成？它将从列表中删除。')}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => handleCompleteOrder(completingOrder)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
              >
                {t('Yes, Complete', '是的，完成')}
              </button>
              <button
                onClick={() => setCompletingOrder(null)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-6 rounded-xl transition-colors"
              >
                {t('Cancel', '取消')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                {t('Add Order', '添加订单')}
              </h3>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewOrderForm({
                    customerName: '',
                    customerEmail: '',
                    customerPhone: '',
                    dishIds: [],
                    message: '',
                  });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddOrder} className="space-y-6">
              <div>
                <label className="block text-lg font-bold text-gray-700 mb-2">
                  {t('Customer Name', '客户姓名')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newOrderForm.customerName}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, customerName: e.target.value })}
                  required
                  className="w-full px-4 py-3 text-base rounded-lg border-2 border-gray-200 focus:border-orange-500 focus:outline-none"
                  placeholder={t('Enter customer name', '输入客户姓名')}
                />
              </div>

              <div>
                <label className="block text-lg font-bold text-gray-700 mb-2">
                  {t('Email', '邮箱')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={newOrderForm.customerEmail}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, customerEmail: e.target.value })}
                  required
                  className="w-full px-4 py-3 text-base rounded-lg border-2 border-gray-200 focus:border-orange-500 focus:outline-none"
                  placeholder={t('Enter email address', '输入邮箱地址')}
                />
              </div>

              <div>
                <label className="block text-lg font-bold text-gray-700 mb-2">
                  {t('Phone', '电话')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={newOrderForm.customerPhone}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, customerPhone: e.target.value })}
                  required
                  className="w-full px-4 py-3 text-base rounded-lg border-2 border-gray-200 focus:border-orange-500 focus:outline-none"
                  placeholder={t('Enter phone number', '输入电话号码')}
                />
              </div>

              <div>
                <label className="block text-lg font-bold text-gray-700 mb-2">
                  {t('Select Dishes', '选择菜品')} <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-gray-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                  {dishes.length === 0 ? (
                    <p className="text-gray-500 italic">{t('No dishes available', '没有可用的菜品')}</p>
                  ) : (
                    <div className="space-y-2">
                      {dishes.map((dish) => (
                        <label
                          key={dish.id}
                          className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={newOrderForm.dishIds.includes(dish.id)}
                            onChange={() => toggleDishSelection(dish.id)}
                            className="mt-1 w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                          />
                          <span className="text-base text-gray-800">
                            {language === 'en' ? dish.nameEn : dish.nameZh}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                {newOrderForm.dishIds.length === 0 && (
                  <p className="text-sm text-red-500 mt-1">
                    {t('Please select at least one dish', '请至少选择一道菜')}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-lg font-bold text-gray-700 mb-2">
                  {t('Additional Notes', '附加备注')}
                </label>
                <textarea
                  value={newOrderForm.message}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, message: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 text-base rounded-lg border-2 border-gray-200 focus:border-orange-500 focus:outline-none resize-none"
                  placeholder={t('Enter any special requests or notes...', '输入任何特殊要求或备注...')}
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={newOrderForm.dishIds.length === 0}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-xl transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {t('Add Order', '添加订单')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewOrderForm({
                      customerName: '',
                      customerEmail: '',
                      customerPhone: '',
                      dishIds: [],
                      message: '',
                    });
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-6 rounded-xl transition-colors"
                >
                  {t('Cancel', '取消')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </DndProvider>
  );
};
