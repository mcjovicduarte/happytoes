import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from './NavBar';
import CustomerOrder from './CustomerOrder';
import Products from './Products';
import { TrendingUp, Users, Package, DollarSign } from 'lucide-react';
import { supabase } from '../supabase';

const DashboardHome = () => {
  const [stats, setStats] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);

        const [{ data: orders, error: ordersError }, { data: products, error: productsError }] =
          await Promise.all([
            supabase.from('orders').select('*'),
            supabase.from('products').select('id, name, price, image_url, stock'),
          ]);

        if (ordersError) throw ordersError;
        if (productsError) throw productsError;

        const ordersData = orders || [];
        const productsData = products || [];

        const completedOrders = ordersData.filter((o) => o.status === 'completed');
        const pendingOrders = ordersData.filter((o) => o.status === 'pending');

        const totalRevenue = completedOrders.reduce(
          (sum, o) => sum + Number(o.total_amount || 0),
          0
        );

        const totalOrders = ordersData.length;
        const uniqueCustomers = new Set(
          ordersData.map((o) => o.customer_email).filter(Boolean)
        ).size;

        const productCount = productsData.length;
        const outOfStockCount = productsData.filter(
          (p) => !p.stock || p.stock === 0
        ).length;

        setStats([
          {
            label: 'Total Revenue',
            value: `₱${totalRevenue.toFixed(2)}`,
            change: `${completedOrders.length} completed`,
            icon: DollarSign,
          },
          {
            label: 'Total Orders',
            value: String(totalOrders),
            change: `${pendingOrders.length} pending`,
            icon: Package,
          },
          {
            label: 'Customers',
            value: String(uniqueCustomers),
            change: uniqueCustomers ? 'With at least 1 order' : 'No customers yet',
            icon: Users,
          },
          {
            label: 'Products',
            value: String(productCount),
            change: outOfStockCount ? `${outOfStockCount} out of stock` : 'All in stock',
            icon: TrendingUp,
          },
        ]);

        const sortedByDate = [...ordersData].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setRecentOrders(sortedByDate.slice(0, 5));

        const salesByProduct = {};
        ordersData.forEach((order) => {
          if (!order.items) return;
          try {
            const parsed = JSON.parse(order.items);
            if (!Array.isArray(parsed)) return;
            parsed.forEach((item) => {
              if (!item.product_id) return;
              const qty = Number(item.quantity || 0);
              if (!salesByProduct[item.product_id]) {
                salesByProduct[item.product_id] = 0;
              }
              salesByProduct[item.product_id] += qty;
            });
          } catch (err) {
            console.error('Error parsing order items for dashboard:', err);
          }
        });

        const productsById = productsData.reduce((acc, product) => {
          acc[product.id] = product;
          return acc;
        }, {});

        const top = Object.entries(salesByProduct)
          .map(([productId, quantity]) => {
            const product = productsById[productId];
            return {
              id: productId,
              name: product?.name || 'Unknown product',
              quantity,
              image_url: product?.image_url || null,
            };
          })
          .sort((a, b) => b.quantity - a.quantity)
          .slice(0, 3);

        setTopProducts(top);
      } catch (error) {
        console.error('Error loading admin dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-lg p-6 border border-gray-200 hover:border-orange-300 transition-colors shadow-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-lg bg-orange-500/10 text-orange-500">
                  <Icon size={24} />
                </div>
                <span className="text-xs font-medium text-orange-500 bg-orange-500/10 px-2 py-1 rounded">
                  {stat.change}
                </span>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Orders</h2>
          <div className="space-y-3">
            {recentOrders.length === 0 ? (
              <p className="text-sm text-gray-500">No recent orders yet.</p>
            ) : (
              recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <p className="text-gray-900 font-medium">
                      Order #{order.id.slice(0, 8)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-orange-500 font-semibold block">
                      ₱{Number(order.total_amount || 0).toFixed(2)}
                    </span>
                    <span
                      className={`mt-1 inline-block px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        order.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : order.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : order.status === 'cancelled'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {order.status === 'cancelled'
                        ? 'Disapproved'
                        : order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Top Products</h2>
          <div className="space-y-3">
            {topProducts.length === 0 ? (
              <p className="text-sm text-gray-500">No product sales yet.</p>
            ) : (
              topProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center overflow-hidden">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xl">🧦</span>
                      )}
                    </div>
                    <div>
                      <p className="text-gray-900 font-medium text-sm line-clamp-1">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500">{product.quantity} sold</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const navigate = useNavigate();

  const handleLogout = () => {
    // Add your logout logic here (clear session, tokens, etc.)
    navigate('/');
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardHome />;
      case 'orders':
        return <CustomerOrder />;
      case 'products':
        return <Products />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <NavBar
        activeSection={activeSection}
        onNavigate={setActiveSection}
        onLogout={handleLogout}
      />
      <main className="flex-1 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminDashboard;
