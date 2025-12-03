import React, { useState, useEffect } from 'react';
import { ShoppingCart, Package, Clock, CheckCircle, Trash2 } from 'lucide-react';
import { supabase } from '../supabase';

const CustomerOrder = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                throw error;
            }

            setOrders(data || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId, status) => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status })
                .eq('id', orderId);

            if (error) {
                throw error;
            }

            setOrders((prev) =>
                prev.map((order) =>
                    order.id === orderId ? { ...order, status } : order
                )
            );
        } catch (error) {
            console.error('Error updating order status:', error);
        }
    };

    const deleteOrder = async (orderId) => {
        try {
            const { error } = await supabase
                .from('orders')
                .delete()
                .eq('id', orderId);

            if (error) {
                throw error;
            }

            setOrders((prev) => prev.filter((order) => order.id !== orderId));
        } catch (error) {
            console.error('Error deleting order:', error);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-700 border-yellow-300';
            case 'processing':
                return 'bg-blue-100 text-blue-700 border-blue-300';
            case 'completed':
                return 'bg-green-100 text-green-700 border-green-300';
            case 'cancelled':
                return 'bg-red-100 text-red-700 border-red-300';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-300';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return <Clock size={16} />;
            case 'processing':
                return <Package size={16} />;
            case 'completed':
                return <CheckCircle size={16} />;
            default:
                return null;
        }
    };

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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Orders</h1>
                <p className="text-gray-600">Manage and track all customer orders</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm mb-1">Total Orders</p>
                            <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                        </div>
                        <div className="p-3 bg-orange-500/10 rounded-lg">
                            <ShoppingCart className="text-orange-500" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm mb-1">Pending</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {orders.filter(o => o.status === 'pending').length}
                            </p>
                        </div>
                        <div className="p-3 bg-orange-500/10 rounded-lg">
                            <Clock className="text-orange-500" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm mb-1">Completed</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {orders.filter(o => o.status === 'completed').length}
                            </p>
                        </div>
                        <div className="p-3 bg-orange-500/10 rounded-lg">
                            <CheckCircle className="text-orange-500" size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Order ID
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Items
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Total
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {orders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-medium text-gray-900">{order.id.slice(0, 8)}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-700">{order.customer_email}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-700">
                                            {order.items
                                                ? JSON.parse(order.items).reduce(
                                                    (sum, item) => sum + (item.quantity || 0),
                                                    0
                                                )
                                                : 0}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-semibold text-gray-900">₱{Number(order.total_amount).toFixed(2)}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                                            {getStatusIcon(order.status)}
                                            {order.status === 'cancelled'
                                                ? 'Disapproved'
                                                : order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-600">{new Date(order.created_at).toLocaleDateString()}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <div className="inline-flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => updateOrderStatus(order.id, order.status === 'completed' ? 'cancelled' : 'completed')}
                                                className={`inline-flex items-center gap-1 px-4 py-1.5 text-xs font-medium rounded-full border  ${
                                                    order.status === 'completed'
                                                        ? 'border-red-300 bg-red-50 text-red-600 hover:bg-red-100'
                                                        : 'border-green-400 bg-green-50 text-green-600 hover:bg-green-100'
                                                }`}
                                            >
                                                <CheckCircle size={14} />
                                                {order.status === 'completed' ? 'Disapprove' : 'Approve'}
                                            </button>
                                            <button
                                                onClick={() => deleteOrder(order.id)}
                                                className="inline-flex items-center gap-1 px-4 py-1.5 text-xs font-medium rounded-full border border-red-300 bg-red-50 text-red-600 hover:bg-red-100"
                                            >
                                                <Trash2 size={14} />
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CustomerOrder;
